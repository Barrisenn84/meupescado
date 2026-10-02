from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime as dt
import json

from ..database import get_db
from ..models import FeedInventory, InventoryMovement, ProductMix, ShrimpBatch, FeedingLog
from ..schemas import (
    FeedInventoryCreate, FeedInventoryResponse,
    InventoryMovementCreate, InventoryMovementResponse,
    ProductMixCreate, ProductMixResponse
)

router = APIRouter(prefix="/api/inventory", tags=["Controle de Estoque & Insumos Inteligente"])


@router.get("/items", response_model=List[FeedInventoryResponse])
def get_inventory_items(
    tipo: Optional[str] = Query(None, description="Filtro por tipo de insumo (Ração, Fertilizante, Veículo, etc.)"),
    situacao: Optional[str] = Query(None, description="Filtro por situação (NORMAL, ABAIXO_MINIMO, ESGOTADO)"),
    search: Optional[str] = Query(None, description="Busca textual por nome ou marca"),
    sort_by: Optional[str] = Query("name", description="Campo para ordenação"),
    db: Session = Depends(get_db)
):
    query = db.query(FeedInventory)

    if tipo and tipo != "Todos":
        query = query.filter(FeedInventory.item_type.ilike(f"%{tipo}%"))

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (FeedInventory.name.ilike(search_filter)) |
            (FeedInventory.brand.ilike(search_filter)) |
            (FeedInventory.item_type.ilike(search_filter))
        )

    items = query.all()

    # Calculate average daily consumption for feed items to predict autonomy days with AI
    total_feed_consumed_last_7_days = 0.0
    seven_days_ago = dt.date.today() - dt.timedelta(days=7)
    recent_feed_logs = db.query(FeedingLog).filter(FeedingLog.date >= seven_days_ago).all()
    feed_consumption_map = {}
    for fl in recent_feed_logs:
        feed_consumption_map[fl.feed_inventory_id] = feed_consumption_map.get(fl.feed_inventory_id, 0.0) + fl.amount_kg

    result = []
    for item in items:
        # Determine actual status dynamically
        status = "NORMAL"
        if item.current_stock_kg <= 0:
            status = "ESGOTADO"
        elif item.min_stock_alert_kg > 0 and item.current_stock_kg <= item.min_stock_alert_kg:
            status = "ABAIXO_MINIMO"

        if situacao and situacao != "Todos":
            if situacao == "ABAIXO_MINIMO" and status != "ABAIXO_MINIMO":
                continue
            elif situacao == "ESGOTADO" and status != "ESGOTADO":
                continue
            elif situacao == "NORMAL" and status != "NORMAL":
                continue

        # AI Autonomy Days & Reorder Advisor
        daily_use = feed_consumption_map.get(item.id, 0.0) / 7.0
        if daily_use <= 0 and "ração" in item.item_type.lower():
            daily_use = 35.0  # fallback estimated daily feed
        
        days_autonomy = None
        reorder_rec = None
        if daily_use > 0:
            days_autonomy = int(item.current_stock_kg / daily_use)
            if days_autonomy <= 5:
                reorder_rec = f"🚨 URGENTE: Apenas {days_autonomy} dias restantes de autonomia! Comprar lote imediatamente."
            elif days_autonomy <= 12:
                reorder_rec = f"⚠️ Atenção: {days_autonomy} dias restantes. Sugerido emitir pedido de compra de {(item.min_stock_alert_kg * 2) or 500} {item.unit}."
            else:
                reorder_rec = f"Estoque seguro ({days_autonomy} dias de autonomia com base no arraçoamento atual)."
        else:
            if item.current_stock_kg <= 0:
                reorder_rec = "🚨 Produto esgotado. Necessário registrar nova entrada para disponibilizar aos viveiros."
            elif status == "ABAIXO_MINIMO":
                reorder_rec = "⚠️ Estoque abaixo do nível de segurança operacional."
            else:
                reorder_rec = "Estoque com níveis adequados."

        total_val = round(item.current_stock_kg * item.cost_per_kg, 2)

        result.append({
            "id": item.id,
            "brand": item.brand,
            "name": item.name,
            "category": item.category,
            "item_type": item.item_type or "Ração",
            "unit": item.unit or "kg",
            "protein_percent": item.protein_percent,
            "pellet_size_mm": item.pellet_size_mm,
            "current_stock_kg": item.current_stock_kg,
            "min_stock_alert_kg": item.min_stock_alert_kg,
            "cost_per_kg": round(item.cost_per_kg, 2),
            "last_entry_price": round(item.last_entry_price or item.cost_per_kg, 2),
            "status": status,
            "location": item.location,
            "expiry_date": item.expiry_date,
            "notes": item.notes,
            "is_low_stock": status != "NORMAL",
            "total_value_rs": total_val,
            "days_of_autonomy_ai": days_autonomy,
            "ai_reorder_recommendation": reorder_rec
        })

    # Sort
    if sort_by == "quantidade":
        result.sort(key=lambda x: x["current_stock_kg"], reverse=True)
    elif sort_by == "valor":
        result.sort(key=lambda x: x["total_value_rs"], reverse=True)
    elif sort_by == "tipo":
        result.sort(key=lambda x: x["item_type"])
    elif sort_by == "situacao":
        result.sort(key=lambda x: (x["status"] == "ESGOTADO", x["status"] == "ABAIXO_MINIMO"), reverse=True)
    else:
        result.sort(key=lambda x: x["name"])

    return result


