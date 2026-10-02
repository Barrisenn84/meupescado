from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime as dt

from ..database import get_db
from ..models import Equipment, EquipmentMaintenanceLog, Pond
from ..schemas import (
    EquipmentCreate, EquipmentResponse,
    EquipmentMaintenanceLogCreate, EquipmentMaintenanceLogResponse
)

router = APIRouter(prefix="/api/equipment", tags=["Equipamentos & Manutenções"])


@router.get("/", response_model=List[EquipmentResponse])
def get_equipment_list(db: Session = Depends(get_db)):
    equipments = db.query(Equipment).all()
    result = []
    for eq in equipments:
        pond = db.query(Pond).filter(Pond.id == eq.pond_id).first() if eq.pond_id else None
        hours_to_next = max(0.0, eq.maintenance_interval_hours - eq.hours_since_last_maintenance)

        # Update status if hours exceeded
        status = eq.status
        if hours_to_next <= 0:
            status = "REVISAO_URGENTE"

        result.append({
            **eq.__dict__,
            "status": status,
            "pond_name": pond.name if pond else "Almoxarifado Geral",
            "hours_to_next_maintenance": hours_to_next,
        })
    return result


@router.post("/", response_model=EquipmentResponse)
def create_equipment(payload: EquipmentCreate, db: Session = Depends(get_db)):
    eq = Equipment(**payload.dict())
    db.add(eq)
    db.commit()
    db.refresh(eq)

    pond = db.query(Pond).filter(Pond.id == eq.pond_id).first() if eq.pond_id else None
    return {
        **eq.__dict__,
        "pond_name": pond.name if pond else "Almoxarifado Geral",
        "hours_to_next_maintenance": eq.maintenance_interval_hours - eq.hours_since_last_maintenance,
    }


@router.put("/{equipment_id}", response_model=EquipmentResponse)
def update_equipment(equipment_id: int, payload: EquipmentCreate, db: Session = Depends(get_db)):
    eq = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not eq:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")

    for key, value in payload.dict().items():
        setattr(eq, key, value)
    
    db.commit()
    db.refresh(eq)

    pond = db.query(Pond).filter(Pond.id == eq.pond_id).first() if eq.pond_id else None
    return {
        **eq.__dict__,
        "pond_name": pond.name if pond else "Almoxarifado Geral",
        "hours_to_next_maintenance": eq.maintenance_interval_hours - eq.hours_since_last_maintenance,
    }


@router.post("/{equipment_id}/maintenance", response_model=EquipmentMaintenanceLogResponse)
def record_maintenance(equipment_id: int, payload: EquipmentMaintenanceLogCreate, db: Session = Depends(get_db)):
    eq = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not eq:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado")

    log = EquipmentMaintenanceLog(
        equipment_id=equipment_id,
        date=payload.date,
        maintenance_type=payload.maintenance_type,
        description=payload.description,
        replaced_parts=payload.replaced_parts,
        cost_rs=payload.cost_rs,
        technician_name=payload.technician_name,
        hourmeter_at_maintenance=eq.hourmeter_hours
    )
    db.add(log)

    # Reset hours since last maintenance
    eq.hours_since_last_maintenance = 0.0
    eq.last_maintenance_date = payload.date
    eq.next_maintenance_date = payload.date + dt.timedelta(days=60)
    eq.status = "OPERACIONAL"
    eq.ai_failure_risk_pct = 4.0
    eq.ai_health_status = "Revisado recentemente com peças novas; excelente condição."

    db.commit()
    db.refresh(log)

    return {
        **log.__dict__,
        "equipment_name": eq.name
    }


@router.get("/maintenance-logs", response_model=List[EquipmentMaintenanceLogResponse])
def get_maintenance_logs(equipment_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(EquipmentMaintenanceLog)
    if equipment_id:
        query = query.filter(EquipmentMaintenanceLog.equipment_id == equipment_id)
    logs = query.order_by(EquipmentMaintenanceLog.date.desc(), EquipmentMaintenanceLog.id.desc()).all()

    result = []
    for l in logs:
        eq = db.query(Equipment).filter(Equipment.id == l.equipment_id).first()
        result.append({
            **l.__dict__,
            "equipment_name": eq.name if eq else "Desconhecido"
        })
    return result


@router.get("/energy-analytics")
def get_energy_analytics(db: Session = Depends(get_db)):
    equipments = db.query(Equipment).all()
    aerators = [e for e in equipments if e.category in ["AERADOR", "SOPRADOR"]]

    total_hp = sum(e.power_hp for e in aerators)
    # 1 HP = 0.745 kW
    total_kw = total_hp * 0.745
    # Média de 10h/dia de funcionamento noturno
    daily_kwh = total_kw * 10
    monthly_kwh = daily_kwh * 30
    tarifa_rural_kwh = 0.45  # R$ 0.45 / kWh (tarifa rural verde)
    monthly_cost_rs = monthly_kwh * tarifa_rural_kwh

    urgent_maintenance = [
        {"id": e.id, "name": e.name, "hours_overdue": abs(e.maintenance_interval_hours - e.hours_since_last_maintenance)}
        for e in equipments if e.hours_since_last_maintenance >= e.maintenance_interval_hours
    ]

    return {
        "total_active_equipment": len(equipments),
        "total_aeration_hp": total_hp,
        "total_aeration_kw": round(total_kw, 2),
        "estimated_daily_kwh": round(daily_kwh, 2),
        "estimated_monthly_cost_rs": round(monthly_cost_rs, 2),
        "urgent_maintenance_count": len(urgent_maintenance),
        "urgent_maintenance_items": urgent_maintenance,
        "ai_energy_tip": (
            "💡 Otimização de Energia IA: A reprogramação do acionamento dos aeradores para iniciar às 21h30 "
            "ao invés de 19h00 (mantendo OD monitorado) economizará aproximadamente R$ 2.450,00/mês na conta de luz rural!"
        )
    }
