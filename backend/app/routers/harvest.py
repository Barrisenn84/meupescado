from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import HarvestLog, ShrimpBatch, Pond
from ..schemas import HarvestLogCreate, HarvestLogResponse

router = APIRouter(prefix="/api/harvest", tags=["Harvest & Financials"])


@router.get("", response_model=List[HarvestLogResponse])
def get_harvests(batch_id: int = None, db: Session = Depends(get_db)):
    query = db.query(HarvestLog)
    if batch_id:
        query = query.filter(HarvestLog.batch_id == batch_id)
    logs = query.order_by(HarvestLog.date.desc()).all()

    result = []
    for log in logs:
        batch = db.query(ShrimpBatch).filter(ShrimpBatch.id == log.batch_id).first()
        pond = db.query(Pond).filter(Pond.id == batch.pond_id).first() if batch else None
        result.append({
            "id": log.id,
            "batch_id": log.batch_id,
            "date": log.date,
            "harvest_type": log.harvest_type,
            "total_weight_kg": log.total_weight_kg,
            "shrimp_count_estimated": log.shrimp_count_estimated,
            "avg_weight_g": log.avg_weight_g,
            "commercial_classification": log.commercial_classification,
            "price_per_kg": log.price_per_kg,
            "total_revenue": log.total_revenue,
            "buyer_name": log.buyer_name,
            "notes": log.notes,
            "batch_code": batch.batch_code if batch else None,
            "pond_name": pond.name if pond else None,
        })
    return result


@router.post("", response_model=HarvestLogResponse)
def record_harvest(payload: HarvestLogCreate, db: Session = Depends(get_db)):
    batch = db.query(ShrimpBatch).filter(ShrimpBatch.id == payload.batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Lote de camarão não encontrado")

    pond = db.query(Pond).filter(Pond.id == batch.pond_id).first()

    if payload.harvest_type == "TOTAL":
        batch.status = "DESPESCADO"
        batch.current_shrimp_count = 0
        if pond:
            pond.status = "PREPARO_CALAGEM"
    else:
        if batch.current_shrimp_count >= payload.shrimp_count_estimated:
            batch.current_shrimp_count -= payload.shrimp_count_estimated

    harvest = HarvestLog(**payload.dict())
    if not harvest.total_revenue and harvest.total_weight_kg and harvest.price_per_kg:
        harvest.total_revenue = round(harvest.total_weight_kg * harvest.price_per_kg, 2)

    db.add(harvest)
    db.commit()
    db.refresh(harvest)

    return {
        "id": harvest.id,
        "batch_id": harvest.batch_id,
        "date": harvest.date,
        "harvest_type": harvest.harvest_type,
        "total_weight_kg": harvest.total_weight_kg,
        "shrimp_count_estimated": harvest.shrimp_count_estimated,
        "avg_weight_g": harvest.avg_weight_g,
        "commercial_classification": harvest.commercial_classification,
        "price_per_kg": harvest.price_per_kg,
        "total_revenue": harvest.total_revenue,
        "buyer_name": harvest.buyer_name,
        "notes": harvest.notes,
        "batch_code": batch.batch_code,
        "pond_name": pond.name if pond else None,
    }
