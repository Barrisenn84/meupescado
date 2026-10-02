export interface Pond {
  id: number;
  name: string;
  pond_type: string; // BERCARIO_PL, ENGORDA, RACETRACK_BFT, MATURACAO
  surface_area_m2: number;
  average_depth_m: number;
  volume_m3: number;
  aeration_hp_total: number;
  aeration_type: string;
  bottom_type: string;
  status: string; // OCUPADO, VAZIO, PREPARO_CALAGEM, ACLIMATACAO, SANITIZACAO
  notes?: string;
  active_batch_code?: string;
  active_batch_id?: number;
  species?: string;
  pl_stage?: string;
  current_shrimp_count?: number;
  current_biomass_kg?: number;
  stocking_density_pl_m2?: number;
  last_water_status?: 'IDEAL' | 'ATENCAO' | 'CRITICO';
  last_do_mg_l?: number;
  last_salinity_ppt?: number;
  last_temp_c?: number;
  last_ph?: number;
  last_alkalinity_mg_l?: number;
}

export interface ShrimpBatch {
  id: number;
  batch_code: string;
  pond_id: number;
  pond_name?: string;
  species: string;
  pl_stage: string;
  origin_laboratory: string;
  stocking_date: string;
  initial_pls_count: number;
  current_shrimp_count: number;
  stocking_density_pl_m2: number;
  pl_stress_test_survival_pct: number;
  initial_salinity_lab_ppt: number;
  pond_target_salinity_ppt: number;
  initial_avg_weight_g: number;
  current_avg_weight_g: number;
  target_harvest_weight_g: number;
  target_harvest_date?: string;
  commercial_class: string;
  status: string;
  days_of_culture: number;
  current_biomass_kg: number;
  survival_rate_percent: number;
  accumulated_feed_kg: number;
  feed_conversion_ratio: number;
}

export interface BiometryLog {
  id: number;
  batch_id: number;
  batch_code?: string;
  pond_name?: string;
  date: string;
  sample_count: number;
  avg_weight_g: number;
  weekly_growth_gain_g: number;
  uniformity_percentage: number;
  gut_fullness_percent: number;
  molt_stage: string;
  estimated_biomass_kg?: number;
  notes?: string;
}

export interface FeedInventory {
  id: number;
  brand: string;
  name: string;
  category: string;
  item_type: string; // Ração, Fertilizante, Veículo, Corretivo / Químico, Probiótico, Medicamento / Vitamina, Outros
  unit: string; // kg, g, L, ml, un, sc
  protein_percent?: number;
  pellet_size_mm?: number;
  current_stock_kg: number;
  min_stock_alert_kg: number;
  cost_per_kg: number;
  last_entry_price: number;
  status: 'NORMAL' | 'ABAIXO_MINIMO' | 'ESGOTADO';
  location?: string;
  expiry_date?: string;
  notes?: string;
  is_low_stock?: boolean;
  total_value_rs: number;
  days_of_autonomy_ai?: number;
  ai_reorder_recommendation?: string;
}

export interface InventoryMovement {
  id: number;
  item_id: number;
  item_name?: string;
  item_type?: string;
  unit?: string;
  movement_type: 'ENTRADA' | 'SAIDA_MANEJO' | 'SAIDA_AJUSTE' | 'PERDA';
  date: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  supplier_name?: string;
  invoice_number?: string;
  batch_number?: string;
  notes?: string;
}

export interface ProductMix {
  id: number;
  name: string;
  target_stage: string;
  total_weight_kg: number;
  cost_per_kg: number;
  recipe_json: string;
  instructions?: string;
  ai_nutritional_summary?: string;
  created_at: string;
}


export interface FeedingLog {
  id: number;
  batch_id: number;
  batch_code?: string;
  pond_name?: string;
  feed_inventory_id: number;
  feed_name?: string;
  date: string;
  trato_number: number;
  time_of_day: string;
  amount_kg: number;
  water_temp_c: number;
  dissolved_oxygen_mg_l: number;
  notes?: string;
}

