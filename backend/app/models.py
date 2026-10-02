from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
import datetime as dt
from .database import Base


class Pond(Base):
    __tablename__ = "ponds"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    pond_type = Column(String(50), default="ENGORDA")  # BERCARIO_PL, ENGORDA, RACETRACK_BFT, MATURACAO
    surface_area_m2 = Column(Float, default=10000.0)  # Em carcinicultura viveiros são tipicamente de 0.5 a 3 hectares
    average_depth_m = Column(Float, default=1.3)
    volume_m3 = Column(Float, default=13000.0)
    aeration_hp_total = Column(Float, default=12.0)  # HP de aeração mecânica total (aeradores de pá/injetores)
    aeration_type = Column(String(100), default="Aeradores de Palheta 2.0cv (12 HP total)")
    bottom_type = Column(String(50), default="NATURAL_ARGILA")  # NATURAL_ARGILA, GEOMEMBRANA_PEAD
    status = Column(String(50), default="OCUPADO")  # OCUPADO, VAZIO, PREPARO_CALAGEM, ACLIMATACAO, SANITIZACAO
    notes = Column(Text, nullable=True)

    batches = relationship("ShrimpBatch", back_populates="pond", cascade="all, delete-orphan")
    water_logs = relationship("WaterQualityLog", back_populates="pond", cascade="all, delete-orphan")


class ShrimpBatch(Base):
    __tablename__ = "shrimp_batches"

    id = Column(Integer, primary_key=True, index=True)
    batch_code = Column(String(50), unique=True, nullable=False)
    pond_id = Column(Integer, ForeignKey("ponds.id"), nullable=False)
    species = Column(String(100), default="Litopenaeus vannamei")
    pl_stage = Column(String(50), default="PL10")  # PL8, PL10, PL12, PL15, JUVENIL
    origin_laboratory = Column(String(150), default="Larvicultura Mar Azul")
    stocking_date = Column(Date, default=dt.date.today)
    
    # Quantidades de Pós-larvas (milheiros / un)
    initial_pls_count = Column(Integer, nullable=False)  # Ex: 350.000 PLs
    current_shrimp_count = Column(Integer, nullable=False)
    stocking_density_pl_m2 = Column(Float, default=35.0)  # PLs/m2
    
    # Teste de Estresse na Recepção da PL (% sobrevivência em estresse salino de 30min)
    pl_stress_test_survival_pct = Column(Float, default=96.0)
    initial_salinity_lab_ppt = Column(Float, default=32.0)
    pond_target_salinity_ppt = Column(Float, default=15.0)

    # Pesos e Metas
    initial_avg_weight_g = Column(Float, default=0.005)  # PLs pesam frações de grama (~0.002 a 0.01g)
    current_avg_weight_g = Column(Float, default=0.005)
    target_harvest_weight_g = Column(Float, default=12.0)  # Classes comerciais: 10g, 12g, 15g, 18g
    target_harvest_date = Column(Date, nullable=True)
    commercial_class = Column(String(50), default="60/70")  # Contagem por kg (ex: 80/100, 70/80, 60/70, 50/60)
    status = Column(String(50), default="ATIVO")  # ATIVO, DESPESCADO, DESPESCA_PARCIAL

    pond = relationship("Pond", back_populates="batches")
    biometry_logs = relationship("BiometryLog", back_populates="batch", cascade="all, delete-orphan")
    feeding_logs = relationship("FeedingLog", back_populates="batch", cascade="all, delete-orphan")
    tray_evaluations = relationship("FeedingTrayLog", back_populates="batch", cascade="all, delete-orphan")
    mortality_logs = relationship("MortalityLog", back_populates="batch", cascade="all, delete-orphan")
    harvest_logs = relationship("HarvestLog", back_populates="batch", cascade="all, delete-orphan")


class BiometryLog(Base):
    __tablename__ = "biometry_logs"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("shrimp_batches.id"), nullable=False)
    date = Column(Date, default=dt.date.today)
    sample_count = Column(Integer, default=100)  # Amostragem padrão em tarrafa
    avg_weight_g = Column(Float, nullable=False)
    weekly_growth_gain_g = Column(Float, default=0.0)  # Ganho de peso semanal
    uniformity_percentage = Column(Float, default=85.0)  # Uniformidade do lote (%)
    gut_fullness_percent = Column(Float, default=90.0)  # Trato digestivo cheio (%)
    molt_stage = Column(String(50), default="INTERMUDA")  # INTERMUDA, PRE_MUDA, POS_MUDA (casca mole)
    estimated_biomass_kg = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)

    batch = relationship("ShrimpBatch", back_populates="biometry_logs")


