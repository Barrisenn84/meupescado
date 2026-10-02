from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from ..database import get_db
from ..models import FeedInventory, FeedingLog, FeedingTrayLog, ShrimpBatch, Pond
from ..schemas import (
    FeedInventoryCreate, FeedInventoryResponse,
    FeedingLogCreate, FeedingLogResponse,
    FeedingTrayLogCreate, FeedingTrayLogResponse
)

router = APIRouter(prefix="/api/feeding", tags=["Feeding & Inventory"])


# FEED INVENTORY ENDPOINTS
@router.get("/inventory", response_model=List[FeedInventoryResponse])
def get_inventory(db: Session = Depends(get_db)):
    items = db.query(FeedInventory).all()
    result = []
    for item in items:
        result.append({
            "id": item.id,
            "brand": item.brand,
            "name": item.name,
            "category": item.category,
            "protein_percent": item.protein_percent,
            "pellet_size_mm": item.pellet_size_mm,
            "current_stock_kg": item.current_stock_kg,
            "min_stock_alert_kg": item.min_stock_alert_kg,
            "cost_per_kg": item.cost_per_kg,
            "is_low_stock": item.current_stock_kg <= item.min_stock_alert_kg,
        })
    return result


@router.post("/inventory", response_model=FeedInventoryResponse)
def add_feed_inventory(payload: FeedInventoryCreate, db: Session = Depends(get_db)):
    item = FeedInventory(**payload.dict())
    db.add(item)
    db.commit()
    db.refresh(item)
    return {
        "id": item.id,
        "brand": item.brand,
        "name": item.name,
        "category": item.category,
        "protein_percent": item.protein_percent,
        "pellet_size_mm": item.pellet_size_mm,
        "current_stock_kg": item.current_stock_kg,
        "min_stock_alert_kg": item.min_stock_alert_kg,
        "cost_per_kg": item.cost_per_kg,
        "is_low_stock": item.current_stock_kg <= item.min_stock_alert_kg,
    }


# FEEDING LOG ENDPOINTS
@router.get("/logs", response_model=List[FeedingLogResponse])
def get_feeding_logs(batch_id: int = None, db: Session = Depends(get_db)):
    query = db.query(FeedingLog)
    if batch_id:
        query = query.filter(FeedingLog.batch_id == batch_id)
    logs = query.order_by(FeedingLog.date.desc(), FeedingLog.id.desc()).all()

    result = []
    for log in logs:
        batch = db.query(ShrimpBatch).filter(ShrimpBatch.id == log.batch_id).first()
        pond = db.query(Pond).filter(Pond.id == batch.pond_id).first() if batch else None
        feed = db.query(FeedInventory).filter(FeedInventory.id == log.feed_inventory_id).first()
        result.append({
            "id": log.id,
            "batch_id": log.batch_id,
            "feed_inventory_id": log.feed_inventory_id,
            "date": log.date,
            "trato_number": log.trato_number,
            "time_of_day": log.time_of_day,
            "amount_kg": log.amount_kg,
            "water_temp_c": log.water_temp_c,
            "dissolved_oxygen_mg_l": log.dissolved_oxygen_mg_l,
            "notes": log.notes,
            "batch_code": batch.batch_code if batch else None,
            "pond_name": pond.name if pond else None,
            "feed_name": f"{feed.brand} - {feed.name}" if feed else None,
        })
    return result


