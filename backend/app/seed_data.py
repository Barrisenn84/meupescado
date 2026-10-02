from datetime import date, datetime, timedelta
import json
from sqlalchemy.orm import Session
from .models import (
    Pond, ShrimpBatch, BiometryLog, FeedInventory,
    FeedingLog, FeedingTrayLog, WaterQualityLog, MortalityLog, HarvestLog,
    InventoryMovement, ProductMix,
    WhatsAppAlertConfig, WhatsAppMessageLog, FiscalInvoice, Equipment, EquipmentMaintenanceLog,
    CommercialSale, BankAccount, CashFlowMovement, FarmProfile
)


def seed_database(db: Session):
    # Only seed if database is empty
    if db.query(Pond).first():
        return

    # 1. Ponds (Carcinicultura: Berçários e Viveiros de Engorda)
    p1 = Pond(
        name="Berçário Intensivo B-01",
        pond_type="BERCARIO_PL",
        surface_area_m2=1500.0,
        average_depth_m=1.2,
        volume_m3=1800.0,
        aeration_hp_total=10.0,
        aeration_type="Soprador de Ar com Mangueiras Microperfuradas + 2x Aeradores Palheta 2.0cv",
        bottom_type="GEOMEMBRANA_PEAD",
        status="OCUPADO",
        notes="Berçário primário com controle de bioflocos e aclimatação contínua de PLs.",
    )
    p2 = Pond(
        name="Viveiro 01 - Engorda",
        pond_type="ENGORDA",
        surface_area_m2=12000.0,  # 1.2 hectares
        average_depth_m=1.3,
        volume_m3=15600.0,
        aeration_hp_total=16.0,
        aeration_type="4x Aeradores de Palheta 2.0cv + 4x Injetores Ar Submerso",
        bottom_type="NATURAL_ARGILA",
        status="OCUPADO",
        notes="Lote intermediário em ótimo ritmo de crescimento.",
    )
    p3 = Pond(
        name="Viveiro 02 - Engorda",
        pond_type="ENGORDA",
        surface_area_m2=15000.0,  # 1.5 hectares
        average_depth_m=1.4,
        volume_m3=21000.0,
        aeration_hp_total=20.0,
        aeration_type="5x Aeradores de Palheta 2.0cv + 5x Injetores",
        bottom_type="NATURAL_ARGILA",
        status="OCUPADO",
        notes="Cultivo semi-intensivo com 35 camarões/m².",
    )
    p4 = Pond(
        name="Viveiro 03 - Terminação",
        pond_type="ENGORDA",
        surface_area_m2=10000.0,  # 1.0 hectare
        average_depth_m=1.3,
        volume_m3=13000.0,
        aeration_hp_total=18.0,
        aeration_type="6x Aeradores de Palheta 2.0cv (12 HP) + Injetores",
        bottom_type="NATURAL_ARGILA",
        status="OCUPADO",
        notes="Camarão atingindo tamanho comercial 60/70. Programando despesca.",
    )
    p5 = Pond(
        name="Racetrack Superintensivo R-01",
        pond_type="RACETRACK_BFT",
        surface_area_m2=600.0,
        average_depth_m=1.5,
        volume_m3=900.0,
        aeration_hp_total=14.0,
        aeration_type="Soprador Roots 10cv + Bicos Venturi",
        bottom_type="GEOMEMBRANA_PEAD",
        status="OCUPADO",
        notes="Sistema BFT (Bioflocos) em altíssima densidade (150 camarões/m²).",
    )
    p6 = Pond(
        name="Viveiro 04 - Preparação",
        pond_type="ENGORDA",
        surface_area_m2=14000.0,
        average_depth_m=1.3,
        volume_m3=18200.0,
        aeration_hp_total=16.0,
        aeration_type="Aeradores em manutenção",
        bottom_type="NATURAL_ARGILA",
        status="PREPARO_CALAGEM",
        notes="Secagem do solo ao sol e aplicação de 1.5 ton de calcário dolomítico e cal virgem.",
    )

    db.add_all([p1, p2, p3, p4, p5, p6])
    db.commit()

    # 2. Feed & Input Inventory (Controle de Estoque & Insumos Inteligente)
    # Produtos reais visualizados nas telas do cliente + insumos vitais
    p_decosolo = FeedInventory(
        brand="Deco",
        name="DECOSOLO",
        category="FERTILIZANTE",
        item_type="Fertilizante",
        unit="kg",
        current_stock_kg=0.0,
        min_stock_alert_kg=50.0,
        cost_per_kg=0.0,
        last_entry_price=0.0,
        status="ESGOTADO",
        location="Galpão de Fertilizantes",
        notes="Fertilizante de base para correção de solo e preparação de viveiro"
    )
    p_samaria = FeedInventory(
        brand="Samaria",
        name="RAÇÃO SAMARIA STARTER",
        category="INICIAL_PL",
        item_type="Ração",
        unit="kg",
        protein_percent=40.0,
        pellet_size_mm=1.0,
        current_stock_kg=350.0,
        min_stock_alert_kg=200.0,
        cost_per_kg=12.20,
        last_entry_price=12.20,
        status="NORMAL",
        location="Depósito Climatizado A",
        notes="Ração micropeletizada para estágios iniciais PL10 a Juvenil"
    )
    p_smartpack = FeedInventory(
        brand="Smart Aqua",
        name="SMART PACK",
        category="VEICULO",
        item_type="Veículo",
        unit="kg",
        current_stock_kg=0.0,
        min_stock_alert_kg=25.0,
        cost_per_kg=0.0,
        last_entry_price=0.0,
        status="ESGOTADO",
        location="Depósito B",
        notes="Veículo emulsificante e aglutinante para adesão de suplementos à ração"
    )
    f1 = FeedInventory(
        brand="Guabi",
        name="Potimirim PL 40% PB Micropeletizada 0.8-1.2mm",
        category="INICIAL_PL",
        item_type="Ração",
        unit="kg",
        protein_percent=40.0,
        pellet_size_mm=1.0,
        current_stock_kg=450.0,
        min_stock_alert_kg=150.0,
        cost_per_kg=11.50,
        last_entry_price=11.50,
        status="NORMAL",
        location="Galpão Principal",
    )
    f2 = FeedInventory(
        brand="Presence",
        name="Camarão Crescimento 35% PB 1.6mm",
        category="CRESCIMENTO",
        item_type="Ração",
        unit="kg",
        protein_percent=35.0,
        pellet_size_mm=1.6,
        current_stock_kg=2200.0,
        min_stock_alert_kg=500.0,
        cost_per_kg=6.40,
        last_entry_price=6.40,
        status="NORMAL",
        location="Galpão Principal",
    )
    f3 = FeedInventory(
        brand="Nutrifish",
        name="AquaShrimp Engorda 32% PB 2.0mm Alta Estabilidade",
        category="ENGORDA",
        item_type="Ração",
        unit="kg",
        protein_percent=32.0,
        pellet_size_mm=2.0,
        current_stock_kg=1350.0,
        min_stock_alert_kg=400.0,
        cost_per_kg=5.80,
        last_entry_price=5.80,
        status="NORMAL",
        location="Galpão Principal",
    )
    f4 = FeedInventory(
        brand="BioAqualab",
        name="Ração Funcional Imuno-Boost 38% PB (Nutracêutica)",
        category="NUTRACEUTICA",
        item_type="Ração",
        unit="kg",
        protein_percent=38.0,
        pellet_size_mm=1.6,
        current_stock_kg=180.0,  # Below min alert (300kg)
        min_stock_alert_kg=300.0,
        cost_per_kg=14.20,
        last_entry_price=14.20,
        status="ABAIXO_MINIMO",
        location="Galpão Principal",
    )
    p_bicarb = FeedInventory(
        brand="Química Nacional",
        name="Bicarbonato de Sódio Grau Aquícola 99%",
        category="CORRETIVO",
        item_type="Corretivo / Químico",
        unit="kg",
        current_stock_kg=1200.0,
        min_stock_alert_kg=500.0,
        cost_per_kg=3.80,
        last_entry_price=3.80,
        status="NORMAL",
        location="Depósito Químico",
        notes="Essencial para tamponamento e manutenção da alcalinidade > 120 mg/L"
    )
    p_calcario = FeedInventory(
        brand="Mineração Vale Verde",
        name="Calcário Dolomítico Puro (PRNT 90%)",
        category="CORRETIVO",
        item_type="Corretivo / Químico",
        unit="kg",
        current_stock_kg=4500.0,
        min_stock_alert_kg=1000.0,
        cost_per_kg=0.85,
        last_entry_price=0.85,
        status="NORMAL",
        location="Pátio Coberto",
        notes="Correção de pH do solo e reposição de Cálcio e Magnésio"
    )
    p_probiotico = FeedInventory(
        brand="AquaBac",
        name="Probiótico AquaBac Biorremediador de Fundo",
        category="PROBIOTICO",
        item_type="Probiótico",
        unit="kg",
        current_stock_kg=65.0,
        min_stock_alert_kg=25.0,
        cost_per_kg=68.00,
        last_entry_price=68.00,
        status="NORMAL",
        location="Geladeira / Galpão Insumos",
        notes="Consórcio de Bacillus subtilis e licheniformis para digestão de matéria orgânica"
    )
    db.add_all([p_decosolo, p_samaria, p_smartpack, f1, f2, f3, f4, p_bicarb, p_calcario, p_probiotico])
    db.commit()

    # Movimentações e Entradas de Amostra
    db.add(InventoryMovement(
        item_id=p_samaria.id,
        movement_type="ENTRADA",
        date=date.today() - timedelta(days=5),
        quantity=350.0,
        unit_price=12.20,
        total_price=4270.0,
        supplier_name="Samaria Rações do Nordeste Ltda",
        invoice_number="NF-004819",
        batch_number="SAM-2026-X8",
        notes="Compra de reposição quinzenal para berçário"
    ))
    db.add(InventoryMovement(
        item_id=p_bicarb.id,
        movement_type="ENTRADA",
        date=date.today() - timedelta(days=10),
        quantity=1500.0,
        unit_price=3.80,
        total_price=5700.0,
        supplier_name="Distribuidora Química Potiguar",
        invoice_number="NF-012984",
        notes="Aquisição de tamponante para o período de luas cheias e chuvas"
    ))
    db.commit()

    # Sample Product Mix
    sample_mix = ProductMix(
        name="Mix Fortificante Pré-Muda (Ração Samaria + Probiótico + Vit C)",
        target_stage="Berçários e Juvenis",
        total_weight_kg=100.0,
        cost_per_kg=14.50,
        recipe_json=json.dumps([
            {"name": "RAÇÃO SAMARIA STARTER", "amount": 95, "unit": "kg", "cost": 1159.0},
            {"name": "Probiótico AquaBac", "amount": 2, "unit": "kg", "cost": 136.0},
            {"name": "SMART PACK (Veículo Aglutinante)", "amount": 2, "unit": "kg", "cost": 75.0},
            {"name": "Vitamina C Anti-Stress 35%", "amount": 1, "unit": "kg", "cost": 80.0},
        ]),
        instructions="Homogeneizar o Smart Pack com o probiótico e vitamina C em 3L de água doce. Borrifar sobre a ração Samaria Starter e deixar secar à sombra por 30 minutos antes do arraçoamento.",
        ai_nutritional_summary="Mix otimizado pela IA: Taxa de adesão do probiótico de 94%. Protege os hepatopâncreas durante a ecdise e acelera o ganho de peso em +15%.",
        created_at=date.today() - timedelta(days=3)
    )
    db.add(sample_mix)
    db.commit()

    # 3. Shrimp Batches (Litopenaeus vannamei)
    today = date.today()
    
    # B1: Berçário com Pós-Larvas PL10 recém-estocadas
    b1 = ShrimpBatch(
        batch_code="LOTE-2026-PL-04",
        pond_id=p1.id,
        species="Litopenaeus vannamei",
        pl_stage="PL10",
        origin_laboratory="Larvicultura Mar Azul (Touros/RN)",
        stocking_date=today - timedelta(days=12),
        initial_pls_count=450000,
        current_shrimp_count=432000,
        stocking_density_pl_m2=300.0,  # Berçário intensivo
        pl_stress_test_survival_pct=98.0,
        initial_salinity_lab_ppt=32.0,
        pond_target_salinity_ppt=18.0,
        initial_avg_weight_g=0.003,
        current_avg_weight_g=0.28,
        target_harvest_weight_g=1.5,  # Transferência para viveiro de engorda
        target_harvest_date=today + timedelta(days=16),
        commercial_class="JUVENIL_BERCARIO",
        status="ATIVO",
    )

    # B2: Viveiro 01 - Engorda intermediária
    b2 = ShrimpBatch(
        batch_code="LOTE-2026-ENG-01",
        pond_id=p2.id,
        species="Litopenaeus vannamei",
        pl_stage="PL12",
        origin_laboratory="Aquatec Aquacultura",
        stocking_date=today - timedelta(days=62),
        initial_pls_count=380000,
        current_shrimp_count=342000,
        stocking_density_pl_m2=31.7,
        pl_stress_test_survival_pct=95.0,
        initial_salinity_lab_ppt=28.0,
        pond_target_salinity_ppt=16.0,
        initial_avg_weight_g=0.004,
        current_avg_weight_g=10.5,
        target_harvest_weight_g=14.0,
        target_harvest_date=today + timedelta(days=22),
        commercial_class="70/80",
        status="ATIVO",
    )

    # B3: Viveiro 02 - Engorda inicial
    b3 = ShrimpBatch(
        batch_code="LOTE-2026-ENG-02",
        pond_id=p3.id,
        species="Litopenaeus vannamei",
        pl_stage="PL10",
        origin_laboratory="Larvicultura Mar Azul",
        stocking_date=today - timedelta(days=40),
        initial_pls_count=500000,
        current_shrimp_count=465000,
        stocking_density_pl_m2=33.3,
        pl_stress_test_survival_pct=97.0,
        initial_salinity_lab_ppt=30.0,
        pond_target_salinity_ppt=15.0,
        initial_avg_weight_g=0.003,
        current_avg_weight_g=6.8,
        target_harvest_weight_g=13.0,
        target_harvest_date=today + timedelta(days=45),
        commercial_class="80/100",
        status="ATIVO",
    )

    # B4: Viveiro 03 - Terminação (Quase no ponto de despesca!)
    b4 = ShrimpBatch(
        batch_code="LOTE-2026-TERM-03",
        pond_id=p4.id,
        species="Litopenaeus vannamei",
        pl_stage="PL12",
        origin_laboratory="Aquatec Aquacultura",
        stocking_date=today - timedelta(days=78),
        initial_pls_count=320000,
        current_shrimp_count=281600,
        stocking_density_pl_m2=32.0,
        pl_stress_test_survival_pct=94.0,
        initial_salinity_lab_ppt=32.0,
        pond_target_salinity_ppt=18.0,
        initial_avg_weight_g=0.004,
        current_avg_weight_g=13.6,
        target_harvest_weight_g=14.0,
        target_harvest_date=today + timedelta(days=6),
        commercial_class="60/70",
        status="ATIVO",
    )

    # B5: Racetrack BFT
    b5 = ShrimpBatch(
        batch_code="LOTE-2026-BFT-01",
        pond_id=p5.id,
        species="Litopenaeus vannamei",
        pl_stage="PL15",
        origin_laboratory="Genética SpeedShrimp",
        stocking_date=today - timedelta(days=50),
        initial_pls_count=90000,
        current_shrimp_count=82800,
        stocking_density_pl_m2=150.0,
        pl_stress_test_survival_pct=99.0,
        initial_salinity_lab_ppt=34.0,
        pond_target_salinity_ppt=26.0,
        initial_avg_weight_g=0.008,
        current_avg_weight_g=9.2,
        target_harvest_weight_g=15.0,
        target_harvest_date=today + timedelta(days=32),
        commercial_class="70/80",
        status="ATIVO",
    )

    db.add_all([b1, b2, b3, b4, b5])
    db.commit()

    # 4. Biometry records (Tarrafadas e avaliações biométricas)
    bio1 = BiometryLog(
        batch_id=b4.id,
        date=today - timedelta(days=21),
        sample_count=120,
        avg_weight_g=9.8,
        weekly_growth_gain_g=1.35,
        uniformity_percentage=88.0,
        gut_fullness_percent=95.0,
        molt_stage="INTERMUDA",
        estimated_biomass_kg=2820.0,
        notes="Camarão com carapaça dura, rostro íntegro e hepatopâncreas bem pigmentado.",
    )
    bio2 = BiometryLog(
        batch_id=b4.id,
        date=today - timedelta(days=14),
        sample_count=130,
        avg_weight_g=11.2,
        weekly_growth_gain_g=1.40,
        uniformity_percentage=89.0,
        gut_fullness_percent=92.0,
        molt_stage="PRE_MUDA",
        estimated_biomass_kg=3190.0,
        notes="Indícios de entrada em ciclo de muda lunar. Bicarbonato aplicado preventivamente.",
    )
    bio3 = BiometryLog(
        batch_id=b4.id,
        date=today - timedelta(days=4),
        sample_count=140,
        avg_weight_g=13.6,
        weekly_growth_gain_g=1.45,
        uniformity_percentage=91.0,
        gut_fullness_percent=90.0,
        molt_stage="INTERMUDA",
        estimated_biomass_kg=3830.0,
        notes="Excelente uniformidade. Tamanho padrão para frigorífico (classe 60/70).",
    )

    bio4 = BiometryLog(
        batch_id=b2.id,
        date=today - timedelta(days=5),
        sample_count=110,
        avg_weight_g=10.5,
        weekly_growth_gain_g=1.30,
        uniformity_percentage=86.0,
        gut_fullness_percent=88.0,
        molt_stage="INTERMUDA",
        estimated_biomass_kg=3590.0,
        notes="Ótimo ganho de peso semanal no Viveiro 01.",
    )

    db.add_all([bio1, bio2, bio3, bio4])
    db.commit()

    # 5. Feeding Trays (Comedouros Testemunha de Camarão)
    db.add(FeedingTrayLog(
        batch_id=b4.id,
        date=today,
        check_time="09:15",
        trays_inspected_count=12,
        tray_status="LIMPO",
        leftover_percentage=0.0,
        ai_recommendation="Bandeja limpa: Aumentar +8% no trato das 11:30h.",
        adjustment_suggested_pct=8.0,
    ))
    db.add(FeedingTrayLog(
        batch_id=b2.id,
        date=today,
        check_time="09:20",
        trays_inspected_count=14,
        tray_status="POUCA_SOBRA",
        leftover_percentage=4.0,
        ai_recommendation="Pouca sobra (<5%): Manter quantidade programada.",
        adjustment_suggested_pct=0.0,
    ))
    # Viveiro 03 com sobra moderada
    db.add(FeedingTrayLog(
        batch_id=b3.id,
        date=today,
        check_time="09:25",
        trays_inspected_count=15,
        tray_status="SOBRA_MEDIA",
        leftover_percentage=16.0,
        ai_recommendation="Sobra de 16%: Reduzir 15% no próximo trato para evitar deterioração do fundo.",
        adjustment_suggested_pct=-15.0,
    ))
    db.commit()

    # 6. Feeding logs (Tratos diários)
    for days_back in range(7, -1, -1):
        d = today - timedelta(days=days_back)
        db.add(FeedingLog(
            batch_id=b4.id,
            feed_inventory_id=f3.id,
            date=d,
            trato_number=1,
            time_of_day="07:00",
            amount_kg=48.0,
            water_temp_c=28.2,
            dissolved_oxygen_mg_l=5.4,
        ))
        db.add(FeedingLog(
            batch_id=b4.id,
            feed_inventory_id=f3.id,
            date=d,
            trato_number=2,
            time_of_day="11:30",
            amount_kg=52.0,
            water_temp_c=29.6,
            dissolved_oxygen_mg_l=6.1,
        ))
        db.add(FeedingLog(
            batch_id=b4.id,
            feed_inventory_id=f3.id,
            date=d,
            trato_number=3,
            time_of_day="16:00",
            amount_kg=45.0,
            water_temp_c=30.1,
            dissolved_oxygen_mg_l=5.8,
        ))

        db.add(FeedingLog(
            batch_id=b2.id,
            feed_inventory_id=f2.id,
            date=d,
            trato_number=1,
            time_of_day="07:30",
            amount_kg=35.0,
            water_temp_c=28.0,
            dissolved_oxygen_mg_l=5.1,
        ))
        db.add(FeedingLog(
            batch_id=b2.id,
            feed_inventory_id=f2.id,
            date=d,
            trato_number=2,
            time_of_day="15:30",
            amount_kg=38.0,
            water_temp_c=29.4,
            dissolved_oxygen_mg_l=5.5,
        ))

    db.commit()

    # 7. Water Quality Logs (Com parâmetros de Carcinicultura: Salinidade, Alcalinidade, Ca, Mg)
    # B1 (Berçário - Ideal)
    db.add(WaterQualityLog(
        pond_id=p1.id,
        timestamp=datetime.utcnow() - timedelta(hours=1),
        salinity_ppt=18.0,
        dissolved_oxygen_mg_l=6.5,
        temperature_c=28.8,
        ph=7.9,
        total_alkalinity_mg_l=160.0,
        total_hardness_mg_l=750.0,
        calcium_mg_l=145.0,
        magnesium_mg_l=440.0,
        toxic_ammonia_nh3_mg_l=0.01,
        nitrite_no2_mg_l=0.02,
        transparency_secchi_cm=35.0,
        status="IDEAL",
        notes="Berçário com excelente tamponamento e aeração microperfurada.",
    ))

    # P2 (Viveiro 01 - Ideal)
    db.add(WaterQualityLog(
        pond_id=p2.id,
        timestamp=datetime.utcnow() - timedelta(hours=2),
        salinity_ppt=16.0,
        dissolved_oxygen_mg_l=5.6,
        temperature_c=29.1,
        ph=7.8,
        total_alkalinity_mg_l=145.0,
        total_hardness_mg_l=680.0,
        calcium_mg_l=130.0,
        magnesium_mg_l=390.0,
        toxic_ammonia_nh3_mg_l=0.015,
        nitrite_no2_mg_l=0.03,
        transparency_secchi_cm=32.0,
        status="IDEAL",
        notes="Boa floração algal de diatomáceas (água marrom-dourada).",
    ))

    # P3 (Viveiro 02 - Atenção: Alcalinidade baixa 105 mg/L antes da muda)
    db.add(WaterQualityLog(
        pond_id=p3.id,
        timestamp=datetime.utcnow() - timedelta(hours=3),
        salinity_ppt=15.0,
        dissolved_oxygen_mg_l=4.2,
        temperature_c=28.5,
        ph=7.4,
        total_alkalinity_mg_l=105.0,  # CRÍTICO PARA CAMARÃO! (<110)
        total_hardness_mg_l=520.0,
        calcium_mg_l=95.0,
        magnesium_mg_l=260.0,
        toxic_ammonia_nh3_mg_l=0.025,
        nitrite_no2_mg_l=0.06,
        transparency_secchi_cm=26.0,
        status="CRITICO",
        notes="ALERTA IA: Alcalinidade em 105 mg/L! Risco imediato de casca mole e canibalismo na muda. Aplicar Bicarbonato de Sódio à noite.",
    ))

    # P4 (Viveiro 03 - Ideal)
    db.add(WaterQualityLog(
        pond_id=p4.id,
        timestamp=datetime.utcnow() - timedelta(hours=2),
        salinity_ppt=18.0,
        dissolved_oxygen_mg_l=5.8,
        temperature_c=29.2,
        ph=8.0,
        total_alkalinity_mg_l=150.0,
        total_hardness_mg_l=720.0,
        calcium_mg_l=140.0,
        magnesium_mg_l=420.0,
        toxic_ammonia_nh3_mg_l=0.018,
        nitrite_no2_mg_l=0.03,
        transparency_secchi_cm=38.0,
        status="IDEAL",
        notes="Pronto para despesca.",
    ))

    # P5 (Racetrack BFT - Ideal)
    db.add(WaterQualityLog(
        pond_id=p5.id,
        timestamp=datetime.utcnow() - timedelta(hours=1),
        salinity_ppt=26.0,
        dissolved_oxygen_mg_l=6.8,
        temperature_c=29.5,
        ph=7.7,
        total_alkalinity_mg_l=180.0,
        total_hardness_mg_l=1100.0,
        calcium_mg_l=210.0,
        magnesium_mg_l=650.0,
        toxic_ammonia_nh3_mg_l=0.01,
        nitrite_no2_mg_l=0.02,
        transparency_secchi_cm=18.0,
        status="IDEAL",
        notes="Bioflocos estáveis, cone Imhoff em 12 mL/L.",
    ))

    db.commit()

    # 8. Mortality Logs
    db.add(MortalityLog(
        batch_id=b2.id,
        date=today - timedelta(days=15),
        quantity=350,
        probable_cause="ROTINA_MUDA",
        notes="Mortalidade normal pós-ecdise em camarão.",
    ))
    db.add(MortalityLog(
        batch_id=b3.id,
        date=today - timedelta(days=2),
        quantity=620,
        probable_cause="BAIXA_ALCALINIDADE",
        notes="Camarões com casca flácida encontrados na beirada. Requer tamponamento urgente.",
    ))
    db.commit()

    h1 = HarvestLog(
        batch_id=b4.id,
        date=today - timedelta(days=35),
        harvest_type="DESBASTE_PARCIAL",
        total_weight_kg=1250.0,
        shrimp_count_estimated=104000,
        avg_weight_g=12.0,
        commercial_classification="70/80",
        price_per_kg=24.50,
        total_revenue=30625.0,
        buyer_name="Frigorífico Camarão do Litoral",
        notes="Despesca parcial de desbaste para alívio de densidade do viveiro.",
    )
    db.add(h1)
    db.commit()

    # 10. WhatsApp Notifications Config & Logs (Exatamente os dados dos screenshots)
    db.add(WhatsAppAlertConfig(
        user_name="Collermhann",
        phone_number="(84) 9 8858-5211",
        notify_despesca=True,
        notify_sync=True,
        notify_water_critical=True,
        notify_low_stock=True,
        notify_daily_ai_summary=True,
        auto_ai_agent_enabled=True,
    ))

    # Logs de mensagens de demonstração sincronizados
    db.add(WhatsAppMessageLog(
        direction="OUTGOING",
        phone_number="(84) 9 8858-5211",
        message_type="DESPESCA",
        content=(
            "*🐟 Despesca Realizada - Fazenda River Life*\n\n"
            "O *Viveiro 04 (Engorda)* foi despescado. Veja seus resultados:\n\n"
            "🔹 *Biomassa:* 1.250,00 kg\n"
            "🔹 *Biometria:* 12,00 g (Classe 70/80)\n"
            "🔹 *População despescada:* 104.000 camarões\n"
            "🔹 *Dias de cultivo:* 75 dias\n"
            "🔹 *Custo/kg:* R$ 11,20\n"
            "🔹 *Custo total:* R$ 14.000,00\n"
            "🔹 *Faturamento:* R$ 30.625,00 (Preço R$ 24,50/kg)\n\n"
            "📲 Acesse o app para mais detalhes!"
        ),
        status="LIDO",
        timestamp=datetime.utcnow() - timedelta(days=2)
    ))
    db.add(WhatsAppMessageLog(
        direction="OUTGOING",
        phone_number="(84) 9 8858-5211",
        message_type="SINCRONIZACAO",
        content=(
            "🔄 *Sincronização Offline - Fazenda River Life*\n\n"
            "O usuário *Collermhann* sincronizou as informações que estavam armazenadas offline no aplicativo de campo, referentes aos manejos:\n\n"
            "[🔹 *Nutrição* 🔹 *Biometria* 🔹 *Mortalidade* 🔹 *Calagem* 🔹 *Arraçoamento* 🔹 *Análise de água*]\n\n"
            f"🔸 Data e hora da sincronização: *{today.strftime('%d/%m/%Y')} às 09:45*\n\n"
            "📲 Acesse o app para visualizar os dados atualizados!"
        ),
        status="LIDO",
        timestamp=datetime.utcnow() - timedelta(hours=3)
    ))
    db.commit()

    # 11. Fiscal Invoices & GTA (Notas Fiscais de Produtor Rural e Manifestos)
    db.add(FiscalInvoice(
        invoice_number="001.042.891",
        series="1",
        access_key="24260918234567000189550010010428911003489123",
        issue_date=today - timedelta(days=35),
        buyer_name="Frigorífico Camarão do Litoral Ltda",
        buyer_cnpj_cpf="18.234.567/0001-89",
        buyer_location="Natal - RN",
        cfop="5.101",
        nature_of_operation="Venda de Camarão In Natura (Litopenaeus vannamei)",
        weight_kg=1250.0,
        commercial_class="70/80",
        unit_price_kg=24.50,
        total_value_rs=30625.0,
        funrural_value_rs=459.38,
        gta_number="GTA-RN-48192/2026",
        status="AUTORIZADA",
        harvest_id=h1.id,
        notes="Despesca de desbaste autorizada com selo de inspeção estadual (SIE)."
    ))
    db.add(FiscalInvoice(
        invoice_number="001.042.892",
        series="1",
        access_key="24260918234567000189550010010428921008745214",
        issue_date=today - timedelta(days=12),
        buyer_name="Distribuidora de Frutos do Mar Mar Aberto",
        buyer_cnpj_cpf="24.891.345/0001-12",
        buyer_location="João Pessoa - PB",
        cfop="6.101",
        nature_of_operation="Venda Interestadual de Pescado Refrigerado",
        weight_kg=2100.0,
        commercial_class="60/70",
        unit_price_kg=26.00,
        total_value_rs=54600.0,
        funrural_value_rs=819.00,
        gta_number="GTA-PB-12894/2026",
        status="AUTORIZADA",
        notes="Carga transportada em baú térmico com gelo a 2°C."
    ))
    db.commit()

    # 12. Equipment & Assets (Gestão de Equipamentos com Manutenção Preditiva)
    eq1 = Equipment(
        name="Aerador de Palheta 2.0cv - V01-A1",
        category="AERADOR",
        brand_model="AquaAerador Pro 2.0cv 4 Pás",
        pond_id=p2.id,
        power_hp=2.0,
        voltage="220V/380V Trifásico",
        hourmeter_hours=1450.0,
        hours_since_last_maintenance=120.0,
        maintenance_interval_hours=500.0,
        status="OPERACIONAL",
        location="Viveiro 01 (Lado Norte)",
        last_maintenance_date=today - timedelta(days=25),
        ai_failure_risk_pct=5.0,
        ai_health_status="Vibração balanceada e corrente elétrica estável em 5.8A."
    )
    eq2 = Equipment(
        name="Aerador de Palheta 2.0cv - V01-A2",
        category="AERADOR",
        brand_model="AquaAerador Pro 2.0cv 4 Pás",
        pond_id=p2.id,
        power_hp=2.0,
        voltage="220V/380V Trifásico",
        hourmeter_hours=2100.0,
        hours_since_last_maintenance=490.0,
        maintenance_interval_hours=500.0,
        status="REVISAO_URGENTE",
        location="Viveiro 01 (Lado Sul)",
        last_maintenance_date=today - timedelta(days=65),
        ai_failure_risk_pct=34.0,
        ai_health_status="⚠️ Atenção: Atingindo 500h de uso. Agendar troca de óleo do redutor e graxa dos mancais."
    )
    eq3 = Equipment(
        name="Soprador de Ar Roots 7.5 HP (Berçário)",
        category="SOPRADOR",
        brand_model="Dalgas Blower Roots 7.5 HP",
        pond_id=p1.id,
        power_hp=7.5,
        voltage="380V Trifásico",
        hourmeter_hours=3200.0,
        hours_since_last_maintenance=180.0,
        maintenance_interval_hours=600.0,
        status="OPERACIONAL",
        location="Casa de Sopradores - Berçário B-01",
        last_maintenance_date=today - timedelta(days=40),
        ai_failure_risk_pct=8.0,
        ai_health_status="Pressão de linha em 350 mbar, filtros de ar desobstruídos."
    )
    eq4 = Equipment(
        name="Bomba de Captação & Drenagem 15 HP",
        category="BOMBA",
        brand_model="Kirloskar / Mark Axial 15 HP (500 m³/h)",
        pond_id=None,
        power_hp=15.0,
        voltage="380V Trifásico",
        hourmeter_hours=890.0,
        hours_since_last_maintenance=90.0,
        maintenance_interval_hours=400.0,
        status="OPERACIONAL",
        location="Estação de Bombeamento Principal",
        last_maintenance_date=today - timedelta(days=20),
        ai_failure_risk_pct=6.0,
        ai_health_status="Selo mecânico e rotor em perfeito funcionamento."
    )
    eq5 = Equipment(
        name="Gerador Diesel de Emergência 150 kVA",
        category="GERADOR",
        brand_model="Stemac / MWM 150 kVA Silenciado",
        pond_id=None,
        power_hp=180.0,
        voltage="220V/380V Automático (QTA)",
        hourmeter_hours=450.0,
        hours_since_last_maintenance=40.0,
        maintenance_interval_hours=250.0,
        status="OPERACIONAL",
        location="Casa de Força Geral",
        last_maintenance_date=today - timedelta(days=10),
        ai_failure_risk_pct=2.0,
        ai_health_status="Pronto para partida automática imediata em caso de queda na rede rural."
    )
    db.add_all([eq1, eq2, eq3, eq4, eq5])
    db.commit()

    # Maintenance log
    db.add(EquipmentMaintenanceLog(
        equipment_id=eq1.id,
        date=today - timedelta(days=25),
        maintenance_type="PREVENTIVA",
        description="Troca de óleo do redutor sintético ISO VG 220 e reaperto de parafusos da palheta.",
        replaced_parts="Retentor de borracha nitrílica",
        cost_rs=180.0,
        technician_name="Oficina da Fazenda River Life",
        hourmeter_at_maintenance=1330.0
    ))
    db.commit()

    # Also seed new modules
    seed_commercial_and_farm(db)