class FeedInventory(Base):
    __tablename__ = "feed_inventory"

    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String(100), nullable=False)
    name = Column(String(150), nullable=False)  # Ex: Ração Inicial PL, DECOSOLO, SMART PACK
    category = Column(String(50), default="ENGORDA")  # INICIAL_PL, CRESCIMENTO, ENGORDA, NUTRACEUTICA, FERTILIZANTE, VEICULO, etc.
    item_type = Column(String(50), default="Ração")  # Ração, Fertilizante, Veículo, Corretivo / Químico, Probiótico, Medicamento / Vitamina, Outros
    unit = Column(String(20), default="kg")  # kg, g, L, ml, un, sc
    protein_percent = Column(Float, default=35.0)
    pellet_size_mm = Column(Float, default=1.6)
    current_stock_kg = Column(Float, default=1500.0)  # Quantidade atual
    min_stock_alert_kg = Column(Float, default=400.0)  # Estoque mínimo
    cost_per_kg = Column(Float, default=6.20)  # Preço médio unitário
    last_entry_price = Column(Float, default=6.20)  # Preço unitário da última entrada
    status = Column(String(50), default="NORMAL")  # NORMAL, ABAIXO_MINIMO, ESGOTADO
    location = Column(String(100), default="Galpão de Insumos")
    expiry_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)

    feeding_logs = relationship("FeedingLog", back_populates="feed_item")
    movements = relationship("InventoryMovement", back_populates="item", cascade="all, delete-orphan")


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("feed_inventory.id"), nullable=False)
    movement_type = Column(String(50), default="ENTRADA")  # ENTRADA, SAIDA_MANEJO, SAIDA_AJUSTE, PERDA
    date = Column(Date, default=dt.date.today)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, default=0.0)
    total_price = Column(Float, default=0.0)
    supplier_name = Column(String(150), nullable=True)
    invoice_number = Column(String(100), nullable=True)  # Nota Fiscal
    batch_number = Column(String(100), nullable=True)  # Lote do Fabricante
    notes = Column(Text, nullable=True)

    item = relationship("FeedInventory", back_populates="movements")


class ProductMix(Base):
    """Misturas & Formulações Especiais de Insumos (Blend de Ração + Aditivos / Probióticos)"""
    __tablename__ = "product_mixes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    target_stage = Column(String(100), default="Berçário & Engorda")
    total_weight_kg = Column(Float, default=100.0)
    cost_per_kg = Column(Float, default=8.50)
    recipe_json = Column(Text, nullable=False)  # JSON com lista de insumos, doses e custos
    instructions = Column(Text, nullable=True)
    ai_nutritional_summary = Column(Text, nullable=True)
    created_at = Column(Date, default=dt.date.today)



class FeedingLog(Base):
    __tablename__ = "feeding_logs"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("shrimp_batches.id"), nullable=False)
    feed_inventory_id = Column(Integer, ForeignKey("feed_inventory.id"), nullable=False)
    date = Column(Date, default=dt.date.today)
    trato_number = Column(Integer, default=1)  # Trato 1 (07h), Trato 2 (11h), Trato 3 (15h), Trato 4 (20h)
    time_of_day = Column(String(10), default="07:00")
    amount_kg = Column(Float, nullable=False)
    water_temp_c = Column(Float, default=28.5)
    dissolved_oxygen_mg_l = Column(Float, default=5.2)
    notes = Column(Text, nullable=True)

    batch = relationship("ShrimpBatch", back_populates="feeding_logs")
    feed_item = relationship("FeedInventory", back_populates="feeding_logs")


class FeedingTrayLog(Base):
    """Manejo de Comedouros / Bandejas de Alimentação - Padrão Ouro na Carcinicultura"""
    __tablename__ = "feeding_tray_logs"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("shrimp_batches.id"), nullable=False)
    date = Column(Date, default=dt.date.today)
    check_time = Column(String(10), default="09:30")  # Checagem ~2h após trato
    trays_inspected_count = Column(Integer, default=10)
    tray_status = Column(String(50), default="LIMPO")  # LIMPO (Aumentar), POUCA_SOBRA (Manter), SOBRA_MEDIA (Reduzir 15%), SOBRA_ALTA (Suspender)
    leftover_percentage = Column(Float, default=0.0)  # % de ração que sobrou
    ai_recommendation = Column(String(200), nullable=True)  # Recomendação da IA de ajuste em kg
    adjustment_suggested_pct = Column(Float, default=0.0)  # +10%, 0%, -15%, -100%

    batch = relationship("ShrimpBatch", back_populates="tray_evaluations")


