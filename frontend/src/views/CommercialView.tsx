import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, Landmark, Plus,
  Sparkles, CheckCircle2, Search, Filter,
  ArrowUpRight, ArrowDownLeft, ShieldCheck, Download
} from 'lucide-react';
import { api } from '../services/api';

export const CommercialView: React.FC = () => {
  const [subTab, setSubTab] = useState<'sales' | 'cashflow' | 'banks'>('sales');
  const [loading, setLoading] = useState(true);

  // States
  const [salesData, setSalesData] = useState<{ sales: any[]; summary: any }>({ sales: [], summary: {} as any });
  const [cashFlowData, setCashFlowData] = useState<{ movements: any[]; summary: any }>({ movements: [], summary: {} as any });
  const [bankAccountsData, setBankAccountsData] = useState<{ accounts: any[]; total_balance_rs: number }>({ accounts: [], total_balance_rs: 0 });
  const [aiAudit, setAiAudit] = useState<any>(null);

  // Modals
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  // New Sale Form
  const [saleForm, setSaleForm] = useState({
    buyer_name: '',
    buyer_document: '',
    buyer_city: 'João Pessoa - PB',
    commercial_class: '50/60',
    quantity_kg: 1000,
    unit_price_kg: 28.50,
    payment_method: 'PIX',
    invoice_number: '',
    notes: '',
  });

  // New Cash Movement Form
  const [cashForm, setCashForm] = useState({
    date: new Date().toISOString().split('T')[0],
    movement_type: 'SAIDA',
    category: 'RACAO',
    description: '',
    amount_rs: 5000,
    status: 'REALIZADO',
    bank_account_id: 1,
    cost_center: 'Nutrição & Estoque',
  });

  // New Bank Form
  const [bankForm, setBankForm] = useState({
    bank_code: '001',
    bank_name: 'Banco do Brasil',
    account_type: 'CORRENTE',
    agency: '1618-7',
    account_number: '',
    holder_name: 'River Life Aquicultura Ltda',
    current_balance_rs: 10000,
    pix_key: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [sales, cash, banks, audit] = await Promise.all([
        api.getCommercialSales(),
        api.getCashFlow(),
        api.getBankAccounts(),
        api.getFinancialAuditAI(),
      ]);
      setSalesData(sales);
      setCashFlowData(cash);
      setBankAccountsData(banks);
      setAiAudit(audit);
    } catch (err) {
      console.error('Erro ao carregar módulo comercial:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.recordCommercialSale(saleForm);
      setIsSaleModalOpen(false);
      loadData();
    } catch (err: any) {
      alert('Erro: ' + err.message);
    }
  };

  const handleCreateCash = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.recordCashMovement(cashForm);
      setIsCashModalOpen(false);
      loadData();
    } catch (err: any) {
      alert('Erro: ' + err.message);
    }
  };

  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBankAccount(bankForm);
      setIsBankModalOpen(false);
      loadData();
    } catch (err: any) {
      alert('Erro: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & Navigation Subtabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff', fontWeight: 800 }}>
            Módulo Comercial & Finanças
          </h2>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Gestão de Lotes Vendidos, Fluxo de Caixa Diário e Contas Bancárias Integradas
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 30, 48, 0.7)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          {[
            { id: 'sales', label: 'Lotes Vendidos', icon: DollarSign },
            { id: 'cashflow', label: 'Fluxo de Caixa', icon: TrendingUp },
            { id: 'banks', label: 'Contas Bancárias', icon: Landmark },
          ].map(tab => {
            const Icon = tab.icon;
            const active = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: active ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : 'transparent',
                  color: active ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Financial Health Banner */}
      {aiAudit && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(14, 165, 233, 0.1))',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div style={{ padding: '8px', background: 'rgba(168, 85, 247, 0.25)', borderRadius: '12px', color: '#c084fc' }}>
            <Sparkles size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f3e8ff' }}>Auditoria de Liquidez & Rentabilidade IA</span>
                <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 700 }}>
                  Margem Líquida {aiAudit.operating_margin_pct}%
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Saldo Total: <strong>R$ {bankAccountsData.total_balance_rs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
            </div>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#e2e8f0', lineHeight: 1.5 }}>
              {aiAudit.recommendation}
            </p>
          </div>
        </div>
      )}

      {/* SUBTAB 1: LOTES VENDIDOS */}
      {subTab === 'sales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div className="glass-card" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <DollarSign size={20} color="#34d399" />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Faturamento Realizado</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>
                    R$ {(salesData.summary?.total_revenue_rs || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <TrendingUp size={20} color="#38bdf8" />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Volume Total Vendido</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>
                    {(salesData.summary?.total_volume_kg || 0).toLocaleString('pt-BR')} kg
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={20} color="#c084fc" />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Preço Médio / kg</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#c084fc' }}>
                    R$ {(salesData.summary?.average_price_kg_rs || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => setIsSaleModalOpen(true)} className="btn btn-primary">
              <Plus size={18} />
              <span>Registrar Venda de Lote</span>
            </button>
          </div>

          {/* Sales Table */}
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>Histórico de Comercialização</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{salesData.sales?.length || 0} despescas faturadas</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(15, 30, 48, 0.7)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '12px 16px' }}>Data</th>
                    <th style={{ padding: '12px 16px' }}>Comprador / Destino</th>
                    <th style={{ padding: '12px 16px' }}>Classe Comercial</th>
                    <th style={{ padding: '12px 16px' }}>Peso (kg)</th>
                    <th style={{ padding: '12px 16px' }}>Preço / kg</th>
                    <th style={{ padding: '12px 16px' }}>Total Líquido</th>
                    <th style={{ padding: '12px 16px' }}>Pagamento</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.sales?.map((sale, idx) => (
                    <tr
                      key={sale.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                      }}
                    >
                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>
                        {new Date(sale.sale_date).toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#fff' }}>
                        <div>{sale.buyer_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sale.buyer_city}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                          {sale.commercial_class}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#e2e8f0' }}>
                        {sale.quantity_kg?.toLocaleString('pt-BR')} kg
                      </td>
                      <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                        R$ {sale.unit_price_kg?.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: '#34d399' }}>
                        R$ {sale.net_total_rs?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.8rem' }}>
                        {sale.payment_method}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '3px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}>
                          {sale.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: FLUXO DE CAIXA */}
      {subTab === 'cashflow' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div className="glass-card" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ArrowDownLeft size={22} color="#34d399" />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Entradas (Receitas)</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>
                    R$ {(cashFlowData.summary?.total_inflow_rs || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ArrowUpRight size={22} color="#f43f5e" />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Saídas (Custos & Despesas)</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f43f5e' }}>
                    R$ {(cashFlowData.summary?.total_outflow_rs || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <DollarSign size={22} color="#38bdf8" />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Saldo Operacional Líquido</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>
                    R$ {(cashFlowData.summary?.net_operational_balance_rs || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => setIsCashModalOpen(true)} className="btn btn-primary">
              <Plus size={18} />
              <span>Novo Lançamento Financeiro</span>
            </button>
          </div>

          {/* Cashflow Table */}
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>Extrato de Movimentações Financeiras</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cashFlowData.movements?.length || 0} lançamentos</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(15, 30, 48, 0.7)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '12px 16px' }}>Data</th>
                    <th style={{ padding: '12px 16px' }}>Tipo</th>
                    <th style={{ padding: '12px 16px' }}>Categoria</th>
                    <th style={{ padding: '12px 16px' }}>Descrição</th>
                    <th style={{ padding: '12px 16px' }}>Centro de Custo</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Valor (R$)</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cashFlowData.movements?.map((m, idx) => (
                    <tr
                      key={m.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                      }}
                    >
                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>
                        {new Date(m.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {m.movement_type === 'ENTRADA' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#34d399', fontWeight: 700, fontSize: '0.78rem' }}>
                            <ArrowDownLeft size={14} /> Entrada
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#f43f5e', fontWeight: 700, fontSize: '0.78rem' }}>
                            <ArrowUpRight size={14} /> Saída
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                          {m.category}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#f1f5f9' }}>
                        {m.description}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {m.cost_center}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: m.movement_type === 'ENTRADA' ? '#34d399' : '#f43f5e' }}>
                        {m.movement_type === 'ENTRADA' ? '+' : '-'} R$ {m.amount_rs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '0.74rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: CONTAS BANCÁRIAS */}
      {subTab === 'banks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Saldo Total em Caixa & Aplicações</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8' }}>
                R$ {bankAccountsData.total_balance_rs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <button onClick={() => setIsBankModalOpen(true)} className="btn btn-primary">
              <Plus size={18} />
              <span>Adicionar Conta Bancária</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {bankAccountsData.accounts?.map((acc) => (
              <div
                key={acc.id}
                className="glass-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: 'linear-gradient(135deg, rgba(15, 30, 48, 0.9), rgba(7, 20, 34, 0.95))',
                  border: '1px solid var(--border-card)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontWeight: 800 }}>
                      {acc.bank_code}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{acc.bank_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Ag: {acc.agency} • CC: {acc.account_number}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
                    {acc.account_type}
                  </span>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '4px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Saldo Atual Disponível</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
                    R$ {acc.current_balance_rs?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {acc.pix_key && (
                  <div style={{ fontSize: '0.76rem', color: '#cbd5e1', background: 'rgba(255, 255, 255, 0.04)', padding: '6px 10px', borderRadius: '6px' }}>
                    <strong>PIX:</strong> {acc.pix_key}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Nova Venda */}
      {isSaleModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-card" style={{ maxWidth: 540, width: '100%', padding: '24px', background: 'rgba(10, 25, 45, 0.98)', border: '1px solid var(--border-card)' }}>
            <h3 style={{ margin: '0 0 16px', color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>Registrar Venda de Camarão</h3>
            <form onSubmit={handleCreateSale} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Nome do Comprador / Frigorífico</label>
                <input required className="form-control" value={saleForm.buyer_name} onChange={e => setSaleForm({ ...saleForm, buyer_name: e.target.value })} placeholder="Ex: Frigorífico Mar Paraíba" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Cidade</label>
                  <input className="form-control" value={saleForm.buyer_city} onChange={e => setSaleForm({ ...saleForm, buyer_city: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Classe Comercial</label>
                  <select className="form-control" value={saleForm.commercial_class} onChange={e => setSaleForm({ ...saleForm, commercial_class: e.target.value })}>
                    <option value="40/50">40/50 (18g)</option>
                    <option value="50/60">50/60 (15g)</option>
                    <option value="60/70">60/70 (12g)</option>
                    <option value="70/80">70/80 (11g)</option>
                    <option value="80/100">80/100 (10g)</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Volume (kg)</label>
                  <input type="number" step="10" required className="form-control" value={saleForm.quantity_kg} onChange={e => setSaleForm({ ...saleForm, quantity_kg: Number(e.target.value) })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Preço / kg (R$)</label>
                  <input type="number" step="0.1" required className="form-control" value={saleForm.unit_price_kg} onChange={e => setSaleForm({ ...saleForm, unit_price_kg: Number(e.target.value) })} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsSaleModalOpen(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Venda</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Novo Lançamento de Fluxo */}
      {isCashModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-card" style={{ maxWidth: 500, width: '100%', padding: '24px', background: 'rgba(10, 25, 45, 0.98)', border: '1px solid var(--border-card)' }}>
            <h3 style={{ margin: '0 0 16px', color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>Novo Lançamento no Fluxo de Caixa</h3>
            <form onSubmit={handleCreateCash} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tipo</label>
                  <select className="form-control" value={cashForm.movement_type} onChange={e => setCashForm({ ...cashForm, movement_type: e.target.value as any })}>
                    <option value="SAIDA">Saída (Despesa)</option>
                    <option value="ENTRADA">Entrada (Receita)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Categoria</label>
                  <select className="form-control" value={cashForm.category} onChange={e => setCashForm({ ...cashForm, category: e.target.value })}>
                    <option value="RACAO">Ração Aquícola</option>
                    <option value="POS_LARVAS">Pós-Larvas (PL10)</option>
                    <option value="ENERGIA_ELETRICA">Energia Elétrica (Energisa)</option>
                    <option value="PROBIOTICOS">Bicarbonato & Probióticos</option>
                    <option value="FOLHA_PAGAMENTO">Folha de Pagamento</option>
                    <option value="MANUTENCAO">Manutenção de Motores</option>
                    <option value="VENDA_CAMARAO">Venda de Camarão</option>
                    <option value="OUTROS">Outros</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Descrição</label>
                <input required className="form-control" value={cashForm.description} onChange={e => setCashForm({ ...cashForm, description: e.target.value })} placeholder="Ex: Compra de 80 sacas de ração 35%" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Valor (R$)</label>
                <input type="number" step="0.01" required className="form-control" value={cashForm.amount_rs} onChange={e => setCashForm({ ...cashForm, amount_rs: Number(e.target.value) })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsCashModalOpen(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">Lançar Movimento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nova Conta Bancária */}
      {isBankModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-card" style={{ maxWidth: 500, width: '100%', padding: '24px', background: 'rgba(10, 25, 45, 0.98)', border: '1px solid var(--border-card)' }}>
            <h3 style={{ margin: '0 0 16px', color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>Cadastrar Conta Bancária</h3>
            <form onSubmit={handleCreateBank} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Instituição Financeira</label>
                <select className="form-control" value={bankForm.bank_name} onChange={e => {
                  const bName = e.target.value;
                  const codeMap: any = { 'Banco do Brasil': '001', 'Banco Santander': '033', 'Bradesco': '237', 'Caixa Econômica': '104', 'Sicoob': '756', 'Sicredi': '748', 'Banco do Nordeste (BNB)': '004', 'Nubank': '260' };
                  setBankForm({ ...bankForm, bank_name: bName, bank_code: codeMap[bName] || '001' });
                }}>
                  <option value="Banco do Brasil">Banco do Brasil (001)</option>
                  <option value="Banco Santander">Banco Santander (033)</option>
                  <option value="Banco do Nordeste (BNB)">Banco do Nordeste (BNB - 004)</option>
                  <option value="Sicoob">Sicoob (756)</option>
                  <option value="Sicredi">Sicredi (748)</option>
                  <option value="Bradesco">Bradesco (237)</option>
                  <option value="Caixa Econômica">Caixa Econômica (104)</option>
                  <option value="Nubank">Nubank (260)</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Agência</label>
                  <input required className="form-control" value={bankForm.agency} onChange={e => setBankForm({ ...bankForm, agency: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Número da Conta</label>
                  <input required className="form-control" value={bankForm.account_number} onChange={e => setBankForm({ ...bankForm, account_number: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Saldo Inicial (R$)</label>
                <input type="number" step="0.01" required className="form-control" value={bankForm.current_balance_rs} onChange={e => setBankForm({ ...bankForm, current_balance_rs: Number(e.target.value) })} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Chave PIX</label>
                <input className="form-control" value={bankForm.pix_key} onChange={e => setBankForm({ ...bankForm, pix_key: e.target.value })} placeholder="E-mail, CNPJ ou telefone" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsBankModalOpen(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Conta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
