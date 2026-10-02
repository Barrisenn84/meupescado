import React from 'react';
import {
  RefreshCw,
  Plus,
  Sparkles,
  Home,
  ChevronDown,
  Bell,
  Settings,
  LogOut,
  User,
  BarChart3,
  Mic,
  Camera,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onRefresh: () => void;
  onOpenQuickAction: () => void;
  onOpenVoice: () => void;
  onOpenVision: () => void;
  criticalAlerts: number;
  onNavigateTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onRefresh,
  onOpenQuickAction,
  onOpenVoice,
  onOpenVision,
  criticalAlerts,
  onNavigateTab,
}) => {
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Painel Geral da Fazenda';
      case 'commercial':
        return 'Módulo Comercial, Vendas & Finanças';
      case 'reports':
        return 'Central de Relatórios Inteligentes & DRE/DFC';
      case 'forecast':
        return 'Previsão de Despesca & Projeção Biométrica IA';
      case 'farm':
        return 'Minha Fazenda • João Pessoa / PB';
      case 'inventory':
        return 'Controle de Estoque & Insumos Inteligente';
      case 'ai':
        return '🤖 ShrimpAI Copilot & Suíte de IA';
      case 'ponds':
        return 'Viveiros & Berçários de Pós-Larvas';
      case 'batches':
        return 'Lotes de Camarão & Amostragens';
      case 'feeding':
        return 'Alimentação & Bandejas (Comedouros)';
      case 'water':
        return 'Qualidade da Água & Balanço Iônico (Mg:Ca)';
      case 'mortality':
        return 'Sanidade & Mudas (Ecdise)';
      case 'harvest':
        return 'Despescas & Comercialização';
      case 'whatsapp':
        return 'WhatsApp & IA Zap Comunicação';
      case 'equipment':
        return 'Equipamentos & Eficiência Energética IA';
      case 'fiscal':
        return 'Nota Fiscal & Guia de Trânsito Animal (GTA)';
      default:
        return 'Meu Pescado • Carcinicultura & IA';
    }
  };

  return (
    <header
      className="glass-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 800,
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-card)',
        background: 'rgba(7, 20, 34, 0.95)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Left: Brand + Farm Switcher (as in screenshot 1, 4, 5) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          onClick={() => onNavigateTab('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(14, 165, 233, 0.1)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            cursor: 'pointer',
          }}
        >
          <img src="/icon.svg" alt="Meu Pescado" style={{ width: 28, height: 28 }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.05rem',
                background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1,
              }}
            >
              MEU PESCADO
            </span>
            <span style={{ fontSize: '0.62rem', color: '#c084fc', fontWeight: 700, letterSpacing: '0.06em' }}>
              CARCINICULTURA & IA
            </span>
          </div>
        </div>

        {/* Farm Switcher & Analisar Fazendas (Replicating Screenshot Header) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(15, 30, 48, 0.7)',
              border: '1px solid var(--border-subtle)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.84rem',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <Home size={15} color="#38bdf8" />
            <span style={{ fontWeight: 600 }}>River Life (Área Fazenda)</span>
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>

          <button
            onClick={() => onNavigateTab('dashboard')}
            className="btn btn-secondary btn-sm"
            style={{
              fontSize: '0.78rem',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <BarChart3 size={14} color="#38bdf8" />
            <span>Analisar fazendas</span>
          </button>
        </div>

        <div style={{ borderLeft: '1px solid var(--border-card)', paddingLeft: '14px' }}>
          <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {getTabTitle(activeTab)}
          </span>
        </div>
      </div>

      {/* Right: User Profile Collermhann, Alerts & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Botão de Voz IA (Controle Total por Voz) */}
        <button
          onClick={onOpenVoice}
          className="btn btn-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(236, 72, 153, 0.2))',
            border: '1px solid rgba(168, 85, 247, 0.6)',
            color: '#f3e8ff',
            padding: '6px 12px',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 0 16px rgba(168, 85, 247, 0.3)',
            cursor: 'pointer',
          }}
          title="Falar com Dr. Camarão e interagir com todo o sistema por voz"
        >
          <Mic size={16} color="#c084fc" />
          <span>Voz IA</span>
          <span
            style={{
              fontSize: '0.62rem',
              background: '#9333ea',
              color: '#ffffff',
              padding: '1px 5px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 800,
              letterSpacing: '0.04em',
            }}
          >
            AO VIVO
          </span>
        </button>

        {/* Botão de Foto & Visão Computacional (Smartphone & Upload) */}
        <button
          onClick={onOpenVision}
          className="btn btn-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(16, 185, 129, 0.2))',
            border: '1px solid rgba(6, 182, 212, 0.6)',
            color: '#ecfeff',
            padding: '6px 12px',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 0 16px rgba(6, 182, 212, 0.3)',
            cursor: 'pointer',
          }}
          title="Fotografar comedouro, camarão, água ou nota fiscal com alta precisão"
        >
          <Camera size={16} color="#38bdf8" />
          <span>Fotografar / Foto IA</span>
          <span
            style={{
              fontSize: '0.62rem',
              background: '#0891b2',
              color: '#ffffff',
              padding: '1px 5px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 800,
              letterSpacing: '0.04em',
            }}
          >
            PRECISÃO 98%
          </span>
        </button>

        <button
          onClick={() => onNavigateTab('ai')}
          className="btn btn-secondary btn-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(14, 165, 233, 0.15))',
            borderColor: 'rgba(168, 85, 247, 0.4)',
            color: '#e9d5ff',
          }}
        >
          <Sparkles size={16} color="#c084fc" />
          <span>ShrimpAI Copilot</span>
        </button>

        {criticalAlerts > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(244, 63, 94, 0.18)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: 'var(--rose-400)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <span className="pulse-dot critico" />
            <span>
              {criticalAlerts} Alerta{criticalAlerts > 1 ? 's' : ''}
            </span>
          </div>
        )}

        <button onClick={onRefresh} className="btn btn-secondary btn-icon" title="Atualizar dados">
          <RefreshCw size={17} />
        </button>

        <button
          onClick={onOpenQuickAction}
          className="btn btn-primary"
          style={{ padding: '7px 14px', fontSize: '0.85rem' }}
        >
          <Plus size={17} />
          <span>Manejo Rápido</span>
        </button>

        {/* User Profile Collermhann (Exact match to Screenshots 1-5) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginLeft: '6px',
            paddingLeft: '12px',
            borderLeft: '1px solid var(--border-card)',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            C
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>
              Collermhann
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              River Life (Área Fazenda)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px' }}>
            <button className="btn btn-secondary btn-sm" style={{ padding: '6px', borderRadius: '50%' }} title="Notificações">
              <Bell size={15} />
            </button>
            <button className="btn btn-secondary btn-sm" style={{ padding: '6px', borderRadius: '50%' }} title="Configurações">
              <Settings size={15} />
            </button>
            <button className="btn btn-secondary btn-sm" style={{ padding: '6px', borderRadius: '50%' }} title="Sair">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
