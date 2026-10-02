import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Activity,
  AlertTriangle,
  Scale,
  Droplets,
  Calendar,
  ChevronRight,
  TrendingUp,
  Bot,
  CloudRain,
  Wind,
  Moon,
  Sun,
  Cloud,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DashboardSummary, Pond, ShrimpBatch, WaterQualityLog } from '../types';

interface DashboardViewProps {
  summary: DashboardSummary | null;
  ponds: Pond[];
  batches: ShrimpBatch[];
  waterLogs: WaterQualityLog[];
  onSelectPond: (pondId: number) => void;
  onNavigateTab: (tab: string) => void;
  onQuickAction: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  ponds,
  onSelectPond,
  onNavigateTab,
}) => {
  const [isWeatherExpanded, setIsWeatherExpanded] = useState(true);

  if (!summary) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Carregando telemetria dos viveiros de camarão...
      </div>
    );
  }

  const criticalWaterPonds = ponds.filter((p) => p.last_water_status === 'CRITICO');
  const weather = summary.weather_info;
  const lunar = summary.lunar_info;
  const aiAdvisory = summary.ai_advisory;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* =================================================================== */}
      {/* 1. CLIMA & FASES DA LUA (WIDGET COMPLETO REPLICANDO SCREENSHOT 4/5 + IA 10x) */}
      {/* =================================================================== */}
      {weather && lunar && (
        <div
          className="glass-card"
          style={{
            background: 'linear-gradient(135deg, rgba(7, 24, 44, 0.95), rgba(15, 30, 52, 0.9))',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Header of Weather & Moon Widget */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'linear-gradient(135deg, #0284c7, #38bdf8)', padding: '10px', borderRadius: 'var(--radius-md)', color: '#ffffff' }}>
                <CloudRain size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                    {weather.location}
                  </h3>
                  <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontSize: '0.72rem' }}>
                    Radar Aquícola
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Atualizado às {weather.updated_at} • {weather.condition} • Máx de {weather.max_temp_c}°C
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setIsWeatherExpanded(!isWeatherExpanded)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>{isWeatherExpanded ? 'RECOLHER' : 'EXPANDIR'}</span>
                {isWeatherExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
            </div>
          </div>

          {isWeatherExpanded && (
            <>
              {/* Moon Phases Row (Identical to Screenshot 4/5) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  marginBottom: '18px',
                }}
              >
                {/* Today's Moon Phase Highlight */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(7, 20, 34, 0.6))',
                    border: '1px solid rgba(234, 179, 8, 0.35)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div style={{ fontSize: '2rem' }}>🌘</div>
                  <div>
                    <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--amber-400)', fontWeight: 700 }}>
                      FASE DE HOJE
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                      {lunar.today_phase}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {lunar.today_illumination_pct}% iluminada
                    </div>
                  </div>
                </div>

                {/* Upcoming 4 Phases */}
                {lunar.upcoming_phases.map((up) => (
                  <div
                    key={up.name}
                    style={{
                      background: 'rgba(7, 20, 34, 0.5)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
                      {up.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      {up.date}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="pulse-dot ideal" style={{ width: 6, height: 6 }} />
                      {up.tag}
                    </div>
                  </div>
                ))}
              </div>

              {/* Weather Stats Bar (Wind, Rain Today, Rain Peak) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '14px',
                  padding: '12px 16px',
                  background: 'rgba(7, 18, 30, 0.5)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    VENTO
                  </span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Wind size={16} color="#38bdf8" />
                    {weather.wind_speed_kmh} km/h
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    CHUVA HOJE
                  </span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CloudRain size={16} />
                    {weather.rain_today_mm} mm
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    MAIOR CHANCE
                  </span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f59e0b' }}>
                    {weather.rain_chance_peak}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    TEMPERATURA
                  </span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                    {weather.current_temp_c}°C ({weather.min_temp_c}° - {weather.max_temp_c}°)
                  </div>
                </div>
              </div>

              {/* 6-Day Meteorological Forecast */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: '8px',
                  textAlign: 'center',
                  marginBottom: '14px',
                }}
              >
                {weather.forecast_6days.map((fc) => (
                  <div
                    key={fc.day}
                    style={{
                      background: 'rgba(7, 20, 34, 0.4)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 6px',
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>
                      {fc.day}
                    </div>
                    <div style={{ fontSize: '1.25rem', margin: '4px 0' }}>🌧️</div>
                    <div style={{ fontSize: '0.78rem', color: '#ffffff', fontWeight: 600 }}>
                      {fc.max_c}° <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{fc.min_c}°</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--aqua-400)', marginTop: '2px' }}>
                      {fc.rain_mm} mm
                    </div>
                  </div>
                ))}
              </div>

              {/* 10x AI PREDITIVE AQUACULTURE ADVISORY */}
              {aiAdvisory && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(14, 165, 233, 0.12))',
                    border: '1px solid rgba(168, 85, 247, 0.35)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc', fontWeight: 700, fontSize: '0.85rem' }}>
                    <Sparkles size={16} />
                    <span>Diagnóstico Preditivo ShrimpAI: Impacto Lunar & Clima na Fazenda</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>
                    {aiAdvisory.lunar_recommendation}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#93c5fd' }}>
                    🌊 <strong>Aeração & Clima:</strong> {aiAdvisory.weather_recommendation}
                  </div>
                </div>
              )}

              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '10px', textAlign: 'center' }}>
                {weather.disclaimer}
              </div>
            </>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. OS 8 CARDS DE TOTAIS DA FAZENDA (EXATAMENTE COMO NO SCREENSHOT 4/5) */}
      {/* =================================================================== */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={22} color="#38bdf8" />
              Totais Gerais em Cultivo & Resultados
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Balanço consolidado de custo operacional, faturamento e biomassa ativa
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', fontSize: '0.8rem', padding: '6px 12px' }}>
              ROI Projetado: {summary.expected_margin_percent?.toFixed(1) || '63.0'}%
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '14px',
          }}
        >
          {/* Card 1: Tanques Povoados */}
          <div
            className="glass-card"
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(7, 24, 44, 0.8), rgba(15, 30, 48, 0.6))',
              borderLeft: '4px solid #38bdf8',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tanques Povoados
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', margin: '6px 0 2px' }}>
              {summary.total_stocked_ponds || summary.active_ponds}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              de {summary.total_ponds} viveiros totais
            </div>
          </div>

          {/* Card 2: Custo em cultivo total */}
          <div
            className="glass-card"
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(7, 24, 44, 0.8), rgba(15, 30, 48, 0.6))',
              borderLeft: '4px solid #f43f5e',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Custo em Cultivo Total
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--rose-400)', margin: '6px 0 2px' }}>
              R$ {(summary.cultivation_cost_total_rs || 142850).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Ração + PLs + Energia + Insumos
            </div>
          </div>

          {/* Card 3: Faturamento esperado total */}
          <div
            className="glass-card"
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(7, 24, 44, 0.8), rgba(15, 30, 48, 0.6))',
              borderLeft: '4px solid #38bdf8',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Faturamento Esperado Total
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--aqua-400)', margin: '6px 0 2px' }}>
              R$ {(summary.expected_revenue_total_rs || 385600).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Comercialização nas classes 60/70 e 50/60
            </div>
          </div>

          {/* Card 4: Resultado esperado total */}
          <div
            className="glass-card"
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(7, 24, 44, 0.8), rgba(15, 30, 48, 0.6))',
              borderLeft: '4px solid #10b981',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Resultado Esperado Total
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--emerald-400)', margin: '6px 0 2px' }}>
              R$ {(summary.expected_profit_total_rs || 242750).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', fontWeight: 600 }}>
              + Lucro Líquido Projetado
            </div>
          </div>

          {/* Card 5: Biomassa total */}
          <div
            className="glass-card"
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(7, 24, 44, 0.8), rgba(15, 30, 48, 0.6))',
              borderLeft: '4px solid #38bdf8',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Biomassa Total
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: '6px 0 2px' }}>
              {summary.total_biomass_kg.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} kg
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--aqua-400)', fontWeight: 600 }}>
              {(summary.total_biomass_kg / 1000).toFixed(2)} toneladas estocadas
            </div>
          </div>

          {/* Card 6: População total */}
          <div
            className="glass-card"
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(7, 24, 44, 0.8), rgba(15, 30, 48, 0.6))',
              borderLeft: '4px solid #a855f7',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              População Total
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: '6px 0 2px' }}>
              {(summary.total_live_shrimp / 1000).toFixed(0)}k <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>un</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', fontWeight: 600 }}>
              {summary.average_survival_percent}% sobrevivência média
            </div>
          </div>

          {/* Card 7: Ração total */}
          <div
            className="glass-card"
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(7, 24, 44, 0.8), rgba(15, 30, 48, 0.6))',
              borderLeft: '4px solid #fbbf24',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ração Total Consumida
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--amber-400)', margin: '6px 0 2px' }}>
              {(summary.total_feed_consumed_cycle_kg || 18200).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} kg
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {(summary.total_feed_stock_kg / 1000).toFixed(2)} ton em estoque
            </div>
          </div>

          {/* Card 8: FCA médio em cultivo */}
          <div
            className="glass-card"
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(7, 24, 44, 0.8), rgba(15, 30, 48, 0.6))',
              borderLeft: '4px solid #a855f7',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              FCA Médio em Cultivo
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c084fc', margin: '6px 0 2px' }}>
              {summary.average_fcr.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Conversão Alimentar Padrão Ouro
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alert Banner if any pond is in critical water condition */}
      {criticalWaterPonds.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(136, 19, 55, 0.3))',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(244, 63, 94, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.25)',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--rose-400)',
              }}
            >
              <AlertTriangle size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>
                ALERTA DE ECDISE & QUALIDADE DA ÁGUA!
              </div>
              <div style={{ fontSize: '0.85rem', color: '#fecdd3' }}>
                {criticalWaterPonds.map((p) => `${p.name} (Alcalinidade: ${p.last_alkalinity_mg_l} mg/L, Salinidade: ${p.last_salinity_ppt} ppt)`).join(' • ')}
                {' — Risco de casca mole e canibalismo! Faça tamponamento com Bicarbonato de Sódio.'}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('ai')}
            className="btn btn-danger btn-sm"
            style={{ fontWeight: 700 }}
          >
            Calcular Bicarbonato IA
          </button>
        </div>
      )}

      {/* Ponds Quick Inspection Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={22} color="#38bdf8" />
              Monitoramento dos Viveiros & Berçários
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Status em tempo real de salinidade, alcalinidade, oxigênio de fundo e biomassa de camarão
            </p>
          </div>
          <button onClick={() => onNavigateTab('ponds')} className="btn btn-secondary btn-sm">
            <span>Gerenciar Viveiros</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '16px',
          }}
        >
          {ponds.map((pond) => {
            const isCritical = pond.last_water_status === 'CRITICO';
            const isWarning = pond.last_water_status === 'ATENCAO';

            return (
              <div
                key={pond.id}
                className="glass-card"
                onClick={() => onSelectPond(pond.id)}
                style={{
                  padding: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  borderLeft: isCritical
                    ? '4px solid var(--rose-500)'
                    : isWarning
                    ? '4px solid var(--amber-500)'
                    : '4px solid var(--emerald-500)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '2px' }}>
                      {pond.name}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {pond.pond_type === 'BERCARIO_PL'
                        ? 'Berçário de PLs'
                        : pond.pond_type === 'RACETRACK_BFT'
                        ? 'Racetrack Bioflocos'
                        : 'Viveiro de Engorda'}{' '}
                      • {(pond.surface_area_m2 / 10000).toFixed(1)} ha ({pond.volume_m3.toLocaleString('pt-BR')} m³)
                    </span>
                  </div>

                  <span className={`badge badge-${pond.last_water_status ? pond.last_water_status.toLowerCase() : 'ideal'}`}>
                    <span className={`pulse-dot ${pond.last_water_status ? pond.last_water_status.toLowerCase() : 'ideal'}`} />
                    {pond.last_water_status || 'IDEAL'}
                  </span>
                </div>

                {pond.active_batch_code ? (
                  <div
                    style={{
                      background: 'rgba(7, 18, 30, 0.6)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 12px',
                      fontSize: '0.82rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Lote / Estágio:</span>
                      <strong style={{ color: 'var(--aqua-300)' }}>
                        {pond.active_batch_code} ({pond.pl_stage})
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>População Viva:</span>
                      <strong style={{ color: '#ffffff' }}>
                        {(pond.current_shrimp_count || 0).toLocaleString('pt-BR')} camarões
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Biomassa / Densidade:</span>
                      <strong style={{ color: 'var(--emerald-400)' }}>
                        {pond.current_biomass_kg?.toLocaleString('pt-BR')} kg ({pond.stocking_density_pl_m2} cam/m²)
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      background: 'rgba(7, 18, 30, 0.4)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px',
                      textAlign: 'center',
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    🟡 Viveiro em Preparação (Calagem e Secagem de Fundo)
                  </div>
                )}

                {/* Carciniculture Telemetry */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '6px',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-subtle)',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>Salinidade</span>
                    <strong style={{ color: '#ffffff' }}>{pond.last_salinity_ppt ? `${pond.last_salinity_ppt} ppt` : '--'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>Alcalinidade</span>
                    <strong
                      style={{
                        color:
                          (pond.last_alkalinity_mg_l || 140) < 110
                            ? 'var(--rose-400)'
                            : (pond.last_alkalinity_mg_l || 140) < 130
                            ? 'var(--amber-400)'
                            : 'var(--emerald-400)',
                      }}
                    >
                      {pond.last_alkalinity_mg_l || '--'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>OD Fundo</span>
                    <strong
                      style={{
                        color:
                          (pond.last_do_mg_l || 5) < 3.5
                            ? 'var(--rose-400)'
                            : (pond.last_do_mg_l || 5) < 4.5
                            ? 'var(--amber-400)'
                            : 'var(--emerald-400)',
                      }}
                    >
                      {pond.last_do_mg_l ? `${pond.last_do_mg_l} mg/L` : '--'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>pH</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{pond.last_ph || '--'}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Harvest Projection Callout */}
      <div
        className="glass-card"
        style={{
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(15, 30, 48, 0.8))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #a855f7, #0284c7)',
              padding: '12px',
              borderRadius: 'var(--radius-lg)',
              color: '#ffffff',
            }}
          >
            <Calendar size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '2px' }}>
              Previsão de Despesca de Camarão (Próximos 30 dias)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Estimativa de {summary.projected_harvest_kg_next_30_days.toLocaleString('pt-BR')} kg aptos para comercialização nas classes 60/70 e 50/60.
            </p>
          </div>
        </div>

        <button onClick={() => onNavigateTab('harvest')} className="btn btn-primary">
          <TrendingUp size={18} />
          <span>Ver Programação de Despesca</span>
        </button>
      </div>
    </div>
  );
};
