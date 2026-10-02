import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  Zap,
  ArrowRight,
  PlusCircle,
  Utensils,
  Droplets,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { AIImageAnalysisResponse, Pond } from '../types';

interface VisionAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  ponds: Pond[];
  onNavigateTab: (tab: string) => void;
  onRefreshData?: () => void;
}

type AnalysisMode = 'tray_feeding' | 'shrimp_health' | 'water_quality' | 'invoice_ocr' | 'general_diagnosis';

export const VisionAnalysisModal: React.FC<VisionAnalysisModalProps> = ({
  isOpen,
  onClose,
  ponds,
  onNavigateTab,
  onRefreshData,
}) => {
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>('tray_feeding');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedPondId, setSelectedPondId] = useState<number | undefined>(ponds[0]?.id);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AIImageAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inventorySaved, setInventorySaved] = useState<boolean>(false);

  const fileInputCameraRef = useRef<HTMLInputElement>(null);
  const fileInputUploadRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido (JPEG, PNG ou WEBP).');
      return;
    }

    setError(null);
    setResult(null);
    setInventorySaved(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      setImagePreview(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imagePreview) {
      setError('Tire uma foto ou selecione uma imagem para analisar.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const res = await api.analyzeCarcinicultureImage({
        image_base64: imagePreview,
        analysis_mode: selectedMode,
        pond_id: selectedPondId,
        custom_prompt: customPrompt.trim() || undefined,
      });

      setResult(res);
    } catch (err: any) {
      console.error('Erro na análise de imagem:', err);
      setError(err.message || 'Falha ao analisar a imagem. Tente novamente com outra foto.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setResult(null);
    setError(null);
    setCustomPrompt('');
    setInventorySaved(false);
  };

  const handleSaveToInventoryFromOCR = async () => {
    if (!result?.extracted_data) return;
    try {
      setLoading(true);
      const d = result.extracted_data;
      await api.createInventoryItem({
        name: d.name || 'Insumo Identificado por Foto',
        brand: d.brand || 'Fabricante Identificado',
        item_type: d.item_type || 'Ração',
        unit: d.unit || 'kg',
        current_stock_kg: Number(d.current_stock_kg || 100),
        min_stock_alert_kg: Number(d.min_stock_alert_kg || 150),
        cost_per_kg: Number(d.cost_per_kg || 10.0),
        last_entry_price: Number(d.cost_per_kg || 10.0),
        location: 'Galpão Principal',
        notes: `Importado via Foto/OCR em ${new Date().toLocaleDateString('pt-BR')}.`,
      });
      setInventorySaved(true);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar insumo no estoque');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(6, 182, 212, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.12), rgba(16, 185, 129, 0.08))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, #06b6d4, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)',
              }}
            >
              <Camera size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Fotografia & Visão Computacional IA
                </h3>
                <span
                  style={{
                    background: 'rgba(6, 182, 212, 0.2)',
                    border: '1px solid rgba(6, 182, 212, 0.4)',
                    color: '#67e8f9',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    textTransform: 'uppercase',
                  }}
                >
                  Gemini Vision 360°
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Fotografe com o smartphone ou envie imagens para inspeção zootécnica de alta precisão
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{ borderRadius: '50%', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Mode Selector Tabs */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
              Selecione o Objetivo da Análise Visual:
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '10px',
              }}
            >
              {[
                {
                  id: 'tray_feeding',
                  label: 'Bandeja de Ração',
                  icon: Utensils,
                  desc: 'Mede % de sobra e ajuste de trato',
                  color: '#38bdf8',
                },
                {
                  id: 'shrimp_health',
                  label: 'Saúde do Camarão',
                  icon: Activity,
                  desc: 'Hepatopâncreas, trato e mudas',
                  color: '#c084fc',
                },
                {
                  id: 'water_quality',
                  label: 'Qualidade da Água',
                  icon: Droplets,
                  desc: 'Fita colorimétrica e disco Secchi',
                  color: '#34d399',
                },
                {
                  id: 'invoice_ocr',
                  label: 'Nota Fiscal / Insumo',
                  icon: FileText,
                  desc: 'OCR para entrada no estoque',
                  color: '#fbbf24',
                },
                {
                  id: 'general_diagnosis',
                  label: 'Diagnóstico Geral',
                  icon: Sparkles,
                  desc: 'Aeradores, encanamento e viveiros',
                  color: '#f43f5e',
                },
              ].map((m) => {
                const isSelected = selectedMode === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMode(m.id as AnalysisMode);
                      setResult(null);
                    }}
                    type="button"
                    style={{
                      background: isSelected ? 'rgba(14, 165, 233, 0.15)' : 'rgba(15, 30, 48, 0.5)',
                      border: `1px solid ${isSelected ? m.color : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-lg)',
                      padding: '12px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? `0 0 16px ${m.color}33` : 'none',
                    }}
                  >
                    <Icon size={20} color={isSelected ? m.color : 'var(--text-muted)'} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? '#ffffff' : 'var(--text-secondary)' }}>
                      {m.label}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>
                      {m.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo Capture / Upload Area */}
          <div style={{ display: 'grid', gridTemplateColumns: imagePreview ? '1fr 1fr' : '1fr', gap: '20px' }}>
            {/* Action Buttons to Capture */}
            <div
              style={{
                border: '2px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                textAlign: 'center',
                background: 'rgba(15, 23, 42, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
              }}
            >
              {/* Hidden inputs */}
              <input
                ref={fileInputCameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <input
                ref={fileInputUploadRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                }}
              >
                <Camera size={28} color="#38bdf8" />
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', margin: '0 0 4px 0' }}>
                  Fotografar ou Enviar Imagem
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, maxWidth: 360 }}>
                  Utilize a câmera do celular diretamente na fazenda ou faça upload de uma foto da galeria.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => fileInputCameraRef.current?.click()}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                    padding: '10px 18px',
                    fontSize: '0.88rem',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)',
                  }}
                >
                  <Camera size={18} />
                  <span>Fotografar com Celular</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputUploadRef.current?.click()}
                  className="btn btn-secondary"
                  style={{ padding: '10px 18px', fontSize: '0.88rem', gap: '8px' }}
                >
                  <Upload size={18} />
                  <span>Subir da Galeria</span>
                </button>
              </div>
            </div>

            {/* Preview Box if Image Selected */}
            {imagePreview && (
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <img
                  src={imagePreview}
                  alt="Pré-visualização"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '260px',
                    borderRadius: 'var(--radius-lg)',
                    objectFit: 'contain',
                    border: '1px solid var(--border-subtle)',
                  }}
                />
                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, gap: '6px' }}
                  >
                    <RotateCcw size={14} />
                    <span>Trocar Foto</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Context Controls (Pond and Prompt) */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 18px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
            }}
          >
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                Viveiro Relacionado (Opcional):
              </label>
              <select
                value={selectedPondId || ''}
                onChange={(e) => setSelectedPondId(Number(e.target.value) || undefined)}
                className="input-field"
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                <option value="">Fazenda Geral (Sem viveiro específico)</option>
                {ponds.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.surface_area_m2.toLocaleString()} m²)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                Dúvida ou Observação Específica (Opcional):
              </label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ex: Foto tirada às 11:30h após o 2º trato..."
                className="input-field"
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Action Trigger Button */}
          {imagePreview && !result && (
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #0284c7, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 8px 24px rgba(6, 182, 212, 0.4)',
              }}
            >
              {loading ? (
                <>
                  <div className="spinner-border spinner-border-sm" role="status" />
                  <span>Dr. Camarão está inspecionando a fotografia com Gemini Vision...</span>
                </>
              ) : (
                <>
                  <Zap size={20} />
                  <span>Analisar Foto com Precisão Máxima IA</span>
                </>
              )}
            </button>
          )}

          {/* Error Banner */}
          {error && (
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                color: 'var(--rose-400)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <AlertTriangle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* AI Result Card */}
          {result && (
            <div
              style={{
                background: 'rgba(15, 30, 48, 0.7)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: 'var(--radius-xl)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                animation: 'fadeIn 0.3s ease-in',
              }}
            >
              {/* Result Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px 0' }}>
                    {result.title}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        background:
                          result.zootecnic_status === 'IDEAL'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : result.zootecnic_status === 'ATENCAO'
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(244, 63, 94, 0.2)',
                        border: `1px solid ${
                          result.zootecnic_status === 'IDEAL'
                            ? 'var(--emerald-500)'
                            : result.zootecnic_status === 'ATENCAO'
                            ? 'var(--amber-500)'
                            : 'var(--rose-500)'
                        }`,
                        color:
                          result.zootecnic_status === 'IDEAL'
                            ? 'var(--emerald-400)'
                            : result.zootecnic_status === 'ATENCAO'
                            ? 'var(--amber-400)'
                            : 'var(--rose-400)',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 10px',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      Status: {result.zootecnic_status}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#67e8f9', fontWeight: 700 }}>
                      ⚡ {result.confidence_score}% de Confiança Zootécnica
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '6px' }}
                >
                  <RotateCcw size={14} />
                  <span>Nova Foto</span>
                </button>
              </div>

              {/* Summary */}
              <div
                style={{
                  background: 'rgba(6, 182, 212, 0.08)',
                  borderLeft: '4px solid #06b6d4',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  color: '#e2e8f0',
                  lineHeight: 1.5,
                }}
              >
                {result.summary}
              </div>

              {/* Grid: Detected Items + Action Plan */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {/* Detected Items */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <CheckCircle2 size={16} color="#34d399" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                      Evidências Observadas na Foto:
                    </span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {result.detected_items.map((it, idx) => (
                      <li key={idx}>{it}</li>
                    ))}
                  </ul>
                </div>

                {/* Action Plan */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.4)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Zap size={16} color="#fbbf24" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                      Plano de Conduta Recomendado:
                    </span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {result.action_plan.map((act, idx) => (
                      <li key={idx}>{act}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 1-Click System Integrations */}
              <div
                style={{
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', display: 'block' }}>
                    Ação Integrada ao Sistema
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {selectedMode === 'invoice_ocr'
                      ? 'Deseja cadastrar automaticamente este insumo no módulo de estoque?'
                      : selectedMode === 'tray_feeding'
                      ? 'Deseja registrar o manejo de comedouros para este viveiro?'
                      : 'Deseja aprofundar a conversa com o Dr. Camarão no Copilot?'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {selectedMode === 'invoice_ocr' && (
                    <button
                      type="button"
                      disabled={inventorySaved || loading}
                      onClick={handleSaveToInventoryFromOCR}
                      className="btn btn-primary btn-sm"
                      style={{
                        background: inventorySaved ? 'var(--emerald-600)' : 'linear-gradient(135deg, #10b981, #059669)',
                        gap: '6px',
                      }}
                    >
                      {inventorySaved ? <CheckCircle2 size={16} /> : <PlusCircle size={16} />}
                      <span>{inventorySaved ? 'Insumo Salvo no Estoque!' : 'Lançar no Estoque Agora'}</span>
                    </button>
                  )}

                  {selectedMode === 'tray_feeding' && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateTab('feeding');
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ gap: '6px' }}
                    >
                      <Utensils size={16} />
                      <span>Ir para Bandejas & Arraçoamento</span>
                    </button>
                  )}

                  {selectedMode === 'water_quality' && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateTab('water');
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ gap: '6px' }}
                    >
                      <Droplets size={16} />
                      <span>Ver Qualidade da Água</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateTab('ai');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '6px' }}
                  >
                    <Sparkles size={16} color="#c084fc" />
                    <span>Perguntar ao Dr. Camarão</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
