import {
  Pond, ShrimpBatch, BiometryLog, FeedInventory,
  FeedingLog, FeedingTrayLog, WaterQualityLog, MortalityLog, HarvestLog, DashboardSummary,
  InventoryMovement, ProductMix,
  WhatsAppAlertConfig, WhatsAppMessageLog, WhatsAppBotChatResponse,
  FiscalInvoice, FiscalSummary, Equipment, EquipmentMaintenanceLog,
  AIChatResponse, AIFeedingAdjustmentResponse, AIIonicBalanceResponse, AIGrowthForecastResponse,
  AIImageAnalysisRequest, AIImageAnalysisResponse
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export const api = {
  // DASHBOARD
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE}/dashboard/summary`);
    if (!res.ok) throw new Error('Falha ao obter dados do dashboard');
    return res.json();
  },

  // PONDS
  async getPonds(): Promise<Pond[]> {
    const res = await fetch(`${API_BASE}/ponds`);
    if (!res.ok) throw new Error('Falha ao listar viveiros');
    return res.json();
  },

  async createPond(data: Partial<Pond>): Promise<Pond> {
    const res = await fetch(`${API_BASE}/ponds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao criar viveiro');
    return res.json();
  },

  // BATCHES
  async getBatches(status?: string): Promise<ShrimpBatch[]> {
    const url = status ? `${API_BASE}/batches?status=${status}` : `${API_BASE}/batches`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao listar lotes de camarão');
    return res.json();
  },

  async createBatch(data: Partial<ShrimpBatch>): Promise<ShrimpBatch> {
    const res = await fetch(`${API_BASE}/batches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao criar lote de camarão');
    return res.json();
  },

  // BIOMETRY
  async getBiometries(batchId?: number): Promise<BiometryLog[]> {
    const url = batchId ? `${API_BASE}/biometry?batch_id=${batchId}` : `${API_BASE}/biometry`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao listar biometrias');
    return res.json();
  },

  async recordBiometry(data: Partial<BiometryLog>): Promise<BiometryLog> {
    const res = await fetch(`${API_BASE}/biometry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao registrar biometria');
    return res.json();
  },

  // INVENTORY & STOCK MANAGEMENT (CONTROLE DE ESTOQUE & INSUMOS INTELIGENTE)
  async getFeedInventory(): Promise<FeedInventory[]> {
    const res = await fetch(`${API_BASE}/inventory/items`);
    if (!res.ok) throw new Error('Falha ao listar estoque de insumos');
    return res.json();
  },

  async getInventoryItems(params?: {
    tipo?: string;
    situacao?: string;
    search?: string;
    sort_by?: string;
  }): Promise<FeedInventory[]> {
    const searchParams = new URLSearchParams();
    if (params?.tipo && params.tipo !== 'Todos') searchParams.append('tipo', params.tipo);
    if (params?.situacao && params.situacao !== 'Todos') searchParams.append('situacao', params.situacao);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sort_by) searchParams.append('sort_by', params.sort_by);

    const qs = searchParams.toString();
    const url = qs ? `${API_BASE}/inventory/items?${qs}` : `${API_BASE}/inventory/items`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao obter insumos do estoque');
    return res.json();
  },

  async createInventoryItem(data: Partial<FeedInventory>): Promise<FeedInventory> {
    const res = await fetch(`${API_BASE}/inventory/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao cadastrar insumo no estoque');
    return res.json();
  },

  async updateInventoryItem(id: number, data: Partial<FeedInventory>): Promise<FeedInventory> {
    const res = await fetch(`${API_BASE}/inventory/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao atualizar insumo no estoque');
    return res.json();
  },

  async deleteInventoryItem(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/inventory/items/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Falha ao excluir insumo do estoque');
    return res.json();
  },

  async recordInventoryEntry(data: {
    item_id: number;
    quantity: number;
    unit_price: number;
    total_price?: number;
    supplier_name?: string;
    invoice_number?: string;
    batch_number?: string;
    notes?: string;
  }): Promise<InventoryMovement> {
    const res = await fetch(`${API_BASE}/inventory/entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Erro na requisição' }));
      throw new Error(err.detail || 'Falha ao registrar entrada no estoque');
    }
    return res.json();
  },

  async recordInventoryExit(data: {
    item_id: number;
    quantity: number;
    movement_type?: string;
    notes?: string;
  }): Promise<InventoryMovement> {
    const res = await fetch(`${API_BASE}/inventory/exit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Erro na requisição' }));
      throw new Error(err.detail || 'Falha ao registrar saída do estoque');
    }
    return res.json();
  },

  async getInventoryMovements(itemId?: number): Promise<InventoryMovement[]> {
    const url = itemId ? `${API_BASE}/inventory/movements?item_id=${itemId}` : `${API_BASE}/inventory/movements`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao obter histórico de movimentações');
    return res.json();
  },

  async getProductMixes(): Promise<ProductMix[]> {
    const res = await fetch(`${API_BASE}/inventory/mixes`);
    if (!res.ok) throw new Error('Falha ao listar misturas e formulações');
    return res.json();
  },

  async createProductMix(data: Partial<ProductMix>): Promise<ProductMix> {
    const res = await fetch(`${API_BASE}/inventory/mixes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao salvar mistura de insumos');
    return res.json();
  },

  async createFeedItem(data: Partial<FeedInventory>): Promise<FeedInventory> {
    return this.createInventoryItem(data);
  },


  async getFeedingLogs(batchId?: number): Promise<FeedingLog[]> {
    const url = batchId ? `${API_BASE}/feeding/logs?batch_id=${batchId}` : `${API_BASE}/feeding/logs`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao listar tratos de alimentação');
    return res.json();
  },

  async recordFeeding(data: Partial<FeedingLog>): Promise<FeedingLog> {
    const res = await fetch(`${API_BASE}/feeding/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao registrar trato');
    return res.json();
  },

  async getFeedingTrays(batchId?: number): Promise<FeedingTrayLog[]> {
    const url = batchId ? `${API_BASE}/feeding/trays?batch_id=${batchId}` : `${API_BASE}/feeding/trays`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao listar comedouros/bandejas');
    return res.json();
  },

  async recordFeedingTray(data: Partial<FeedingTrayLog>): Promise<FeedingTrayLog> {
    const res = await fetch(`${API_BASE}/feeding/trays`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao registrar inspeção de bandeja');
    return res.json();
  },

  // WATER QUALITY
  async getWaterLogs(pondId?: number): Promise<WaterQualityLog[]> {
    const url = pondId ? `${API_BASE}/water-quality?pond_id=${pondId}` : `${API_BASE}/water-quality`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao listar qualidade da água');
    return res.json();
  },

  async recordWaterQuality(data: Partial<WaterQualityLog>): Promise<WaterQualityLog> {
    const res = await fetch(`${API_BASE}/water-quality`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao registrar parâmetros de água');
    return res.json();
  },

  // MORTALITY
  async getMortalities(batchId?: number): Promise<MortalityLog[]> {
    const url = batchId ? `${API_BASE}/mortality?batch_id=${batchId}` : `${API_BASE}/mortality`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao listar mortalidades');
    return res.json();
  },

  async recordMortality(data: Partial<MortalityLog>): Promise<MortalityLog> {
    const res = await fetch(`${API_BASE}/mortality`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao registrar mortalidade');
    return res.json();
  },

  // HARVEST
  async getHarvests(batchId?: number): Promise<HarvestLog[]> {
    const url = batchId ? `${API_BASE}/harvest?batch_id=${batchId}` : `${API_BASE}/harvest`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao listar despescas');
    return res.json();
  },

  async recordHarvest(data: Partial<HarvestLog>): Promise<HarvestLog> {
    const res = await fetch(`${API_BASE}/harvest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao registrar despesca');
    return res.json();
  },

  // ===================================================================
  // AI INTELLIGENCE SERVICES
  // ===================================================================
  async askAICopilot(message: string, pondId?: number, batchId?: number): Promise<AIChatResponse> {
    const res = await fetch(`${API_BASE}/ai/copilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context_pond_id: pondId, context_batch_id: batchId }),
    });
    if (!res.ok) throw new Error('Falha na resposta do Copilot IA');
    return res.json();
  },

  async optimizeFeedingAI(data: {
    batch_id: number;
    current_biomass_kg: number;
    water_temp_c: number;
    dissolved_oxygen_mg_l: number;
    leftover_percentage: number;
    current_trato_kg: number;
  }): Promise<AIFeedingAdjustmentResponse> {
    const res = await fetch(`${API_BASE}/ai/feeding-optimizer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha na otimização de arraçoamento IA');
    return res.json();
  },

  async calculateIonicBalanceAI(data: {
    pond_id: number;
    pond_volume_m3: number;
    current_salinity_ppt: number;
    current_alkalinity_mg_l: number;
    current_calcium_mg_l: number;
    current_magnesium_mg_l: number;
  }): Promise<AIIonicBalanceResponse> {
    const res = await fetch(`${API_BASE}/ai/ionic-balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha no cálculo do balanço iônico IA');
    return res.json();
  },

  async getGrowthForecastAI(batchId: number): Promise<AIGrowthForecastResponse> {
    const res = await fetch(`${API_BASE}/ai/growth-forecast/${batchId}`);
    if (!res.ok) throw new Error('Falha na projeção biométrica IA');
    return res.json();
  },

  // ===================================================================
  // WHATSAPP & ALERTAS INTELIGENTES
  // ===================================================================
  async getWhatsAppConfig(): Promise<WhatsAppAlertConfig> {
    const res = await fetch(`${API_BASE}/whatsapp/config`);
    if (!res.ok) throw new Error('Falha ao obter configuração do WhatsApp');
    return res.json();
  },

  async updateWhatsAppConfig(data: Partial<WhatsAppAlertConfig>): Promise<WhatsAppAlertConfig> {
    const res = await fetch(`${API_BASE}/whatsapp/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao salvar configuração do WhatsApp');
    return res.json();
  },

  async getWhatsAppMessages(limit = 30): Promise<WhatsAppMessageLog[]> {
    const res = await fetch(`${API_BASE}/whatsapp/messages?limit=${limit}`);
    if (!res.ok) throw new Error('Falha ao listar mensagens do WhatsApp');
    return res.json();
  },

  async sendTestWhatsAppNotification(templateType = 'despesca'): Promise<WhatsAppMessageLog> {
    const res = await fetch(`${API_BASE}/whatsapp/send-test?template_type=${templateType}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Falha ao disparar mensagem de teste no WhatsApp');
    return res.json();
  },

  async chatWithWhatsAppBot(user_message: string, phone_number?: string): Promise<WhatsAppBotChatResponse> {
    const res = await fetch(`${API_BASE}/whatsapp/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_message, phone_number }),
    });
    if (!res.ok) throw new Error('Falha ao conversar com o Bot IA do WhatsApp');
    return res.json();
  },

  // ===================================================================
  // NOTA FISCAL & GUIA DE TRÂNSITO ANIMAL (GTA)
  // ===================================================================
  async getFiscalInvoices(): Promise<FiscalInvoice[]> {
    const res = await fetch(`${API_BASE}/fiscal/invoices`);
    if (!res.ok) throw new Error('Falha ao listar notas fiscais');
    return res.json();
  },

  async createFiscalInvoice(data: Partial<FiscalInvoice>): Promise<FiscalInvoice> {
    const res = await fetch(`${API_BASE}/fiscal/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao emitir nota fiscal');
    return res.json();
  },

  async issueInvoiceFromHarvest(harvestId: number, buyerName?: string): Promise<FiscalInvoice> {
    const url = buyerName
      ? `${API_BASE}/fiscal/issue-from-harvest/${harvestId}?buyer_name=${encodeURIComponent(buyerName)}`
      : `${API_BASE}/fiscal/issue-from-harvest/${harvestId}`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error('Falha ao gerar NF-e a partir da despesca');
    return res.json();
  },

  async getFiscalSummary(): Promise<FiscalSummary> {
    const res = await fetch(`${API_BASE}/fiscal/summary`);
    if (!res.ok) throw new Error('Falha ao carregar balanço fiscal');
    return res.json();
  },

  // ===================================================================
  // EQUIPAMENTOS, ATIVOS & MANUTENÇÃO PREDITIVA IA
  // ===================================================================
  async getEquipments(): Promise<Equipment[]> {
    const res = await fetch(`${API_BASE}/equipment/`);
    if (!res.ok) throw new Error('Falha ao listar equipamentos');
    return res.json();
  },

  async createEquipment(data: Partial<Equipment>): Promise<Equipment> {
    const res = await fetch(`${API_BASE}/equipment/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao cadastrar equipamento');
    return res.json();
  },

  async updateEquipment(id: number, data: Partial<Equipment>): Promise<Equipment> {
    const res = await fetch(`${API_BASE}/equipment/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao atualizar equipamento');
    return res.json();
  },

  async recordEquipmentMaintenance(id: number, data: Partial<EquipmentMaintenanceLog>): Promise<EquipmentMaintenanceLog> {
    const res = await fetch(`${API_BASE}/equipment/${id}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao registrar manutenção');
    return res.json();
  },

  async getEquipmentMaintenanceLogs(equipmentId?: number): Promise<EquipmentMaintenanceLog[]> {
    const url = equipmentId
      ? `${API_BASE}/equipment/maintenance-logs?equipment_id=${equipmentId}`
      : `${API_BASE}/equipment/maintenance-logs`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao carregar histórico de manutenções');
    return res.json();
  },

  async getEquipmentEnergyAnalytics(): Promise<{
    total_active_equipment: number;
    total_aeration_hp: number;
    total_aeration_kw: number;
    estimated_daily_kwh: number;
    estimated_monthly_cost_rs: number;
    urgent_maintenance_count: number;
    urgent_maintenance_items: Array<{ id: number; name: string; hours_overdue: number }>;
    ai_energy_tip: string;
  }> {
    const res = await fetch(`${API_BASE}/equipment/energy-analytics`);
    if (!res.ok) throw new Error('Falha ao obter diagnóstico energético IA');
    return res.json();
  },

  // ===================================================================
  // MÓDULO COMERCIAL
  // ===================================================================
  async getCommercialSales(params?: { buyer?: string; class?: string }): Promise<{
    sales: any[];
    summary: { total_sales_count: number; total_volume_kg: number; total_revenue_rs: number; average_price_kg_rs: number };
  }> {
    const sp = new URLSearchParams();
    if (params?.buyer) sp.append('buyer_name', params.buyer);
    if (params?.class) sp.append('commercial_class', params.class);
    const qs = sp.toString();
    const url = qs ? `${API_BASE}/commercial/sales?${qs}` : `${API_BASE}/commercial/sales`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao listar vendas comerciais');
    return res.json();
  },

  async recordCommercialSale(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/commercial/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao registrar venda');
    return res.json();
  },

  async getCashFlow(params?: { type?: string; category?: string }): Promise<{
    movements: any[];
    summary: { total_inflow_rs: number; total_outflow_rs: number; net_operational_balance_rs: number; by_category: any };
  }> {
    const sp = new URLSearchParams();
    if (params?.type) sp.append('movement_type', params.type);
    if (params?.category) sp.append('category', params.category);
    const qs = sp.toString();
    const url = qs ? `${API_BASE}/commercial/cashflow?${qs}` : `${API_BASE}/commercial/cashflow`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha ao obter fluxo de caixa');
    return res.json();
  },

  async recordCashMovement(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/commercial/cashflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao registrar movimentação financeira');
    return res.json();
  },

  async getBankAccounts(): Promise<{ accounts: any[]; total_balance_rs: number }> {
    const res = await fetch(`${API_BASE}/commercial/bank-accounts`);
    if (!res.ok) throw new Error('Falha ao listar contas bancárias');
    return res.json();
  },

  async createBankAccount(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/commercial/bank-accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao cadastrar conta bancária');
    return res.json();
  },

  async getOfficialBanks(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/commercial/banks`);
    if (!res.ok) throw new Error('Falha ao listar bancos oficiais');
    return res.json();
  },

  async getFinancialAuditAI(): Promise<any> {
    const res = await fetch(`${API_BASE}/commercial/ai-audit`, { method: 'POST' });
    if (!res.ok) throw new Error('Falha ao gerar auditoria financeira IA');
    return res.json();
  },

  // ===================================================================
  // MÓDULO RELATÓRIOS
  // ===================================================================
  async getDREReport(): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/dre`);
    if (!res.ok) throw new Error('Falha ao gerar DRE');
    return res.json();
  },

  async getDFCReport(): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/dfc`);
    if (!res.ok) throw new Error('Falha ao gerar DFC');
    return res.json();
  },

  async getProductionReports(): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/production`);
    if (!res.ok) throw new Error('Falha ao carregar relatórios de produção');
    return res.json();
  },

  async getReportGraphs(): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/graphs`);
    if (!res.ok) throw new Error('Falha ao carregar dados de gráficos');
    return res.json();
  },

  async getAIExecutiveSummary(): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/ai-summary`, { method: 'POST' });
    if (!res.ok) throw new Error('Falha ao emitir diagnóstico executivo IA');
    return res.json();
  },

  // ===================================================================
  // PREVISÃO DE DESPESCA
  // ===================================================================
  async getHarvestSimulation(params?: {
    weekly_growth_g?: number;
    gmd_g_day?: number;
    target_weight_g?: number;
    pond_id?: number;
  }): Promise<any> {
    const sp = new URLSearchParams();
    if (params?.weekly_growth_g !== undefined) sp.append('weekly_growth_g', params.weekly_growth_g.toString());
    if (params?.gmd_g_day !== undefined) sp.append('gmd_g_day', params.gmd_g_day.toString());
    if (params?.target_weight_g !== undefined) sp.append('target_weight_g', params.target_weight_g.toString());
    if (params?.pond_id) sp.append('pond_id', params.pond_id.toString());
    const qs = sp.toString();
    const url = qs ? `${API_BASE}/forecast/simulation?${qs}` : `${API_BASE}/forecast/simulation`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha na simulação de despesca');
    return res.json();
  },

  async calculateOptimalHarvestAI(data: { target_weight_g: number; water_temp_c?: number }): Promise<any> {
    const res = await fetch(`${API_BASE}/forecast/ai-optimal-harvest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao calcular ponto ótimo de despesca IA');
    return res.json();
  },

  // ===================================================================
  // MINHA FAZENDA (JOÃO PESSOA / PB)
  // ===================================================================
  async getFarmProfile(): Promise<any> {
    const res = await fetch(`${API_BASE}/farm/profile`);
    if (!res.ok) throw new Error('Falha ao obter perfil da fazenda');
    return res.json();
  },

  async updateFarmProfile(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/farm/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao atualizar dados da fazenda');
    return res.json();
  },

  async getLiveWeather(): Promise<any> {
    const res = await fetch(`${API_BASE}/farm/weather-live`);
    if (!res.ok) throw new Error('Falha ao consultar clima ao vivo');
    return res.json();
  },

  async getParaibaTides(): Promise<any> {
    const res = await fetch(`${API_BASE}/farm/tides`);
    if (!res.ok) throw new Error('Falha ao consultar tábua de marés da Paraíba');
    return res.json();
  },

  async getShrimpMarketPrices(): Promise<any> {
    const res = await fetch(`${API_BASE}/farm/market-prices`);
    if (!res.ok) throw new Error('Falha ao obter cotação de mercado regional');
    return res.json();
  },

  async getCurrencyQuotes(): Promise<any> {
    const res = await fetch(`${API_BASE}/farm/currency`);
    if (!res.ok) throw new Error('Falha ao obter cotações de moedas');
    return res.json();
  },

  async consultCNPJ(cnpj: string): Promise<any> {
    const res = await fetch(`${API_BASE}/farm/consult-cnpj/${cnpj}`);
    if (!res.ok) throw new Error('Falha ao consultar CNPJ via BrasilAPI');
    return res.json();
  },

  async consultCEP(cep: string): Promise<any> {
    const res = await fetch(`${API_BASE}/farm/consult-cep/${cep}`);
    if (!res.ok) throw new Error('Falha ao consultar CEP via BrasilAPI');
    return res.json();
  },

  async getCommercialHolidays(year = 2026): Promise<any> {
    const res = await fetch(`${API_BASE}/farm/holidays?year=${year}`);
    if (!res.ok) throw new Error('Falha ao obter feriados comerciais');
    return res.json();
  },

  async getCreditIndices(): Promise<any> {
    const res = await fetch(`${API_BASE}/farm/credit-indices`);
    if (!res.ok) throw new Error('Falha ao obter taxas de crédito e Selic');
    return res.json();
  },

  // ===================================================================
  // ENDPOINTS ESPECIALIZADOS DE IA PARA TODOS OS MÓDULOS
  // ===================================================================
  async getFarmHealthSummary(): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/farm-health-summary`);
    if (!res.ok) throw new Error('Falha ao obter índice de saúde da fazenda');
    return res.json();
  },

  async getPondHealthAI(pondId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/pond-health/${pondId}`);
    if (!res.ok) throw new Error('Falha ao obter capacidade de suporte do viveiro');
    return res.json();
  },

  async getWaterStressAI(pondId: number): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/water-stress/${pondId}`);
    if (!res.ok) throw new Error('Falha ao obter estresse químico da água');
    return res.json();
  },

  // MULTIMODAL COMPUTER VISION (SMARTPHONE CAMERA / PHOTO UPLOAD)
  async analyzeCarcinicultureImage(payload: AIImageAnalysisRequest): Promise<AIImageAnalysisResponse> {
    const res = await fetch(`${API_BASE}/ai/analyze-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Falha ao analisar imagem com IA');
    }
    return res.json();
  },
};