class WaterQualityLog(Base):
    __tablename__ = "water_quality_logs"

    id = Column(Integer, primary_key=True, index=True)
    pond_id = Column(Integer, ForeignKey("ponds.id"), nullable=False)
    timestamp = Column(DateTime, default=dt.datetime.utcnow)
    
    # Parâmetros vitais de Carcinicultura
    salinity_ppt = Column(Float, default=15.0)  # Salinidade em ppt (partes por mil)
    dissolved_oxygen_mg_l = Column(Float, nullable=False)  # OD mg/L
    temperature_c = Column(Float, nullable=False)  # Temp °C
    ph = Column(Float, nullable=False)  # pH
    
    # Parâmetros químicos e iônicos fundamentais para camarão
    total_alkalinity_mg_l = Column(Float, default=140.0)  # Alcalinidade Total (mg/L CaCO3) - Mínimo 120 para muda
    total_hardness_mg_l = Column(Float, default=650.0)  # Dureza Total (mg/L CaCO3)
    calcium_mg_l = Column(Float, default=120.0)  # Ca2+
    magnesium_mg_l = Column(Float, default=360.0)  # Mg2+ (Ideal relação Mg:Ca ~ 3:1)
    
    # Compostos nitrogenados e transparência
    toxic_ammonia_nh3_mg_l = Column(Float, default=0.015)
    nitrite_no2_mg_l = Column(Float, default=0.04)  # Tóxico especialmente em baixa salinidade
    transparency_secchi_cm = Column(Float, default=32.0)  # 30-40cm ideal para cor de água diatomáceas/clorofíceas
    
    status = Column(String(50), default="IDEAL")  # IDEAL, ATENCAO, CRITICO
    notes = Column(Text, nullable=True)

    pond = relationship("Pond", back_populates="water_logs")


class MortalityLog(Base):
    __tablename__ = "mortality_logs"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("shrimp_batches.id"), nullable=False)
    date = Column(Date, default=dt.date.today)
    quantity = Column(Integer, nullable=False)
    probable_cause = Column(String(100), default="ROTINA_MUDA")  # HIPOXIA_NOTURNA, ROTINA_MUDA, SINDROME_MANCHA_BRANCA, BAIXA_ALCALINIDADE, TOXIDEZ_NITRITO, ESTRESSE_SALINIDADE
    notes = Column(Text, nullable=True)

    batch = relationship("ShrimpBatch", back_populates="mortality_logs")


class HarvestLog(Base):
    __tablename__ = "harvest_logs"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("shrimp_batches.id"), nullable=False)
    date = Column(Date, default=dt.date.today)
    harvest_type = Column(String(50), default="TOTAL")  # TOTAL, DESBASTE_PARCIAL
    total_weight_kg = Column(Float, nullable=False)
    shrimp_count_estimated = Column(Integer, nullable=False)
    avg_weight_g = Column(Float, nullable=False)
    commercial_classification = Column(String(50), default="60/70")  # 50/60, 60/70, 70/80
    price_per_kg = Column(Float, default=24.50)  # Preço típico camarão R$/kg
    total_revenue = Column(Float, nullable=False)
    buyer_name = Column(String(150), nullable=True)
    notes = Column(Text, nullable=True)

    batch = relationship("ShrimpBatch", back_populates="harvest_logs")


# ===================================================================
# WHATSAPP NOTIFICATIONS & AI BOT INTEGRATION
# ===================================================================
class WhatsAppAlertConfig(Base):
    __tablename__ = "whatsapp_alert_configs"

    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String(100), default="Collermhann")
    phone_number = Column(String(50), default="(84) 9 8858-5211")
    notify_despesca = Column(Boolean, default=True)
    notify_sync = Column(Boolean, default=True)
    notify_water_critical = Column(Boolean, default=True)
    notify_low_stock = Column(Boolean, default=True)
    notify_daily_ai_summary = Column(Boolean, default=True)
    auto_ai_agent_enabled = Column(Boolean, default=True)  # Resposta automática interativa pelo Zap
    updated_at = Column(DateTime, default=dt.datetime.utcnow)


class WhatsAppMessageLog(Base):
    __tablename__ = "whatsapp_message_logs"

    id = Column(Integer, primary_key=True, index=True)
    direction = Column(String(10), default="OUTGOING")  # OUTGOING, INCOMING
    phone_number = Column(String(50), default="(84) 9 8858-5211")
    message_type = Column(String(50), default="DESPESCA")  # DESPESCA, SINCRONIZACAO, AGUA_CRITICA, ESTOQUE, IA_CHAT, RESUMO_DIARIO
    content = Column(Text, nullable=False)
    status = Column(String(30), default="ENVIADO")  # ENVIADO, ENTREGUE, LIDO
    timestamp = Column(DateTime, default=dt.datetime.utcnow)


