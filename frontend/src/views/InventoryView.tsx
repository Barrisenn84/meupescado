import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Plus,
  ShoppingCart,
  Layers,
  Sparkles,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MoreVertical,
  History,
  TrendingUp,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  X,
  FileSpreadsheet,
  Calendar,
  Warehouse,
  Flame,
  Info,
} from 'lucide-react';
import { FeedInventory, InventoryMovement, ProductMix } from '../types';
import { api } from '../services/api';

interface InventoryViewProps {
  onRefresh: () => void;
  onNavigateTab: (tab: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onRefresh, onNavigateTab }) => {
  const [items, setItems] = useState<FeedInventory[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [mixes, setMixes] = useState<ProductMix[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [sortBy, setSortBy] = useState('nome');

  // Modals state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isMixesModalOpen, setIsMixesModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FeedInventory | null>(null);

  // Entry Form state
  const [entryQty, setEntryQty] = useState<number>(100);
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [entrySupplier, setEntrySupplier] = useState('');
  const [entryInvoice, setEntryInvoice] = useState('');
  const [entryBatch, setEntryBatch] = useState('');
  const [entryNotes, setEntryNotes] = useState('');

  // Exit Form state
  const [exitQty, setExitQty] = useState<number>(25);
  const [exitType, setExitType] = useState('SAIDA_MANEJO');
  const [exitNotes, setExitNotes] = useState('');

  // New Product Form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdType, setNewProdType] = useState('Ração');
  const [newProdUnit, setNewProdUnit] = useState('kg');
  const [newProdInitialQty, setNewProdInitialQty] = useState(0);
  const [newProdMinQty, setNewProdMinQty] = useState(200);
  const [newProdPrice, setNewProdPrice] = useState(10.0);
  const [newProdLocation, setNewProdLocation] = useState('Galpão Principal');
  const [newProdNotes, setNewProdNotes] = useState('');

  // New Mix Form state
  const [newMixName, setNewMixName] = useState('');
  const [newMixTarget, setNewMixTarget] = useState('Berçário & Engorda');
  const [newMixInstructions, setNewMixInstructions] = useState('');

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const [itemsData, movsData, mixesData] = await Promise.all([
        api.getInventoryItems(),
        api.getInventoryMovements(),
        api.getProductMixes(),
      ]);
      setItems(itemsData || []);
      setMovements(movsData || []);
      setMixes(mixesData || []);
    } catch (err) {
      console.error('Erro ao carregar dados do estoque:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventoryData();
  }, []);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.brand.toLowerCase().includes(q) ||
          i.item_type.toLowerCase().includes(q)
      );
    }

    if (selectedType !== 'Todos') {
      result = result.filter((i) => i.item_type.toLowerCase() === selectedType.toLowerCase());
    }

    if (selectedStatus !== 'Todos') {
      result = result.filter((i) => i.status === selectedStatus);
    }

    if (sortBy === 'nome') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'quantidade') {
      result.sort((a, b) => b.current_stock_kg - a.current_stock_kg);
    } else if (sortBy === 'valor') {
      result.sort((a, b) => (b.total_value_rs || 0) - (a.total_value_rs || 0));
    } else if (sortBy === 'tipo') {
      result.sort((a, b) => a.item_type.localeCompare(b.item_type));
    } else if (sortBy === 'situacao') {
      result.sort((a, b) => (a.status === 'ESGOTADO' ? -1 : 1));
    }

    return result;
  }, [items, searchQuery, selectedType, selectedStatus, sortBy]);

  // Aggregate Metrics
  const totalStockValue = useMemo(() => {
    return items.reduce((acc, curr) => acc + (curr.total_value_rs || curr.current_stock_kg * curr.cost_per_kg), 0);
  }, [items]);

  const criticalItemsCount = useMemo(() => {
    return items.filter((i) => i.status === 'ABAIXO_MINIMO' || i.status === 'ESGOTADO').length;
  }, [items]);

  const totalFeedKg = useMemo(() => {
    return items
      .filter((i) => i.item_type.toLowerCase().includes('ração'))
      .reduce((acc, curr) => acc + curr.current_stock_kg, 0);
  }, [items]);

  // Handlers
  const handleOpenEntry = (item: FeedInventory) => {
    setSelectedItem(item);
    setEntryQty(100);
    setEntryPrice(item.cost_per_kg || 10.0);
    setEntrySupplier(item.brand || '');
    setEntryInvoice('');
    setEntryBatch('');
    setEntryNotes('');
    setIsEntryModalOpen(true);
  };

  const handleOpenExit = (item: FeedInventory) => {
    setSelectedItem(item);
    setExitQty(item.current_stock_kg > 20 ? 20 : item.current_stock_kg);
    setExitType('SAIDA_MANEJO');
    setExitNotes('');
    setIsExitModalOpen(true);
  };

  const handleOpenHistory = (item: FeedInventory) => {
    setSelectedItem(item);
    setIsHistoryModalOpen(true);
  };

  const handleConfirmEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || entryQty <= 0) return;

    try {
      await api.recordInventoryEntry({
        item_id: selectedItem.id,
        quantity: entryQty,
        unit_price: entryPrice,
        total_price: entryQty * entryPrice,
        supplier_name: entrySupplier,
        invoice_number: entryInvoice,
        batch_number: entryBatch,
        notes: entryNotes,
      });
      setIsEntryModalOpen(false);
      await loadInventoryData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar entrada');
    }
  };

  const handleConfirmExit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || exitQty <= 0) return;

    try {
      await api.recordInventoryExit({
        item_id: selectedItem.id,
        quantity: exitQty,
        movement_type: exitType,
        notes: exitNotes,
      });
      setIsExitModalOpen(false);
      await loadInventoryData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar saída');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    try {
      await api.createInventoryItem({
        name: newProdName,
        brand: newProdBrand || 'Geral',
        item_type: newProdType,
        unit: newProdUnit,
        current_stock_kg: newProdInitialQty,
        min_stock_alert_kg: newProdMinQty,
        cost_per_kg: newProdPrice,
        last_entry_price: newProdPrice,
        location: newProdLocation,
        notes: newProdNotes,
      });
      setIsNewProductModalOpen(false);
      setNewProdName('');
      setNewProdBrand('');
      setNewProdInitialQty(0);
      await loadInventoryData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao cadastrar produto');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Produto', 'Marca', 'Tipo', 'Unidade', 'Estoque Mínimo', 'Estoque Atual', 'Preço Médio (R$)', 'Saldo Atual (R$)', 'Situação'];
    const rows = filteredItems.map((i) => [
      `"${i.name}"`,
      `"${i.brand}"`,
      `"${i.item_type}"`,
      i.unit,
      i.min_stock_alert_kg.toFixed(2),
      i.current_stock_kg.toFixed(2),
      i.cost_per_kg.toFixed(2),
      (i.total_value_rs || i.current_stock_kg * i.cost_per_kg).toFixed(2),
      i.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `controle_estoque_meu_pescado_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const productTypes = ['Todos', 'Ração', 'Fertilizante', 'Veículo', 'Corretivo / Químico', 'Probiótico', 'Medicamento / Vitamina'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <span>River Life (Área Fazenda)</span>
            <span>•</span>
            <span style={{ color: 'var(--aqua-400)' }}>Insumos & Nutrição</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package size={28} color="#38bdf8" />
            Controle de Estoque & Insumos Inteligente
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Monitoramento de rações, fertilizantes, veículos e misturas com previsão de consumo e dias de autonomia por IA
          </p>
        </div>

        {/* Action Buttons matching legacy + 10x */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setIsMixesModalOpen(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(168, 85, 247, 0.15)', borderColor: 'rgba(168, 85, 247, 0.4)', color: '#c084fc' }}
          >
            <Sparkles size={16} />
            <span>Misturas & Formulações IA</span>
          </button>

          <button
            onClick={() => setIsNewProductModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} />
            <span>Novo produto</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            title="Exportar para Excel (.csv)"
            style={{ padding: '8px 12px' }}
          >
            <FileSpreadsheet size={18} color="#10b981" />
          </button>

          <button
            onClick={loadInventoryData}
            className="btn btn-secondary"
            title="Atualizar dados"
            style={{ padding: '8px 12px' }}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* 4 Top KPI Cards (10x Better Analytics) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Valor Total Imobilizado</span>
            <DollarSign size={20} color="#34d399" />
          </div>
          <div className="metric-value">
            R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="metric-sub">
            <span style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>{items.length} itens</span>
            <span>cadastrados no almoxarifado</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Rações em Estoque</span>
            <Package size={20} color="#38bdf8" />
          </div>
          <div className="metric-value">
            {(totalFeedKg / 1000).toFixed(2)} <span style={{ fontSize: '1rem', fontWeight: 500 }}>toneladas</span>
          </div>
          <div className="metric-sub">
            <span style={{ color: 'var(--aqua-400)', fontWeight: 600 }}>{totalFeedKg.toLocaleString('pt-BR')} kg</span>
            <span>disponíveis para trato</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Insumos Críticos / Zerados</span>
            <AlertTriangle size={20} color={criticalItemsCount > 0 ? '#f43f5e' : '#34d399'} />
          </div>
          <div className="metric-value" style={{ color: criticalItemsCount > 0 ? 'var(--rose-400)' : '#ffffff' }}>
            {criticalItemsCount} <span style={{ fontSize: '1rem', fontWeight: 500 }}>produtos</span>
          </div>
          <div className="metric-sub">
            {criticalItemsCount > 0 ? (
              <span style={{ color: 'var(--rose-400)', fontWeight: 600 }}>Abaixo do estoque mínimo de segurança</span>
            ) : (
              <span style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>Todos os níveis adequados</span>
            )}
          </div>
        </div>

        <div className="metric-card" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(15, 30, 48, 0.8))' }}>
          <div className="metric-header">
            <span className="metric-label">Autonomia IA & Reposição</span>
            <Sparkles size={20} color="#c084fc" />
          </div>
          <div className="metric-value" style={{ color: '#e9d5ff' }}>
            ~24 <span style={{ fontSize: '1rem', fontWeight: 500 }}>dias</span>
          </div>
          <div className="metric-sub">
            <span style={{ color: '#c084fc', fontWeight: 600 }}>Previsão IA:</span>
            <span>Comprar ração Samaria antes da Lua Nova</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar (matching exactly the filters in Screenshot 1) */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Pesquisar produto ou marca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{ paddingLeft: '38px', width: '100%' }}
            />
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 10px' }}
              title="Limpar pesquisa"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Ordenar por... */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
              style={{ padding: '7px 12px', fontSize: '0.85rem', width: 140 }}
            >
              <option value="nome">Nome do Produto</option>
              <option value="quantidade">Quantidade Atual</option>
              <option value="valor">Saldo Total (R$)</option>
              <option value="tipo">Tipo / Insumo</option>
              <option value="situacao">Situação Crítica</option>
            </select>
          </div>

          {/* Tipo Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tipo:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input"
              style={{ padding: '7px 12px', fontSize: '0.85rem', width: 150 }}
            >
              {productTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Situação Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Situação:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input"
              style={{ padding: '7px 12px', fontSize: '0.85rem', width: 140 }}
            >
              <option value="Todos">Todas</option>
              <option value="NORMAL">Normal</option>
              <option value="ABAIXO_MINIMO">Abaixo do Mínimo</option>
              <option value="ESGOTADO">Esgotado (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Inventory Table (Matching Image 1 table columns + 10x Upgrades) */}
      <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(7, 20, 34, 0.95)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '14px 16px', width: 80, textAlign: 'center' }}>Situação</th>
                <th style={{ padding: '14px 16px' }}>Produto</th>
                <th style={{ padding: '14px 16px' }}>Tipo</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Mínimo</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Quantidade Atual</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Preço Médio (un.)</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Preço Últ. Entrada</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Saldo Atual</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Autonomia IA</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', width: 110 }}>Nova Entrada</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', width: 80 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Nenhum produto encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isZero = item.current_stock_kg <= 0;
                  const isBelowMin = !isZero && item.min_stock_alert_kg > 0 && item.current_stock_kg <= item.min_stock_alert_kg;
                  const totalItemVal = item.total_value_rs || item.current_stock_kg * item.cost_per_kg;

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: isZero
                          ? 'rgba(244, 63, 94, 0.04)'
                          : isBelowMin
                          ? 'rgba(245, 158, 11, 0.03)'
                          : 'transparent',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = isZero
                          ? 'rgba(244, 63, 94, 0.04)'
                          : isBelowMin
                          ? 'rgba(245, 158, 11, 0.03)'
                          : 'transparent')
                      }
                    >
                      {/* Situação Icon matching legacy system */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        {isZero ? (
                          <span title="Produto esgotado / Estoque zerado">
                            <XCircle size={18} color="#f43f5e" />
                          </span>
                        ) : isBelowMin ? (
                          <span title="Estoque abaixo do mínimo de segurança">
                            <AlertTriangle size={18} color="#f59e0b" />
                          </span>
                        ) : (
                          <span title="Estoque normal e abastecido">
                            <CheckCircle2 size={18} color="#10b981" />
                          </span>
                        )}
                      </td>

                      {/* Produto & Marca */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.92rem' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {item.brand} {item.location ? `• ${item.location}` : ''}
                        </div>
                      </td>

                      {/* Tipo */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          className="badge"
                          style={{
                            background:
                              item.item_type.toLowerCase().includes('ração')
                                ? 'rgba(56, 189, 248, 0.15)'
                                : item.item_type.toLowerCase().includes('fertilizante')
                                ? 'rgba(52, 211, 153, 0.15)'
                                : item.item_type.toLowerCase().includes('veículo')
                                ? 'rgba(245, 158, 11, 0.15)'
                                : 'rgba(168, 85, 247, 0.15)',
                            color:
                              item.item_type.toLowerCase().includes('ração')
                                ? '#38bdf8'
                                : item.item_type.toLowerCase().includes('fertilizante')
                                ? '#34d399'
                                : item.item_type.toLowerCase().includes('veículo')
                                ? '#fbbf24'
                                : '#c084fc',
                            border: '1px solid currentColor',
                            fontSize: '0.75rem',
                          }}
                        >
                          {item.item_type}
                        </span>
                      </td>

                      {/* Mínimo */}
                      <td style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                        {item.min_stock_alert_kg.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} {item.unit}
                      </td>

                      {/* Quantidade Atual */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <strong style={{ color: isZero ? 'var(--rose-400)' : isBelowMin ? 'var(--amber-400)' : '#ffffff', fontSize: '0.95rem' }}>
                          {item.current_stock_kg.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} {item.unit}
                        </strong>
                      </td>

                      {/* Preço Médio (un.) */}
                      <td style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                        R$ {item.cost_per_kg.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Preço Últ. Entrada */}
                      <td style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--text-muted)' }}>
                        {item.last_entry_price > 0
                          ? `R$ ${item.last_entry_price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : '-'}
                      </td>

                      {/* Saldo Atual (R$) */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <strong style={{ color: 'var(--emerald-400)' }}>
                          R$ {totalItemVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </strong>
                      </td>

                      {/* Autonomia IA */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        {item.days_of_autonomy_ai !== null && item.days_of_autonomy_ai !== undefined ? (
                          <span
                            className="badge"
                            style={{
                              background:
                                item.days_of_autonomy_ai <= 5
                                  ? 'rgba(244, 63, 94, 0.2)'
                                  : item.days_of_autonomy_ai <= 12
                                  ? 'rgba(245, 158, 11, 0.2)'
                                  : 'rgba(52, 211, 153, 0.15)',
                              color:
                                item.days_of_autonomy_ai <= 5
                                  ? '#fb7185'
                                  : item.days_of_autonomy_ai <= 12
                                  ? '#fbbf24'
                                  : '#34d399',
                              fontSize: '0.72rem',
                            }}
                            title={item.ai_reorder_recommendation || ''}
                          >
                            {item.days_of_autonomy_ai} dias IA
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>--</span>
                        )}
                      </td>

                      {/* Nova Entrada (Green Shopping Cart Button from legacy screenshot!) */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleOpenEntry(item)}
                          className="btn btn-sm"
                          style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.35)',
                            color: '#10b981',
                            padding: '6px 10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-md)',
                            transition: 'all 0.2s',
                          }}
                          title="Registrar Compra / Nova Entrada no Estoque"
                        >
                          <ShoppingCart size={15} />
                          <Plus size={12} />
                        </button>
                      </td>

                      {/* Ações (...) */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <button
                            onClick={() => handleOpenExit(item)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                            title="Registrar Saída / Baixa no Viveiro"
                          >
                            Baixa
                          </button>
                          <button
                            onClick={() => handleOpenHistory(item)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 6px' }}
                            title="Histórico de Movimentações (Kardex)"
                          >
                            <History size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODAL 1: NOVA ENTRADA (COMPRA / NOTA FISCAL / REPOSIÇÃO) */}
      {/* =================================================================== */}
      {isEntryModalOpen && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '8px', borderRadius: 'var(--radius-md)', color: '#10b981' }}>
                  <ShoppingCart size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>
                    Nova Entrada de Estoque
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {selectedItem.name} ({selectedItem.brand})
                  </span>
                </div>
              </div>
              <button onClick={() => setIsEntryModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmEntry} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label className="form-label">Quantidade ({selectedItem.unit}) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={entryQty}
                    onChange={(e) => setEntryQty(parseFloat(e.target.value) || 0)}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label className="form-label">Preço Unitário (R$ / {selectedItem.unit}) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Live Preview of Weighted Average Price (CMP) */}
              <div
                style={{
                  background: 'rgba(14, 165, 233, 0.1)',
                  border: '1px solid rgba(14, 165, 233, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  fontSize: '0.82rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Valor Total da Entrada:</span>
                  <strong style={{ color: '#38bdf8' }}>
                    R$ {(entryQty * entryPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Novo Saldo em Estoque:</span>
                  <strong style={{ color: '#ffffff' }}>
                    {(selectedItem.current_stock_kg + entryQty).toFixed(2)} {selectedItem.unit}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label className="form-label">Fornecedor / Distribuidor</label>
                  <input
                    type="text"
                    placeholder="Ex: Samaria Nutrição Animal"
                    value={entrySupplier}
                    onChange={(e) => setEntrySupplier(e.target.value)}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label className="form-label">Número da NF (Nota Fiscal)</label>
                  <input
                    type="text"
                    placeholder="Ex: NF-004819"
                    value={entryInvoice}
                    onChange={(e) => setEntryInvoice(e.target.value)}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Lote do Fabricante / Observações</label>
                <input
                  type="text"
                  placeholder="Ex: Lote SAM-2026-X8 - Validade 10/2026"
                  value={entryNotes}
                  onChange={(e) => setEntryNotes(e.target.value)}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsEntryModalOpen(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#10b981', borderColor: '#10b981' }}>
                  Confirmar Entrada no Estoque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: REGISTRAR SAÍDA / BAIXA MANUAL OU CONSUMO */}
      {/* =================================================================== */}
      {isExitModalOpen && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(244, 63, 94, 0.2)', padding: '8px', borderRadius: 'var(--radius-md)', color: '#f43f5e' }}>
                  <ArrowDownRight size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>
                    Registrar Baixa / Saída de Insumo
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {selectedItem.name} (Disponível: {selectedItem.current_stock_kg} {selectedItem.unit})
                  </span>
                </div>
              </div>
              <button onClick={() => setIsExitModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmExit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div>
                <label className="form-label">Quantidade de Saída ({selectedItem.unit}) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedItem.current_stock_kg}
                  required
                  value={exitQty}
                  onChange={(e) => setExitQty(parseFloat(e.target.value) || 0)}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="form-label">Motivo da Saída *</label>
                <select value={exitType} onChange={(e) => setExitType(e.target.value)} className="input" style={{ width: '100%' }}>
                  <option value="SAIDA_MANEJO">Arraçoamento / Manejo no Viveiro</option>
                  <option value="SAIDA_AJUSTE">Ajuste de Inventário / Contagem Física</option>
                  <option value="PERDA">Perda por Umidade / Avaria / Vencimento</option>
                </select>
              </div>

              <div>
                <label className="form-label">Observações / Destino</label>
                <input
                  type="text"
                  placeholder="Ex: Aplicado no Berçário B-01"
                  value={exitNotes}
                  onChange={(e) => setExitNotes(e.target.value)}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsExitModalOpen(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-danger">
                  Confirmar Baixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: NOVO PRODUTO */}
      {/* =================================================================== */}
      {isNewProductModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '8px', borderRadius: 'var(--radius-md)', color: '#38bdf8' }}>
                  <Plus size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>
                    Cadastrar Novo Produto no Estoque
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Insumos de Carcinicultura & Aquicultura
                  </span>
                </div>
              </div>
              <button onClick={() => setIsNewProductModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
              <div>
                <label className="form-label">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: RAÇÃO SAMARIA STARTER, DECOSOLO, SMART PACK"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Marca / Fabricante *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Samaria, Deco, Guabi"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label className="form-label">Tipo de Insumo *</label>
                  <select value={newProdType} onChange={(e) => setNewProdType(e.target.value)} className="input" style={{ width: '100%' }}>
                    <option value="Ração">Ração</option>
                    <option value="Fertilizante">Fertilizante</option>
                    <option value="Veículo">Veículo / Aglutinante</option>
                    <option value="Corretivo / Químico">Corretivo / Químico</option>
                    <option value="Probiótico">Probiótico / Biorremediador</option>
                    <option value="Medicamento / Vitamina">Medicamento / Vitamina</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Unidade *</label>
                  <select value={newProdUnit} onChange={(e) => setNewProdUnit(e.target.value)} className="input" style={{ width: '100%' }}>
                    <option value="kg">kg (Quilogramas)</option>
                    <option value="g">g (Gramas)</option>
                    <option value="L">L (Litros)</option>
                    <option value="un">un (Unidades)</option>
                    <option value="sc">sc (Sacos)</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Estoque Inicial</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProdInitialQty}
                    onChange={(e) => setNewProdInitialQty(parseFloat(e.target.value) || 0)}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label className="form-label">Estoque Mínimo *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newProdMinQty}
                    onChange={(e) => setNewProdMinQty(parseFloat(e.target.value) || 0)}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Preço Médio (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(parseFloat(e.target.value) || 0)}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label className="form-label">Localização no Depósito</label>
                  <input
                    type="text"
                    placeholder="Ex: Galpão Principal, Pátio"
                    value={newProdLocation}
                    onChange={(e) => setNewProdLocation(e.target.value)}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsNewProductModalOpen(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: HISTÓRICO DE MOVIMENTAÇÕES (KARDEX) */}
      {/* =================================================================== */}
      {isHistoryModalOpen && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '8px', borderRadius: 'var(--radius-md)', color: '#38bdf8' }}>
                  <History size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>
                    Histórico de Movimentações
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {selectedItem.name} • Saldo Atual: {selectedItem.current_stock_kg} {selectedItem.unit}
                  </span>
                </div>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <div style={{ marginTop: '16px', maxHeight: '380px', overflowY: 'auto' }}>
              {movements.filter((m) => m.item_id === selectedItem.id).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  Nenhuma movimentação registrada para este item ainda.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {movements
                    .filter((m) => m.item_id === selectedItem.id)
                    .map((m) => {
                      const isEntry = m.movement_type === 'ENTRADA';
                      return (
                        <div
                          key={m.id}
                          style={{
                            background: 'rgba(7, 20, 34, 0.6)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-md)',
                            padding: '12px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                background: isEntry ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                                color: isEntry ? '#10b981' : '#f43f5e',
                                padding: '8px',
                                borderRadius: 'var(--radius-md)',
                              }}
                            >
                              {isEntry ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.88rem' }}>
                                {isEntry ? 'Entrada / Compra' : 'Baixa / Manejo'}
                                {m.invoice_number ? ` • ${m.invoice_number}` : ''}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {m.date} {m.supplier_name ? `• ${m.supplier_name}` : ''} {m.notes ? `• ${m.notes}` : ''}
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, color: isEntry ? '#10b981' : '#f43f5e', fontSize: '0.95rem' }}>
                              {isEntry ? '+' : '-'}
                              {m.quantity.toFixed(2)} {selectedItem.unit}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                              R$ {m.total_price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button onClick={() => setIsHistoryModalOpen(false)} className="btn btn-secondary">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 5: MISTURAS & FORMULAÇÕES IA (Feature 10x Melhor do Botão "Misturas") */}
      {/* =================================================================== */}
      {isMixesModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'linear-gradient(135deg, #a855f7, #0ea5e9)', padding: '10px', borderRadius: 'var(--radius-md)', color: '#ffffff' }}>
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0 }}>
                    Misturas & Formulações IA (Blends Nutracêuticos)
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#c084fc' }}>
                    Otimizador nutricional de rações enriquecidas com probióticos, óleos e imunoestimulantes
                  </span>
                </div>
              </div>
              <button onClick={() => setIsMixesModalOpen(false)} className="modal-close-btn">
                <X size={20} />
              </button>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: 'var(--radius-md)', padding: '12px 16px', fontSize: '0.85rem', color: '#e9d5ff' }}>
                💡 <strong>Poder da IA em Misturas:</strong> O ShrimpAI calcula a sinergia entre o grânulo da ração e aditivos (probióticos, melaço, óleo aglutinante Smart Pack e vitamina C), estimando o custo final por kg e o impacto no hepatopâncreas dos camarões.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ color: '#ffffff', fontSize: '0.95rem', margin: 0 }}>
                  Formulações Ativas na Fazenda:
                </h4>

                {mixes.map((mix) => (
                  <div
                    key={mix.id}
                    style={{
                      background: 'rgba(7, 20, 34, 0.7)',
                      border: '1px solid var(--border-card)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>
                        {mix.name}
                      </span>
                      <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.25)', color: '#c084fc' }}>
                        R$ {mix.cost_per_kg.toFixed(2)} / kg
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Destino: <strong>{mix.target_stage}</strong> • Lote de preparo: <strong>{mix.total_weight_kg} kg</strong>
                    </div>

                    {mix.ai_nutritional_summary && (
                      <div style={{ fontSize: '0.78rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.08)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                        ✨ <strong>Parecer IA:</strong> {mix.ai_nutritional_summary}
                      </div>
                    )}

                    {mix.instructions && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <strong>Modo de Preparo:</strong> {mix.instructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button onClick={() => setIsMixesModalOpen(false)} className="btn btn-secondary">
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
