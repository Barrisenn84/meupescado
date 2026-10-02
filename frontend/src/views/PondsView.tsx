import React, { useState } from 'react';
import { Plus, Wind, Layers, ShieldCheck, LayoutGrid, List, Search, ArrowUpDown, MoreHorizontal, FileSpreadsheet } from 'lucide-react';
import { Pond } from '../types';
import { api } from '../services/api';

interface PondsViewProps {
  ponds?: Pond[];
  onRefresh: () => void;
  onSelectPond: (pondId: number) => void;
  onOpenNewBatchModal: (pondId?: number) => void;
}

export const PondsView: React.FC<PondsViewProps> = ({
  ponds = [],
  onRefresh,
  onSelectPond,
  onOpenNewBatchModal,
}) => {
  const safePonds = Array.isArray(ponds) ? ponds : [];
  const [filterType, setFilterType] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    pond_type: 'ENGORDA',
    surface_area_m2: 10000,
    average_depth_m: 1.3,
    volume_m3: 13000,
    aeration_hp_total: 16.0,
    aeration_type: '4x Aeradores de Palheta 2.0cv + Injetores',
    bottom_type: 'NATURAL_ARGILA',
    status: 'VAZIO',
    notes: '',
  });

  const filteredPonds = safePonds.filter(p => {
    if (filterType !== 'ALL' && p.pond_type !== filterType) return false;
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'area') return b.surface_area_m2 - a.surface_area_m2;
    if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '');
    return a.name.localeCompare(b.name);
  });

  const handleCreatePond = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPond({
        ...formData,
        volume_m3: formData.surface_area_m2 * formData.average_depth_m,
      });
      setIsCreateModalOpen(false);
      onRefresh();
    } catch (err) {
      alert('Erro ao cadastrar viveiro: ' + err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header and Filter Controls Matching Competitor Image 2 */}
      <div
        className="glass-card"
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'rgba(15, 30, 48, 0.7)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary"
            style={{ padding: '8px 14px', fontSize: '0.86rem' }}
          >
            <Plus size={16} />
            <span>Novo tanque</span>
          </button>

          <button className="btn btn-secondary btn-icon" title="Exportar para Excel" style={{ height: '36px', width: '36px' }}>
            <FileSpreadsheet size={16} color="#34d399" />
          </button>
        </div>

        {/* Filters and search like Image 2 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            className="form-control"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={{ width: '150px', height: '36px', padding: '6px 10px', fontSize: '0.84rem' }}
          >
            <option value="ALL">Tipo Tanque (Todos)</option>
            <option value="ENGORDA">Escavado / Engorda</option>
            <option value="BERCARIO_PL">Berçário PLs</option>
            <option value="RACETRACK_BFT">Racetrack Bioflocos</option>
          </select>

          <select
            className="form-control"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ width: '150px', height: '36px', padding: '6px 10px', fontSize: '0.84rem' }}
          >
            <option value="name">Ordenar por Nome</option>
            <option value="area">Ordenar por Área (ha)</option>
            <option value="status">Ordenar por Status</option>
          </select>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Digite o tanque..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ width: '160px', height: '36px', padding: '6px 10px 6px 30px', fontSize: '0.84rem' }}
            />
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
          </div>

          {/* Table vs Grid Toggle (Image 2 right side) */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.06)', padding: '2px', borderRadius: '6px' }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? '#0284c7' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 8px',
                cursor: 'pointer',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Visualização em Lista / Tabela"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? '#0284c7' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 8px',
                cursor: 'pointer',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Visualização em Grade / Cards"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* TABLE VIEW (Competitor Image 2 style) */}
      {viewMode === 'table' && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 30, 48, 0.8)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '12px 16px' }}>Tanque</th>
                <th style={{ padding: '12px 16px' }}>Tipo</th>
                <th style={{ padding: '12px 16px' }}>Linha</th>
                <th style={{ padding: '12px 16px' }}>Área da superfície</th>
                <th style={{ padding: '12px 16px' }}>Lote atual</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Ciclo do tanque</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPonds.map((pond, idx) => {
                const areaHa = (pond.surface_area_m2 / 10000).toFixed(3);
                const isOccupied = pond.status === 'OCUPADO';
                return (
                  <tr
                    key={pond.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#ffffff' }}>
                      {pond.name}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                      {pond.bottom_type === 'GEOMEMBRANA_PEAD' ? 'Geomembrana' : 'Escavado'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>
                      {pond.pond_type === 'BERCARIO_PL' ? 'Berçário' : pond.pond_type === 'RACETRACK_BFT' ? 'Bioflocos' : 'Engorda'}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#e2e8f0' }}>
                      {areaHa} ha
                    </td>
                    <td style={{ padding: '12px 16px', color: isOccupied ? '#38bdf8' : 'var(--text-muted)' }}>
                      {pond.active_batch_code || 'S/ lotes'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#cbd5e1' }}>
                      {isOccupied ? 1 : 0}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          color: isOccupied ? '#38bdf8' : '#34d399',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                        }}
                      >
                        {isOccupied ? 'Povoado' : 'Livre'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => onSelectPond(pond.id)}
                        className="btn btn-secondary btn-icon"
                        style={{ width: '28px', height: '28px', padding: 0 }}
                        title="Ver detalhes do tanque"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid of Ponds */}
      {viewMode === 'grid' && (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px',
      }}>
        {filteredPonds.map((pond) => {
          return (
            <div key={pond.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '4px' }}>
                    {pond.name}
                  </h3>
                  <span className="badge badge-aqua">
                    {pond.pond_type === 'BERCARIO_PL' ? 'Berçário de Pós-Larvas' : pond.pond_type === 'RACETRACK_BFT' ? 'Racetrack Bioflocos' : 'Viveiro de Engorda'}
                  </span>
                </div>

                <span style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: pond.status === 'OCUPADO' ? 'rgba(16, 185, 129, 0.15)' : pond.status === 'PREPARO_CALAGEM' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                  color: pond.status === 'OCUPADO' ? 'var(--emerald-400)' : pond.status === 'PREPARO_CALAGEM' ? 'var(--amber-400)' : 'var(--text-secondary)',
                  border: `1px solid ${pond.status === 'OCUPADO' ? 'rgba(16, 185, 129, 0.3)' : pond.status === 'PREPARO_CALAGEM' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(148, 163, 184, 0.3)'}`,
                }}>
                  {pond.status}
                </span>
              </div>

              {/* Dimensional specs */}
              <div style={{
                background: 'rgba(7, 18, 30, 0.5)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                textAlign: 'center',
                fontSize: '0.8rem',
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Área de Lâmina</span>
                  <strong style={{ color: '#ffffff' }}>{(pond.surface_area_m2 / 10000).toFixed(2)} ha</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({pond.surface_area_m2} m²)</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Volume</span>
                  <strong style={{ color: '#ffffff' }}>{pond.volume_m3.toLocaleString('pt-BR')} m³</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Aeração Total</span>
                  <strong style={{ color: 'var(--aqua-300)' }}>{pond.aeration_hp_total} HP</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>mecânica</span>
                </div>
              </div>

              {/* Aeration & Bottom Type */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wind size={16} color="#38bdf8" />
                  <span>{pond.aeration_type}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} color="#34d399" />
                  <span>Fundo: <strong>{pond.bottom_type === 'GEOMEMBRANA_PEAD' ? 'Geomembrana PEAD' : 'Natural Argila'}</strong></span>
                </div>
              </div>

              {/* Active batch */}
              {pond.active_batch_code ? (
                <div style={{
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  background: 'rgba(14, 165, 233, 0.05)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '0.82rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Lote / Estágio:</span>
                    <strong style={{ color: 'var(--aqua-400)' }}>{pond.active_batch_code} ({pond.pl_stage})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Camarões Vivos:</span>
                    <strong style={{ color: '#ffffff' }}>{(pond.current_shrimp_count || 0).toLocaleString('pt-BR')} camarões</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Biomassa Atual:</span>
                    <strong style={{ color: 'var(--emerald-400)' }}>{pond.current_biomass_kg?.toLocaleString('pt-BR')} kg</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Densidade de Estocagem:</span>
                    <strong style={{ color: '#ffffff' }}>{pond.stocking_density_pl_m2} camarões/m²</strong>
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--border-card)',
                }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Viveiro sem lote ativo
                  </span>
                  <button
                    onClick={() => onOpenNewBatchModal(pond.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    + Povoar com PLs
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}

      {/* Modal: Cadastrar Viveiro */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#ffffff' }}>
              Novo Viveiro ou Berçário de Camarão
            </h2>

            <form onSubmit={handleCreatePond} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Identificação / Nome</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Viveiro 05 - Engorda"
                  className="form-control"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Tipo de Estrutura</label>
                  <select
                    className="form-control"
                    value={formData.pond_type}
                    onChange={e => setFormData({ ...formData, pond_type: e.target.value })}
                  >
                    <option value="ENGORDA">Viveiro de Engorda (Escavado)</option>
                    <option value="BERCARIO_PL">Berçário Intensivo de Pós-Larvas</option>
                    <option value="RACETRACK_BFT">Racetrack Bioflocos (BFT)</option>
                    <option value="MATURACAO">Maturacão / Larvicultura</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Revestimento de Fundo</label>
                  <select
                    className="form-control"
                    value={formData.bottom_type}
                    onChange={e => setFormData({ ...formData, bottom_type: e.target.value })}
                  >
                    <option value="NATURAL_ARGILA">Natural Argila / Solo compactado</option>
                    <option value="GEOMEMBRANA_PEAD">Geomembrana PEAD 1.0mm</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Área de Lâmina (m²)</label>
                  <input
                    type="number"
                    min="100"
                    className="form-control"
                    value={formData.surface_area_m2}
                    onChange={e => setFormData({ ...formData, surface_area_m2: Number(e.target.value) })}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {(formData.surface_area_m2 / 10000).toFixed(2)} hectare(s)
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Profundidade Média (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.8"
                    className="form-control"
                    value={formData.average_depth_m}
                    onChange={e => setFormData({ ...formData, average_depth_m: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Potência Total Aeração (HP)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    className="form-control"
                    value={formData.aeration_hp_total}
                    onChange={e => setFormData({ ...formData, aeration_hp_total: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status Inicial</label>
                  <select
                    className="form-control"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="VAZIO">Vazio</option>
                    <option value="PREPARO_CALAGEM">Preparo (Calagem e Adubação)</option>
                    <option value="OCUPADO">Ocupado</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Equipamentos de Aeração</label>
                <input
                  type="text"
                  placeholder="Ex: 4x Aeradores Palheta 2.0cv + 4x Injetores submersos"
                  className="form-control"
                  value={formData.aeration_type}
                  onChange={e => setFormData({ ...formData, aeration_type: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Viveiro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
