import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Sparkles,
  ShieldAlert,
  Search,
  RotateCw,
  Gauge,
  History,
  TrendingDown,
  X,
  BatteryCharging,
  Cpu,
  Layers,
} from 'lucide-react';
import { Equipment, EquipmentMaintenanceLog } from '../types';
import { api } from '../services/api';

export const EquipmentView: React.FC = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [analytics, setAnalytics] = useState<{
    total_active_equipment: number;
    total_aeration_hp: number;
    total_aeration_kw: number;
    estimated_daily_kwh: number;
    estimated_monthly_cost_rs: number;
    urgent_maintenance_count: number;
    urgent_maintenance_items: Array<{ id: number; name: string; hours_overdue: number }>;
    ai_energy_tip: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [maintenanceLogs, setMaintenanceLogs] = useState<EquipmentMaintenanceLog[]>([]);

  // Form: New Equipment
  const [newEquip, setNewEquip] = useState({
    name: '',
    category: 'Aerador',
    brand_model: '',
    power_hp: 2.0,
    voltage: '380V Trifásico',
    hourmeter_hours: 0,
    maintenance_interval_hours: 500,
    location: 'Viveiro 01',
    notes: '',
  });

  // Form: Record Maintenance
  const [maintData, setMaintData] = useState({
    maintenance_type: 'PREVENTIVA',
    description: '',
    replaced_parts: '',
    cost_rs: 0,
    technician_name: 'Equipe de Manutenção Interna',
    hourmeter_at_maintenance: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [list, diag] = await Promise.all([
        api.getEquipments(),
        api.getEquipmentEnergyAnalytics(),
      ]);
      setEquipments(list);
      setAnalytics(diag);
    } catch (err) {
      console.error('Erro ao carregar dados de equipamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenMaintenance = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setMaintData({
      maintenance_type: 'PREVENTIVA',
      description: `Revisão periódica programada aos ${eq.hourmeter_hours}h. Troca de óleo do redutor e verificação de rolamentos.`,
      replaced_parts: 'Óleo sintético ISO VG 220, retentor nitrílico',
      cost_rs: 180.0,
      technician_name: 'Eletromecânica Potiguar',
      hourmeter_at_maintenance: eq.hourmeter_hours,
    });
    setShowMaintenanceModal(true);
  };

  const handleOpenHistory = async (eq: Equipment) => {
    setSelectedEquipment(eq);
    try {
      const logs = await api.getEquipmentMaintenanceLogs(eq.id);
      setMaintenanceLogs(logs);
      setShowHistoryModal(true);
    } catch (err) {
      alert('Falha ao carregar histórico de manutenções');
    }
  };

  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createEquipment(newEquip);
      setShowAddModal(false);
      setNewEquip({
        name: '',
        category: 'Aerador',
        brand_model: '',
        power_hp: 2.0,
        voltage: '380V Trifásico',
        hourmeter_hours: 0,
        maintenance_interval_hours: 500,
        location: 'Viveiro 01',
        notes: '',
      });
      await loadData();
      alert('Equipamento cadastrado com sucesso!');
    } catch (err) {
      alert('Erro ao cadastrar equipamento');
    }
  };

  const handleSaveMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment) return;
    try {
      await api.recordEquipmentMaintenance(selectedEquipment.id, maintData);
      setShowMaintenanceModal(false);
      await loadData();
      alert('Manutenção registrada e horímetro de ciclo reiniciado com sucesso!');
    } catch (err) {
      alert('Erro ao registrar manutenção');
    }
  };

  const handleQuickHourUpdate = async (eq: Equipment, additionalHours: number) => {
    try {
      const newHours = eq.hourmeter_hours + additionalHours;
      await api.updateEquipment(eq.id, { hourmeter_hours: newHours });
      await loadData();
    } catch (err) {
      alert('Erro ao atualizar horímetro');
    }
  };

  const filteredEquipments = equipments.filter((eq) => {
    const matchesSearch =
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.brand_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || eq.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || eq.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/70 to-slate-900 rounded-2xl p-6 text-white border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Módulo de Ativos & Manutenção 100% Desbloqueado • IA Preditiva
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Wrench className="w-8 h-8 text-amber-400" />
              Gestão de Equipamentos, Aeradores & Eficiência Energética
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Monitoramento contínuo de horímetro, desgaste de palhetas e redutores, alertas de lubrificação periódica,
              e telemetria com estimativa de consumo de energia (HP vs kWh).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 text-sm"
            >
              <Plus className="w-4 h-4" />
              Novo Equipamento
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total de Ativos</p>
            <p className="text-xl font-bold text-white mt-1">
              {analytics?.total_active_equipment || equipments.length} máquinas
            </p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              100% catalogados
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Potência Instalada</p>
            <p className="text-xl font-bold text-amber-400 mt-1">
              {analytics?.total_aeration_hp || 0} HP
            </p>
            <p className="text-xs text-slate-400 mt-1">~{analytics?.total_aeration_kw || 0} kW em operação</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Consumo Médio Diário</p>
            <p className="text-xl font-bold text-cyan-400 mt-1">
              {analytics?.estimated_daily_kwh.toLocaleString('pt-BR') || 0} kWh
            </p>
            <p className="text-xs text-slate-400 mt-1">Ciclos noturnos / diurnos</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <BatteryCharging className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Custo Energia Estimado</p>
            <p className="text-xl font-bold text-purple-400 mt-1">
              R$ {analytics?.estimated_monthly_cost_rs.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Tarifa rural / mês</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Revisão Urgente</p>
            <p className="text-xl font-bold text-rose-400 mt-1">
              {analytics?.urgent_maintenance_count || 0} pendentes
            </p>
            <p className="text-xs text-rose-300 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Horímetro estourado
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* AI Energy & Predictive Diagnostics */}
      <div className="bg-slate-900/70 border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              Assistente de Telemetria Preditiva & Eficiência Energética IA
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-normal">
                Auditoria Automatizada
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              {analytics?.ai_energy_tip ||
                'Os aeradores são responsáveis por mais de 65% da conta de luz de uma carcinicultura. A IA monitora horas trabalhadas para evitar queima de enrolamento do motor e vibrações excessivas nos redutores.'}
            </p>
            {analytics?.urgent_maintenance_items && analytics.urgent_maintenance_items.length > 0 && (
              <div className="mt-2 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>
                  <strong>Atenção Imediata:</strong> Os equipamentos{' '}
                  {analytics.urgent_maintenance_items.map((i) => `"${i.name}" (+${i.hours_overdue}h)`).join(', ')}{' '}
                  ultrapassaram o intervalo preventivo e necessitam de graxa/óleo para evitar travamento.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters and List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h2 className="font-semibold text-white text-base">Inventário de Equipamentos & Horímetros</h2>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
              {filteredEquipments.length} máquinas
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar modelo, setor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500 w-48"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Todas Categorias</option>
              <option value="Aerador">Aeradores</option>
              <option value="Soprador">Sopradores</option>
              <option value="Bomba">Bombas</option>
              <option value="Gerador">Geradores</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Todos Status</option>
              <option value="OPERACIONAL">Operacional</option>
              <option value="REVISAO_URGENTE">Revisão Urgente</option>
              <option value="EM_MANUTENCAO">Em Manutenção</option>
            </select>

            <button
              onClick={loadData}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors"
              title="Recarregar"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Equipment Grid Cards */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipments.map((eq) => {
            const cycleProgress = Math.min(
              100,
              Math.round((eq.hours_since_last_maintenance / eq.maintenance_interval_hours) * 100)
            );
            const isOverdue = eq.hours_since_last_maintenance >= eq.maintenance_interval_hours;

            return (
              <div
                key={eq.id}
                className="bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700/80 text-amber-300">
                        {eq.category}
                      </span>
                      <h3 className="font-semibold text-white text-sm mt-1">{eq.name}</h3>
                      <p className="text-xs text-slate-400">{eq.brand_model}</p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        eq.status === 'OPERACIONAL'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : eq.status === 'REVISAO_URGENTE'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {eq.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-700/50 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Localização:</span>
                      <span className="font-medium text-slate-200">{eq.location}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Potência / Tensão:</span>
                      <span className="font-medium text-amber-300">
                        {eq.power_hp} HP • {eq.voltage}
                      </span>
                    </div>
                  </div>

                  {/* Hourmeter & Progress */}
                  <div className="mt-3 bg-slate-900/60 rounded-lg p-3 border border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400 flex items-center gap-1 font-mono">
                        <Gauge className="w-3.5 h-3.5 text-amber-400" />
                        Horímetro: <strong className="text-white">{eq.hourmeter_hours}h</strong>
                      </span>
                      <span
                        className={`text-[11px] font-mono font-semibold ${
                          isOverdue ? 'text-rose-400' : 'text-slate-300'
                        }`}
                      >
                        {eq.hours_since_last_maintenance}h / {eq.maintenance_interval_hours}h
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isOverdue
                            ? 'bg-rose-500'
                            : cycleProgress > 75
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${cycleProgress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                      <span>Última revisão: {eq.last_maintenance_date || 'N/A'}</span>
                      <span className="text-amber-400/90 font-medium">
                        Saúde IA: {100 - eq.ai_failure_risk_pct}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleQuickHourUpdate(eq, 24)}
                      className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[10px] text-slate-200 transition-colors"
                      title="Adicionar 24h de operação"
                    >
                      +24h
                    </button>
                    <button
                      onClick={() => handleQuickHourUpdate(eq, 168)}
                      className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[10px] text-slate-200 transition-colors"
                      title="Adicionar 1 semana (+168h)"
                    >
                      +7d
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenHistory(eq)}
                      className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors"
                      title="Histórico de Manutenções"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenMaintenance(eq)}
                      className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      Revisar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: NOVO EQUIPAMENTO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                Cadastrar Novo Equipamento / Ativo
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEquipment} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nome / Identificação</label>
                <input
                  type="text"
                  required
                  value={newEquip.name}
                  onChange={(e) => setNewEquip({ ...newEquip, name: e.target.value })}
                  placeholder="Ex: Aerador Pá 2.0cv - V05"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Categoria</label>
                  <select
                    value={newEquip.category}
                    onChange={(e) => setNewEquip({ ...newEquip, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Aerador">Aerador</option>
                    <option value="Soprador">Soprador / Blower</option>
                    <option value="Bomba">Bomba d'Água</option>
                    <option value="Gerador">Gerador a Diesel</option>
                    <option value="Alimentador">Alimentador Automático</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Marca / Modelo</label>
                  <input
                    type="text"
                    value={newEquip.brand_model}
                    onChange={(e) => setNewEquip({ ...newEquip, brand_model: e.target.value })}
                    placeholder="Ex: AquaBrasil 4 pás"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Potência (HP / cv)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newEquip.power_hp}
                    onChange={(e) => setNewEquip({ ...newEquip, power_hp: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tensão Elétrica</label>
                  <input
                    type="text"
                    value={newEquip.voltage}
                    onChange={(e) => setNewEquip({ ...newEquip, voltage: e.target.value })}
                    placeholder="Ex: 380V Trifásico"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Horímetro Inicial (h)</label>
                  <input
                    type="number"
                    value={newEquip.hourmeter_hours}
                    onChange={(e) => setNewEquip({ ...newEquip, hourmeter_hours: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Intervalo Revisão (h)</label>
                  <input
                    type="number"
                    value={newEquip.maintenance_interval_hours}
                    onChange={(e) =>
                      setNewEquip({ ...newEquip, maintenance_interval_hours: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Setor / Viveiro Alocado</label>
                <input
                  type="text"
                  value={newEquip.location}
                  onChange={(e) => setNewEquip({ ...newEquip, location: e.target.value })}
                  placeholder="Ex: Viveiro 01 ou Casa de Força"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl text-xs"
                >
                  Salvar Equipamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR MANUTENÇÃO */}
      {showMaintenanceModal && selectedEquipment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                Registrar Manutenção: {selectedEquipment.name}
              </h3>
              <button
                onClick={() => setShowMaintenanceModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaintenance} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tipo de Manutenção</label>
                  <select
                    value={maintData.maintenance_type}
                    onChange={(e) => setMaintData({ ...maintData, maintenance_type: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="PREVENTIVA">Preventiva Periódica</option>
                    <option value="LUBRIFICACAO">Lubrificação & Retentores</option>
                    <option value="CORRETIVA">Corretiva / Reparo</option>
                    <option value="SUBSTITUICAO">Substituição de Peças</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Horímetro na Revisão</label>
                  <input
                    type="number"
                    value={maintData.hourmeter_at_maintenance}
                    onChange={(e) =>
                      setMaintData({ ...maintData, hourmeter_at_maintenance: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Descrição do Serviço Realizado</label>
                <textarea
                  rows={3}
                  required
                  value={maintData.description}
                  onChange={(e) => setMaintData({ ...maintData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Peças Substituídas / Insumos</label>
                <input
                  type="text"
                  value={maintData.replaced_parts}
                  onChange={(e) => setMaintData({ ...maintData, replaced_parts: e.target.value })}
                  placeholder="Ex: Rolamento 6205, óleo sintético, retentor"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Custo Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={maintData.cost_rs}
                    onChange={(e) => setMaintData({ ...maintData, cost_rs: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Técnico / Responsável</label>
                  <input
                    type="text"
                    value={maintData.technician_name}
                    onChange={(e) => setMaintData({ ...maintData, technician_name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMaintenanceModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl text-xs"
                >
                  Registrar & Zerar Ciclo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: HISTÓRICO DE MANUTENÇÃO */}
      {showHistoryModal && selectedEquipment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                Histórico de Manutenções: {selectedEquipment.name}
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
              {maintenanceLogs.length === 0 ? (
                <p className="text-center text-slate-500 text-xs py-8">
                  Nenhum registro de manutenção anterior encontrado para este equipamento.
                </p>
              ) : (
                maintenanceLogs.map((log) => (
                  <div key={log.id} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-300">{log.maintenance_type}</span>
                      <span className="text-slate-400">{log.date}</span>
                    </div>
                    <p className="text-xs text-slate-200">{log.description}</p>
                    {log.replaced_parts && (
                      <p className="text-[11px] text-slate-400">
                        <strong className="text-slate-300">Peças:</strong> {log.replaced_parts}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-700/40 text-slate-400">
                      <span>Técnico: {log.technician_name}</span>
                      <span className="text-emerald-400 font-medium">R$ {log.cost_rs.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
