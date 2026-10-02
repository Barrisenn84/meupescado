from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime as dt
import random

from ..database import get_db
from ..models import FiscalInvoice, HarvestLog, ShrimpBatch, Pond
from ..schemas import FiscalInvoiceCreate, FiscalInvoiceResponse

router = APIRouter(prefix="/api/fiscal", tags=["Nota Fiscal & Documentos Fiscais"])


def generate_fake_access_key() -> str:
    # 44 dígitos da NF-e brasileira
    uf = "24"  # Rio Grande do Norte
    aamm = dt.datetime.now().strftime("%y%m")
    cnpj = "18234567000189"
    mod = "55"
    serie = "001"
    num = f"{random.randint(100000, 999999):09d}"
    tp_emis = "1"
    codigo = f"{random.randint(10000000, 99999999):08d}"
    digito = f"{random.randint(0, 9)}"
    return f"{uf}{aamm}{cnpj}{mod}{serie}{num}{tp_emis}{codigo}{digito}"


@router.get("/invoices", response_model=List[FiscalInvoiceResponse])
def get_fiscal_invoices(db: Session = Depends(get_db)):
    invoices = db.query(FiscalInvoice).order_by(FiscalInvoice.issue_date.desc(), FiscalInvoice.id.desc()).all()
    return invoices


@router.post("/invoices", response_model=FiscalInvoiceResponse)
def create_fiscal_invoice(payload: FiscalInvoiceCreate, db: Session = Depends(get_db)):
    data = payload.dict()
    if not data.get("access_key"):
        data["access_key"] = generate_fake_access_key()
    
    if not data.get("funrural_value_rs"):
        # Funrural ~1.5% sobre valor bruto de comercialização do produtor rural
        data["funrural_value_rs"] = round(data["total_value_rs"] * 0.015, 2)

    inv = FiscalInvoice(**data)
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv


@router.post("/issue-from-harvest/{harvest_id}", response_model=FiscalInvoiceResponse)
def issue_invoice_from_harvest(harvest_id: int, buyer_name: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Gera instantaneamente a NF-e e Guia de Trânsito Animal (GTA)
    diretamente a partir de uma despesca concluída!
    """
    harvest = db.query(HarvestLog).filter(HarvestLog.id == harvest_id).first()
    if not harvest:
        raise HTTPException(status_code=404, detail="Registro de despesca não encontrado")

    existing = db.query(FiscalInvoice).filter(FiscalInvoice.harvest_id == harvest_id).first()
    if existing:
        return existing

    num = f"001.{random.randint(100, 999):03d}.{random.randint(100, 999):03d}"
    gta = f"GTA-RN-{random.randint(10000, 99999)}/2026"
    buyer = buyer_name or harvest.buyer_name or "Frigorífico Camarão Potiguar Ltda"
    total_val = round(harvest.total_weight_kg * harvest.price_per_kg, 2)
    funrural = round(total_val * 0.015, 2)

    inv = FiscalInvoice(
        invoice_number=num,
        series="1",
        access_key=generate_fake_access_key(),
        issue_date=harvest.date or dt.date.today(),
        buyer_name=buyer,
        buyer_cnpj_cpf="18.234.567/0001-89",
        buyer_location="Natal - RN",
        cfop="5.101",
        nature_of_operation="Venda de Camarão In Natura (Litopenaeus vannamei)",
        weight_kg=harvest.total_weight_kg,
        commercial_class=harvest.commercial_classification or "60/70",
        unit_price_kg=harvest.price_per_kg or 24.50,
        total_value_rs=total_val,
        funrural_value_rs=funrural,
        gta_number=gta,
        status="AUTORIZADA",
        harvest_id=harvest.id,
        notes=f"Emissão automática vinculada à despesca do lote #{harvest.batch_id}."
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv


@router.get("/summary")
def get_fiscal_summary(db: Session = Depends(get_db)):
    invoices = db.query(FiscalInvoice).all()
    total_invoiced = sum(i.total_value_rs for i in invoices if i.status == "AUTORIZADA")
    total_weight = sum(i.weight_kg for i in invoices if i.status == "AUTORIZADA")
    avg_price = round(total_invoiced / total_weight, 2) if total_weight > 0 else 0.0
    total_funrural = sum(i.funrural_value_rs for i in invoices if i.status == "AUTORIZADA")

    return {
        "total_invoices_issued": len(invoices),
        "total_invoiced_rs": round(total_invoiced, 2),
        "total_shrimp_shipped_kg": round(total_weight, 2),
        "average_sale_price_kg": avg_price,
        "total_funrural_withheld_rs": round(total_funrural, 2),
        "gta_manifests_count": sum(1 for i in invoices if i.gta_number),
    }
