import React, { useState, useEffect } from 'react';
import {
  Calendar, TrendingUp, Scale, Sparkles, RefreshCw, ChevronDown, ChevronRight,
  Layers, CheckCircle2, ArrowRight, DollarSign, Filter
} from 'lucide-react';
import { api } from '../services/api';

export const HarvestForecastView: React.FC = () => {
  const [mode, setMode] = useState<'taxa' | 'gmd'>('taxa');
  const [weeklyGrowth, setWeeklyGrowth] = useState<number>(1.45);
  const [gmdDaily, setGmdDaily] = useState<number>(0.207);
  const [targetWeight, setTargetWeight] = useState<number>(15.0);
  const [selectedPond, setSelectedPond] = useState<number | undefined>(undefined);
  const [expandedPeriods, setExpandedPeriods] = useState<Record<string, boolean>>({});

  const [loading, setLoading] = useState(false);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [pondsList, setPondsList] = useState<any[]>([]);
  const [aiOptimal, setAiOptimal] = useState<any>(null);

  const fetchSimulation = async () => {
    setLoading(true);
    try {
      const data = await api.getHarvestSimulation({
        weekly_growth_g: mode === 'taxa' ? weeklyGrowth : undefined,
        gmd_g_day: mode === 'gmd' ? gmdDaily : undefined,
        target_weight_g: targetWeight,
        pond_id: selectedPond,
      });
      setSimulationData(data);

      // Auto expand first two periods
      if (data.periods && data.periods.length > 0) {
        setExpandedPeriods({
          [data.periods[0].period_label]: true,
          [data.periods[1]?.period_label || '']: true,
        });
      }

      // Calculate AI optimal
      const opt = await api.calculateOptimalHarvestAI({ target_weight_g: targetWeight, water_temp_c: 28.5 });
      setAiOptimal(opt);
    } catch (err) {
      console.error('Erro na simulação:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getPonds().then(setPondsList).catch(() => {});
    fetchSimulation();
  }, [selectedPond]);

  const togglePeriod = (label: string) => {
    setExpandedPeriods(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleModeChange = (newMode: 'taxa' | 'gmd') => {
    setMode(newMode);
    if (newMode === 'gmd') {
      setGmdDaily(Number((weeklyGrowth / 7.0).toFixed(3)));
    } else {
      setWeeklyGrowth(Number((gmdDaily * 7.0).toFixed(2)));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & Simulation Controls (Exact match to Image 4) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.45rem', color: '#fff', fontWeight: 800 }}>
            Previsão de Despesca Inteligente
          </h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Simulador de Crescimento Preditivo, Ponto de Equilíbrio e Cronograma de Colheita
          </span>
        </div>

        {/* Toggle Mode: Taxa vs GMD (Replicating Image 4 top right) */}
        <div style={{ display: 'flex', background: 'rgba(15, 30, 48, 0.9)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => handleModeChange('taxa')}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              background: mode === 'taxa' ? '#0284c7' : 'transparent',
              color: mode === 'taxa' ? '#fff' : 'var(--text-secondary)',
              fontWeight: mode === 'taxa' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Taxa
          </button>
          <button
            onClick={() => handleModeChange('gmd')}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              border: 'none',
              background: mode === 'gmd' ? '#0284c7' : 'transparent',
              color: mode === 'gmd' ? '#fff' : 'var(--text-secondary)',
              fontWeight: mode === 'gmd' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            GMD
          </button>
        </div>
      </div>

      {/* Control Bar: Inputs and Tank selector (Image 4) */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'rgba(15, 30, 48, 0.7)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Crescimento semanal Taxa / GMD */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {mode === 'taxa' ? 'Crescimento semanal:' : 'Ganho Diário (GMD):'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="number"
                step="0.05"
                value={mode === 'taxa' ? weeklyGrowth : gmdDaily}
                onChange={e => {
                  const val = Number(e.target.value);
                  if (mode === 'taxa') setWeeklyGrowth(val);
                  else setGmdDaily(val);
                }}
                className="form-control"
                style={{ width: '85px', textAlign: 'center', padding: '6px 10px', height: '36px' }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>g</span>
              <button
                onClick={fetchSimulation}
                className="btn btn-secondary btn-icon"
                style={{ height: '36px', width: '36px' }}
                title="Recalcular simulação"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          {/* Biometria Prevista */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Biometria prevista:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="number"
                step="0.5"
                value={targetWeight}
                onChange={e => setTargetWeight(Number(e.target.value))}
                className="form-control"
                style={{ width: '85px', textAlign: 'center', padding: '6px 10px', height: '36px' }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>g</span>
            </div>
          </div>
        </div>

        {/* Escolha o tanque dropdown */}
        <div style={{ minWidth: '220px' }}>
          <select
            className="form-control"
            value={selectedPond || ''}
            onChange={e => setSelectedPond(e.target.value ? Number(e.target.value) : undefined)}
            style={{ height: '38px', padding: '6px 12px' }}
          >
            <option value="">Todos os tanques</option>
            {pondsList.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Blue Banner Metrics (Replicating Image 4 top blue bar) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
        }}
      >
        <div style={{ background: '#0284c7', borderRadius: '8px', padding: '14px 16px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', opacity: 0.9, fontWeight: 600 }}>Qtde de tanques</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{simulationData?.summary_banners?.total_tanks || 0}</div>
        </div>

        <div style={{ background: '#0284c7', borderRadius: '8px', padding: '14px 16px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', opacity: 0.9, fontWeight: 600 }}>População total</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {(simulationData?.summary_banners?.total_population || 0).toLocaleString('pt-BR')} un
          </div>
        </div>

        <div style={{ background: '#0284c7', borderRadius: '8px', padding: '14px 16px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', opacity: 0.9, fontWeight: 600 }}>Biomassa atual</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {(simulationData?.summary_banners?.current_biomass_kg || 0).toLocaleString('pt-BR')} kg
          </div>
        </div>

        <div style={{ background: '#0284c7', borderRadius: '8px', padding: '14px 16px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', opacity: 0.9, fontWeight: 600 }}>Biomassa prevista</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>
            {(simulationData?.summary_banners?.predicted_biomass_kg || 0).toLocaleString('pt-BR')} kg
          </div>
        </div>
      </div>

      {/* AI Optimal Harvest Recommendation Banner */}
      {aiOptimal && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(14, 165, 233, 0.12))',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="#c084fc" />
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                Recomendação ShrimpAI: Ponto Ótimo de Despesca em {aiOptimal.optimal_harvest_day}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                {aiOptimal.ai_verdict}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.78rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
            Classe Recomendada: {aiOptimal.optimal_class}
          </span>
        </div>
      )}

      {/* Accordion Table by Periods (Exact match to Image 4) */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ background: '#0284c7', color: '#ffffff', fontWeight: 700 }}>
              <th style={{ padding: '12px 16px' }}>Período</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Biometria mínima atual</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Biometria máxima atual</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Biomassa atual</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Biomassa prevista</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Nº de tanques</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {simulationData?.periods?.map((period: any, idx: number) => {
              const isExpanded = !!expandedPeriods[period.period_label];
              return (
                <React.Fragment key={period.period_label}>
                  <tr
                    onClick={() => togglePeriod(period.period_label)}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)'}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ffffff' }}>
                      {period.period_label}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', color: '#94a3b8' }}>
                      {period.min_weight_g > 0 ? `${period.min_weight_g} g` : '-'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', color: '#94a3b8' }}>
                      {period.max_weight_g > 0 ? `${period.max_weight_g} g` : '-'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, color: '#e2e8f0' }}>
                      {period.current_biomass_kg > 0 ? `${period.current_biomass_kg.toLocaleString('pt-BR')} kg` : '-'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700, color: '#38bdf8' }}>
                      {period.predicted_biomass_kg > 0 ? `${period.predicted_biomass_kg.toLocaleString('pt-BR')} kg` : '-'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700, color: '#fff' }}>
                      {period.tanks_count}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', color: '#38bdf8' }}>
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </td>
                  </tr>

                  {/* Expanded Accordion Row with Tanks Breakdown */}
                  {isExpanded && (
                    <tr style={{ background: 'rgba(7, 20, 34, 0.85)' }}>
                      <td colSpan={7} style={{ padding: '12px 20px 20px' }}>
                        <div style={{ background: 'rgba(15, 30, 48, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ padding: '8px 14px', background: 'rgba(14, 165, 233, 0.1)', fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8' }}>
                            Detalhamento por Viveiro ({period.period_label})
                          </div>
                          <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Viveiro</th>
                                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Lote</th>
                                <th style={{ padding: '8px 12px', textAlign: 'right' }}>População</th>
                                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Peso Projetado</th>
                                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Biomassa Prevista</th>
                                <th style={{ padding: '8px 12px', textAlign: 'center' }}>Classe Comercial</th>
                                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Receita Estimada</th>
                              </tr>
                            </thead>
                            <tbody>
                              {period.details_by_tank?.map((t: any) => (
                                <tr key={t.pond_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                  <td style={{ padding: '8px 12px', fontWeight: 600, color: '#fff' }}>{t.pond_name}</td>
                                  <td style={{ padding: '8px 12px', color: '#94a3b8' }}>{t.batch_code}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'right', color: '#e2e8f0' }}>{t.current_population?.toLocaleString('pt-BR')}</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#38bdf8' }}>{t.projected_weight_in_period_g}g</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#34d399' }}>{t.period_biomass_kg?.toLocaleString('pt-BR')} kg</td>
                                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                    <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem' }}>
                                      {t.recommended_commercial_class}
                                    </span>
                                  </td>
                                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 800, color: '#34d399' }}>
                                    R$ {t.estimated_revenue_rs?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
