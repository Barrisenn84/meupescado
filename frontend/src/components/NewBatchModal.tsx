import React, { useState } from 'react';
import { Pond } from '../types';
import { api } from '../services/api';

interface NewBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  ponds: Pond[];
  preSelectedPondId?: number;
  onBatchCreated: () => void;
}

export const NewBatchModal: React.FC<NewBatchModalProps> = ({
  isOpen,
  onClose,
  ponds,
  preSelectedPondId,
  onBatchCreated,
}) => {
  const [form, setForm] = useState({
    batch_code: `LOTE-${new Date().getFullYear()}-PL-0${Math.floor(Math.random() * 90) + 10}`,
    pond_id: preSelectedPondId || (ponds.length > 0 ? ponds[0].id : 0),
    species: 'Litopenaeus vannamei',
    pl_stage: 'PL10',
    origin_laboratory: 'Larvicultura Mar Azul (Touros/RN)',
    stocking_date: new Date().toISOString().split('T')[0],
    initial_pls_count: 350000,
    current_shrimp_count: 350000,
    stocking_density_pl_m2: 35.0,
    pl_stress_test_survival_pct: 97.0,
    initial_salinity_lab_ppt: 32.0,
    pond_target_salinity_ppt: 16.0,
    initial_avg_weight_g: 0.003,
    current_avg_weight_g: 0.003,
    target_harvest_weight_g: 13.0,
    target_harvest_date: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    commercial_class: '60/70',
    status: 'ATIVO',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBatch(form);
      onBatchCreated();
      onClose();
    } catch (err) {
      alert('Erro ao criar lote de camarão: ' + err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#ffffff' }}>
          Povoamento com Pós-Larvas (PLs)
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Código do Lote</label>
              <input
                type="text"
                required
                className="form-control"
                value={form.batch_code}
                onChange={e => setForm({ ...form, batch_code: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Viveiro ou Berçário de Destino</label>
              <select
                className="form-control"
                value={form.pond_id}
                onChange={e => {
                  const pid = Number(e.target.value);
                  const p = ponds.find(x => x.id === pid);
                  const area = p?.surface_area_m2 || 10000;
                  setForm({
                    ...form,
                    pond_id: pid,
                    stocking_density_pl_m2: Number((form.initial_pls_count / area).toFixed(1)),
                  });
                }}
              >
                {ponds.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({(p.surface_area_m2 / 10000).toFixed(2)} ha - {p.pond_type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Estágio da Pós-Larva</label>
              <select
                className="form-control"
                value={form.pl_stage}
                onChange={e => setForm({ ...form, pl_stage: e.target.value })}
              >
                <option value="PL8">PL8 (Berçário protegido)</option>
                <option value="PL10">PL10 (Padrão mais comercializado)</option>
                <option value="PL12">PL12 (Maior rusticidade)</option>
                <option value="PL15">PL15 (Ideal para estocagem direta)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Laboratório de Origem</label>
              <input
                type="text"
                className="form-control"
                value={form.origin_laboratory}
                onChange={e => setForm({ ...form, origin_laboratory: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Quantidade de PLs (unidades)</label>
              <input
                type="number"
                min="1000"
                step="10000"
                required
                className="form-control"
                value={form.initial_pls_count}
                onChange={e => {
                  const q = Number(e.target.value);
                  const p = ponds.find(x => x.id === form.pond_id);
                  const area = p?.surface_area_m2 || 10000;
                  setForm({
                    ...form,
                    initial_pls_count: q,
                    current_shrimp_count: q,
                    stocking_density_pl_m2: Number((q / area).toFixed(1)),
                  });
                }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--aqua-400)' }}>
                {form.initial_pls_count / 1000} milheiros • {form.stocking_density_pl_m2} PLs/m²
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Teste de Estresse da PL (% Sobrev.)</label>
              <input
                type="number"
                step="0.5"
                min="50"
                max="100"
                required
                className="form-control"
                value={form.pl_stress_test_survival_pct}
                onChange={e => setForm({ ...form, pl_stress_test_survival_pct: Number(e.target.value) })}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Sobrevivência em água doce por 30 minutos
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Salinidade da Caixa (ppt)</label>
              <input
                type="number"
                step="0.5"
                className="form-control"
                value={form.initial_salinity_lab_ppt}
                onChange={e => setForm({ ...form, initial_salinity_lab_ppt: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Salinidade do Viveiro (ppt)</label>
              <input
                type="number"
                step="0.5"
                className="form-control"
                value={form.pond_target_salinity_ppt}
                onChange={e => setForm({ ...form, pond_target_salinity_ppt: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Peso Meta de Despesca (g)</label>
              <input
                type="number"
                step="0.5"
                min="8"
                className="form-control"
                value={form.target_harvest_weight_g}
                onChange={e => setForm({ ...form, target_harvest_weight_g: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Previsão de Despesca</label>
              <input
                type="date"
                className="form-control"
                value={form.target_harvest_date}
                onChange={e => setForm({ ...form, target_harvest_date: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Iniciar Povoamento com PLs
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
