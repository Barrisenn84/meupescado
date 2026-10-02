import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Package,
  Plus,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { FeedInventory, FeedingLog, FeedingTrayLog, ShrimpBatch } from '../types';
import { api } from '../services/api';

interface FeedingViewProps {
  inventory?: FeedInventory[];
  logs?: FeedingLog[];
  trays?: FeedingTrayLog[];
  batches?: ShrimpBatch[];
  onRefresh: () => void;
  onNavigateTab: (tab: string) => void;
}

export const FeedingView: React.FC<FeedingViewProps> = ({
  inventory = [],
  logs = [],
  trays = [],
  batches = [],
  onRefresh,
  onNavigateTab,
}) => {
  const safeInventory = Array.isArray(inventory) ? inventory : [];
  const safeLogs = Array.isArray(logs) ? logs : [];
  const safeTrays = Array.isArray(trays) ? trays : [];
  const safeBatches = Array.isArray(batches) ? batches : [];

  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
  const [isTrayModalOpen, setIsTrayModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

  const [feedForm, setFeedForm] = useState({
    batch_id: safeBatches.length > 0 ? safeBatches[0].id : 0,
    feed_inventory_id: safeInventory.length > 0 ? safeInventory[0].id : 0,
    date: new Date().toISOString().split('T')[0],
    trato_number: 1,
    time_of_day: '07:00',
    amount_kg: 45,
    water_temp_c: 28.5,
    dissolved_oxygen_mg_l: 5.4,
    notes: '',
  });

  const [trayForm, setTrayForm] = useState({
    batch_id: safeBatches.length > 0 ? safeBatches[0].id : 0,
    date: new Date().toISOString().split('T')[0],
    check_time: '09:15',
    trays_inspected_count: 12,
    tray_status: 'LIMPO',
    leftover_percentage: 0,
  });

  const [inventoryForm, setInventoryForm] = useState({
    brand: '',
    name: '',
    category: 'ENGORDA',
    protein_percent: 35.0,
    pellet_size_mm: 1.6,
    current_stock_kg: 1000,
    min_stock_alert_kg: 300,
    cost_per_kg: 6.20,
  });

  // Automatically sync initial IDs when batches or inventory load
  useEffect(() => {
    if (safeBatches.length > 0) {
      setFeedForm(prev => (prev.batch_id === 0 ? { ...prev, batch_id: safeBatches[0].id } : prev));
      setTrayForm(prev => (prev.batch_id === 0 ? { ...prev, batch_id: safeBatches[0].id } : prev));
    }
  }, [safeBatches]);

  useEffect(() => {
    if (safeInventory.length > 0) {
      setFeedForm(prev => (prev.feed_inventory_id === 0 ? { ...prev, feed_inventory_id: safeInventory[0].id } : prev));
    }
  }, [safeInventory]);

  const handleRecordFeeding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedForm.batch_id || feedForm.batch_id === 0) {
      alert('Selecione um lote de camarão válido antes de lançar o trato.');
      return;
    }
    if (!feedForm.feed_inventory_id || feedForm.feed_inventory_id === 0) {
      alert('Selecione o tipo de ração do estoque.');
      return;
    }

    try {
      await api.recordFeeding(feedForm);
      setIsFeedModalOpen(false);
      onRefresh();
    } catch (err: any) {
      console.error('Erro ao registrar trato:', err);
      alert('Erro ao registrar trato: ' + (err?.message || err));
    }
  };

  const handleRecordTray = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trayForm.batch_id || trayForm.batch_id === 0) {
      alert('Selecione um lote de camarão antes de registrar a checagem das bandejas.');
      return;
    }

    try {
      await api.recordFeedingTray({
        ...trayForm,
        adjustment_suggested_pct: 0,
      });
      setIsTrayModalOpen(false);
      onRefresh();
    } catch (err: any) {
      console.error('Erro ao registrar comedouro:', err);
      alert('Erro ao registrar comedouro: ' + (err?.message || err));
    }
  };

  const handleCreateInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createFeedItem(inventoryForm);
      setIsInventoryModalOpen(false);
      onRefresh();
    } catch (err: any) {
      console.error('Erro ao cadastrar ração:', err);
      alert('Erro ao cadastrar ração: ' + (err?.message || err));
    }
  };

  const totalStockKg = safeInventory.reduce((acc, curr) => acc + (curr.current_stock_kg || 0), 0);

  // Helper for tray AI preview in form
  const getTrayDiagnosis = (pct: number) => {
    if (pct === 0) {
      return {
        status: 'LIMPO',
        text: 'Bandeja limpa: Camarão com apetite alto. Sugestão IA: Aumentar +8% a +10% no próximo trato.',
        color: 'var(--emerald-400)',
      };
    } else if (pct <= 5) {
      return {
        status: 'POUCA_SOBRA',
        text: 'Pouca sobra (<5%): Arraçoamento adequado. Sugestão IA: Manter quantidade programada.',
        color: 'var(--aqua-400)',
      };
    } else if (pct <= 20) {
      return {
        status: 'SOBRA_MEDIA',
        text: `Sobra moderada (${pct}%): Sugestão IA: Reduzir 15% para evitar deterioração do fundo.`,
        color: 'var(--amber-400)',
      };
    } else {
      return {
        status: 'SOBRA_ALTA',
        text: `Sobra excessiva (${pct}%): Alerta crítico! Sugestão IA: Cortar 50% ou suspender trato e medir OD.`,
        color: 'var(--rose-400)',
      };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner and Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UtensilsCrossed size={24} color="#fbbf24" />
            Manejo Alimentar & Comedouros Testemunha (Bandejas)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Controle de sobras nas bandejas, múltiplos turnos de arraçoamento e ajuste fino por IA
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onNavigateTab('ai')}
            className="btn btn-secondary"
            style={{ border: '1px solid rgba(168, 85, 247, 0.4)', color: '#c084fc' }}
          >
            <Sparkles size={18} />
            <span>Otimizador IA de Trato</span>
          </button>

          <button
            onClick={() => setIsTrayModalOpen(true)}
            className="btn btn-secondary"
          >
            <span>+ Checar Bandejas</span>
          </button>

          <button
            onClick={() => setIsFeedModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus size={18} />
            <span>Lançar Trato</span>
          </button>
        </div>
      </div>

      {/* Feeding Trays Inspection Section */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#ffffff' }}>
              Últimas Leituras de Bandejas / Comedouros (Check Trays)
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Avaliadas ~2h após a aplicação da ração para balizamento do próximo trato
            </span>
          </div>

          <button
            onClick={() => setIsTrayModalOpen(true)}
            className="btn btn-secondary btn-sm"
          >
            + Registrar Checagem
          </button>
        </div>

        {safeTrays.length === 0 ? (
          <div style={{
            padding: '30px',
            textAlign: 'center',
            background: 'rgba(7, 18, 30, 0.4)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-card)',
            color: 'var(--text-secondary)',
          }}>
            <p style={{ marginBottom: '10px', fontSize: '0.9rem' }}>Nenhuma checagem de bandeja registrada recentemente.</p>
            <button
              onClick={() => setIsTrayModalOpen(true)}
              className="btn btn-primary btn-sm"
            >
              Registrar Primeira Checagem
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '14px',
          }}>
            {safeTrays.slice(0, 4).map((t) => {
              const isClean = t.tray_status === 'LIMPO';
              const isModerate = t.tray_status === 'SOBRA_MEDIA';
              const isHigh = t.tray_status === 'SOBRA_ALTA';
              return (
                <div
                  key={t.id}
                  style={{
                    background: 'rgba(7, 18, 30, 0.65)',
                    border: `1px solid ${isClean ? 'rgba(16, 185, 129, 0.35)' : isModerate ? 'rgba(245, 158, 11, 0.35)' : isHigh ? 'rgba(244, 63, 94, 0.4)' : 'rgba(56, 189, 248, 0.35)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: '#ffffff', fontSize: '0.92rem' }}>
                      {t.pond_name || t.batch_code || `Lote #${t.batch_id}`}
                    </strong>
                    <span className={`badge badge-${isClean ? 'ideal' : isModerate ? 'atencao' : isHigh ? 'critico' : 'aqua'}`}>
                      {t.tray_status} ({t.leftover_percentage}% sobra)
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {t.trays_inspected_count} bandejas inspecionadas às {t.check_time} ({t.date})
                  </div>

                  <div style={{
                    background: 'rgba(15, 30, 48, 0.8)',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    color: 'var(--aqua-300)',
                  }}>
                    🤖 <strong>Recomendação IA:</strong> {t.ai_recommendation || 'Manter programação habitual.'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Feed Inventory Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#ffffff' }}>
            Estoque de Rações de Camarão (Saldo Total: {(totalStockKg / 1000).toFixed(2)} ton)
          </h3>
          <button onClick={() => setIsInventoryModalOpen(true)} className="btn btn-secondary btn-sm">
            <Package size={16} /> + Cadastrar Ração
          </button>
        </div>

        {safeInventory.length === 0 ? (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            background: 'rgba(15, 30, 48, 0.4)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-card)',
            color: 'var(--text-secondary)',
          }}>
            Nenhum tipo de ração cadastrado. Clique no botão acima para adicionar.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
          }}>
            {safeInventory.map((item) => {
              const isLow = item.current_stock_kg <= item.min_stock_alert_kg;
              return (
                <div
                  key={item.id}
                  className="glass-card"
                  style={{
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    borderLeft: isLow ? '4px solid var(--amber-500)' : '4px solid var(--emerald-500)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {item.brand} • {item.category}
                      </span>
                      <h4 style={{ fontSize: '0.95rem', color: '#ffffff', marginTop: '2px' }}>
                        {item.name}
                      </h4>
                    </div>
                    {isLow ? (
                      <span className="badge badge-atencao" title="Abaixo do estoque mínimo">
                        <AlertTriangle size={12} /> Repor
                      </span>
                    ) : (
                      <span className="badge badge-ideal">Estoque OK</span>
                    )}
                  </div>

                  <div style={{
                    background: 'rgba(7, 18, 30, 0.5)',
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    fontSize: '0.8rem',
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Proteína Bruta</span>
                      <strong style={{ color: 'var(--aqua-300)' }}>{item.protein_percent}% PB</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Granulometria</span>
                      <strong style={{ color: '#ffffff' }}>{item.pellet_size_mm} mm</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Saldo Atual</span>
                      <strong style={{ color: isLow ? 'var(--amber-400)' : 'var(--emerald-400)', fontSize: '0.92rem' }}>
                        {item.current_stock_kg.toLocaleString('pt-BR')} kg
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Preço de Custo</span>
                      <strong style={{ color: '#ffffff' }}>R$ {item.cost_per_kg.toFixed(2)}/kg</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Feeding Logs Table */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '14px' }}>
          Histórico Recente de Tratos Realizados
        </h3>

        {safeLogs.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Nenhum trato registrado até o momento.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px' }}>Data & Horário</th>
                  <th style={{ padding: '10px' }}>Trato</th>
                  <th style={{ padding: '10px' }}>Viveiro / Lote</th>
                  <th style={{ padding: '10px' }}>Ração Utilizada</th>
                  <th style={{ padding: '10px' }}>Qtd (kg)</th>
                  <th style={{ padding: '10px' }}>Temp (°C)</th>
                  <th style={{ padding: '10px' }}>OD Fundo</th>
                </tr>
              </thead>
              <tbody>
                {safeLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 10px', color: '#ffffff', fontWeight: 600 }}>
                      {new Date(log.date).toLocaleDateString('pt-BR')} às {log.time_of_day}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span className="badge badge-aqua" style={{ fontSize: '0.7rem' }}>
                        Trato {log.trato_number}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-primary)' }}>
                      <strong>{log.pond_name || `Viveiro #${log.batch_id}`}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.batch_code}</div>
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                      {log.feed_name || 'Ração Padrão'}
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--aqua-400)', fontWeight: 700 }}>
                      {log.amount_kg} kg
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                      {log.water_temp_c}°C
                    </td>
                    <td style={{ padding: '12px 10px', color: log.dissolved_oxygen_mg_l < 3.5 ? 'var(--rose-400)' : 'var(--emerald-400)', fontWeight: 600 }}>
                      {log.dissolved_oxygen_mg_l} mg/L
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Lançar Trato */}
      {isFeedModalOpen && (
        <div className="modal-overlay" onClick={() => setIsFeedModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#ffffff' }}>
              Registrar Trato de Camarão
            </h2>

            {safeBatches.length === 0 ? (
              <div style={{ color: 'var(--amber-400)', padding: '14px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)' }}>
                Nenhum lote ativo encontrado. Cadastre um lote de camarão primeiro no módulo "Lotes & Pós-Larvas".
              </div>
            ) : safeInventory.length === 0 ? (
              <div style={{ color: 'var(--amber-400)', padding: '14px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)' }}>
                Nenhuma ração cadastrada no estoque. Cadastre a ração primeiro usando o botão "+ Cadastrar Ração".
              </div>
            ) : (
              <form onSubmit={handleRecordFeeding} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Lote / Viveiro</label>
                  <select
                    className="form-control"
                    value={feedForm.batch_id}
                    onChange={e => setFeedForm({ ...feedForm, batch_id: Number(e.target.value) })}
                  >
                    {safeBatches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.batch_code} ({b.pond_name} - {b.commercial_class})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Ração</label>
                  <select
                    className="form-control"
                    value={feedForm.feed_inventory_id}
                    onChange={e => setFeedForm({ ...feedForm, feed_inventory_id: Number(e.target.value) })}
                  >
                    {safeInventory.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.brand} - {i.name} (Saldo: {i.current_stock_kg} kg)
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
                      value={feedForm.date}
                      onChange={e => setFeedForm({ ...feedForm, date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Turno / Horário</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={feedForm.time_of_day}
                      onChange={e => setFeedForm({ ...feedForm, time_of_day: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Quantidade (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      required
                      className="form-control"
                      value={feedForm.amount_kg}
                      onChange={e => setFeedForm({ ...feedForm, amount_kg: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={feedForm.water_temp_c}
                      onChange={e => setFeedForm({ ...feedForm, water_temp_c: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">OD Fundo (mg/L)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      value={feedForm.dissolved_oxygen_mg_l}
                      onChange={e => setFeedForm({ ...feedForm, dissolved_oxygen_mg_l: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsFeedModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Gravar Trato
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Inspecionar Bandejas */}
      {isTrayModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTrayModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#ffffff' }}>
              Registrar Checagem de Bandejas (Comedouros)
            </h2>

            {safeBatches.length === 0 ? (
              <div style={{ color: 'var(--amber-400)', padding: '14px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)' }}>
                Nenhum lote ativo encontrado para vincular à inspeção das bandejas.
              </div>
            ) : (
              <form onSubmit={handleRecordTray} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Lote / Viveiro</label>
                  <select
                    className="form-control"
                    value={trayForm.batch_id}
                    onChange={e => setTrayForm({ ...trayForm, batch_id: Number(e.target.value) })}
                  >
                    {safeBatches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.batch_code} ({b.pond_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Horário da Checagem</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 09:30"
                      className="form-control"
                      value={trayForm.check_time}
                      onChange={e => setTrayForm({ ...trayForm, check_time: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bandejas Inspecionadas</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={trayForm.trays_inspected_count}
                      onChange={e => setTrayForm({ ...trayForm, trays_inspected_count: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">
                      Sobra Média nas Bandejas (% de ração não consumida):
                    </label>
                    <strong style={{ color: getTrayDiagnosis(trayForm.leftover_percentage).color, fontSize: '1rem' }}>
                      {trayForm.leftover_percentage}%
                    </strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="2"
                    style={{ width: '100%', marginTop: '6px' }}
                    value={trayForm.leftover_percentage}
                    onChange={e => {
                      const pct = Number(e.target.value);
                      const diag = getTrayDiagnosis(pct);
                      setTrayForm({ ...trayForm, leftover_percentage: pct, tray_status: diag.status });
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>0% (Limpo)</span>
                    <span>4% (Pouca sobra)</span>
                    <span>15% (Sobra média)</span>
                    <span>30%+ (Excessiva)</span>
                  </div>
                </div>

                {/* AI Instant Feedback Callout */}
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(15, 30, 48, 0.85)',
                  border: `1px solid ${getTrayDiagnosis(trayForm.leftover_percentage).color}`,
                  fontSize: '0.8rem',
                  color: '#ffffff',
                }}>
                  🤖 <strong>Diagnóstico ShrimpAI:</strong> {getTrayDiagnosis(trayForm.leftover_percentage).text}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsTrayModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Gravar Leitura de Bandeja
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Cadastrar Ração */}
      {isInventoryModalOpen && (
        <div className="modal-overlay" onClick={() => setIsInventoryModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#ffffff' }}>
              Cadastrar Ração de Camarão
            </h2>

            <form onSubmit={handleCreateInventory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Fabricante / Marca</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Guabi, Presence, etc."
                    className="form-control"
                    value={inventoryForm.brand}
                    onChange={e => setInventoryForm({ ...inventoryForm, brand: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nome da Ração</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Potimirim PL 40%"
                    className="form-control"
                    value={inventoryForm.name}
                    onChange={e => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Proteína (% PB)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-control"
                    value={inventoryForm.protein_percent}
                    onChange={e => setInventoryForm({ ...inventoryForm, protein_percent: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pellet (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={inventoryForm.pellet_size_mm}
                    onChange={e => setInventoryForm({ ...inventoryForm, pellet_size_mm: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estoque (kg)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={inventoryForm.current_stock_kg}
                    onChange={e => setInventoryForm({ ...inventoryForm, current_stock_kg: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsInventoryModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Ração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedingView;