export interface FeedingTrayLog {
  id: number;
  batch_id: number;
  batch_code?: string;
  pond_name?: string;
  date: string;
  check_time: string;
  trays_inspected_count: number;
  tray_status: string; // LIMPO, POUCA_SOBRA, SOBRA_MEDIA, SOBRA_ALTA
  leftover_percentage: number;
  ai_recommendation?: string;
  adjustment_suggested_pct: number;
}

export interface WaterQualityLog {
  id: number;
  pond_id: number;
  pond_name?: string;
  timestamp: string;
  salinity_ppt: number;
  dissolved_oxygen_mg_l: number;
  temperature_c: number;
  ph: number;
  total_alkalinity_mg_l: number;
  total_hardness_mg_l: number;
  calcium_mg_l: number;
  magnesium_mg_l: number;
  toxic_ammonia_nh3_mg_l?: number;
  nitrite_no2_mg_l?: number;
  transparency_secchi_cm?: number;
  status: 'IDEAL' | 'ATENCAO' | 'CRITICO';
  notes?: string;
  mg_ca_ratio?: number;
}

export interface MortalityLog {
  id: number;
  batch_id: number;
  batch_code?: string;
  pond_name?: string;
  date: string;
  quantity: number;
  probable_cause: string;
  notes?: string;
}

export interface HarvestLog {
  id: number;
  batch_id: number;
  batch_code?: string;
  pond_name?: string;
  date: string;
  harvest_type: string;
  total_weight_kg: number;
  shrimp_count_estimated: number;
  avg_weight_g: number;
  commercial_classification: string;
  price_per_kg: number;
  total_revenue: number;
  buyer_name?: string;
  notes?: string;
}

export interface DashboardSummary {
  farm_name?: string;
  farm_location?: string;
  total_ponds: number;
  active_ponds: number;
  total_stocked_ponds?: number;
  cultivation_cost_total_rs?: number;
  expected_revenue_total_rs?: number;
  expected_profit_total_rs?: number;
  expected_margin_percent?: number;
  total_live_shrimp: number;
  total_biomass_kg: number;
  average_fcr: number;
  average_survival_percent: number;
  total_feed_stock_kg: number;
  total_feed_consumed_cycle_kg?: number;
  critical_water_alerts: number;
  critical_alkalinity_alerts: number;
  low_feed_alerts: number;
  monthly_feed_consumption_kg: number;
  projected_harvest_kg_next_30_days: number;
  weather_info?: {
    location: string;
    current_temp_c: number;
    max_temp_c: number;
    min_temp_c: number;
    condition: string;
    wind_speed_kmh: number;
    rain_today_mm: number;
    rain_chance_peak: string;
    updated_at: string;
    forecast_6days: Array<{
      day: string;
      date: string;
      condition: string;
      min_c: number;
      max_c: number;
      rain_mm: number;
    }>;
    disclaimer: string;
  };
  lunar_info?: {
    today_phase: string;
    today_illumination_pct: number;
    today_description: string;
    upcoming_phases: Array<{
      name: string;
      date: string;
      tag: string;
    }>;
  };
  ai_advisory?: {
    lunar_recommendation: string;
    weather_recommendation: string;
    sanitary_alert: string;
  };
}


// AI Interfaces
export interface AIChatResponse {
  answer: string;
  recommendations: string[];
  suggested_actions: Array<{ label: string; action: string }>;
  confidence_score: number;
}

export interface AIFeedingAdjustmentResponse {
  recommended_trato_kg: number;
  adjustment_percentage: number;
  explanation: string;
  tray_diagnosis: string;
  urgent_alerts: string[];
}

export interface AIIonicBalanceResponse {
  status: string;
  current_mg_ca_ratio: number;
  target_mg_ca_ratio: number;
  bicarbonate_sodium_kg_needed: number;
  calcium_carbonate_kg_needed: number;
  magnesium_chloride_kg_needed: number;
  explanation: string;
  step_by_step_application: string[];
}

export interface AIGrowthForecastResponse {
  batch_code: string;
  pond_name: string;
  current_weight_g: number;
  days_of_culture: number;
  forecast_timeline: Array<{
    week: number;
    days_of_culture: number;
    projected_weight_g: number;
    estimated_biomass_kg: number;
    commercial_class: string;
    estimated_value_rs: number;
  }>;
  target_10g_date: string;
  target_12g_date: string;
  target_15g_date: string;
  target_18g_date: string;
  optimal_harvest_recommendation: string;
}