# ===================================================================
# EMISSÃO DE NOTA FISCAL & GUIA DE TRÂNSITO ANIMAL (GTA)
# ===================================================================
class FiscalInvoice(Base):
    __tablename__ = "fiscal_invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(50), unique=True, nullable=False)  # Ex: "001.042.891"
    series = Column(String(10), default="1")
    access_key = Column(String(60), nullable=False)  # Chave de 44 dígitos da NF-e
    issue_date = Column(Date, default=dt.date.today)
    buyer_name = Column(String(150), nullable=False)
    buyer_cnpj_cpf = Column(String(30), default="18.234.567/0001-89")
    buyer_location = Column(String(100), default="Natal - RN")
    cfop = Column(String(10), default="5.101")  # Venda de produção do estabelecimento
    nature_of_operation = Column(String(100), default="Venda de Camarão In Natura (Litopenaeus vannamei)")
    weight_kg = Column(Float, nullable=False)
    commercial_class = Column(String(50), default="60/70")
    unit_price_kg = Column(Float, default=26.50)
    total_value_rs = Column(Float, nullable=False)
    funrural_value_rs = Column(Float, default=0.0)
    gta_number = Column(String(50), nullable=True)  # Guia de Trânsito Animal
    status = Column(String(30), default="AUTORIZADA")  # AUTORIZADA, CANCELADA, EM_DIGITACAO
    harvest_id = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)


# ===================================================================
# GESTÃO DE EQUIPAMENTOS, ATIVOS & MANUTENÇÃO PREDITIVA IA
# ===================================================================
class Equipment(Base):
    __tablename__ = "equipments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)  # Ex: "Aerador de Palheta 2.0cv - V01-A1"
    category = Column(String(50), default="AERADOR")  # AERADOR, SOPRADOR, BOMBA, GERADOR, ALIMENTADOR, SENSOR_OD
    brand_model = Column(String(150), default="AquaPower Pro 2.0cv")
    pond_id = Column(Integer, ForeignKey("ponds.id"), nullable=True)
    power_hp = Column(Float, default=2.0)
    voltage = Column(String(30), default="220V/380V Trifásico")
    hourmeter_hours = Column(Float, default=1240.0)  # Horímetro acumulado
    hours_since_last_maintenance = Column(Float, default=140.0)
    maintenance_interval_hours = Column(Float, default=500.0)  # Revisão preventiva a cada 500h
    status = Column(String(30), default="OPERACIONAL")  # OPERACIONAL, REVISAO_URGENTE, EM_MANUTENCAO, DESATIVADO
    location = Column(String(100), default="Viveiro 01")
    last_maintenance_date = Column(Date, nullable=True)
    next_maintenance_date = Column(Date, nullable=True)
    ai_failure_risk_pct = Column(Float, default=8.0)  # Probabilidade preditiva de falha por IA
    ai_health_status = Column(String(150), default="Equipamento operando com vibração e corrente normais")
    notes = Column(Text, nullable=True)

    pond = relationship("Pond")
    maintenance_logs = relationship("EquipmentMaintenanceLog", back_populates="equipment", cascade="all, delete-orphan")


class EquipmentMaintenanceLog(Base):
    __tablename__ = "equipment_maintenance_logs"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipments.id"), nullable=False)
    date = Column(Date, default=dt.date.today)
    maintenance_type = Column(String(50), default="PREVENTIVA")  # PREVENTIVA, CORRETIVA, LUBRIFICACAO, TROCA_ROLAMENTO, CALIBRACAO
    description = Column(Text, nullable=False)
    replaced_parts = Column(String(200), nullable=True)
    cost_rs = Column(Float, default=0.0)
    technician_name = Column(String(100), default="Oficina da Fazenda")
    hourmeter_at_maintenance = Column(Float, default=0.0)

    equipment = relationship("Equipment", back_populates="maintenance_logs")


