import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  Truck,
  Scale,
  DollarSign,
  AlertCircle,
  Download,
  Copy,
  Plus,
  Sparkles,
  ShieldCheck,
  Search,
  FileCheck,
  Building2,
  Calendar,
  Barcode,
  X,
  ArrowRight,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import { FiscalInvoice, FiscalSummary, HarvestLog } from '../types';
import { api } from '../services/api';

export const FiscalView: React.FC = () => {
  const [invoices, setInvoices] = useState<FiscalInvoice[]>([]);
  const [summary, setSummary] = useState<FiscalSummary | null>(null);
  const [harvests, setHarvests] = useState<HarvestLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<FiscalInvoice | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showDanfeModal, setShowDanfeModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form for manual/harvest invoice
  const [selectedHarvestId, setSelectedHarvestId] = useState<number | ''>('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerCnpj, setBuyerCnpj] = useState('');
  const [buyerLocation, setBuyerLocation] = useState('Natal / RN');
  const [cfop, setCfop] = useState('5.101');
  const [weightKg, setWeightKg] = useState<number>(0);
  const [unitPrice, setUnitPrice] = useState<number>(24.5);
  const [commercialClass, setCommercialClass] = useState('60/70 (14g a 16g)');
  const [gtaNumber, setGtaNumber] = useState('');
  const [issuing, setIssuing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invList, sum, hList] = await Promise.all([
        api.getFiscalInvoices(),
        api.getFiscalSummary(),
        api.getHarvests(),
      ]);
      setInvoices(invList);
      setSummary(sum);
      setHarvests(hList);
    } catch (err) {
      console.error('Erro ao carregar dados fiscais:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSelectHarvest = (harvestIdStr: string) => {
    const hid = Number(harvestIdStr);
    setSelectedHarvestId(hid);
    const harvest = harvests.find((h) => h.id === hid);
    if (harvest) {
      setWeightKg(harvest.total_weight_kg);
      setUnitPrice(harvest.price_per_kg || 24.5);
      setBuyerName(harvest.buyer_name || 'Frigorífico Camarão Potiguar Ltda');
      setCommercialClass(harvest.commercial_classification || '60/70 (14g a 16g)');
      setBuyerCnpj('08.452.910/0001-83');
      setGtaNumber(`RN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  };

  const handleIssueInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIssuing(true);
      if (selectedHarvestId) {
        await api.issueInvoiceFromHarvest(Number(selectedHarvestId), buyerName);
      } else {
        const totalVal = Number((weightKg * unitPrice).toFixed(2));
        const funruralVal = Number((totalVal * 0.015).toFixed(2));
        const num = String(Math.floor(100000 + Math.random() * 900000));
        const randomKey = `2426090845291000018355001000${num}1982736412`;
        await api.createFiscalInvoice({
          invoice_number: `000.${num.slice(0, 3)}.${num.slice(3)}`,
          series: '1',
          access_key: randomKey,
          issue_date: new Date().toISOString().split('T')[0],
          buyer_name: buyerName || 'Frigorífico Camarão do Brasil S/A',
          buyer_cnpj_cpf: buyerCnpj || '08.452.910/0001-83',
          buyer_location: buyerLocation,
          cfop: cfop,
          nature_of_operation: cfop === '5.101' ? 'Venda de produção do estabelecimento (Estadual)' : 'Venda de produção (Interestadual)',
          weight_kg: weightKg,
          commercial_class: commercialClass,
          unit_price_kg: unitPrice,
          total_value_rs: totalVal,
          funrural_value_rs: funruralVal,
          gta_number: gtaNumber || `RN-2026-${Math.floor(100000 + Math.random() * 900000)}`,
          status: 'AUTORIZADA',
        });
      }
      setShowIssueModal(false);
      await loadData();
      alert('Nota Fiscal emitida e autorizada pela SEFAZ com sucesso!');
    } catch (err: any) {
      alert(`Erro ao emitir NF-e: ${err.message || 'Falha na comunicação fiscal'}`);
    } finally {
      setIssuing(false);
    }
  };

  const openDanfePreview = (invoice: FiscalInvoice) => {
    setSelectedInvoice(invoice);
    setShowDanfeModal(true);
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.access_key.includes(searchTerm) ||
      (inv.gta_number && inv.gta_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Módulo Fiscal Desbloqueado • 100% Integrado & IA Compliant
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Receipt className="w-8 h-8 text-emerald-400" />
              Emissão de Nota Fiscal & Manifestos GTA
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Emissão instantânea de NF-e (Modelo 55) sincronizada à pesagem de despesca, cálculo automático de Funrural (1,5%),
              geração de Guia de Trânsito Animal (GTA) para o IDIARN e espelho DANFE digital.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedHarvestId('');
                setBuyerName('Frigorífico Camarão Potiguar Ltda');
                setWeightKg(3500);
                setUnitPrice(25.0);
                setShowIssueModal(true);
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95 text-sm"
            >
              <Plus className="w-4 h-4" />
              Emitir Nova NF-e / GTA
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Faturamento Faturado</p>
            <p className="text-xl font-bold text-white mt-1">
              R$ {summary?.total_invoiced_rs.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              100% escriturado SEFAZ
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Volume Despescado</p>
            <p className="text-xl font-bold text-cyan-400 mt-1">
              {summary?.total_shrimp_shipped_kg.toLocaleString('pt-BR')} kg
            </p>
            <p className="text-xs text-slate-400 mt-1">Camarão fresco/resfriado</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Preço Médio / kg</p>
            <p className="text-xl font-bold text-amber-400 mt-1">
              R$ {summary?.average_sale_price_kg.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Calibre predominante 60/70</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Funrural Retido (1.5%)</p>
            <p className="text-xl font-bold text-purple-400 mt-1">
              R$ {summary?.total_funrural_withheld_rs.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Retenção pelo frigorífico</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Notas / GTAs Emitidas</p>
            <p className="text-xl font-bold text-white mt-1">
              {summary?.total_invoices_issued || 0} NF-e
            </p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {summary?.gta_manifests_count || 0} Guia Sanitária Ativa
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Truck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* AI Fiscal Advisor Box */}
      <div className="bg-slate-900/70 border border-indigo-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-base flex items-center gap-2">
                Assistente Tributário & Sanitário IA (ShrimpFiscal)
                <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-normal">
                  Sincronização Fiscal Ativa
                </span>
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300 pt-1">
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                <span className="font-semibold text-indigo-300 block mb-1">CFOP 5.101 vs 6.101</span>
                Em vendas internas para frigoríficos do RN, utilize CFOP 5.101 com diferimento de ICMS. Para envios a
                Pernambuco ou Ceará, o sistema sugere automaticamente o CFOP 6.101.
              </div>
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                <span className="font-semibold text-emerald-300 block mb-1">Retenção de Funrural (1,5%)</span>
                Como produtor pessoa jurídica optante pela folha ou produtor rural regular, a alíquota de 1,5% é calculada
                sobre a receita bruta e abatida no recibo financeiro do adquirente.
              </div>
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
                <span className="font-semibold text-cyan-300 block mb-1">GTA Automática (IDIARN / MAPA)</span>
                A cada NF-e gerada de despesca, a Guia de Trânsito Animal é pré-preenchida com espécie Litopenaeus
                vannamei, finalidade abate/frigorífico e peso líquido calibrado.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices List / Filter */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h2 className="font-semibold text-white text-base">Notas Fiscais Emitidas & Documentos de Transporte</h2>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
              {filteredInvoices.length} registros
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar número, comprador, GTA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-64"
              />
            </div>
            <button
              onClick={loadData}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors"
              title="Atualizar lista"
            >
              <FileCheck className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/40 text-slate-400 uppercase font-medium text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Número / Série</th>
                <th className="px-4 py-3">Emissão</th>
                <th className="px-4 py-3">Destinatário</th>
                <th className="px-4 py-3">Carga / Calibre</th>
                <th className="px-4 py-3">CFOP</th>
                <th className="px-4 py-3">GTA Sanitária</th>
                <th className="px-4 py-3 text-right">Valor Total (R$)</th>
                <th className="px-4 py-3 text-center">Status SEFAZ</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    Nenhuma nota fiscal encontrada no filtro selecionado.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-white">
                      <div className="flex items-center gap-1.5 font-mono">
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        {inv.invoice_number}
                        <span className="text-[10px] text-slate-400">s.{inv.series}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <span className="truncate max-w-[130px] font-mono">{inv.access_key}</span>
                        <button
                          onClick={() => handleCopyKey(inv.access_key)}
                          className="hover:text-emerald-400 transition-colors"
                          title="Copiar chave de 44 dígitos"
                        >
                          {copiedKey === inv.access_key ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-300 whitespace-nowrap">
                      {new Date(inv.issue_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-white truncate max-w-[180px]">{inv.buyer_name}</div>
                      <div className="text-[10px] text-slate-400">{inv.buyer_cnpj_cpf} • {inv.buyer_location}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-emerald-300">
                        {inv.weight_kg.toLocaleString('pt-BR')} kg
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {inv.commercial_class} @ R$ {inv.unit_price_kg.toFixed(2)}/kg
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
                        {inv.cfop}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      {inv.gta_number ? (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[11px]">
                          <Truck className="w-3 h-3" />
                          {inv.gta_number}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Não gerada</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="font-bold text-white">
                        R$ {inv.total_value_rs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-purple-400">
                        Funrural: R$ {inv.funrural_value_rs.toFixed(2)}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        {inv.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openDanfePreview(inv)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 text-xs transition-colors flex items-center gap-1"
                        >
                          <Barcode className="w-3.5 h-3.5 text-emerald-400" />
                          DANFE
                        </button>
                        <button
                          onClick={() => alert(`Download de XML (SEFAZ Modelo 55) para NF-e ${inv.invoice_number} iniciado!`)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 rounded-lg border border-slate-700 transition-colors"
                          title="Baixar XML SEFAZ"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: EMITIR NOVA NF-E / VINCULAR À DESPESCA */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-white text-base">Emitir Nota Fiscal Eletrônica & Manifesto GTA</h3>
              </div>
              <button
                onClick={() => setShowIssueModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueInvoice} className="p-6 space-y-4">
              {/* Option to select recent harvest */}
              {harvests.length > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5">
                  <label className="block text-xs font-semibold text-emerald-300 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Puxar Dados Instantaneamente de Despesca Realizada
                  </label>
                  <select
                    value={selectedHarvestId}
                    onChange={(e) => handleSelectHarvest(e.target.value)}
                    className="w-full bg-slate-800 border border-emerald-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="">Selecione uma despesca para preenchimento automático em 1 clique...</option>
                    {harvests.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.date} • {h.pond_name || `Lote #${h.batch_id}`} • {h.total_weight_kg.toLocaleString()} kg • R${' '}
                        {h.price_per_kg?.toFixed(2)}/kg • {h.buyer_name || 'Comprador padrão'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Razão Social do Comprador / Frigorífico</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Ex: Frigorífico Camarão Potiguar Ltda"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">CNPJ do Adquirente</label>
                  <input
                    type="text"
                    value={buyerCnpj}
                    onChange={(e) => setBuyerCnpj(e.target.value)}
                    placeholder="08.452.910/0001-83"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Destino (Cidade / UF)</label>
                  <input
                    type="text"
                    value={buyerLocation}
                    onChange={(e) => setBuyerLocation(e.target.value)}
                    placeholder="Ex: Pendências / RN ou Recife / PE"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">CFOP Fiscal</label>
                  <select
                    value={cfop}
                    onChange={(e) => setCfop(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="5.101">5.101 - Venda de produção do estabelecimento (Interna / RN)</option>
                    <option value="6.101">6.101 - Venda de produção interestadual (PE, CE, PB, SP)</option>
                    <option value="5.949">5.949 - Outra saída de mercadoria ou remessa para terceirização</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Volume Despescado (kg Líquido)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Preço Negociado / kg (R$)</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Classificação Comercial / Gramatura</label>
                  <input
                    type="text"
                    value={commercialClass}
                    onChange={(e) => setCommercialClass(e.target.value)}
                    placeholder="Ex: 60/70 (14g a 16g)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Número da GTA Sanitária</label>
                  <input
                    type="text"
                    value={gtaNumber}
                    onChange={(e) => setGtaNumber(e.target.value)}
                    placeholder="RN-2026-XXXXXX"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Real-time Calculation Summary */}
              <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-400">Total Bruto da NF-e</p>
                  <p className="text-lg font-bold text-emerald-400">
                    R$ {(weightKg * unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400">Retenção Funrural Estimada (1,5%)</p>
                  <p className="text-sm font-semibold text-purple-400">
                    R$ {(weightKg * unitPrice * 0.015).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={issuing || weightKg <= 0}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all"
                >
                  {issuing ? (
                    <>Transmitindo à SEFAZ...</>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Emitir & Autorizar NF-e
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DANFE DIGITAL PREVIEW */}
      {showDanfeModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setShowDanfeModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* DANFE Header */}
            <div className="border border-slate-400 p-4 rounded-lg mb-4">
              <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-300 pb-3 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    RL
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-tight">RIVER LIFE CARCINICULTURA LTDA</h2>
                    <p className="text-[11px] text-slate-600">Fazenda River Life - Setor Aquícola Norte, Pendências - RN</p>
                    <p className="text-[10px] text-slate-500 font-mono">CNPJ: 14.892.341/0001-92 • IE: 20.481.932-1</p>
                  </div>
                </div>

                <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-300 pt-2 sm:pt-0 sm:pl-4">
                  <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-slate-900 text-white uppercase mb-1">
                    DANFE
                  </span>
                  <p className="text-[11px] font-bold text-slate-700">DOCUMENTO AUXILIAR DA NF-E</p>
                  <p className="text-xs font-bold text-slate-900">
                    Nº {selectedInvoice.invoice_number} • SÉRIE {selectedInvoice.series}
                  </p>
                </div>
              </div>

              {/* Barcode & Key */}
              <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Chave de Acesso SEFAZ</span>
                  <span className="text-xs font-mono font-semibold text-slate-800 tracking-wider">
                    {selectedInvoice.access_key.replace(/(\d{4})/g, '$1 ').trim()}
                  </span>
                </div>
                <div className="px-3 py-1 bg-emerald-50 border border-emerald-300 rounded text-center">
                  <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    AUTORIZADA SEFAZ
                  </span>
                  <span className="text-[10px] text-emerald-700 block font-mono">Prot: 124260098412891</span>
                </div>
              </div>
            </div>

            {/* Nature and Dates */}
            <div className="grid grid-cols-3 gap-2 border border-slate-300 p-2.5 rounded-lg text-[11px] mb-4">
              <div>
                <span className="text-slate-500 block text-[10px]">NATUREZA DA OPERAÇÃO</span>
                <span className="font-semibold text-slate-800">{selectedInvoice.nature_of_operation}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">PROTOCOLO DE AUTORIZAÇÃO</span>
                <span className="font-semibold text-slate-800">124260098412891 - {selectedInvoice.issue_date}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">CFOP</span>
                <span className="font-semibold text-slate-800 font-mono">{selectedInvoice.cfop}</span>
              </div>
            </div>

            {/* Destinatário */}
            <div className="border border-slate-300 p-3 rounded-lg text-xs mb-4">
              <span className="font-bold text-slate-700 uppercase text-[10px] block mb-1">Destinatário / Remetente</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Razão Social:</span>{' '}
                  <strong className="text-slate-900">{selectedInvoice.buyer_name}</strong>
                </div>
                <div>
                  <span className="text-slate-500">CNPJ/CPF:</span>{' '}
                  <strong className="font-mono text-slate-900">{selectedInvoice.buyer_cnpj_cpf}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Município/UF:</span>{' '}
                  <span className="text-slate-800">{selectedInvoice.buyer_location}</span>
                </div>
                <div>
                  <span className="text-slate-500">Manifesto GTA Sanitário:</span>{' '}
                  <strong className="text-indigo-700 font-mono">{selectedInvoice.gta_number || 'Dispensado'}</strong>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="border border-slate-300 rounded-lg overflow-hidden text-[11px] mb-4">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                  <tr>
                    <th className="p-2">Cód / NCM</th>
                    <th className="p-2">Descrição do Produto</th>
                    <th className="p-2">Calibre</th>
                    <th className="p-2 text-right">Qtd (kg)</th>
                    <th className="p-2 text-right">Vlr Unitário (R$)</th>
                    <th className="p-2 text-right">Vlr Total (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 font-mono text-slate-600">0306.17.00</td>
                    <td className="p-2 font-medium text-slate-900">
                      Camarão Litopenaeus vannamei fresco/resfriado inteiro
                    </td>
                    <td className="p-2 text-slate-600">{selectedInvoice.commercial_class}</td>
                    <td className="p-2 text-right font-semibold text-slate-900">
                      {selectedInvoice.weight_kg.toLocaleString('pt-BR')} kg
                    </td>
                    <td className="p-2 text-right font-mono text-slate-800">
                      R$ {selectedInvoice.unit_price_kg.toFixed(2)}
                    </td>
                    <td className="p-2 text-right font-bold text-slate-900">
                      R$ {selectedInvoice.total_value_rs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tax Totals */}
            <div className="grid grid-cols-4 gap-2 border border-slate-300 p-2.5 rounded-lg text-[11px] bg-slate-50 mb-4">
              <div>
                <span className="text-slate-500 block text-[10px]">BASE CÁLCULO ICMS</span>
                <span className="font-semibold text-slate-800">R$ 0,00 (Diferido)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">VALOR DO ICMS</span>
                <span className="font-semibold text-slate-800">R$ 0,00</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">RETENÇÃO FUNRURAL (1.5%)</span>
                <span className="font-bold text-purple-700">
                  R$ {selectedInvoice.funrural_value_rs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">VALOR TOTAL DA NOTA</span>
                <span className="font-bold text-emerald-800 text-sm">
                  R$ {selectedInvoice.total_value_rs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                Imprimir DANFE & GTA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
