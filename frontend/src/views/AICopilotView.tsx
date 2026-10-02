import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  Scale,
  Droplets,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { Pond, ShrimpBatch, AIChatResponse, AIIonicBalanceResponse, AIFeedingAdjustmentResponse, AIGrowthForecastResponse } from '../types';
import { api } from '../services/api';

interface AICopilotViewProps {
  ponds?: Pond[];
  batches?: ShrimpBatch[];
  onNavigateTab?: (tab: string) => void;
}

export const AICopilotView: React.FC<AICopilotViewProps> = ({
  ponds = [],
  batches = [],
  onNavigateTab,
}) => {
  const safePonds = Array.isArray(ponds) ? ponds : [];
  const safeBatches = Array.isArray(batches) ? batches : [];

  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'ionic' | 'feeding' | 'growth'>('chat');

  // 1. Chat State
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string; recs?: string[]; actions?: Array<{ label: string; action: string }> }>>([
    {
      sender: 'ai',
      text: 'Olá! Sou o **ShrimpAI Copilot**, seu assistente especialista em Carcinicultura e Pós-Larvas (*Litopenaeus vannamei*). Estou conectado em tempo real aos viveiros e comedouros da sua fazenda. Como posso te auxiliar no manejo de campo hoje?',
      recs: [
        'Atenção ao Viveiro 02: Alcalinidade em 105 mg/L requer tamponamento urgente antes da muda.',
        'Viveiro 03 (Terminação): Peso médio em 13.6g, pronto para programação de despesca.',
      ],
      actions: [
        { label: 'Calcular Bicarbonato IA', action: 'calc_ionic' },
        { label: 'Otimizar Bandejas de Trato', action: 'calc_feeding' },
      ],
    },
  ]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || chatLoading) return;

    setChatHistory(prev => [...prev, { sender: 'user', text: textToSend }]);
    setInputMessage('');
    setChatLoading(true);

    try {
      const response: AIChatResponse = await api.askAICopilot(textToSend);
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: response.answer,
          recs: response.recommendations || [],
          actions: response.suggested_actions || [],
        },
      ]);
    } catch (err) {
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'Desculpe, ocorreu uma instabilidade na consulta ao motor de IA. Verifique se o servidor FastAPI está online.',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // 2. Ionic Balance State
  const [ionicPondId, setIonicPondId] = useState<number>(safePonds.length > 0 ? safePonds[0].id : 0);
  const [ionicVolume, setIonicVolume] = useState<number>(15000);
  const [ionicSalinity, setIonicSalinity] = useState<number>(15.0);
  const [ionicAlk, setIonicAlk] = useState<number>(105.0);
  const [ionicCa, setIonicCa] = useState<number>(95.0);
  const [ionicMg, setIonicMg] = useState<number>(260.0);
  const [ionicResult, setIonicResult] = useState<AIIonicBalanceResponse | null>(null);
  const [ionicLoading, setIonicLoading] = useState(false);

  // Sync pond selection when safePonds load
  useEffect(() => {
    if (safePonds.length > 0 && ionicPondId === 0) {
      setIonicPondId(safePonds[0].id);
      if (safePonds[0].volume_m3) {
        setIonicVolume(safePonds[0].volume_m3);
      }
    }
  }, [safePonds, ionicPondId]);

  const handleCalculateIonic = async () => {
    setIonicLoading(true);
    try {
      const res = await api.calculateIonicBalanceAI({
        pond_id: ionicPondId || (safePonds.length > 0 ? safePonds[0].id : 1),
        pond_volume_m3: ionicVolume,
        current_salinity_ppt: ionicSalinity,
        current_alkalinity_mg_l: ionicAlk,
        current_calcium_mg_l: ionicCa,
        current_magnesium_mg_l: ionicMg,
      });
      setIonicResult(res);
    } catch (err: any) {
      alert('Erro no cálculo iônico IA: ' + (err?.message || err));
    } finally {
      setIonicLoading(false);
    }
  };

  // 3. Feeding Optimizer State
  const [feedBatchId, setFeedBatchId] = useState<number>(safeBatches.length > 0 ? safeBatches[0].id : 0);
  const [feedBiomass, setFeedBiomass] = useState<number>(3800);
  const [feedTemp, setFeedTemp] = useState<number>(29.0);
  const [feedDO, setFeedDO] = useState<number>(5.2);
  const [feedLeftover, setFeedLeftover] = useState<number>(0);
  const [feedCurrentTrato, setFeedCurrentTrato] = useState<number>(50);
  const [feedResult, setFeedResult] = useState<AIFeedingAdjustmentResponse | null>(null);
  const [feedLoading, setFeedLoading] = useState(false);

  useEffect(() => {
    if (safeBatches.length > 0 && feedBatchId === 0) {
      setFeedBatchId(safeBatches[0].id);
      if (safeBatches[0].current_biomass_kg) {
        setFeedBiomass(safeBatches[0].current_biomass_kg);
      }
    }
  }, [safeBatches, feedBatchId]);

  const handleOptimizeFeeding = async () => {
    setFeedLoading(true);
    try {
      const res = await api.optimizeFeedingAI({
        batch_id: feedBatchId || (safeBatches.length > 0 ? safeBatches[0].id : 1),
        current_biomass_kg: feedBiomass,
        water_temp_c: feedTemp,
        dissolved_oxygen_mg_l: feedDO,
        leftover_percentage: feedLeftover,
        current_trato_kg: feedCurrentTrato,
      });
      setFeedResult(res);
    } catch (err: any) {
      alert('Erro na otimização de trato IA: ' + (err?.message || err));
    } finally {
      setFeedLoading(false);
    }
  };

  // 4. Growth Forecast State
  const [growthBatchId, setGrowthBatchId] = useState<number>(safeBatches.length > 0 ? safeBatches[0].id : 0);
  const [growthResult, setGrowthResult] = useState<AIGrowthForecastResponse | null>(null);
  const [growthLoading, setGrowthLoading] = useState(false);

  useEffect(() => {
    if (safeBatches.length > 0 && growthBatchId === 0) {
      setGrowthBatchId(safeBatches[0].id);
    }
  }, [safeBatches, growthBatchId]);

  const handleGrowthForecast = async (overrideBatchId?: number) => {
    const idToUse = overrideBatchId || growthBatchId || (safeBatches.length > 0 ? safeBatches[0].id : 0);
    if (!idToUse) return;
    setGrowthLoading(true);
    try {
      const res = await api.getGrowthForecastAI(idToUse);
      setGrowthResult(res);
    } catch (err: any) {
      alert('Erro na projeção biométrica IA: ' + (err?.message || err));
    } finally {
      setGrowthLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* AI Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(14, 165, 233, 0.15))',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #a855f7, #0284c7)',
            padding: '14px',
            borderRadius: 'var(--radius-lg)',
            color: '#ffffff',
            boxShadow: '0 0 25px rgba(168, 85, 247, 0.4)',
          }}>
            <Bot size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.35rem', color: '#ffffff' }}>
                ShrimpAI Copilot & Suíte de Inteligência Artificial
              </h2>
              <span className="badge" style={{
                background: 'rgba(168, 85, 247, 0.2)',
                color: '#c084fc',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                fontSize: '0.7rem',
              }}>
                <Sparkles size={12} /> IA ATIVA
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Assistência agronômica em tempo real para aclimatação de PLs, ecdise/muda, bandejas de alimentação e balanço iônico
            </p>
          </div>
        </div>

        {/* Sub-tabs buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'chat', label: '💬 Chat Especialista' },
            { id: 'ionic', label: '🧪 Balanço Iônico & Ecdise' },
            { id: 'feeding', label: '🍽️ Otimizador de Bandejas' },
            { id: 'growth', label: '📈 Projeção & Despesca IA' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                if (tab.id === 'growth' && !growthResult) {
                  handleGrowthForecast();
                }
              }}
              className="btn btn-sm"
              style={{
                background: activeSubTab === tab.id ? 'linear-gradient(135deg, #a855f7, #0ea5e9)' : 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                border: activeSubTab === tab.id ? 'none' : '1px solid var(--border-subtle)',
                fontWeight: activeSubTab === tab.id ? 700 : 500,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. CHAT ESPECIALISTA */}
      {activeSubTab === 'chat' && (
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '620px' }}>
          {/* Quick preset chips */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            {[
              '🦐 Como aclimatar o lote de PL10 que chega hoje?',
              '🍽️ Bandeja com 16% de sobra, como dosar o próximo trato?',
              '🧪 Quanto de Bicarbonato aplicar no Viveiro 02?',
              '🌙 Cuidados para o período de muda na lua cheia?',
              '📊 Resumo geral da biomassa e viveiros críticos',
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.slice(3))}
                style={{
                  background: 'rgba(168, 85, 247, 0.1)',
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#c084fc'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.25)'}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(chatHistory || []).map((item, idx) => {
              const isUser = item.sender === 'user';
              return (
                <div
                  key={idx}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: isUser ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'rgba(15, 30, 48, 0.85)',
                    border: `1px solid ${isUser ? 'rgba(56, 189, 248, 0.4)' : 'rgba(168, 85, 247, 0.25)'}`,
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '14px 18px',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    {isUser ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--aqua-300)', fontWeight: 600 }}>Você (Produtor)</span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Bot size={14} /> ShrimpAI Copilot
                      </span>
                    )}
                  </div>

                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {item.text}
                  </div>

                  {item.recs && item.recs.length > 0 && (
                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <strong style={{ fontSize: '0.78rem', color: '#fbbf24' }}>💡 Recomendações do Especialista:</strong>
                      {item.recs.map((r, rIdx) => (
                        <div key={rIdx} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '6px' }}>
                          <span>•</span> <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.actions && item.actions.length > 0 && (
                    <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {item.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => {
                            if (act.action === 'calc_ionic' || act.action === 'calc_ionic_modal') setActiveSubTab('ionic');
                            else if (act.action === 'calc_feeding') setActiveSubTab('feeding');
                            else if (act.action === 'new_batch_modal' && onNavigateTab) onNavigateTab('batches');
                            else if (act.action === 'open_water_tab' && onNavigateTab) onNavigateTab('water');
                            else if (act.action === 'open_feeding_tab' && onNavigateTab) onNavigateTab('feeding');
                            else if (act.action === 'open_forecast_tab' && onNavigateTab) onNavigateTab('forecast');
                            else if (act.action === 'open_mortality_tab' && onNavigateTab) onNavigateTab('mortality');
                            else if (act.action === 'open_reports_tab' && onNavigateTab) onNavigateTab('reports');
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                        >
                          <Zap size={12} color="#c084fc" />
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {chatLoading && (
              <div style={{ alignSelf: 'flex-start', background: 'rgba(15, 30, 48, 0.85)', padding: '12px 18px', borderRadius: '16px', color: '#c084fc', fontSize: '0.85rem' }}>
                <span className="pulse-dot critico" style={{ marginRight: '8px' }} /> ShrimpAI analisando parâmetros dos viveiros...
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Pergunte ao ShrimpAI sobre aclimatação de PL, bandejas, alcalinidade, mudas..."
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={chatLoading}
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #a855f7, #0ea5e9)' }}
            >
              <Send size={18} />
              <span>Enviar</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. BALANÇO IÔNICO & CALAGEM */}
      {activeSubTab === 'ionic' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Droplets size={20} color="#38bdf8" />
              Calculadora Estequiométrica de Tamponamento
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Garante alcalinidade suficiente e relação Mg:Ca ótima (~3.1:1) para prevenir mortalidade por casca mole na ecdise.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Viveiro Selecionado</label>
                <select
                  className="form-control"
                  value={ionicPondId}
                  onChange={e => {
                    const id = Number(e.target.value);
                    setIonicPondId(id);
                    const p = safePonds.find(x => x.id === id);
                    if (p) setIonicVolume(p.volume_m3);
                  }}
                >
                  {safePonds.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.volume_m3.toLocaleString('pt-BR')} m³)</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Volume de Água (m³)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={ionicVolume}
                    onChange={e => setIonicVolume(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Salinidade Atual (ppt)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-control"
                    value={ionicSalinity}
                    onChange={e => setIonicSalinity(Number(e.target.value))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Alcalinidade (mg/L)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={ionicAlk}
                    onChange={e => setIonicAlk(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cálcio Ca²⁺ (mg/L)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={ionicCa}
                    onChange={e => setIonicCa(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Magnésio Mg²⁺ (mg/L)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={ionicMg}
                    onChange={e => setIonicMg(Number(e.target.value))}
                  />
                </div>
              </div>

              <button
                onClick={handleCalculateIonic}
                disabled={ionicLoading}
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #a855f7, #0284c7)', marginTop: '8px' }}
              >
                <Sparkles size={18} />
                <span>Calcular Correção com IA</span>
              </button>
            </div>
          </div>

          {/* Results Card */}
          <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>Prescrição Química Recomendada</h3>

            {ionicResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: ionicResult.status === 'CRITICO_MUDA' ? 'rgba(244, 63, 94, 0.18)' : 'rgba(16, 185, 129, 0.15)',
                  border: `1px solid ${ionicResult.status === 'CRITICO_MUDA' ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                  fontSize: '0.85rem',
                  color: '#ffffff',
                }}>
                  <strong>Diagnóstico: {ionicResult.status}</strong>
                  <p style={{ marginTop: '4px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {ionicResult.explanation}
                  </p>
                </div>

                {/* Dosages Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                  <div style={{ background: 'rgba(7, 18, 30, 0.6)', padding: '12px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Bicarbonato de Sódio</span>
                    <strong style={{ fontSize: '1.15rem', color: 'var(--aqua-400)' }}>
                      {ionicResult.bicarbonate_sodium_kg_needed} kg
                    </strong>
                  </div>

                  <div style={{ background: 'rgba(7, 18, 30, 0.6)', padding: '12px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Calcário / CaCO₃</span>
                    <strong style={{ fontSize: '1.15rem', color: 'var(--emerald-400)' }}>
                      {ionicResult.calcium_carbonate_kg_needed} kg
                    </strong>
                  </div>

                  <div style={{ background: 'rgba(7, 18, 30, 0.6)', padding: '12px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Cloreto de Magnésio</span>
                    <strong style={{ fontSize: '1.15rem', color: 'var(--purple-400)' }}>
                      {ionicResult.magnesium_chloride_kg_needed} kg
                    </strong>
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Relação Mg:Ca Atual: <strong>{ionicResult.current_mg_ca_ratio} : 1</strong> • Meta: <strong>{ionicResult.target_mg_ca_ratio} : 1</strong>
                </div>

                {/* Steps */}
                <div style={{ background: 'rgba(7, 18, 30, 0.5)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <strong style={{ fontSize: '0.78rem', color: 'var(--aqua-300)' }}>Passo a Passo de Aplicação Noturna:</strong>
                  {(ionicResult.step_by_step_application || []).map((st, i) => (
                    <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{st}</div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Clique em "Calcular Correção com IA" para gerar a prescrição exata de Bicarbonato e Minerais.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. OTIMIZADOR DE BANDEJAS */}
      {activeSubTab === 'feeding' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '14px' }}>
              Avaliador Inteligente de Bandejas (Comedouros)
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              A IA calcula o ajuste em quilos para o próximo trato, protegendo o fundo contra anóxia.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Lote em Cultivo</label>
                <select
                  className="form-control"
                  value={feedBatchId}
                  onChange={e => {
                    const id = Number(e.target.value);
                    setFeedBatchId(id);
                    const b = safeBatches.find(x => x.id === id);
                    if (b) setFeedBiomass(b.current_biomass_kg);
                  }}
                >
                  {safeBatches.map(b => (
                    <option key={b.id} value={b.id}>{b.batch_code} ({b.pond_name} - {b.current_biomass_kg} kg biomassa)</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Trato Atual (kg)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={feedCurrentTrato}
                    onChange={e => setFeedCurrentTrato(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Oxigênio Fundo (mg/L)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={feedDO}
                    onChange={e => setFeedDO(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Sobra Média nas Bandejas após 2h: <strong style={{ color: 'var(--aqua-400)' }}>{feedLeftover}%</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="2"
                  style={{ width: '100%' }}
                  value={feedLeftover}
                  onChange={e => setFeedLeftover(Number(e.target.value))}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>0% (Limpa)</span>
                  <span>5% (Ideal)</span>
                  <span>15% (Sobra Média)</span>
                  <span>30%+ (Excessiva)</span>
                </div>
              </div>

              <button
                onClick={handleOptimizeFeeding}
                disabled={feedLoading}
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #a855f7, #0284c7)' }}
              >
                <Sparkles size={18} />
                <span>Otimizar Trato com IA</span>
              </button>
            </div>
          </div>

          {/* Feeding Results */}
          <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>Diagnóstico de Manejo Alimentar</h3>

            {feedResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-lg)',
                  background: feedResult.adjustment_percentage < 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  border: `1px solid ${feedResult.adjustment_percentage < 0 ? 'rgba(244, 63, 94, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
                  textAlign: 'center',
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Próximo Trato Recomendado</span>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', margin: '4px 0' }}>
                    {feedResult.recommended_trato_kg} kg
                  </div>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: feedResult.adjustment_percentage < 0 ? 'var(--rose-400)' : feedResult.adjustment_percentage > 0 ? 'var(--emerald-400)' : 'var(--aqua-400)',
                  }}>
                    Ajuste: {feedResult.adjustment_percentage > 0 ? `+${feedResult.adjustment_percentage}%` : `${feedResult.adjustment_percentage}%`}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  <strong>{feedResult.tray_diagnosis}</strong>: {feedResult.explanation}
                </div>

                {(feedResult.urgent_alerts || []).length > 0 && (
                  <div style={{ background: 'rgba(244, 63, 94, 0.2)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(244, 63, 94, 0.4)' }}>
                    {feedResult.urgent_alerts.map((al, idx) => (
                      <div key={idx} style={{ fontSize: '0.8rem', color: '#fecdd3', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={14} /> {al}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Ajuste os parâmetros da bandeja e clique em "Otimizar Trato com IA".
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. PROJEÇÃO BIOMÉTRICA & DESPESCA */}
      {activeSubTab === 'growth' && (
        <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>
                Curva de Crescimento & Data Ótima de Despesca IA
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Modelo preditivo baseado em taxa de crescimento térmico de L. vannamei e classes comerciais (contagem/kg)
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                className="form-control"
                value={growthBatchId}
                onChange={e => {
                  const newId = Number(e.target.value);
                  setGrowthBatchId(newId);
                  handleGrowthForecast(newId);
                }}
              >
                {safeBatches.map(b => (
                  <option key={b.id} value={b.id}>{b.batch_code} ({b.pond_name} - {b.current_avg_weight_g}g)</option>
                ))}
              </select>

              <button
                onClick={() => handleGrowthForecast()}
                disabled={growthLoading}
                className="btn btn-primary btn-sm"
              >
                Recalcular
              </button>
            </div>
          </div>

          {growthResult && (
            <>
              {/* Target Commercial Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {[
                  { label: 'Classe 70/80 (10g)', date: growthResult.target_10g_date, color: '#38bdf8' },
                  { label: 'Classe 60/70 (12g)', date: growthResult.target_12g_date, color: '#34d399' },
                  { label: 'Classe 50/60 (15g)', date: growthResult.target_15g_date, color: '#fbbf24' },
                  { label: 'Classe 40/50 (18g)', date: growthResult.target_18g_date, color: '#c084fc' },
                ].map((item, idx) => (
                  <div key={idx} style={{ background: 'rgba(7, 18, 30, 0.6)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{item.label}</span>
                    <strong style={{ fontSize: '1.1rem', color: item.color, display: 'block', marginTop: '4px' }}>
                      {item.date}
                    </strong>
                  </div>
                ))}
              </div>

              {/* Recommendation Callout */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(14, 165, 233, 0.1))',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <Sparkles size={24} color="#c084fc" />
                <div>
                  <strong>Recomendação de Despesca da IA:</strong>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {growthResult.optimal_harvest_recommendation}
                  </p>
                </div>
              </div>

              {/* Timeline Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px' }}>Semana Futura</th>
                      <th style={{ padding: '10px' }}>Dias Cultivo (DOC)</th>
                      <th style={{ padding: '10px' }}>Peso Projetado</th>
                      <th style={{ padding: '10px' }}>Classe Comercial</th>
                      <th style={{ padding: '10px' }}>Biomassa Est.</th>
                      <th style={{ padding: '10px' }}>Faturamento Projetado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(growthResult.forecast_timeline || []).map((row) => (
                      <tr key={row.week} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px 10px', color: '#ffffff', fontWeight: 600 }}>
                          + {row.week}ª semana
                        </td>
                        <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                          {row.days_of_culture} dias
                        </td>
                        <td style={{ padding: '12px 10px', color: 'var(--aqua-400)', fontWeight: 700 }}>
                          {row.projected_weight_g} g
                        </td>
                        <td style={{ padding: '12px 10px' }}>
                          <span className="badge badge-aqua">{row.commercial_class}</span>
                        </td>
                        <td style={{ padding: '12px 10px', color: '#ffffff' }}>
                          {row.estimated_biomass_kg.toLocaleString('pt-BR')} kg
                        </td>
                        <td style={{ padding: '12px 10px', color: 'var(--emerald-400)', fontWeight: 700 }}>
                          R$ {row.estimated_value_rs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AICopilotView;