# ===================================================================
# MÓDULO COMERCIAL: LOTES VENDIDOS, FLUXO DE CAIXA & CONTAS BANCÁRIAS
# ===================================================================
class CommercialSale(Base):
    __tablename__ = "commercial_sales"

    id = Column(Integer, primary_key=True, index=True)
    sale_date = Column(Date, default=dt.date.today)
    batch_id = Column(Integer, ForeignKey("shrimp_batches.id"), nullable=True)
    pond_id = Column(Integer, ForeignKey("ponds.id"), nullable=True)
    buyer_name = Column(String(150), nullable=False)
    buyer_document = Column(String(30), default="00.000.000/0001-00")
    buyer_city = Column(String(100), default="João Pessoa - PB")
    commercial_class = Column(String(50), default="60/70")  # 40/50, 50/60, 60/70, 70/80, 80/100
    quantity_kg = Column(Float, nullable=False)
    unit_price_kg = Column(Float, nullable=False)
    gross_total_rs = Column(Float, nullable=False)
    net_total_rs = Column(Float, nullable=False)
    discount_or_taxes_rs = Column(Float, default=0.0)
    payment_method = Column(String(50), default="PIX")  # PIX, BOLETO, TRANSFERENCIA, PRAZO_30D
    payment_status = Column(String(30), default="PAGO")  # PAGO, PENDENTE, PARCIAL
    invoice_number = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)

    batch = relationship("ShrimpBatch")
    pond = relationship("Pond")


class BankAccount(Base):
    __tablename__ = "bank_accounts"

    id = Column(Integer, primary_key=True, index=True)
    bank_code = Column(String(10), default="001")  # Código Febraban (001=BB, 033=Santander, 756=Sicoob, etc.)
    bank_name = Column(String(100), nullable=False)  # Ex: "Banco do Brasil", "Sicoob Nordeste"
    account_type = Column(String(50), default="CORRENTE")  # CORRENTE, POUPANCA, APLICACAO
    agency = Column(String(20), default="1618-7")
    account_number = Column(String(30), default="25489-0")
    holder_name = Column(String(150), default="River Life Aquicultura Ltda")
    current_balance_rs = Column(Float, default=45000.0)
    pix_key = Column(String(100), default="financeiro@riverlife.com.br")
    is_active = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)

    movements = relationship("CashFlowMovement", back_populates="bank_account", cascade="all, delete-orphan")


class CashFlowMovement(Base):
    __tablename__ = "cash_flow_movements"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, default=dt.date.today)
    movement_type = Column(String(20), nullable=False)  # ENTRADA, SAIDA
    category = Column(String(80), nullable=False)  # VENDA_CAMARAO, RACAO, POS_LARVAS, ENERGIA_ELETRICA, PROBIOTICOS, MANUTENCAO, FOLHA_PAGAMENTO, IMPOSTOS
    description = Column(String(200), nullable=False)
    amount_rs = Column(Float, nullable=False)
    status = Column(String(30), default="REALIZADO")  # REALIZADO, PREVISTO
    bank_account_id = Column(Integer, ForeignKey("bank_accounts.id"), nullable=True)
    cost_center = Column(String(80), default="Produção Engorda")
    pond_id = Column(Integer, ForeignKey("ponds.id"), nullable=True)
    batch_id = Column(Integer, ForeignKey("shrimp_batches.id"), nullable=True)
    document_ref = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)

    bank_account = relationship("BankAccount", back_populates="movements")
    pond = relationship("Pond")
    batch = relationship("ShrimpBatch")


# ===================================================================
# MÓDULO MINHA FAZENDA: CARCINICULTURA JOÃO PESSOA / PARAIBA
# ===================================================================
class FarmProfile(Base):
    __tablename__ = "farm_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), default="River Life Aquicultura & Camarão")
    corporate_name = Column(String(200), default="River Life Carcinicultura do Nordeste Ltda")
    cnpj = Column(String(30), default="32.845.912/0001-44")
    state_registration = Column(String(30), default="16.984.231-0")
    address = Column(String(200), default="Rodovia PB-018, Km 14, Zona Rural")
    city = Column(String(100), default="João Pessoa")
    state = Column(String(10), default="PB")
    zip_code = Column(String(20), default="58000-000")
    latitude = Column(Float, default=-7.1153)
    longitude = Column(Float, default=-34.8631)
    water_source_type = Column(String(100), default="Estuário do Rio Paraíba (Maré Salobra)")
    average_salinity_ppt = Column(Float, default=18.5)
    total_area_hectares = Column(Float, default=18.4)
    water_surface_hectares = Column(Float, default=12.2)
    active_ponds_count = Column(Integer, default=6)
    technician_in_charge = Column(String(150), default="Dr. Arnaldo Bezerra (Eng. de Pesca - UFRPE/UFPB)")
    council_registration = Column(String(50), default="CREA-PB 14.892-D")
    environmental_license = Column(String(100), default="SUDEMA-PB LO nº 2024/0981-L")
    phone = Column(String(30), default="(83) 99876-5432")
    email = Column(String(100), default="contato@riverlife.com.br")
    notes = Column(Text, nullable=True)