// WhatsApp Interfaces
export interface WhatsAppAlertConfig {
  id?: number;
  user_name: string;
  phone_number: string;
  notify_despesca: boolean;
  notify_sync: boolean;
  notify_water_critical: boolean;
  notify_low_stock: boolean;
  notify_daily_ai_summary: boolean;
  auto_ai_agent_enabled: boolean;
  updated_at?: string;
}

export interface WhatsAppMessageLog {
  id: number;
  direction: 'OUTGOING' | 'INCOMING';
  phone_number: string;
  message_type: string;
  content: string;
  status: string;
  timestamp: string;
}

export interface WhatsAppBotChatResponse {
  bot_reply: string;
  detected_intent: string;
  suggested_action?: string;
  action_executed: boolean;
}

// Fiscal & GTA Interfaces
export interface FiscalInvoice {
  id: number;
  invoice_number: string;
  series: string;
  access_key: string;
  issue_date: string;
  buyer_name: string;
  buyer_cnpj_cpf: string;
  buyer_location: string;
  cfop: string;
  nature_of_operation: string;
  weight_kg: number;
  commercial_class: string;
  unit_price_kg: number;
  total_value_rs: number;
  funrural_value_rs: number;
  gta_number?: string;
  status: 'AUTORIZADA' | 'CANCELADA' | 'EM_DIGITACAO';
  harvest_id?: number;
  notes?: string;
}

export interface FiscalSummary {
  total_invoices_issued: number;
  total_invoiced_rs: number;
  total_shrimp_shipped_kg: number;
  average_sale_price_kg: number;
  total_funrural_withheld_rs: number;
  gta_manifests_count: number;
}

// Equipment & Maintenance Interfaces
export interface Equipment {
  id: number;
  name: string;
  category: string;
  brand_model: string;
  pond_id?: number;
  pond_name?: string;
  power_hp: number;
  voltage: string;
  hourmeter_hours: number;
  hours_since_last_maintenance: number;
  maintenance_interval_hours: number;
  hours_to_next_maintenance?: number;
  status: 'OPERACIONAL' | 'REVISAO_URGENTE' | 'EM_MANUTENCAO' | 'DESATIVADO';
  location: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  ai_failure_risk_pct: number;
  ai_health_status: string;
  notes?: string;
}

export interface EquipmentMaintenanceLog {
  id: number;
  equipment_id: number;
  equipment_name?: string;
  date: string;
  maintenance_type: string;
  description: string;
  replaced_parts?: string;
  cost_rs: number;
  technician_name: string;
  hourmeter_at_maintenance: number;
}

// =====================================================================
// COMERCIAL: LOTES VENDIDOS, FLUXO DE CAIXA & CONTAS BANCÁRIAS
// =====================================================================
export interface CommercialSaleItem {
  id: number;
  sale_date: string;
  batch_id?: number;
  pond_id?: number;
  buyer_name: string;
  buyer_document: string;
  buyer_city: string;
  commercial_class: string;
  quantity_kg: number;
  unit_price_kg: number;
  gross_total_rs: number;
  net_total_rs: number;
  discount_or_taxes_rs: number;
  payment_method: string;
  payment_status: string;
  invoice_number?: string;
  notes?: string;
}

export interface CashMovementItem {
  id: number;
  date: string;
  movement_type: 'ENTRADA' | 'SAIDA';
  category: string;
  description: string;
  amount_rs: number;
  status: 'REALIZADO' | 'PREVISTO';
  bank_account_id?: number;
  cost_center: string;
  document_ref?: string;
  notes?: string;
}

export interface BankAccountItem {
  id: number;
  bank_code: string;
  bank_name: string;
  account_type: string;
  agency: string;
  account_number: string;
  holder_name: string;
  current_balance_rs: number;
  pix_key?: string;
  notes?: string;
}

