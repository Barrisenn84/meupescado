from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import datetime as dt


# POND SCHEMAS
class PondBase(BaseModel):
    name: str
    pond_type: str = "ENGORDA"  # BERCARIO_PL, ENGORDA, RACETRACK_BFT, MATURACAO
    surface_area_m2: float = 10000.0
    average_depth_m: float = 1.3
    volume_m3: float = 13000.0
    aeration_hp_total: float = 12.0
    aeration_type: str = "Aeradores de Palheta 2.0cv (12 HP total)"
    bottom_type: str = "NATURAL_ARGILA"
    status: str = "OCUPADO"
    notes: Optional[str] = None


class PondCreate(PondBase):
    pass


class PondResponse(PondBase):
    id: int
    active_batch_code: Optional[str] = None
    active_batch_id: Optional[int] = None
    species: Optional[str] = None
    pl_stage: Optional[str] = None
    current_shrimp_count: Optional[int] = None
    current_biomass_kg: Optional[float] = None
    stocking_density_pl_m2: Optional[float] = None
    last_water_status: Optional[str] = "IDEAL"
    last_do_mg_l: Optional[float] = None
    last_salinity_ppt: Optional[float] = None
    last_temp_c: Optional[float] = None
    last_ph: Optional[float] = None
    last_alkalinity_mg_l: Optional[float] = None

    class Config:
        from_attributes = True


# SHRIMP BATCH SCHEMAS
class ShrimpBatchBase(BaseModel):
    batch_code: str
    pond_id: int
    species: str = "Litopenaeus vannamei"
    pl_stage: str = "PL10"
    origin_laboratory: str = "Larvicultura Mar Azul"
    stocking_date: dt.date = Field(default_factory=dt.date.today)
    initial_pls_count: int = 350000
    current_shrimp_count: int = 350000
    stocking_density_pl_m2: float = 35.0
    pl_stress_test_survival_pct: float = 96.0
    initial_salinity_lab_ppt: float = 32.0
    pond_target_salinity_ppt: float = 15.0
    initial_avg_weight_g: float = 0.005
    current_avg_weight_g: float = 0.005
    target_harvest_weight_g: float = 12.0
    target_harvest_date: Optional[dt.date] = None
    commercial_class: str = "60/70"
    status: str = "ATIVO"


class ShrimpBatchCreate(ShrimpBatchBase):
    pass


class ShrimpBatchResponse(ShrimpBatchBase):
    id: int
    pond_name: Optional[str] = None
    days_of_culture: Optional[int] = 0
    current_biomass_kg: Optional[float] = 0.0
    survival_rate_percent: Optional[float] = 100.0
    accumulated_feed_kg: Optional[float] = 0.0
    feed_conversion_ratio: Optional[float] = 1.0  # CAA

    class Config:
        from_attributes = True


# BIOMETRY SCHEMAS
class BiometryLogBase(BaseModel):
    batch_id: int
    date: dt.date = Field(default_factory=dt.date.today)
    sample_count: int = 100
    avg_weight_g: float
    weekly_growth_gain_g: Optional[float] = 0.0
    uniformity_percentage: Optional[float] = 85.0
    gut_fullness_percent: Optional[float] = 90.0
    molt_stage: str = "INTERMUDA"
    estimated_biomass_kg: Optional[float] = None
    notes: Optional[str] = None


class BiometryLogCreate(BiometryLogBase):
    pass


class BiometryLogResponse(BiometryLogBase):
    id: int
    batch_code: Optional[str] = None
    pond_name: Optional[str] = None

    class Config:
        from_attributes = True


# FEED & STOCK INVENTORY SCHEMAS
class FeedInventoryBase(BaseModel):
    brand: str
    name: str
    category: str = "ENGORDA"  # INICIAL_PL, CRESCIMENTO, ENGORDA, NUTRACEUTICA, FERTILIZANTE, VEICULO, CORRETIVO, PROBIOTICO, etc.
    item_type: str = "Ração"  # Ração, Fertilizante, Veículo, Corretivo / Químico, Probiótico, Medicamento / Vitamina, Outros
    unit: str = "kg"  # kg, g, L, ml, un, sc
    protein_percent: Optional[float] = 35.0
    pellet_size_mm: Optional[float] = 1.6
    current_stock_kg: float = 0.0  # Quantidade atual
    min_stock_alert_kg: float = 0.0  # Estoque mínimo
    cost_per_kg: float = 0.0  # Preço médio unitário
    last_entry_price: Optional[float] = 0.0  # Preço última entrada
    status: Optional[str] = "NORMAL"  # NORMAL, ABAIXO_MINIMO, ESGOTADO
    location: Optional[str] = "Galpão de Insumos"
    expiry_date: Optional[dt.date] = None
    notes: Optional[str] = None


