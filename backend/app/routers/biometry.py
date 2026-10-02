from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from ..database import get_db
from ..models import BiometryLog, ShrimpBatch, Pond
from ..schemas import BiometryLogCreate, BiometryLogResponse

router = APIRouter(prefix="/api/biometry", tags=["Biometry"])


@router.get("", response_model=List[BiometryLogResponse])
def get_biometries(batch_id: int = None, db: Session = Depends(get_db)):
    query = db.query(BiometryLog)
    if batch_id:
        query = query.filter(BiometryLog.batch_id == batch_id)
    logs = query.order_by(BiometryLog.date.desc()).all()

    result = []
    for log in logs:
        batch = db.query(ShrimpBatch).filter(ShrimpBatch.id == log.batch_id).first()
        pond = db.query(Pond).filter(Pond.id == batch.pond_id).first() if batch else None
        result.append({
            "id": log.id,
            "batch_id": log.batch_id,
            "date": log.date,
            "sample_count": log.sample_count,
            "avg_weight_g": log.avg_weight_g,
            "weekly_growth_gain_g": log.weekly_growth_gain_g,
            "uniformity_percentage": log.uniformity_percentage,
            "gut_fullness_percent": log.gut_fullness_percent,
            "molt_stage": log.molt_stage,
            "estimated_biomass_kg": log.estimated_biomass_kg,
            "notes": log.notes,
            "batch_code": batch.batch_code if batch else None,
            "pond_name": pond.name if pond else None,
        })
    return result


@router.post("", response_model=BiometryLogResponse)
def record_biometry(payload: BiometryLogCreate, db: Session = Depends(get_db)):
    batch = db.query(ShrimpBatch).filter(ShrimpBatch.id == payload.batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Lote de camarão não encontrado")

    prev_biometry = (
        db.query(BiometryLog)
        .filter(BiometryLog.batch_id == batch.id, BiometryLog.date < payload.date)
        .order_by(BiometryLog.date.desc())
        .first()
    )

    if prev_biometry:
        days_diff = (payload.date - prev_biometry.date).days
        weight_diff = payload.avg_weight_g - prev_biometry.avg_weight_g
        weekly_gain = round((weight_diff / days_diff) * 7.0, 2) if days_diff > 0 else 0.0
    else:
        days_diff = (payload.date - batch.stocking_date).days
        weight_diff = payload.avg_weight_g - batch.initial_avg_weight_g
        weekly_gain = round((weight_diff / days_diff) * 7.0, 2) if days_diff > 0 else 0.0

    estimated_biomass = round((batch.current_shrimp_count * payload.avg_weight_g) / 1000.0, 2)

    biometry = BiometryLog(
        batch_id=payload.batch_id,
        date=payload.date,
        sample_count=payload.sample_count,
        avg_weight_g=payload.avg_weight_g,
        weekly_growth_gain_g=weekly_gain,
        uniformity_percentage=payload.uniformity_percentage or 85.0,
        gut_fullness_percent=payload.gut_fullness_percent or 90.0,
        molt_stage=payload.molt_stage,
        estimated_biomass_kg=estimated_biomass,
        notes=payload.notes,
    )
    db.add(biometry)

    # Update batch current avg weight
    batch.current_avg_weight_g = payload.avg_weight_g

    # Update commercial class
    w = payload.avg_weight_g
    if w >= 18.0:
        batch.commercial_class = "40/50"
    elif w >= 15.0:
        batch.commercial_class = "50/60"
    elif w >= 12.0:
        batch.commercial_class = "60/70"
    elif w >= 10.0:
        batch.commercial_class = "70/80"
    else:
        batch.commercial_class = "80/100"

    db.commit()
    db.refresh(biometry)

    pond = db.query(Pond).filter(Pond.id == batch.pond_id).first()
    return {
        "id": biometry.id,
        "batch_id": biometry.batch_id,
        "date": biometry.date,
        "sample_count": biometry.sample_count,
        "avg_weight_g": biometry.avg_weight_g,
        "weekly_growth_gain_g": biometry.weekly_growth_gain_g,
        "uniformity_percentage": biometry.uniformity_percentage,
        "gut_fullness_percent": biometry.gut_fullness_percent,
        "molt_stage": biometry.molt_stage,
        "estimated_biomass_kg": biometry.estimated_biomass_kg,
        "notes": biometry.notes,
        "batch_code": batch.batch_code,
        "pond_name": pond.name if pond else None,
    }