@router.post("/logs", response_model=FeedingLogResponse)
def record_feeding(payload: FeedingLogCreate, db: Session = Depends(get_db)):
    batch = db.query(ShrimpBatch).filter(ShrimpBatch.id == payload.batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Lote de camarão não encontrado")

    feed = db.query(FeedInventory).filter(FeedInventory.id == payload.feed_inventory_id).first()
    if not feed:
        raise HTTPException(status_code=404, detail="Tipo de ração não encontrado")

    # Deduct feed from inventory
    if feed.current_stock_kg >= payload.amount_kg:
        feed.current_stock_kg = round(feed.current_stock_kg - payload.amount_kg, 2)
    else:
        feed.current_stock_kg = 0.0

    log = FeedingLog(**payload.dict())
    db.add(log)
    db.commit()
    db.refresh(log)

    pond = db.query(Pond).filter(Pond.id == batch.pond_id).first()
    return {
        "id": log.id,
        "batch_id": log.batch_id,
        "feed_inventory_id": log.feed_inventory_id,
        "date": log.date,
        "trato_number": log.trato_number,
        "time_of_day": log.time_of_day,
        "amount_kg": log.amount_kg,
        "water_temp_c": log.water_temp_c,
        "dissolved_oxygen_mg_l": log.dissolved_oxygen_mg_l,
        "notes": log.notes,
        "batch_code": batch.batch_code,
        "pond_name": pond.name if pond else None,
        "feed_name": f"{feed.brand} - {feed.name}",
    }


# FEEDING TRAYS (BANDEJAS DE COMEDOUROS)
@router.get("/trays", response_model=List[FeedingTrayLogResponse])
def get_tray_evaluations(batch_id: int = None, db: Session = Depends(get_db)):
    query = db.query(FeedingTrayLog)
    if batch_id:
        query = query.filter(FeedingTrayLog.batch_id == batch_id)
    logs = query.order_by(FeedingTrayLog.date.desc(), FeedingTrayLog.id.desc()).all()

    result = []
    for log in logs:
        batch = db.query(ShrimpBatch).filter(ShrimpBatch.id == log.batch_id).first()
        pond = db.query(Pond).filter(Pond.id == batch.pond_id).first() if batch else None
        result.append({
            "id": log.id,
            "batch_id": log.batch_id,
            "date": log.date,
            "check_time": log.check_time,
            "trays_inspected_count": log.trays_inspected_count,
            "tray_status": log.tray_status,
            "leftover_percentage": log.leftover_percentage,
            "ai_recommendation": log.ai_recommendation,
            "adjustment_suggested_pct": log.adjustment_suggested_pct,
            "batch_code": batch.batch_code if batch else None,
            "pond_name": pond.name if pond else None,
        })
    return result


@router.post("/trays", response_model=FeedingTrayLogResponse)
def record_tray_evaluation(payload: FeedingTrayLogCreate, db: Session = Depends(get_db)):
    batch = db.query(ShrimpBatch).filter(ShrimpBatch.id == payload.batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Lote de camarão não encontrado")

    # IA automatic recommendation
    adj_pct = 0.0
    if payload.leftover_percentage == 0:
        rec = "Bandeja limpa: Camarão com apetite alto. Aumentar +8% a +10% no próximo trato."
        adj_pct = 8.0
    elif payload.leftover_percentage <= 5:
        rec = "Pouca sobra (<5%): Arraçoamento adequado. Manter quantidade no próximo trato."
        adj_pct = 0.0
    elif payload.leftover_percentage <= 20:
        rec = f"Sobra moderada ({payload.leftover_percentage}%): Reduzir 15% para evitar acúmulo no fundo."
        adj_pct = -15.0
    else:
        rec = f"Sobra excessiva ({payload.leftover_percentage}%): Reduzir 50% ou suspender próximo trato. Verificar OD imediatamente!"
        adj_pct = -50.0

    tray_log = FeedingTrayLog(
        batch_id=payload.batch_id,
        date=payload.date,
        check_time=payload.check_time,
        trays_inspected_count=payload.trays_inspected_count,
        tray_status=payload.tray_status,
        leftover_percentage=payload.leftover_percentage,
        ai_recommendation=rec,
        adjustment_suggested_pct=adj_pct,
    )
    db.add(tray_log)
    db.commit()
    db.refresh(tray_log)

    pond = db.query(Pond).filter(Pond.id == batch.pond_id).first()
    return {
        "id": tray_log.id,
        "batch_id": tray_log.batch_id,
        "date": tray_log.date,
        "check_time": tray_log.check_time,
        "trays_inspected_count": tray_log.trays_inspected_count,
        "tray_status": tray_log.tray_status,
        "leftover_percentage": tray_log.leftover_percentage,
        "ai_recommendation": tray_log.ai_recommendation,
        "adjustment_suggested_pct": tray_log.adjustment_suggested_pct,
        "batch_code": batch.batch_code,
        "pond_name": pond.name if pond else None,
    }
