from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Pond, ShrimpBatch, WaterQualityLog
from ..schemas import PondCreate, PondResponse

router = APIRouter(prefix="/api/ponds", tags=["Ponds"])


def enrich_pond(pond: Pond, db: Session) -> dict:
    active_batch = (
        db.query(ShrimpBatch)
        .filter(ShrimpBatch.pond_id == pond.id, ShrimpBatch.status == "ATIVO")
        .first()
    )
    last_water = (
        db.query(WaterQualityLog)
        .filter(WaterQualityLog.pond_id == pond.id)
        .order_by(WaterQualityLog.timestamp.desc())
        .first()
    )

    current_count = active_batch.current_shrimp_count if active_batch else 0
    current_bio_kg = round((current_count * (active_batch.current_avg_weight_g if active_batch else 0)) / 1000.0, 2)
    density_pl_m2 = round(current_count / (pond.surface_area_m2 or 1.0), 1) if active_batch else 0.0

    return {
        "id": pond.id,
        "name": pond.name,
        "pond_type": pond.pond_type,
        "surface_area_m2": pond.surface_area_m2,
        "average_depth_m": pond.average_depth_m,
        "volume_m3": pond.volume_m3,
        "aeration_hp_total": pond.aeration_hp_total,
        "aeration_type": pond.aeration_type,
        "bottom_type": pond.bottom_type,
        "status": pond.status,
        "notes": pond.notes,
        "active_batch_code": active_batch.batch_code if active_batch else None,
        "active_batch_id": active_batch.id if active_batch else None,
        "species": active_batch.species if active_batch else None,
        "pl_stage": active_batch.pl_stage if active_batch else None,
        "current_shrimp_count": current_count,
        "current_biomass_kg": current_bio_kg,
        "stocking_density_pl_m2": density_pl_m2,
        "last_water_status": last_water.status if last_water else "IDEAL",
        "last_do_mg_l": last_water.dissolved_oxygen_mg_l if last_water else None,
        "last_salinity_ppt": last_water.salinity_ppt if last_water else None,
        "last_temp_c": last_water.temperature_c if last_water else None,
        "last_ph": last_water.ph if last_water else None,
        "last_alkalinity_mg_l": last_water.total_alkalinity_mg_l if last_water else None,
    }


@router.get("", response_model=List[PondResponse])
def get_ponds(db: Session = Depends(get_db)):
    ponds = db.query(Pond).all()
    return [enrich_pond(p, db) for p in ponds]


@router.get("/{pond_id}", response_model=PondResponse)
def get_pond(pond_id: int, db: Session = Depends(get_db)):
    pond = db.query(Pond).filter(Pond.id == pond_id).first()
    if not pond:
        raise HTTPException(status_code=404, detail="Viveiro de camarão não encontrado")
    return enrich_pond(pond, db)


@router.post("", response_model=PondResponse)
def create_pond(payload: PondCreate, db: Session = Depends(get_db)):
    pond = Pond(**payload.dict())
    if not pond.volume_m3 and pond.surface_area_m2 and pond.average_depth_m:
        pond.volume_m3 = pond.surface_area_m2 * pond.average_depth_m
    db.add(pond)
    db.commit()
    db.refresh(pond)
    return enrich_pond(pond, db)


@router.put("/{pond_id}", response_model=PondResponse)
def update_pond(pond_id: int, payload: PondCreate, db: Session = Depends(get_db)):
    pond = db.query(Pond).filter(Pond.id == pond_id).first()
    if not pond:
        raise HTTPException(status_code=404, detail="Viveiro de camarão não encontrado")
    for key, value in payload.dict().items():
        setattr(pond, key, value)
    db.commit()
    db.refresh(pond)
    return enrich_pond(pond, db)


@router.delete("/{pond_id}")
def delete_pond(pond_id: int, db: Session = Depends(get_db)):
    pond = db.query(Pond).filter(Pond.id == pond_id).first()
    if not pond:
        raise HTTPException(status_code=404, detail="Viveiro não encontrado")
    db.delete(pond)
    db.commit()
    return {"message": "Viveiro excluído com sucesso"}