class FeedInventoryCreate(FeedInventoryBase):
    pass


class FeedInventoryResponse(FeedInventoryBase):
    id: int
    is_low_stock: Optional[bool] = False
    total_value_rs: Optional[float] = 0.0
    days_of_autonomy_ai: Optional[int] = None
    ai_reorder_recommendation: Optional[str] = None

    class Config:
        from_attributes = True


# INVENTORY MOVEMENTS (ENTRADAS, SAÍDAS, COMPRAS, AJUSTES)
class InventoryMovementBase(BaseModel):
    item_id: int
    movement_type: str = "ENTRADA"  # ENTRADA, SAIDA_MANEJO, SAIDA_AJUSTE, PERDA
    date: dt.date = Field(default_factory=dt.date.today)
    quantity: float
    unit_price: float = 0.0
    total_price: float = 0.0
    supplier_name: Optional[str] = None
    invoice_number: Optional[str] = None
    batch_number: Optional[str] = None
    notes: Optional[str] = None


class InventoryMovementCreate(InventoryMovementBase):
    pass


class InventoryMovementResponse(InventoryMovementBase):
    id: int
    item_name: Optional[str] = None
    item_type: Optional[str] = None
    unit: Optional[str] = None

    class Config:
        from_attributes = True


# PRODUCT MIXES & BLENDS (MISTURAS IA)
class ProductMixBase(BaseModel):
    name: str
    target_stage: str = "Berçário & Engorda"
    total_weight_kg: float = 100.0
    cost_per_kg: float = 8.50
    recipe_json: str  # JSON list of ingredients, dosages, costs
    instructions: Optional[str] = None
    ai_nutritional_summary: Optional[str] = None
    created_at: dt.date = Field(default_factory=dt.date.today)


class ProductMixCreate(ProductMixBase):
    pass


class ProductMixResponse(ProductMixBase):
    id: int

    class Config:
        from_attributes = True



# FEEDING LOG SCHEMAS
class FeedingLogBase(BaseModel):
    batch_id: int
    feed_inventory_id: int
    date: dt.date = Field(default_factory=dt.date.today)
    trato_number: int = 1
    time_of_day: str = "07:00"
    amount_kg: float
    water_temp_c: float = 28.5
    dissolved_oxygen_mg_l: float = 5.2
    notes: Optional[str] = None


class FeedingLogCreate(FeedingLogBase):
    pass


class FeedingLogResponse(FeedingLogBase):
    id: int
    batch_code: Optional[str] = None
    pond_name: Optional[str] = None
    feed_name: Optional[str] = None

    class Config:
        from_attributes = True


# FEEDING TRAY SCHEMAS (Bandejas de Comedouros)
class FeedingTrayLogBase(BaseModel):
    batch_id: int
    date: dt.date = Field(default_factory=dt.date.today)
    check_time: str = "09:30"
    trays_inspected_count: int = 10
    tray_status: str = "LIMPO"  # LIMPO, POUCA_SOBRA, SOBRA_MEDIA, SOBRA_ALTA
    leftover_percentage: float = 0.0
    ai_recommendation: Optional[str] = None
    adjustment_suggested_pct: Optional[float] = 0.0


class FeedingTrayLogCreate(FeedingTrayLogBase):
    pass


class FeedingTrayLogResponse(FeedingTrayLogBase):
    id: int
    batch_code: Optional[str] = None
    pond_name: Optional[str] = None

    class Config:
        from_attributes = True


# WATER QUALITY SCHEMAS
class WaterQualityLogBase(BaseModel):
    pond_id: int
    timestamp: dt.datetime = Field(default_factory=dt.datetime.utcnow)
    salinity_ppt: float = 15.0
    dissolved_oxygen_mg_l: float
    temperature_c: float
    ph: float
    total_alkalinity_mg_l: float = 140.0
    total_hardness_mg_l: float = 650.0
    calcium_mg_l: float = 120.0
    magnesium_mg_l: float = 360.0
    toxic_ammonia_nh3_mg_l: float = 0.015
    nitrite_no2_mg_l: float = 0.04
    transparency_secchi_cm: float = 32.0
    status: str = "IDEAL"
    notes: Optional[str] = None


class WaterQualityLogCreate(WaterQualityLogBase):
    pass


class WaterQualityLogResponse(WaterQualityLogBase):
    id: int
    pond_name: Optional[str] = None
    mg_ca_ratio: Optional[float] = 3.0

    class Config:
        from_attributes = True


