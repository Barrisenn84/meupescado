from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from ..database import get_db
from ..models import ShrimpBatch, Pond, FeedingLog, BiometryLog, MortalityLog
from ..schemas import ShrimpBatchCreate, ShrimpBatchResponse

router = APIRouter(prefix="/api/batches", tags=["Shrimp Batches"])


def enrich_batch(batch: ShrimpBatch, db: Session) -> dict:
    pond = db.query(Pond).filter(Pond.id == batch.pond_id).first()
    
    # Calculate accumulated feed
    feed_logs = db.query(FeedingLog).filter(FeedingLog.batch_id == batch.id).all()
    total_feed_kg = sum(f.amount_kg for f in feed_logs)

    # Days of culture (DOC)
    doc = (date.today() - batch.stocking_date).days if batch.stocking_date else 0
    if doc < 0:
        doc = 0

    # Biomass gain and FCR
    initial_biomass_kg = (batch.initial_pls_count * batch.initial_avg_weight_g) / 1000.0
    current_biomass_kg = (batch.current_shrimp_count * batch.current_avg_weight_g) / 1000.0
    biomass_gain_kg = current_biomass_kg - initial_biomass_kg

    fcr = 1.0
    if biomass_gain_kg > 0 and total_feed_kg > 0:
        fcr = round(total_feed_kg / biomass_gain_kg, 2)
    elif total_feed_kg > 0 and biomass_gain_kg <= 0:
        fcr = 1.25

    survival = 100.0
    if batch.initial_pls_count > 0:
        survival = round((batch.current_shrimp_count / batch.initial_pls_count) * 100.0, 1)

    return {
        "id": batch.id,
        "batch_code": batch.batch_code,
        "pond_id": batch.pond_id,
        "pond_name": pond.name if pond else "Não definido",
        "species": batch.species,
        "pl_stage": batch.pl_stage,
        "origin_laboratory": batch.origin_laboratory,
        "stocking_date": batch.stocking_date,
        "initial_pls_count": batch.initial_pls_count,
        "current_shrimp_count": batch.current_shrimp_count,
        "stocking_density_pl_m2": batch.stocking_density_pl_m2,
        "pl_stress_test_survival_pct": batch.pl_stress_test_survival_pct,
        "initial_salinity_lab_ppt": batch.initial_salinity_lab_ppt,
        "pond_target_salinity_ppt": batch.pond_target_salinity_ppt,
        "initial_avg_weight_g": batch.initial_avg_weight_g,
        "current_avg_weight_g": batch.current_avg_weight_g,
        "target_harvest_weight_g": batch.target_harvest_weight_g,
        "target_harvest_date": batch.target_harvest_date,
        "commercial_class": batch.commercial_class,
        "status": batch.status,
        "days_of_culture": doc,
        "current_biomass_kg": round(current_biomass_kg, 2),
        "survival_rate_percent": survival,
        "accumulated_feed_kg": round(total_feed_kg, 2),
        "feed_conversion_ratio": fcr,
    }


@router.get("", response_model=List[ShrimpBatchResponse])
def get_batches(status: str = None, db: Session = Depends(get_db)):
    query = db.query(ShrimpBatch)
    if status:
        query = query.filter(ShrimpBatch.status == status)
    batches = query.all()
    return [enrich_batch(b, db) for b in batches]


@router.get("/{batch_id}", response_model=ShrimpBatchResponse)
def get_batch(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(ShrimpBatch).filter(ShrimpBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Lote de camarão não encontrado")
    return enrich_batch(batch, db)


@router.post("", response_model=ShrimpBatchResponse)
def create_batch(payload: ShrimpBatchCreate, db: Session = Depends(get_db)):
    pond = db.query(Pond).filter(Pond.id == payload.pond_id).first()
    if not pond:
        raise HTTPException(status_code=404, detail="Viveiro associado não encontrado")

    batch = ShrimpBatch(**payload.dict())
    if not batch.current_shrimp_count:
        batch.current_shrimp_count = batch.initial_pls_count
    if not batch.current_avg_weight_g:
        batch.current_avg_weight_g = batch.initial_avg_weight_g
    if pond.surface_area_m2 and pond.surface_area_m2 > 0:
        batch.stocking_density_pl_m2 = round(batch.initial_pls_count / pond.surface_area_m2, 1)

    pond.status = "OCUPADO"

    db.add(batch)
    db.commit()
    db.refresh(batch)
    return enrich_batch(batch, db)


@router.put("/{batch_id}", response_model=ShrimpBatchResponse)
def update_batch(batch_id: int, payload: ShrimpBatchCreate, db: Session = Depends(get_db)):
    batch = db.query(ShrimpBatch).filter(ShrimpBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Lote não encontrado")
    for key, value in payload.dict().items():
        setattr(batch, key, value)
    db.commit()
    db.refresh(batch)
    return enrich_batch(batch, db)


@router.delete("/{batch_id}")
def delete_batch(batch_id: int, db: Session = Depends(get_db)):
    batch = db.query(ShrimpBatch).filter(ShrimpBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Lote não encontrado")
    db.delete(batch)
    db.commit()
    return {"message": "Lote de camarão excluído com sucesso"}