// =====================================================================
// RELATÓRIOS: DRE, DFC, ZOOTÉCNICOS & GRÁFICOS
// =====================================================================
export interface DREReport {
  period: string;
  gross_revenue_rs: number;
  deductions_funrural_rs: number;
  net_revenue_rs: number;
  cpv_breakdown: {
    feed_rs: number;
    larvae_rs: number;
    electricity_rs: number;
    probiotics_minerals_rs: number;
    field_labor_rs: number;
    total_cpv_rs: number;
  };
  gross_profit_rs: number;
  gross_margin_pct: number;
  operating_expenses: {
    maintenance_equipment_rs: number;
    administrative_rs: number;
    total_expenses_rs: number;
  };
  ebitda_rs: number;
  ebitda_margin_pct: number;
  net_income_rs: number;
  ai_dre_commentary: string;
}

export interface DFCReport {
  title: string;
  inflows_operational: Array<{ desc: string; amount: number }>;
  total_inflows_rs: number;
  outflows_operational: Array<{ desc: string; amount: number }>;
  total_outflows_rs: number;
  net_operating_cash_flow_rs: number;
  investing_cash_flow_rs: number;
  financing_cash_flow_rs: number;
  final_cash_variation_rs: number;
  initial_cash_balance_rs: number;
  final_cash_balance_rs: number;
}

// =====================================================================
// PREVISÃO DE DESPESCA
// =====================================================================
export interface ForecastTankDetail {
  pond_id: number;
  pond_name: string;
  batch_code: string;
  current_weight_g: number;
  current_population: number;
  current_biomass_kg: number;
  predicted_biomass_kg: number;
  days_to_harvest: number;
  forecast_harvest_date: string;
  recommended_commercial_class: string;
  estimated_revenue_rs: number;
  projected_weight_in_period_g: number;
  period_biomass_kg: number;
}

export interface ForecastPeriod {
  period_label: string;
  month: number;
  year: number;
  min_weight_g: number;
  max_weight_g: number;
  current_biomass_kg: number;
  predicted_biomass_kg: number;
  tanks_count: number;
  details_by_tank: ForecastTankDetail[];
}

export interface ForecastSimulationResponse {
  parameters: {
    weekly_growth_g: number;
    gmd_g_day: number;
    target_weight_g: number;
    pond_id?: number;
  };
  summary_banners: {
    total_tanks: number;
    total_population: number;
    current_biomass_kg: number;
    predicted_biomass_kg: number;
  };
  periods: ForecastPeriod[];
  ai_prediction_insights: {
    best_harvest_window: string;
    reasoning: string;
  };
}

// =====================================================================
// MINHA FAZENDA (JOÃO PESSOA / PB)
// =====================================================================
export interface FarmProfileData {
  id: number;
  name: string;
  corporate_name: string;
  cnpj: string;
  state_registration: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number;
  longitude: number;
  water_source_type: string;
  average_salinity_ppt: number;
  total_area_hectares: number;
  water_surface_hectares: number;
  active_ponds_count: number;
  technician_in_charge: string;
  council_registration: string;
  environmental_license: string;
  phone: string;
  email: string;
  notes?: string;
}

export interface LiveWeatherData {
  location: string;
  coordinates: string;
  current: {
    temperature_c: number;
    apparent_temp_c?: number;
    humidity_pct: number;
    wind_speed_kmh: number;
    rain_mm: number;
    updated_at?: string;
  };
  forecast_today?: {
    temp_max_c: number;
    temp_min_c: number;
    rain_probability_pct: number;
    total_rain_expected_mm: number;
    wind_max_kmh: number;
  };
  carciniculture_ai_evaluation: {
    water_temp_estimate_c: number;
    photosynthesis_index?: string;
    alerts: string[];
  };
}

// MULTIMODAL COMPUTER VISION INTERFACES
export interface AIImageAnalysisRequest {
  image_base64: string;
  analysis_mode: 'tray_feeding' | 'shrimp_health' | 'water_quality' | 'invoice_ocr' | 'general_diagnosis';
  custom_prompt?: string;
  pond_id?: number;
}

export interface AIImageAnalysisResponse {
  title: string;
  summary: string;
  confidence_score: number;
  zootecnic_status: 'IDEAL' | 'ATENCAO' | 'CRITICO';
  detected_items: string[];
  action_plan: string[];
  suggested_action?: 'adjust_feeding' | 'add_inventory' | 'record_water' | 'open_copilot';
  extracted_data?: Record<string, any>;
}