@router.post("/items", response_model=FeedInventoryResponse)
def create_inventory_item(payload: FeedInventoryCreate, db: Session = Depends(get_db)):
    data = payload.dict()
    data["status"] = "NORMAL"
    if data["current_stock_kg"] <= 0:
        data["status"] = "ESGOTADO"
    elif data["min_stock_alert_kg"] > 0 and data["current_stock_kg"] <= data["min_stock_alert_kg"]:
        data["status"] = "ABAIXO_MINIMO"
    
    if not data.get("last_entry_price"):
        data["last_entry_price"] = data.get("cost_per_kg", 0.0)

    item = FeedInventory(**data)
    db.add(item)
    db.commit()
    db.refresh(item)

    # If initial stock was provided, record initial movement
    if item.current_stock_kg > 0:
        mov = InventoryMovement(
            item_id=item.id,
            movement_type="ENTRADA",
            date=dt.date.today(),
            quantity=item.current_stock_kg,
            unit_price=item.cost_per_kg,
            total_price=item.current_stock_kg * item.cost_per_kg,
            notes="Estoque inicial de cadastro"
        )
        db.add(mov)
        db.commit()

    return {
        "id": item.id,
        "brand": item.brand,
        "name": item.name,
        "category": item.category,
        "item_type": item.item_type or "Ração",
        "unit": item.unit or "kg",
        "protein_percent": item.protein_percent,
        "pellet_size_mm": item.pellet_size_mm,
        "current_stock_kg": item.current_stock_kg,
        "min_stock_alert_kg": item.min_stock_alert_kg,
        "cost_per_kg": round(item.cost_per_kg, 2),
        "last_entry_price": round(item.last_entry_price or item.cost_per_kg, 2),
        "status": item.status,
        "location": item.location,
        "expiry_date": item.expiry_date,
        "notes": item.notes,
        "is_low_stock": item.status != "NORMAL",
        "total_value_rs": round(item.current_stock_kg * item.cost_per_kg, 2),
        "days_of_autonomy_ai": 30,
        "ai_reorder_recommendation": "Produto cadastrado com sucesso."
    }