# MORTALITY SCHEMAS
class MortalityLogBase(BaseModel):
    batch_id: int
    date: dt.date = Field(default_factory=dt.date.today)
    quantity: int
    probable_cause: str = "ROTINA_MUDA"
    notes: Optional[str] = None


class MortalityLogCreate(MortalityLogBase):
    pass


class MortalityLogResponse(MortalityLogBase):
    id: int
    batch_code: Optional[str] = None
    pond_name: Optional[str] = None

    class Config:
        from_attributes = True


# HARVEST SCHEMAS
class HarvestLogBase(BaseModel):
    batch_id: int
    date: dt.date = Field(default_factory=dt.date.today)
    harvest_type: str = "TOTAL"
    total_weight_kg: float
    shrimp_count_estimated: int
    avg_weight_g: float
    commercial_classification: str = "60/70"
    price_per_kg: float = 24.50
    total_revenue: float
    buyer_name: Optional[str] = None
    notes: Optional[str] = None


class HarvestLogCreate(HarvestLogBase):
    pass


class HarvestLogResponse(HarvestLogBase):
    id: int
    batch_code: Optional[str] = None
    pond_name: Optional[str] = None

    class Config:
        from_attributes = True


# DASHBOARD SUMMARY
class DashboardSummary(BaseModel):
    farm_name: str = "River Life (Área Fazenda)"
    farm_location: str = "Mogeiro - PB"
    total_ponds: int
    active_ponds: int
    total_stocked_ponds: int = 0
    cultivation_cost_total_rs: float = 0.0
    expected_revenue_total_rs: float = 0.0
    expected_profit_total_rs: float = 0.0
    expected_margin_percent: float = 0.0
    total_live_shrimp: int
    total_biomass_kg: float
    average_fcr: float
    average_survival_percent: float
    total_feed_stock_kg: float
    total_feed_consumed_cycle_kg: float = 0.0
    critical_water_alerts: int
    critical_alkalinity_alerts: int
    low_feed_alerts: int
    monthly_feed_consumption_kg: float
    projected_harvest_kg_next_30_days: float
    weather_info: Optional[Dict[str, Any]] = None
    lunar_info: Optional[Dict[str, Any]] = None
    ai_advisory: Optional[Dict[str, Any]] = None



# ===================================================================
# AI SUITE SCHEMAS
# ===================================================================
class AIChatRequest(BaseModel):
    message: str
    context_pond_id: Optional[int] = None
    context_batch_id: Optional[int] = None


class AIChatResponse(BaseModel):
    answer: str
    recommendations: List[str] = []
    suggested_actions: List[Dict[str, str]] = []
    confidence_score: float = 0.98


class AIFeedingAdjustmentRequest(BaseModel):
    batch_id: int
    current_biomass_kg: float
    water_temp_c: float
    dissolved_oxygen_mg_l: float
    leftover_percentage: float  # Sobra na bandeja (%)
    current_trato_kg: float


class AIFeedingAdjustmentResponse(BaseModel):
    recommended_trato_kg: float
    adjustment_percentage: float
    explanation: str
    tray_diagnosis: str
    urgent_alerts: List[str] = []


class AIIonicBalanceRequest(BaseModel):
    pond_id: int
    pond_volume_m3: float
    current_salinity_ppt: float
    current_alkalinity_mg_l: float
    current_calcium_mg_l: float
    current_magnesium_mg_l: float


class AIIonicBalanceResponse(BaseModel):
    status: str  # IDEAL, DESBALANCEADO, CRITICO_MUDA
    current_mg_ca_ratio: float
    target_mg_ca_ratio: float
    bicarbonate_sodium_kg_needed: float
    calcium_carbonate_kg_needed: float
    magnesium_chloride_kg_needed: float
    explanation: str
    step_by_step_application: List[str]


class AIGrowthForecastResponse(BaseModel):
    batch_code: str
    pond_name: str
    current_weight_g: float
    days_of_culture: int
    forecast_timeline: List[Dict[str, Any]]
    target_10g_date: str
    target_12g_date: str
    target_15g_date: str
    target_18g_date: str
    optimal_harvest_recommendation: str


# ===================================================================
# WHATSAPP NOTIFICATIONS SCHEMAS
# ===================================================================
class WhatsAppConfigBase(BaseModel):
    user_name: str = "Collermhann"
    phone_number: str = "(84) 9 8858-5211"
    notify_despesca: bool = True
    notify_sync: bool = True
    notify_water_critical: bool = True
    notify_low_stock: bool = True
    notify_daily_ai_summary: bool = True
    auto_ai_agent_enabled: bool = True


