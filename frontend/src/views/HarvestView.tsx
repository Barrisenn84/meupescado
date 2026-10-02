import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  DollarSign,
  Scale,
} from 'lucide-react';
import { HarvestLog, ShrimpBatch } from '../types';
import { api } from '../services/api';

interface HarvestViewProps {
  logs: HarvestLog[];
  batches: ShrimpBatch[];
  onRefresh: () => void;
}

export const HarvestView: React.FC<HarvestViewProps> = ({
  logs = [],
  batches = [],
  onRefresh,
}) => {
  const safeLogs = Array.isArray(logs) ? logs : [];
  const safeBatches = Array.isArray(batches) ? batches : [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    batch_id: safeBatches.length > 0 ? safeBatches[0].id : 0,
    date: new Date().toISOString().split('T')[0],
    harvest_type: 'TOTAL',
    total_weight_kg: 3500,
    shrimp_count_estimated: 250000,
    avg_weight_g: 14.0,
    commercial_classification: '60/70',
    price_per_kg: 24.50,
    total_revenue: 85750,
    buyer_name: '',
    notes: '',
  });

  useEffect(() => {
    if (safeBatches.length > 0) {
      setForm(prev => (prev.batch_id === 0 ? { ...prev, batch_id: safeBatches[0].id } : prev));
    }
  }, [safeBatches]);

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.batch_id || form.batch_id === 0) {
      alert('Selecione um lote de camarão válido.');
      return;
    }

    try {
      await api.recordHarvest({
        ...form,
        total_revenue: form.total_weight_kg * form.price_per_kg,
      });
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert('Erro ao registrar despesca: ' + (err?.message || err));
    }
  };

  const totalHarvestedKg = safeLogs.reduce((acc, curr) => acc + (curr.total_weight_kg || 0), 0);
  const totalRevenue = safeLogs.reduce((acc, curr) => acc + (curr.total_revenue || 0), 0);
  const avgPrice = totalHarvestedKg > 0 ? totalRevenue / totalHarvestedKg : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={24} color="#10b981" />
            Despescas & Comercialização de Camarão
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Registro de colheita por classe comercial (50/60, 60/70, 70/80), pesagem final e faturamento
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Registrar Despesca</span>
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
      }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Receita Bruta Total</span>
            <DollarSign size={20} color="#34d399" />
          </div>
          <div className="metric-value" style={{ color: 'var(--emerald-400)' }}>
            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="metric-sub">
            <span>Faturamento acumulado</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Biomassa Comercializada</span>
            <Scale size={20} color="#38bdf8" />
          </div>
          <div className="metric-value">
            {totalHarvestedKg.toLocaleString('pt-BR')} <span style={{ fontSize: '1rem', fontWeight: 500 }}>kg</span>
          </div>
          <div className="metric-sub">
            <span>{(totalHarvestedKg / 1000).toFixed(2)} toneladas despescadas</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Preço Médio Praticado</span>
            <TrendingUp size={20} color="#fbbf24" />
          </div>
          <div className="metric-value">
            R$ {avgPrice.toFixed(2)} <span style={{ fontSize: '1rem', fontWeight: 500 }}>/kg</span>
          </div>
          <div className="metric-sub">
            <span>Valor médio na beira do viveiro</span>
          </div>
        </div>
      </div>

      {/* Harvest Logs Table */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '14px' }}>
          Histórico de Despescas Realizadas
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>Data</th>
                <th style={{ padding: '10px' }}>Lote / Viveiro</th>
                <th style={{ padding: '10px' }}>Tipo</th>
                <th style={{ padding: '10px' }}>Volume (kg)</th>
                <th style={{ padding: '10px' }}>Camarões (un)</th>
                <th style={{ padding: '10px' }}>Peso Médio</th>
                <th style={{ padding: '10px' }}>Classe</th>
                <th style={{ padding: '10px' }}>Preço/kg</th>
                <th style={{ padding: '10px' }}>Receita Total</th>
                <th style={{ padding: '10px' }}>Comprador</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 10px', color: '#ffffff', fontWeight: 600 }}>
                    {new Date(log.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-primary)' }}>
                    <strong>{log.batch_code}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.pond_name}</div>
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className={`badge badge-${log.harvest_type === 'TOTAL' ? 'atencao' : 'aqua'}`}>
                      {log.harvest_type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', color: '#ffffff', fontWeight: 700 }}>
                    {log.total_weight_kg.toLocaleString('pt-BR')} kg
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                    {log.shrimp_count_estimated.toLocaleString('pt-BR')}
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--aqua-400)' }}>
                    {log.avg_weight_g} g
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className="badge badge-aqua">{log.commercial_classification}</span>
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                    R$ {log.price_per_kg.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--emerald-400)', fontWeight: 700 }}>
                    R$ {log.total_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-primary)' }}>
                    {log.buyer_name || '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Registrar Despesca */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#ffffff' }}>
              Registrar Despesca de Camarão
            </h2>

            <form onSubmit={handleRecord} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Lote Despescado</label>
                <select
                  className="form-control"
                  value={form.batch_id}
                  onChange={e => setForm({ ...form, batch_id: Number(e.target.value) })}
                >
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.batch_code} ({b.pond_name} - {b.current_avg_weight_g}g - Saldo: {b.current_shrimp_count} un)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Data da Despesca</label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Despesca</label>
                  <select
                    className="form-control"
                    value={form.harvest_type}
                    onChange={e => setForm({ ...form, harvest_type: e.target.value })}
                  >
                    <option value="TOTAL">Despesca Total (Esvazia viveiro)</option>
                    <option value="DESBASTE_PARCIAL">Desbaste Parcial (Alívio de densidade)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Peso Total (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    className="form-control"
                    value={form.total_weight_kg}
                    onChange={e => {
                      const w = Number(e.target.value);
                      const avg = form.shrimp_count_estimated > 0 ? (w * 1000) / form.shrimp_count_estimated : form.avg_weight_g;
                      setForm({
                        ...form,
                        total_weight_kg: w,
                        avg_weight_g: Math.round(avg * 10) / 10,
                        total_revenue: w * form.price_per_kg,
                      });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Camarões (un)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="form-control"
                    value={form.shrimp_count_estimated}
                    onChange={e => {
                      const count = Number(e.target.value);
                      const avg = count > 0 ? (form.total_weight_kg * 1000) / count : form.avg_weight_g;
                      setForm({
                        ...form,
                        shrimp_count_estimated: count,
                        avg_weight_g: Math.round(avg * 10) / 10,
                      });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Classe Comercial</label>
                  <select
                    className="form-control"
                    value={form.commercial_classification}
                    onChange={e => setForm({ ...form, commercial_classification: e.target.value })}
                  >
                    <option value="40/50">40/50 (18g - 20g)</option>
                    <option value="50/60">50/60 (15g - 17g)</option>
                    <option value="60/70">60/70 (12g - 14g)</option>
                    <option value="70/80">70/80 (10g - 12g)</option>
                    <option value="80/100">80/100 (8g - 10g)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Preço de Venda (R$/kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    className="form-control"
                    value={form.price_per_kg}
                    onChange={e => {
                      const p = Number(e.target.value);
                      setForm({
                        ...form,
                        price_per_kg: p,
                        total_revenue: form.total_weight_kg * p,
                      });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Receita Calculada (R$)</label>
                  <input
                    type="text"
                    disabled
                    className="form-control"
                    style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald-400)', fontWeight: 700 }}
                    value={`R$ ${(form.total_weight_kg * form.price_per_kg).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Comprador / Frigorífico</label>
                <input
                  type="text"
                  placeholder="Ex: Frigorífico Camarão do Litoral"
                  className="form-control"
                  value={form.buyer_name}
                  onChange={e => setForm({ ...form, buyer_name: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-success">
                  Confirmar Despesca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