@router.put("/items/{item_id}", response_model=FeedInventoryResponse)
def update_inventory_item(item_id: int, payload: FeedInventoryCreate, db: Session = Depends(get_db)):
    item = db.query(FeedInventory).filter(FeedInventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    data = payload.dict()
    for key, value in data.items():
        setattr(item, key, value)

    # Recalculate status
    if item.current_stock_kg <= 0:
        item.status = "ESGOTADO"
    elif item.min_stock_alert_kg > 0 and item.current_stock_kg <= item.min_stock_alert_kg:
        item.status = "ABAIXO_MINIMO"
    else:
        item.status = "NORMAL"

    db.commit()
    db.refresh(item)
    return {
        "id": item.id,
        "brand": item.brand,
        "name": item.name,
        "category": item.category,
        "item_type": item.item_type or "Ração",
        "unit": item.unit or "kg",
        "protein_percent": item.protein_percent,
        "pellet_size_mm": item.pellet_size_mm,
        "current_stock_kg": item.current_stock_kg,
        "min_stock_alert_kg": item.min_stock_alert_kg,
        "cost_per_kg": round(item.cost_per_kg, 2),
        "last_entry_price": round(item.last_entry_price or item.cost_per_kg, 2),
        "status": item.status,
        "location": item.location,
        "expiry_date": item.expiry_date,
        "notes": item.notes,
        "is_low_stock": item.status != "NORMAL",
        "total_value_rs": round(item.current_stock_kg * item.cost_per_kg, 2),
        "days_of_autonomy_ai": None,
        "ai_reorder_recommendation": None
    }


@router.delete("/items/{item_id}")
def delete_inventory_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(FeedInventory).filter(FeedInventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    
    db.delete(item)
    db.commit()
    return {"message": f"Produto '{item.name}' excluído com sucesso"}


@router.post("/entry", response_model=InventoryMovementResponse)
def record_inventory_entry(payload: InventoryMovementCreate, db: Session = Depends(get_db)):
    """
    Registra Nova Entrada (Compra/Nota Fiscal)
    Aplica Custo Médio Ponderado (CMP) automaticamente!
    """
    item = db.query(FeedInventory).filter(FeedInventory.id == payload.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Insumo não encontrado no estoque")

    if payload.quantity <= 0:
        raise HTTPException(status_code=400, detail="A quantidade de entrada deve ser maior que zero")

    total_price = payload.total_price
    if total_price <= 0 and payload.unit_price > 0:
        total_price = payload.quantity * payload.unit_price
    elif payload.unit_price <= 0 and total_price > 0:
        payload.unit_price = total_price / payload.quantity

    # Cálculo do Custo Médio Ponderado (CMP)
    prev_stock = item.current_stock_kg
    prev_cost = item.cost_per_kg
    new_stock = prev_stock + payload.quantity

    if new_stock > 0:
        new_avg_cost = ((prev_stock * prev_cost) + (payload.quantity * payload.unit_price)) / new_stock
    else:
        new_avg_cost = payload.unit_price

    item.current_stock_kg = round(new_stock, 2)
    item.cost_per_kg = round(new_avg_cost, 2)
    item.last_entry_price = round(payload.unit_price, 2)

    if item.current_stock_kg > item.min_stock_alert_kg:
        item.status = "NORMAL"
    elif item.current_stock_kg > 0:
        item.status = "ABAIXO_MINIMO"
    else:
        item.status = "ESGOTADO"

    # Criar movimentação
    mov = InventoryMovement(
        item_id=payload.item_id,
        movement_type="ENTRADA",
        date=payload.date,
        quantity=payload.quantity,
        unit_price=payload.unit_price,
        total_price=total_price,
        supplier_name=payload.supplier_name,
        invoice_number=payload.invoice_number,
        batch_number=payload.batch_number,
        notes=payload.notes
    )
    db.add(mov)
    db.commit()
    db.refresh(mov)

    return {
        "id": mov.id,
        "item_id": mov.item_id,
        "movement_type": mov.movement_type,
        "date": mov.date,
        "quantity": mov.quantity,
        "unit_price": mov.unit_price,
        "total_price": mov.total_price,
        "supplier_name": mov.supplier_name,
        "invoice_number": mov.invoice_number,
        "batch_number": mov.batch_number,
        "notes": mov.notes,
        "item_name": item.name,
        "item_type": item.item_type,
        "unit": item.unit
    }


@router.post("/exit", response_model=InventoryMovementResponse)
def record_inventory_exit(payload: InventoryMovementCreate, db: Session = Depends(get_db)):
    """
    Registra Saída / Baixa Manual / Perda
    """
    item = db.query(FeedInventory).filter(FeedInventory.id == payload.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Insumo não encontrado no estoque")

    if payload.quantity <= 0:
        raise HTTPException(status_code=400, detail="A quantidade deve ser maior que zero")

    if item.current_stock_kg < payload.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Saldo insuficiente em estoque! Disponível: {item.current_stock_kg} {item.unit}"
        )

    item.current_stock_kg = round(item.current_stock_kg - payload.quantity, 2)
    if item.current_stock_kg <= 0:
        item.status = "ESGOTADO"
    elif item.current_stock_kg <= item.min_stock_alert_kg:
        item.status = "ABAIXO_MINIMO"
    else:
        item.status = "NORMAL"

    mov = InventoryMovement(
        item_id=payload.item_id,
        movement_type=payload.movement_type or "SAIDA_MANEJO",
        date=payload.date,
        quantity=payload.quantity,
        unit_price=item.cost_per_kg,
        total_price=payload.quantity * item.cost_per_kg,
        notes=payload.notes
    )
    db.add(mov)
    db.commit()
    db.refresh(mov)

    return {
        "id": mov.id,
        "item_id": mov.item_id,
        "movement_type": mov.movement_type,
        "date": mov.date,
        "quantity": mov.quantity,
        "unit_price": mov.unit_price,
        "total_price": mov.total_price,
        "supplier_name": mov.supplier_name,
        "invoice_number": mov.invoice_number,
        "batch_number": mov.batch_number,
        "notes": mov.notes,
        "item_name": item.name,
        "item_type": item.item_type,
        "unit": item.unit
    }


@router.get("/movements", response_model=List[InventoryMovementResponse])
def get_inventory_movements(item_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(InventoryMovement)
    if item_id:
        query = query.filter(InventoryMovement.item_id == item_id)
    movements = query.order_by(InventoryMovement.date.desc(), InventoryMovement.id.desc()).all()

    result = []
    for m in movements:
        item = db.query(FeedInventory).filter(FeedInventory.id == m.item_id).first()
        result.append({
            "id": m.id,
            "item_id": m.item_id,
            "movement_type": m.movement_type,
            "date": m.date,
            "quantity": m.quantity,
            "unit_price": m.unit_price,
            "total_price": m.total_price,
            "supplier_name": m.supplier_name,
            "invoice_number": m.invoice_number,
            "batch_number": m.batch_number,
            "notes": m.notes,
            "item_name": item.name if item else "Item removido",
            "item_type": item.item_type if item else None,
            "unit": item.unit if item else None
        })
    return result


@router.get("/mixes", response_model=List[ProductMixResponse])
def get_product_mixes(db: Session = Depends(get_db)):
    mixes = db.query(ProductMix).order_by(ProductMix.created_at.desc()).all()
    return mixes


@router.post("/mixes", response_model=ProductMixResponse)
def create_product_mix(payload: ProductMixCreate, db: Session = Depends(get_db)):
    """
    Cria nova Mistura/Formulações Inteligente IA
    Calcula custo total, dosagens e gera parecer nutricional por IA
    """
    # Parse recipe_json if possible to compute nutritional insight
    ai_summary = "Formulações equilibrada pela IA ShrimpAI para máxima atratividade e conversão alimentar."
    try:
        ingredients = json.loads(payload.recipe_json)
        total_kg = sum(float(i.get("amount", 0)) for i in ingredients)
        total_cost = sum(float(i.get("cost", 0)) for i in ingredients)
        cost_per_kg = round(total_cost / total_kg, 2) if total_kg > 0 else payload.cost_per_kg
        
        has_probiotic = any("probiótico" in str(i.get("name", "")).lower() or "bactéria" in str(i.get("name", "")).lower() for i in ingredients)
        has_oil = any("óleo" in str(i.get("name", "")).lower() for i in ingredients)
        has_vitc = any("vitamina" in str(i.get("name", "")).lower() or "vit c" in str(i.get("name", "")).lower() for i in ingredients)

        insights = []
        if has_probiotic:
            insights.append("Colonização intestinal probiótica reforçada (reduz Vibrio spp.)")
        if has_oil:
            insights.append("Lipídios e ácidos graxos essenciais aumentam atratividade e fixação dos aditivos no grânulo")
        if has_vitc:
            insights.append("Ação antiestresse fortalecida para fases de muda e oscilação térmica")
        
        if insights:
            ai_summary = f"Mix de alta performance: {'; '.join(insights)}. Absorção digestiva estimada em +18%."
    except Exception:
        pass

    mix = ProductMix(
        name=payload.name,
        target_stage=payload.target_stage,
        total_weight_kg=payload.total_weight_kg,
        cost_per_kg=payload.cost_per_kg,
        recipe_json=payload.recipe_json,
        instructions=payload.instructions,
        ai_nutritional_summary=ai_summary,
        created_at=payload.created_at or dt.date.today()
    )
    db.add(mix)
    db.commit()
    db.refresh(mix)
    return mix
