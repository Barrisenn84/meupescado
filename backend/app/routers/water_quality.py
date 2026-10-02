from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import WaterQualityLog, Pond
from ..schemas import WaterQualityLogCreate, WaterQualityLogResponse

router = APIRouter(prefix="/api/water-quality", tags=["Water Quality"])


def evaluate_water_status(do: float, temp: float, ph: float, alk: float, nh3: float, no2: float) -> str:
    # Critical for shrimp:
    # 1. Hypoxia (DO < 3.5 mg/L in bottom)
    # 2. Critical Alkalinity < 110 mg/L (risk of death during ecdysis)
    # 3. High Toxic Ammonia >= 0.05 or Nitrite >= 0.25
    if do < 3.5 or alk < 110.0 or nh3 >= 0.05 or no2 >= 0.25 or ph < 6.8 or ph > 8.8:
        return "CRITICO"
    elif do < 4.5 or alk < 130.0 or nh3 >= 0.02 or no2 >= 0.10 or ph < 7.2 or ph > 8.4 or temp < 24.0 or temp > 33.0:
        return "ATENCAO"
    return "IDEAL"


@router.get("", response_model=List[WaterQualityLogResponse])
def get_water_logs(pond_id: int = None, limit: int = 50, db: Session = Depends(get_db)):
    query = db.query(WaterQualityLog)
    if pond_id:
        query = query.filter(WaterQualityLog.pond_id == pond_id)
    logs = query.order_by(WaterQualityLog.timestamp.desc()).limit(limit).all()

    result = []
    for log in logs:
        pond = db.query(Pond).filter(Pond.id == log.pond_id).first()
        ratio = round((log.magnesium_mg_l or 360.0) / max(log.calcium_mg_l or 120.0, 1.0), 2)
        result.append({
            "id": log.id,
            "pond_id": log.pond_id,
            "timestamp": log.timestamp,
            "salinity_ppt": log.salinity_ppt,
            "dissolved_oxygen_mg_l": log.dissolved_oxygen_mg_l,
            "temperature_c": log.temperature_c,
            "ph": log.ph,
            "total_alkalinity_mg_l": log.total_alkalinity_mg_l,
            "total_hardness_mg_l": log.total_hardness_mg_l,
            "calcium_mg_l": log.calcium_mg_l,
            "magnesium_mg_l": log.magnesium_mg_l,
            "toxic_ammonia_nh3_mg_l": log.toxic_ammonia_nh3_mg_l,
            "nitrite_no2_mg_l": log.nitrite_no2_mg_l,
            "transparency_secchi_cm": log.transparency_secchi_cm,
            "status": log.status,
            "notes": log.notes,
            "pond_name": pond.name if pond else None,
            "mg_ca_ratio": ratio,
        })
    return result


@router.post("", response_model=WaterQualityLogResponse)
def record_water_quality(payload: WaterQualityLogCreate, db: Session = Depends(get_db)):
    pond = db.query(Pond).filter(Pond.id == payload.pond_id).first()
    if not pond:
        raise HTTPException(status_code=404, detail="Viveiro não encontrado")

    computed_status = evaluate_water_status(
        do=payload.dissolved_oxygen_mg_l,
        temp=payload.temperature_c,
        ph=payload.ph,
        alk=payload.total_alkalinity_mg_l,
        nh3=payload.toxic_ammonia_nh3_mg_l or 0.0,
        no2=payload.nitrite_no2_mg_l or 0.0,
    )

    log = WaterQualityLog(
        pond_id=payload.pond_id,
        timestamp=payload.timestamp,
        salinity_ppt=payload.salinity_ppt,
        dissolved_oxygen_mg_l=payload.dissolved_oxygen_mg_l,
        temperature_c=payload.temperature_c,
        ph=payload.ph,
        total_alkalinity_mg_l=payload.total_alkalinity_mg_l,
        total_hardness_mg_l=payload.total_hardness_mg_l,
        calcium_mg_l=payload.calcium_mg_l,
        magnesium_mg_l=payload.magnesium_mg_l,
        toxic_ammonia_nh3_mg_l=payload.toxic_ammonia_nh3_mg_l,
        nitrite_no2_mg_l=payload.nitrite_no2_mg_l,
        transparency_secchi_cm=payload.transparency_secchi_cm,
        status=computed_status,
        notes=payload.notes,
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    ratio = round((log.magnesium_mg_l or 360.0) / max(log.calcium_mg_l or 120.0, 1.0), 2)
    return {
        "id": log.id,
        "pond_id": log.pond_id,
        "timestamp": log.timestamp,
        "salinity_ppt": log.salinity_ppt,
        "dissolved_oxygen_mg_l": log.dissolved_oxygen_mg_l,
        "temperature_c": log.temperature_c,
        "ph": log.ph,
        "total_alkalinity_mg_l": log.total_alkalinity_mg_l,
        "total_hardness_mg_l": log.total_hardness_mg_l,
        "calcium_mg_l": log.calcium_mg_l,
        "magnesium_mg_l": log.magnesium_mg_l,
        "toxic_ammonia_nh3_mg_l": log.toxic_ammonia_nh3_mg_l,
        "nitrite_no2_mg_l": log.nitrite_no2_mg_l,
        "transparency_secchi_cm": log.transparency_secchi_cm,
        "status": log.status,
        "notes": log.notes,
        "pond_name": pond.name,
        "mg_ca_ratio": ratio,
    }