class WhatsAppConfigCreate(WhatsAppConfigBase):
    pass


class WhatsAppConfigResponse(WhatsAppConfigBase):
    id: int
    updated_at: Optional[dt.datetime] = None

    class Config:
        from_attributes = True


class WhatsAppMessageLogResponse(BaseModel):
    id: int
    direction: str
    phone_number: str
    message_type: str
    content: str
    status: str
    timestamp: dt.datetime

    class Config:
        from_attributes = True


class WhatsAppBotChatRequest(BaseModel):
    user_message: str
    phone_number: Optional[str] = "(84) 9 8858-5211"


class WhatsAppBotChatResponse(BaseModel):
    bot_reply: str
    detected_intent: str
    suggested_action: Optional[str] = None
    action_executed: bool = False


# ===================================================================
# FISCAL INVOICES & GTA SCHEMAS
# ===================================================================
class FiscalInvoiceBase(BaseModel):
    invoice_number: str
    series: str = "1"
    access_key: str
    issue_date: dt.date = Field(default_factory=dt.date.today)
    buyer_name: str
    buyer_cnpj_cpf: str = "18.234.567/0001-89"
    buyer_location: str = "Natal - RN"
    cfop: str = "5.101"
    nature_of_operation: str = "Venda de Camarão In Natura (Litopenaeus vannamei)"
    weight_kg: float
    commercial_class: str = "60/70"
    unit_price_kg: float = 26.50
    total_value_rs: float
    funrural_value_rs: float = 0.0
    gta_number: Optional[str] = None
    status: str = "AUTORIZADA"
    harvest_id: Optional[int] = None
    notes: Optional[str] = None


class FiscalInvoiceCreate(FiscalInvoiceBase):
    pass


class FiscalInvoiceResponse(FiscalInvoiceBase):
    id: int

    class Config:
        from_attributes = True


# ===================================================================
# EQUIPMENT & PREDICTIVE MAINTENANCE SCHEMAS
# ===================================================================
class EquipmentBase(BaseModel):
    name: str
    category: str = "AERADOR"  # AERADOR, SOPRADOR, BOMBA, GERADOR, ALIMENTADOR, SENSOR_OD
    brand_model: str = "AquaPower Pro 2.0cv"
    pond_id: Optional[int] = None
    power_hp: float = 2.0
    voltage: str = "220V/380V Trifásico"
    hourmeter_hours: float = 1240.0
    hours_since_last_maintenance: float = 140.0
    maintenance_interval_hours: float = 500.0
    status: str = "OPERACIONAL"
    location: str = "Viveiro 01"
    last_maintenance_date: Optional[dt.date] = None
    next_maintenance_date: Optional[dt.date] = None
    ai_failure_risk_pct: float = 8.0
    ai_health_status: str = "Equipamento operando com vibração e corrente normais"
    notes: Optional[str] = None


class EquipmentCreate(EquipmentBase):
    pass


class EquipmentResponse(EquipmentBase):
    id: int
    pond_name: Optional[str] = None
    hours_to_next_maintenance: Optional[float] = None

    class Config:
        from_attributes = True


class EquipmentMaintenanceLogBase(BaseModel):
    equipment_id: int
    date: dt.date = Field(default_factory=dt.date.today)
    maintenance_type: str = "PREVENTIVA"
    description: str
    replaced_parts: Optional[str] = None
    cost_rs: float = 0.0
    technician_name: str = "Oficina da Fazenda"
    hourmeter_at_maintenance: float = 0.0


class EquipmentMaintenanceLogCreate(EquipmentMaintenanceLogBase):
    pass


class EquipmentMaintenanceLogResponse(EquipmentMaintenanceLogBase):
    id: int
    equipment_name: Optional[str] = None

    class Config:
        from_attributes = True


# MULTIMODAL COMPUTER VISION SCHEMAS (SMARTPHONE CAMERA / UPLOAD)
class AIImageAnalysisRequest(BaseModel):
    image_base64: str  # Suporta data:image/...;base64,... ou base64 direto
    analysis_mode: str = "general_diagnosis"  # tray_feeding, shrimp_health, water_quality, invoice_ocr, general_diagnosis
    custom_prompt: Optional[str] = None
    pond_id: Optional[int] = None


class AIImageAnalysisResponse(BaseModel):
    title: str
    summary: str
    confidence_score: int
    zootecnic_status: str  # IDEAL, ATENCAO, CRITICO
    detected_items: List[str]
    action_plan: List[str]
    suggested_action: Optional[str] = None  # adjust_feeding, add_inventory, record_water, open_copilot
    extracted_data: Optional[Dict[str, Any]] = None

