import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Plus,
} from 'lucide-react';
import { MortalityLog, ShrimpBatch } from '../types';
import { api } from '../services/api';

interface MortalityViewProps {
  logs?: MortalityLog[];
  batches?: ShrimpBatch[];
  onRefresh: () => void;
}

export const MortalityView: React.FC<MortalityViewProps> = ({
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
    quantity: 50,
    probable_cause: 'ROTINA_MUDA',
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
      await api.recordMortality(form);
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert('Erro ao registrar mortalidade: ' + (err?.message || err));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HeartPulse size={24} color="#f43f5e" />
            Sanidade do Camarão & Registro de Mudas / Baixas
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Registro de ocorrências, causas patológicas ou de manejo e índice de sobrevivência das Pós-Larvas
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Registrar Ocorrência / Baixa</span>
        </button>
      </div>

      {/* Survival KPI summary by batch */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
      }}>
        {batches.map((batch) => {
          const isHighSurvival = batch.survival_rate_percent >= 85;
          return (
            <div key={batch.id} className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>
                  {batch.batch_code}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: isHighSurvival ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                  color: isHighSurvival ? 'var(--emerald-400)' : 'var(--rose-400)',
                }}>
                  {batch.survival_rate_percent}% Sobrev.
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {batch.pond_name} • {batch.pl_stage}
              </div>

              <div style={{
                background: 'rgba(7, 18, 30, 0.5)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
              }}>
                <span style={{ color: 'var(--text-muted)' }}>Estoque Atual:</span>
                <strong style={{ color: '#ffffff' }}>
                  {(batch.current_shrimp_count / 1000).toFixed(0)}k / {(batch.initial_pls_count / 1000).toFixed(0)}k PLs
                </strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mortality Records Table */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '14px' }}>
          Registro Histórico de Ocorrências
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>Data</th>
                <th style={{ padding: '10px' }}>Lote / Viveiro</th>
                <th style={{ padding: '10px' }}>Quantidade</th>
                <th style={{ padding: '10px' }}>Causa Provável</th>
                <th style={{ padding: '10px' }}>Anotações</th>
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
                  <td style={{ padding: '12px 10px', color: 'var(--rose-400)', fontWeight: 700 }}>
                    {log.quantity} camarões
                  </td>
                  <td style={{ padding: '12px 10px' }}>
                    <span className="badge badge-atencao" style={{ fontSize: '0.7rem' }}>
                      {log.probable_cause}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {log.notes || '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Registrar Mortalidade */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#ffffff' }}>
              Registrar Ocorrência Sanitária
            </h2>

            <form onSubmit={handleRecord} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Lote Afetado</label>
                <select
                  className="form-control"
                  value={form.batch_id}
                  onChange={e => setForm({ ...form, batch_id: Number(e.target.value) })}
                >
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.batch_code} ({b.pond_name} - {b.pl_stage})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Data</label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Camarões Afetados (un)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="form-control"
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Causa Provável</label>
                <select
                  className="form-control"
                  value={form.probable_cause}
                  onChange={e => setForm({ ...form, probable_cause: e.target.value })}
                >
                  <option value="ROTINA_MUDA">Rotina / Troca de Carapaça (Muda natural)</option>
                  <option value="BAIXA_ALCALINIDADE">Baixa Alcalinidade / Casca mole</option>
                  <option value="HIPOXIA_NOTURNA">Hipóxia Noturna (Queda de OD no fundo)</option>
                  <option value="ESTRESSE_SALINIDADE">Estresse Osmótico / Variação Brusca Salinidade</option>
                  <option value="TOXIDEZ_NITRITO">Toxidez por Nitrito / Amônia</option>
                  <option value="SINDROME_MANCHA_BRANCA">Suspeita de Vírus da Mancha Branca (WSSV)</option>
                  <option value="AHPND_EMS">Necrose Hepatopancreática (AHPND/EMS)</option>
                  <option value="OUTROS">Outros / Indeterminado</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Observações e Ações Tomadas</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Ex: Reforço de aeração mecânica, aplicação de Bicarbonato..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
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
                <button type="submit" className="btn btn-danger">
                  Confirmar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
