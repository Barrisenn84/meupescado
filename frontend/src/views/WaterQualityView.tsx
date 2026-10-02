import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Plus,
  Sparkles,
} from 'lucide-react';
import { WaterQualityLog, Pond } from '../types';
import { api } from '../services/api';

interface WaterQualityViewProps {
  logs: WaterQualityLog[];
  ponds: Pond[];
  onRefresh: () => void;
  onNavigateTab: (tab: string) => void;
}

export const WaterQualityView: React.FC<WaterQualityViewProps> = ({
  logs = [],
  ponds = [],
  onRefresh,
  onNavigateTab,
}) => {
  const safeLogs = Array.isArray(logs) ? logs : [];
  const safePonds = Array.isArray(ponds) ? ponds : [];

  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  const [selectedPondFilter, setSelectedPondFilter] = useState<number | 'ALL'>('ALL');

  const [form, setForm] = useState({
    pond_id: safePonds.length > 0 ? safePonds[0].id : 0,
    timestamp: new Date().toISOString().slice(0, 16),
    salinity_ppt: 16.0,
    dissolved_oxygen_mg_l: 5.6,
    temperature_c: 29.0,
    ph: 7.8,
    total_alkalinity_mg_l: 145.0,
    total_hardness_mg_l: 680.0,
    calcium_mg_l: 130.0,
    magnesium_mg_l: 390.0,
    toxic_ammonia_nh3_mg_l: 0.015,
    nitrite_no2_mg_l: 0.03,
    transparency_secchi_cm: 32.0,
    notes: '',
  });

  useEffect(() => {
    if (safePonds.length > 0) {
      setForm(prev => (prev.pond_id === 0 ? { ...prev, pond_id: safePonds[0].id } : prev));
    }
  }, [safePonds]);

  const handleRecordWater = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pond_id || form.pond_id === 0) {
      alert('Selecione um viveiro válido.');
      return;
    }

    try {
      await api.recordWaterQuality({
        ...form,
        timestamp: new Date(form.timestamp).toISOString(),
      });
      setIsWaterModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert('Erro ao registrar parâmetros da água: ' + (err?.message || err));
    }
  };

  const filteredLogs = selectedPondFilter === 'ALL'
    ? safeLogs
    : safeLogs.filter(l => l.pond_id === selectedPondFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Droplets size={24} color="#38bdf8" />
            Qualidade da Água & Balanço Iônico para Camarão
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Monitoramento de Salinidade, Alcalinidade Total, Relação Magnésio:Cálcio (Mg:Ca) e Oxigênio de Fundo
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onNavigateTab('ai')}
            className="btn btn-secondary"
            style={{ border: '1px solid rgba(168, 85, 247, 0.4)', color: '#c084fc' }}
          >
            <Sparkles size={18} />
            <span>Calcular Bicarbonato & Minerais IA</span>
          </button>

          <button
            onClick={() => setIsWaterModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus size={18} />
            <span>Registrar Medição</span>
          </button>
        </div>
      </div>

      {/* Reference standards for shrimp */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '12px',
      }}>
        <div className="glass-card" style={{ padding: '14px', borderLeft: '4px solid var(--aqua-400)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Alcalinidade Total (CaCO₃)</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>130 - 160 mg/L</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--rose-400)', marginTop: '2px' }}>
            &lt; 110 mg/L: Risco na troca de casca (muda)
          </div>
        </div>

        <div className="glass-card" style={{ padding: '14px', borderLeft: '4px solid var(--purple-400)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Relação Iônica Mg : Ca</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>3.0 : 1 a 3.5 : 1</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Essencial para calcificação do exoesqueleto
          </div>
        </div>

        <div className="glass-card" style={{ padding: '14px', borderLeft: '4px solid var(--emerald-400)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Oxigênio Dissolvido (Fundo)</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>&ge; 4.5 mg/L</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--rose-400)', marginTop: '2px' }}>
            &lt; 3.5 mg/L: Risco de anóxia e corte de ração
          </div>
        </div>

        <div className="glass-card" style={{ padding: '14px', borderLeft: '4px solid var(--amber-400)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Salinidade Operacional</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>10 a 35 ppt</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Aclimatar max 2.5 ppt/hora
          </div>
        </div>
      </div>

      {/* Table of logs */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#ffffff' }}>
            Histórico de Medições de Viveiros e Berçários
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Filtrar Viveiro:</span>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '6px 28px 6px 12px', fontSize: '0.82rem' }}
              value={selectedPondFilter}
              onChange={e => setSelectedPondFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            >
              <option value="ALL">Todos os Viveiros</option>
              {ponds.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>Data & Hora</th>
                <th style={{ padding: '10px' }}>Viveiro</th>
                <th style={{ padding: '10px' }}>Salinidade</th>
                <th style={{ padding: '10px' }}>Alcalinidade</th>
                <th style={{ padding: '10px' }}>Mg : Ca</th>
                <th style={{ padding: '10px' }}>OD Fundo</th>
                <th style={{ padding: '10px' }}>Temp</th>
                <th style={{ padding: '10px' }}>pH</th>
                <th style={{ padding: '10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const isCrit = log.status === 'CRITICO';
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 10px', color: '#ffffff', fontWeight: 600 }}>
                      {new Date(log.timestamp).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {log.pond_name}
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                      {log.salinity_ppt} ppt
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <strong style={{
                        color: log.total_alkalinity_mg_l < 110 ? 'var(--rose-400)' : log.total_alkalinity_mg_l < 130 ? 'var(--amber-400)' : 'var(--emerald-400)',
                        fontSize: '0.92rem',
                      }}>
                        {log.total_alkalinity_mg_l} mg/L
                      </strong>
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--purple-400)', fontWeight: 600 }}>
                      {log.mg_ca_ratio} : 1
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <strong style={{
                        color: log.dissolved_oxygen_mg_l < 3.5 ? 'var(--rose-400)' : log.dissolved_oxygen_mg_l < 4.5 ? 'var(--amber-400)' : 'var(--emerald-400)',
                      }}>
                        {log.dissolved_oxygen_mg_l} mg/L
                      </strong>
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                      {log.temperature_c}°C
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-primary)' }}>
                      {log.ph}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span className={`badge badge-${log.status.toLowerCase()}`}>
                        <span className={`pulse-dot ${log.status.toLowerCase()}`} />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Registrar Parâmetros */}
      {isWaterModalOpen && (
        <div className="modal-overlay" onClick={() => setIsWaterModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#ffffff' }}>
              Registrar Parâmetros Físico-Químicos
            </h2>

            <form onSubmit={handleRecordWater} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Viveiro ou Berçário</label>
                <select
                  className="form-control"
                  value={form.pond_id}
                  onChange={e => setForm({ ...form, pond_id: Number(e.target.value) })}
                >
                  {ponds.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Salinidade (ppt)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-control"
                    value={form.salinity_ppt}
                    onChange={e => setForm({ ...form, salinity_ppt: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Alcalinidade Total (mg/L CaCO₃)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.total_alkalinity_mg_l}
                    onChange={e => setForm({ ...form, total_alkalinity_mg_l: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Cálcio Ca²⁺ (mg/L)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.calcium_mg_l}
                    onChange={e => setForm({ ...form, calcium_mg_l: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Magnésio Mg²⁺ (mg/L)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.magnesium_mg_l}
                    onChange={e => setForm({ ...form, magnesium_mg_l: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">OD Fundo (mg/L)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={form.dissolved_oxygen_mg_l}
                    onChange={e => setForm({ ...form, dissolved_oxygen_mg_l: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Temperatura (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={form.temperature_c}
                    onChange={e => setForm({ ...form, temperature_c: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">pH</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={form.ph}
                    onChange={e => setForm({ ...form, ph: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsWaterModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Gravar Parâmetros
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
