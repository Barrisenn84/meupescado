import React, { useState, useEffect } from 'react';
import {
  Scale,
  Plus,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Clock,
  Layers,
} from 'lucide-react';
import { ShrimpBatch, BiometryLog } from '../types';
import { api } from '../services/api';

interface BatchesViewProps {
  batches?: ShrimpBatch[];
  biometries?: BiometryLog[];
  onRefresh: () => void;
  onOpenNewBatchModal: (pondId?: number) => void;
  onNavigateTab: (tab: string) => void;
}

export const BatchesView: React.FC<BatchesViewProps> = ({
  batches = [],
  biometries = [],
  onRefresh,
  onOpenNewBatchModal,
  onNavigateTab,
}) => {
  const safeBatches = Array.isArray(batches) ? batches : [];
  const safeBiometries = Array.isArray(biometries) ? biometries : [];

  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(
    safeBatches.length > 0 ? safeBatches[0].id : null
  );
  const [isBiometryModalOpen, setIsBiometryModalOpen] = useState(false);
  const [biometryForm, setBiometryForm] = useState({
    batch_id: safeBatches.length > 0 ? safeBatches[0].id : 0,
    date: new Date().toISOString().split('T')[0],
    sample_count: 100,
    avg_weight_g: 0,
    uniformity_percentage: 88,
    gut_fullness_percent: 90,
    molt_stage: 'INTERMUDA',
    notes: '',
  });

  useEffect(() => {
    if (safeBatches.length > 0 && selectedBatchId === null) {
      setSelectedBatchId(safeBatches[0].id);
      setBiometryForm(prev => (prev.batch_id === 0 ? { ...prev, batch_id: safeBatches[0].id } : prev));
    }
  }, [safeBatches, selectedBatchId]);

  const handleRecordBiometry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biometryForm.batch_id || biometryForm.batch_id === 0) {
      alert('Selecione um lote de camarão válido.');
      return;
    }

    try {
      await api.recordBiometry(biometryForm);
      setIsBiometryModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert('Erro ao registrar biometria de camarão: ' + (err?.message || err));
    }
  };

  const selectedBatch = safeBatches.find(b => b.id === selectedBatchId) || (safeBatches.length > 0 ? safeBatches[0] : null);
  const batchBiometries = safeBiometries.filter(b => b.batch_id === (selectedBatch?.id || selectedBatchId));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>🦐</span>
            Lotes de Camarão & Amostragens Biométricas
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Acompanhamento de ganho de peso semanal, ecdise/muda, repleção do trato digestivo e classes comerciais
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onNavigateTab('ai')}
            className="btn btn-secondary"
            style={{ border: '1px solid rgba(168, 85, 247, 0.4)', color: '#c084fc' }}
          >
            <Sparkles size={18} />
            <span>Projeção IA de Despesca</span>
          </button>

          <button
            onClick={() => {
              if (selectedBatch) {
                setBiometryForm(prev => ({ ...prev, batch_id: selectedBatch.id }));
              }
              setIsBiometryModalOpen(true);
            }}
            className="btn btn-secondary"
          >
            <Scale size={18} />
            <span>Nova Biometria (Tarrafa)</span>
          </button>

          <button
            onClick={() => onOpenNewBatchModal()}
            className="btn btn-primary"
          >
            <Plus size={18} />
            <span>Povoar com Pós-Larvas (PL)</span>
          </button>
        </div>
      </div>

      {safeBatches.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          background: 'rgba(15, 30, 48, 0.4)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-card)',
          color: 'var(--text-secondary)',
        }}>
          <p style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '8px' }}>Nenhum lote de camarão ativo no momento.</p>
          <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>Inicie um novo ciclo povoando um viveiro ou berçário com pós-larvas.</p>
          <button onClick={() => onOpenNewBatchModal()} className="btn btn-primary">
            <Plus size={16} /> Povoar Primeiro Lote
          </button>
        </div>
      ) : (
        /* Main Grid: Batches on left, Selected Batch details on right */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {/* Batches Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {safeBatches.map((batch) => {
              const isSelected = batch.id === (selectedBatch?.id || selectedBatchId);
              const progress = Math.min(
                100,
                Math.round((batch.current_avg_weight_g / (batch.target_harvest_weight_g || 1)) * 100)
              );

              return (
                <div
                  key={batch.id}
                  className="glass-card"
                  onClick={() => setSelectedBatchId(batch.id)}
                  style={{
                    padding: '18px',
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--aqua-400)' : undefined,
                    background: isSelected ? 'rgba(14, 165, 233, 0.12)' : undefined,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff' }}>
                          {batch.batch_code}
                        </span>
                        <span className="badge badge-aqua" style={{ fontSize: '0.7rem' }}>
                          {batch.pl_stage}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {batch.origin_laboratory} • <strong>{batch.pond_name}</strong>
                      </div>
                    </div>

                    <span className="badge badge-aqua">
                      Classe {batch.commercial_class}
                    </span>
                  </div>

                  {/* Progress bar towards harvest weight */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Peso Atual: <strong style={{ color: 'var(--aqua-300)' }}>{batch.current_avg_weight_g} g</strong>
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Meta: <strong style={{ color: '#ffffff' }}>{batch.target_harvest_weight_g} g</strong> ({progress}%)
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--aqua-500), var(--emerald-400))',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease',
                      }} />
                    </div>
                  </div>

                  {/* Quick stats row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '6px',
                    background: 'rgba(7, 18, 30, 0.5)',
                    padding: '10px 8px',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Dias Cultivo</span>
                      <strong style={{ color: '#ffffff' }}>{batch.days_of_culture} d</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>População</span>
                      <strong style={{ color: '#ffffff' }}>{((batch.current_shrimp_count || 0) / 1000).toFixed(0)}k</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Sobrevivência</span>
                      <strong style={{ color: 'var(--emerald-400)' }}>{batch.survival_rate_percent}%</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>CAA / FCR</span>
                      <strong style={{ color: 'var(--purple-400)' }}>{batch.feed_conversion_ratio} : 1</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Batch Details & Biometry Logs Table */}
          {selectedBatch ? (
            <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '2px' }}>
                    Biometrias do Lote: {selectedBatch.batch_code}
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Amostragem em tarrafa com controle de intestino cheio e fase de ecdise (muda)
                  </span>
                </div>

                <button
                  onClick={() => {
                    setBiometryForm(prev => ({ ...prev, batch_id: selectedBatch.id }));
                    setIsBiometryModalOpen(true);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={16} />
                  <span>+ Registrar Amostra</span>
                </button>
              </div>

              {batchBiometries.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px' }}>Data</th>
                        <th style={{ padding: '10px' }}>Amostra (un)</th>
                        <th style={{ padding: '10px' }}>Peso Médio</th>
                        <th style={{ padding: '10px' }}>Ganho Semanal</th>
                        <th style={{ padding: '10px' }}>Intestino</th>
                        <th style={{ padding: '10px' }}>Fase Muda</th>
                        <th style={{ padding: '10px' }}>Biomassa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchBiometries.map((b) => (
                        <tr key={b.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '12px 10px', color: '#ffffff', fontWeight: 600 }}>
                            {new Date(b.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                            {b.sample_count} camarões
                          </td>
                          <td style={{ padding: '12px 10px', color: 'var(--aqua-400)', fontWeight: 700 }}>
                            {b.avg_weight_g} g
                          </td>
                          <td style={{ padding: '12px 10px', color: 'var(--emerald-400)', fontWeight: 600 }}>
                            +{b.weekly_growth_gain_g} g/sem
                          </td>
                          <td style={{ padding: '12px 10px', color: 'var(--text-primary)' }}>
                            {b.gut_fullness_percent}% cheio
                          </td>
                          <td style={{ padding: '12px 10px' }}>
                            <span className={`badge badge-${b.molt_stage === 'POS_MUDA' ? 'atencao' : 'ideal'}`}>
                              {b.molt_stage}
                            </span>
                          </td>
                          <td style={{ padding: '12px 10px', color: '#ffffff' }}>
                            {b.estimated_biomass_kg?.toLocaleString('pt-BR')} kg
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{
                  padding: '30px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  background: 'rgba(7, 18, 30, 0.4)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  Nenhuma amostragem biométrica registrada ainda para este lote.
                </div>
              )}

              {/* Calculations Explanation Callout */}
              <div style={{
                background: 'rgba(15, 30, 48, 0.7)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}>
                <strong style={{ color: 'var(--aqua-300)' }}>Conversão Alimentar Aparente (CAA) do Camarão:</strong>
                <div>
                  CAA = Ração Consumida ({(selectedBatch.accumulated_feed_kg || 0).toLocaleString('pt-BR')} kg) / Ganho de Biomassa ({(selectedBatch.current_biomass_kg || 0).toLocaleString('pt-BR')} kg) = <strong style={{ color: 'var(--purple-400)' }}>{selectedBatch.feed_conversion_ratio} : 1</strong>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  * Na carcinicultura, uma CAA entre 1.1 e 1.3 reflete excelência de arraçoamento via bandejas e mínimo desperdício de ração no fundo.
                </span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Modal: Registrar Amostragem Biométrica */}
      {isBiometryModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBiometryModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#ffffff' }}>
              Registrar Biometria de Camarão (Tarrafada)
            </h2>

            <form onSubmit={handleRecordBiometry} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Lote de Camarão</label>
                <select
                  className="form-control"
                  value={biometryForm.batch_id}
                  onChange={e => setBiometryForm({ ...biometryForm, batch_id: Number(e.target.value) })}
                >
                  {safeBatches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.batch_code} ({b.pond_name} - {b.pl_stage})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Data da Coleta</label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={biometryForm.date}
                    onChange={e => setBiometryForm({ ...biometryForm, date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Camarões Amostrados (un)</label>
                  <input
                    type="number"
                    min="10"
                    required
                    className="form-control"
                    value={biometryForm.sample_count}
                    onChange={e => setBiometryForm({ ...biometryForm, sample_count: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Peso Médio da Amostra (g)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="Ex: 11.5"
                    className="form-control"
                    value={biometryForm.avg_weight_g || ''}
                    onChange={e => setBiometryForm({ ...biometryForm, avg_weight_g: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Uniformidade do Lote (%)</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="100"
                    className="form-control"
                    value={biometryForm.uniformity_percentage}
                    onChange={e => setBiometryForm({ ...biometryForm, uniformity_percentage: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Trato Digestivo / Intestino Cheio (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="form-control"
                    value={biometryForm.gut_fullness_percent}
                    onChange={e => setBiometryForm({ ...biometryForm, gut_fullness_percent: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estágio de Muda (Ecdise)</label>
                  <select
                    className="form-control"
                    value={biometryForm.molt_stage}
                    onChange={e => setBiometryForm({ ...biometryForm, molt_stage: e.target.value })}
                  >
                    <option value="INTERMUDA">Intermuda (Carapaça firme e dura)</option>
                    <option value="PRE_MUDA">Pré-muda (Dupla carapaça visível no urópodo)</option>
                    <option value="POS_MUDA">Pós-muda (Casca mole / recém-trocada)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Observações Sanitárias</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Ex: Brânquias limpas sem manchas pretas ou epibiontes. Boa pigmentação."
                  value={biometryForm.notes}
                  onChange={e => setBiometryForm({ ...biometryForm, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsBiometryModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Gravar Amostragem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchesView;
