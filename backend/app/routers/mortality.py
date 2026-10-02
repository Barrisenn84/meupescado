from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import MortalityLog, ShrimpBatch, Pond
from ..schemas import MortalityLogCreate, MortalityLogResponse

router = APIRouter(prefix="/api/mortality", tags=["Mortality"])


@router.get("", response_model=List[MortalityLogResponse])
def get_mortalities(batch_id: int = None, db: Session = Depends(get_db)):
    query = db.query(MortalityLog)
    if batch_id:
        query = query.filter(MortalityLog.batch_id == batch_id)
    logs = query.order_by(MortalityLog.date.desc(), MortalityLog.id.desc()).all()

    result = []
    for log in logs:
        batch = db.query(ShrimpBatch).filter(ShrimpBatch.id == log.batch_id).first()
        pond = db.query(Pond).filter(Pond.id == batch.pond_id).first() if batch else None
        result.append({
            "id": log.id,
            "batch_id": log.batch_id,
            "date": log.date,
            "quantity": log.quantity,
            "probable_cause": log.probable_cause,
            "notes": log.notes,
            "batch_code": batch.batch_code if batch else None,
            "pond_name": pond.name if pond else None,
        })
    return result


@router.post("", response_model=MortalityLogResponse)
def record_mortality(payload: MortalityLogCreate, db: Session = Depends(get_db)):
    batch = db.query(ShrimpBatch).filter(ShrimpBatch.id == payload.batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Lote de camarão não encontrado")

    if batch.current_shrimp_count >= payload.quantity:
        batch.current_shrimp_count -= payload.quantity
    else:
        batch.current_shrimp_count = 0

    log = MortalityLog(**payload.dict())
    db.add(log)
    db.commit()
    db.refresh(log)

    pond = db.query(Pond).filter(Pond.id == batch.pond_id).first()
    return {
        "id": log.id,
        "batch_id": log.batch_id,
        "date": log.date,
        "quantity": log.quantity,
        "probable_cause": log.probable_cause,
        "notes": log.notes,
        "batch_code": batch.batch_code,
        "pond_name": pond.name if pond else None,
    }