def seed_commercial_and_farm(db: Session):
    today = date.today()

    # 1. Farm Profile (João Pessoa - PB)
    if not db.query(FarmProfile).first():
        farm = FarmProfile(
            name="River Life Carcinicultura & Pós-Larvas",
            corporate_name="River Life Aquicultura do Nordeste Ltda",
            cnpj="32.845.912/0001-44",
            state_registration="16.984.231-0",
            address="Rodovia PB-018, Km 14, Bacia do Rio Paraíba",
            city="João Pessoa",
            state="PB",
            zip_code="58000-000",
            latitude=-7.1153,
            longitude=-34.8631,
            water_source_type="Estuário do Rio Paraíba (Água Salobra de Maré)",
            average_salinity_ppt=18.5,
            total_area_hectares=18.4,
            water_surface_hectares=12.2,
            active_ponds_count=6,
            technician_in_charge="Dr. Arnaldo Bezerra (Eng. de Pesca - UFRPE/UFPB)",
            council_registration="CREA-PB 14.892-D",
            environmental_license="SUDEMA-PB LO nº 2024/0981-L",
            phone="(83) 99876-5432",
            email="contato@riverlife.com.br",
            notes="Fazenda de carcinicultura de alta densidade e balanço iônico na Paraíba."
        )
        db.add(farm)
        db.commit()

    # 2. Bank Accounts
    if not db.query(BankAccount).first():
        acc1 = BankAccount(
            bank_code="001",
            bank_name="Banco do Brasil",
            account_type="CORRENTE",
            agency="1618-7",
            account_number="25489-0",
            holder_name="River Life Aquicultura Ltda",
            current_balance_rs=58450.00,
            pix_key="financeiro@riverlife.com.br",
            notes="Conta principal para recebimento de clientes e compras de ração."
        )
        acc2 = BankAccount(
            bank_code="756",
            bank_name="Sicoob Nordeste",
            account_type="CORRENTE",
            agency="4012",
            account_number="10892-1",
            holder_name="River Life Aquicultura Ltda",
            current_balance_rs=22800.00,
            pix_key="32.845.912/0001-44",
            notes="Conta cooperativa para crédito rural de custeio agrícola."
        )
        db.add_all([acc1, acc2])
        db.commit()

    # 3. Commercial Sales
    if not db.query(CommercialSale).first():
        sales_data = [
            CommercialSale(
                sale_date=today - timedelta(days=28),
                buyer_name="Frigorífico Mar Paraíba Ltda",
                buyer_document="18.234.567/0001-89",
                buyer_city="Cabedelo - PB",
                commercial_class="50/60",
                quantity_kg=3800.0,
                unit_price_kg=28.50,
                gross_total_rs=108300.0,
                net_total_rs=106675.5,
                discount_or_taxes_rs=1624.5,
                payment_method="PIX",
                payment_status="PAGO",
                invoice_number="001.042.891",
                notes="Lote despescado com ótima textura e casca dura."
            ),
            CommercialSale(
                sale_date=today - timedelta(days=14),
                buyer_name="Distribuidora de Pescados Tambaú",
                buyer_document="24.912.441/0001-33",
                buyer_city="João Pessoa - PB",
                commercial_class="40/50",
                quantity_kg=2100.0,
                unit_price_kg=32.00,
                gross_total_rs=67200.0,
                net_total_rs=66192.0,
                discount_or_taxes_rs=1008.0,
                payment_method="PIX",
                payment_status="PAGO",
                invoice_number="001.042.892",
                notes="Destinado a restaurantes da orla de Cabo Branco e Manaíra."
            ),
            CommercialSale(
                sale_date=today - timedelta(days=3),
                buyer_name="Camarão Express Nordeste",
                buyer_document="09.551.320/0001-90",
                buyer_city="Recife - PE",
                commercial_class="60/70",
                quantity_kg=4200.0,
                unit_price_kg=26.50,
                gross_total_rs=111300.0,
                net_total_rs=109630.5,
                discount_or_taxes_rs=1669.5,
                payment_method="TRANSFERENCIA",
                payment_status="PAGO",
                invoice_number="001.042.893",
                notes="Despesca total do Viveiro 03. Pagamento 50% à vista e 50% 15 dias."
            ),
        ]
        db.add_all(sales_data)
        db.commit()

    # 4. Cash Flow Movements
    if not db.query(CashFlowMovement).first():
        acc = db.query(BankAccount).first()
        acc_id = acc.id if acc else None

        movements = [
            CashFlowMovement(
                date=today - timedelta(days=28),
                movement_type="ENTRADA",
                category="VENDA_CAMARAO",
                description="Recebimento Venda Frigorífico Mar Paraíba (3.800 kg - Classe 50/60)",
                amount_rs=106675.5,
                status="REALIZADO",
                bank_account_id=acc_id,
                cost_center="Comercialização",
                document_ref="NF-e 001.042.891",
            ),
            CashFlowMovement(
                date=today - timedelta(days=25),
                movement_type="SAIDA",
                category="RACAO",
                description="Compra de Ração Guabi 35% e 40% Extrusada (12 Toneladas)",
                amount_rs=48500.0,
                status="REALIZADO",
                bank_account_id=acc_id,
                cost_center="Nutrição & Estoque",
                document_ref="NF-e 558291",
            ),
            CashFlowMovement(
                date=today - timedelta(days=20),
                movement_type="SAIDA",
                category="ENERGIA_ELETRICA",
                description="Fatura Energisa Paraíba - Aeradores e Bombeamento Rural",
                amount_rs=14850.0,
                status="REALIZADO",
                bank_account_id=acc_id,
                cost_center="Infraestrutura Elétrica",
                document_ref="Conta 2026/09",
            ),
            CashFlowMovement(
                date=today - timedelta(days=14),
                movement_type="ENTRADA",
                category="VENDA_CAMARAO",
                description="Recebimento Venda Pescados Tambaú (2.100 kg - Classe 40/50)",
                amount_rs=66192.0,
                status="REALIZADO",
                bank_account_id=acc_id,
                cost_center="Comercialização",
                document_ref="NF-e 001.042.892",
            ),
            CashFlowMovement(
                date=today - timedelta(days=10),
                movement_type="SAIDA",
                category="POS_LARVAS",
                description="Aquisição de 450.000 PL10 Certificadas Aquatec com Teste de Estresse 98%",
                amount_rs=15750.0,
                status="REALIZADO",
                bank_account_id=acc_id,
                cost_center="Berçário B-01",
                document_ref="NF-e 11982",
            ),
            CashFlowMovement(
                date=today - timedelta(days=7),
                movement_type="SAIDA",
                category="PROBIOTICOS",
                description="Bicarbonato de Sódio Puro (2.000 kg) e Probiótico Biorremediador",
                amount_rs=6800.0,
                status="REALIZADO",
                bank_account_id=acc_id,
                cost_center="Qualidade de Água",
                document_ref="NF-e 88471",
            ),
            CashFlowMovement(
                date=today - timedelta(days=3),
                movement_type="ENTRADA",
                category="VENDA_CAMARAO",
                description="Recebimento Venda Camarão Express Nordeste (4.200 kg)",
                amount_rs=109630.5,
                status="REALIZADO",
                bank_account_id=acc_id,
                cost_center="Comercialização",
                document_ref="NF-e 001.042.893",
            ),
            CashFlowMovement(
                date=today - timedelta(days=1),
                movement_type="SAIDA",
                category="FOLHA_PAGAMENTO",
                description="Folha de Pagamento Quinzenal - Tratadores, Eletricista e Gerente de Campo",
                amount_rs=11500.0,
                status="REALIZADO",
                bank_account_id=acc_id,
                cost_center="Pessoal",
            ),
        ]
        db.add_all(movements)
        db.commit()
