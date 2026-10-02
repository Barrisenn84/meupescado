import React, { useState, useEffect } from 'react';
import {
  FileText, BarChart3, TrendingUp, DollarSign, Scale, Calendar,
  Droplets, UtensilsCrossed, Users, PieChart, Sparkles, Download, X,
  CheckCircle, ArrowUpRight, ShieldCheck, Printer, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export const ReportsView: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dreData, setDreData] = useState<any>(null);
  const [dfcData, setDfcData] = useState<any>(null);
  const [productionData, setProductionData] = useState<any>(null);
  const [graphsData, setGraphsData] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [dre, dfc, prod, graphs] = await Promise.all([
          api.getDREReport(),
          api.getDFCReport(),
          api.getProductionReports(),
          api.getReportGraphs(),
        ]);
        setDreData(dre);
        setDfcData(dfc);
        setProductionData(prod);
        setGraphsData(graphs);
      } catch (err) {
        console.error('Erro ao carregar relatórios:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleGenerateAISummary = async () => {
    setIsAiLoading(true);
    try {
      const summary = await api.getAIExecutiveSummary();
      setAiSummary(summary);
    } catch (err) {
      alert('Erro ao gerar parecer IA: ' + err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const reportSections = [
    {
      category: 'Financeiro',
      items: [
        { id: 'dre', label: 'DRE', desc: 'Demonstrativo do Resultado do Exercício com margem líquida e EBITDA', icon: DollarSign, color: '#34d399' },
        { id: 'dfc', label: 'DFC', desc: 'Demonstrativo de Fluxo de Caixa Direto com saldos operacionais', icon: TrendingUp, color: '#38bdf8' },
      ],
    },
    {
      category: 'Produção',
      items: [
        { id: 'biometria_tanque', label: 'Biometria por tanque', desc: 'Pesagens semanais, ganho de peso e uniformidade por viveiro', icon: Scale, color: '#38bdf8' },
        { id: 'biometria_geral', label: 'Biometria geral', desc: 'Consolidado da fazenda, peso médio ponderado e desvios', icon: Scale, color: '#0ea5e9' },
        { id: 'periodo_tanque', label: 'Período por tanque', desc: 'Linha temporal do ciclo desde o povoamento até a despesca', icon: Calendar, color: '#6366f1' },
        { id: 'zootecnico', label: 'Zootécnico', desc: 'Sobrevivência, FCR/TCA, GMD g/dia, densidade e biomassa', icon: FileText, color: '#a855f7' },
        { id: 'diario_geral', label: 'Diário geral', desc: 'Livro de bordo com tratos, leituras de oxigênio e ocorrências', icon: FileText, color: '#eab308' },
        { id: 'agua', label: 'Análise de água', desc: 'Histórico de salinidade, pH, alcalinidade e relação Mg:Ca', icon: Droplets, color: '#06b6d4' },
        { id: 'racao', label: 'Controle de ração', desc: 'Consumo por calibre, sobras nas bandejas e curva de arraçoamento', icon: UtensilsCrossed, color: '#f97316' },
        { id: 'comparativa', label: 'Análise comparativa', desc: 'Benchmark interno: comparativo de rentabilidade entre viveiros', icon: BarChart3, color: '#ec4899' },
        { id: 'parceiros', label: 'Despescas por parceiros', desc: 'Histórico de entregas por frigorífico e distribuidor comprador', icon: Users, color: '#10b981' },
      ],
    },
    {
      category: 'Gráficos',
      items: [
        { id: 'grafico_producao', label: 'Produção', desc: 'Curva de evolução de biomassa e peso médio mensal', icon: BarChart3, color: '#38bdf8' },
        { id: 'grafico_fornecedores', label: 'Fornecedores', desc: 'Distribuição de compras de ração, insumos e larvas', icon: Users, color: '#f59e0b' },
        { id: 'grafico_custos', label: 'Custos de produção', desc: 'Composição percentual do custo por kg de camarão produzido', icon: PieChart, color: '#ef4444' },
        { id: 'grafico_vendas', label: 'Vendas', desc: 'Faturamento bruto por classe comercial (40/50, 50/60, etc.)', icon: DollarSign, color: '#10b981' },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.45rem', color: '#fff', fontWeight: 800 }}>
            Central de Relatórios Inteligentes
          </h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Demonstrativos Financeiros, Zootécnicos e Análise Gráfica com Inteligência Artificial
          </span>
        </div>

        <button
          onClick={handleGenerateAISummary}
          disabled={isAiLoading}
          className="btn btn-primary"
          style={{
            background: 'linear-gradient(135deg, #a855f7, #0ea5e9)',
            boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
          }}
        >
          <Sparkles size={17} />
          <span>{isAiLoading ? 'Emitindo Parecer...' : 'Diagnóstico Executivo ShrimpAI'}</span>
        </button>
      </div>

      {/* AI Summary Banner if generated */}
      {aiSummary && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(14, 165, 233, 0.12))',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={22} color="#c084fc" />
              <span style={{ fontWeight: 800, color: '#f3e8ff', fontSize: '1.05rem' }}>{aiSummary.title}</span>
            </div>
            <span style={{ fontSize: '0.78rem', background: 'rgba(16, 185, 129, 0.25)', color: '#34d399', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
              Nota de Eficiência: {aiSummary.overall_health_score}/100
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.6 }}>
            {aiSummary.executive_summary}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', marginTop: '6px' }}>
            {aiSummary.key_highlights?.map((h: string, idx: number) => (
              <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={15} color="#34d399" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3 Categories exactly as in Competitor Images 1 & 3 */}
      {reportSections.map((sec) => (
        <div key={sec.category} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#ffffff', fontWeight: 700, borderLeft: '4px solid #0ea5e9', paddingLeft: '10px' }}>
            {sec.category}
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '14px',
            }}
          >
            {sec.items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedReport(item.id)}
                  className="glass-card"
                  style={{
                    padding: '18px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '110px',
                    transition: 'all 0.2s',
                    background: 'rgba(15, 30, 48, 0.75)',
                    border: '1px solid var(--border-card)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = item.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border-card)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '10px',
                        background: `${item.color}22`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.color,
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#ffffff' }}>{item.label}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.4 }}>
                    {item.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Modal / Drawer for Detailed Report View */}
      {selectedReport && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: 880,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'rgba(10, 25, 45, 0.98)',
              border: '1px solid var(--border-card)',
              padding: '24px',
              borderRadius: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fff', fontWeight: 800 }}>
                  {reportSections.flatMap(s => s.items).find(i => i.id === selectedReport)?.label}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Fazenda River Life • Safra Paraíba
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => window.print()} className="btn btn-secondary btn-sm" title="Imprimir Relatório">
                  <Printer size={16} />
                  <span>Imprimir / PDF</span>
                </button>
                <button onClick={() => setSelectedReport(null)} className="btn btn-secondary btn-icon" style={{ borderRadius: '50%' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* DRE CONTENT */}
            {selectedReport === 'dre' && dreData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div className="glass-card" style={{ padding: '14px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Receita Líquida</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>R$ {dreData.net_revenue_rs?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div className="glass-card" style={{ padding: '14px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CPV (Custo Total Camarão)</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f43f5e' }}>R$ {dreData.cpv_breakdown?.total_cpv_rs?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div className="glass-card" style={{ padding: '14px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>EBITDA Operacional</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>R$ {dreData.ebitda_rs?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({dreData.ebitda_margin_pct}%)</div>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', padding: '10px 0' }}><td style={{ padding: '10px 0', fontWeight: 700, color: '#fff' }}>(=) Receita Operacional Bruta</td><td style={{ textAlign: 'right', fontWeight: 800, color: '#34d399' }}>R$ {dreData.gross_revenue_rs?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ padding: '8px 0', color: '#94a3b8' }}>(-) Deduções e Funrural (1,5%)</td><td style={{ textAlign: 'right', color: '#f43f5e' }}>- R$ {dreData.deductions_funrural_rs?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ padding: '8px 0', color: '#94a3b8' }}>(-) Ração de Engorda e Berçário</td><td style={{ textAlign: 'right', color: '#f43f5e' }}>- R$ {dreData.cpv_breakdown?.feed_rs?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ padding: '8px 0', color: '#94a3b8' }}>(-) Pós-Larvas Genética PL10</td><td style={{ textAlign: 'right', color: '#f43f5e' }}>- R$ {dreData.cpv_breakdown?.larvae_rs?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ padding: '8px 0', color: '#94a3b8' }}>(-) Energia Elétrica Rural (Energisa)</td><td style={{ textAlign: 'right', color: '#f43f5e' }}>- R$ {dreData.cpv_breakdown?.electricity_rs?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ padding: '8px 0', color: '#94a3b8' }}>(-) Bicarbonato, Calcário e Probióticos</td><td style={{ textAlign: 'right', color: '#f43f5e' }}>- R$ {dreData.cpv_breakdown?.probiotics_minerals_rs?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ padding: '10px 0', fontWeight: 800, color: '#38bdf8' }}>(=) Lucro Líquido do Exercício</td><td style={{ textAlign: 'right', fontWeight: 800, color: '#38bdf8', fontSize: '1.1rem' }}>R$ {dreData.net_income_rs?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* DFC CONTENT */}
            {selectedReport === 'dfc' && dfcData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700 }}>Variação Líquida de Caixa no Período</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>R$ {dfcData.final_cash_variation_rs?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>

                <h4 style={{ margin: '10px 0 6px', color: '#fff' }}>Entradas Operacionais</h4>
                {dfcData.inflows_operational?.map((i: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' }}>
                    <span style={{ color: '#cbd5e1' }}>{i.desc}</span>
                    <span style={{ fontWeight: 700, color: '#34d399' }}>+ R$ {i.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}

                <h4 style={{ margin: '14px 0 6px', color: '#fff' }}>Saídas Operacionais</h4>
                {dfcData.outflows_operational?.map((o: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' }}>
                    <span style={{ color: '#cbd5e1' }}>{o.desc}</span>
                    <span style={{ fontWeight: 700, color: '#f43f5e' }}>- R$ {o.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            )}

            {/* PRODUCTION & ZOOTECNIC REPORTS */}
            {(selectedReport === 'zootecnico' || selectedReport === 'biometria_tanque' || selectedReport === 'comparativa') && productionData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <div className="glass-card" style={{ padding: '12px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>FCR Médio</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>{productionData.general_zootecnic?.average_fcr}</div>
                  </div>
                  <div className="glass-card" style={{ padding: '12px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sobrevivência</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>{productionData.general_zootecnic?.average_survival_pct}%</div>
                  </div>
                  <div className="glass-card" style={{ padding: '12px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>GMD Médio</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#c084fc' }}>{productionData.general_zootecnic?.average_gpd_g_day} g/dia</div>
                  </div>
                  <div className="glass-card" style={{ padding: '12px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ganho Semanal</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24' }}>{productionData.general_zootecnic?.average_growth_weekly_g} g/sem</div>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(15, 30, 48, 0.8)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left' }}>Viveiro</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left' }}>Lote</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Peso Atual</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Biomassa</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Dias de Cultivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productionData.biometry_by_pond?.map((b: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#fff' }}>{b.pond_name}</td>
                        <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{b.batch_code}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#38bdf8' }}>{b.current_weight_g}g</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#34d399' }}>{b.biomass_kg?.toLocaleString('pt-BR')} kg</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#cbd5e1' }}>{b.days_of_culture} dias</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* GRAPHS VIEW */}
            {selectedReport.startsWith('grafico_') && graphsData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedReport === 'grafico_producao' && (
                  <div>
                    <h4 style={{ margin: '0 0 12px', color: '#fff' }}>Evolução de Biomassa Total (kg)</h4>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: 180, padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      {graphsData.production_evolution?.map((p: any, idx: number) => {
                        const h = (p.biomass_kg / 14000) * 150;
                        return (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '6px' }}>
                            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>{p.biomass_kg}</span>
                            <div style={{ width: '100%', height: h, background: 'linear-gradient(180deg, #38bdf8, #0284c7)', borderRadius: '6px 6px 0 0' }} />
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{p.month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedReport === 'grafico_custos' && (
                  <div>
                    <h4 style={{ margin: '0 0 12px', color: '#fff' }}>Composição Percentual de Custos</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {graphsData.production_costs?.map((c: any, idx: number) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                            <span style={{ color: '#fff' }}>{c.category}</span>
                            <span style={{ fontWeight: 700, color: '#38bdf8' }}>R$ {c.cost_rs.toLocaleString('pt-BR')} ({c.pct}%)</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${c.pct}%`, height: '100%', background: idx === 0 ? '#38bdf8' : idx === 1 ? '#a855f7' : idx === 2 ? '#f59e0b' : '#10b981' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
