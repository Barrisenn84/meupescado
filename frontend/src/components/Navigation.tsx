import React, { useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  Sparkles,
  UtensilsCrossed,
  Droplets,
  HeartPulse,
  TrendingUp,
  Package,
  Calendar,
  MessageSquare,
  Receipt,
  Wrench,
  Menu,
  X,
  DollarSign,
  BarChart3,
  CalendarClock,
  Home,
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  criticalWaterCount?: number;
  criticalAlkalinityCount?: number;
  lowFeedCount?: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  isAI?: boolean;
  badge?: number;
  badgeCrit?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  criticalWaterCount = 0,
  criticalAlkalinityCount = 0,
  lowFeedCount = 0,
}) => {
  const [showAllModules, setShowAllModules] = useState(false);
  const totalWaterAlerts = criticalWaterCount + criticalAlkalinityCount;

  const navSections: NavSection[] = [
    {
      title: 'Principal & IA',
      items: [
        { id: 'dashboard', label: 'Painel Inicial', icon: LayoutDashboard },
        { id: 'ai', label: 'ShrimpAI Copilot', icon: Sparkles, isAI: true },
        { id: 'whatsapp', label: 'WhatsApp & IA Zap', icon: MessageSquare },
      ],
    },
    {
      title: 'Comercial & Inteligência',
      items: [
        { id: 'commercial', label: 'Comercial & Finanças', icon: DollarSign },
        { id: 'reports', label: 'Relatórios Inteligentes', icon: BarChart3 },
        { id: 'forecast', label: 'Previsão de Despesca', icon: CalendarClock },
      ],
    },
    {
      title: 'Manejos & Rotinas',
      items: [
        {
          id: 'feeding',
          label: 'Nutrição & Bandejas',
          icon: UtensilsCrossed,
        },
        {
          id: 'water',
          label: 'Análise de Água',
          icon: Droplets,
          badge: totalWaterAlerts > 0 ? totalWaterAlerts : undefined,
          badgeCrit: true,
        },
        {
          id: 'mortality',
          label: 'Mortalidade & Mudas',
          icon: HeartPulse,
        },
        {
          id: 'harvest',
          label: 'Despesca & Vendas',
          icon: Calendar,
        },
      ],
    },
    {
      title: 'Operações & Fazenda PB',
      items: [
        {
          id: 'farm',
          label: 'Minha Fazenda (JP/PB)',
          icon: Home,
        },
        {
          id: 'inventory',
          label: 'Controle de Estoque',
          icon: Package,
          badge: lowFeedCount > 0 ? lowFeedCount : undefined,
          badgeCrit: false,
        },
        {
          id: 'ponds',
          label: 'Tanques & Viveiros',
          icon: Layers,
        },
        {
          id: 'batches',
          label: 'Lotes de Cultivo',
          icon: TrendingUp,
        },
        {
          id: 'equipment',
          label: 'Equipamentos & Motores',
          icon: Wrench,
        },
        {
          id: 'fiscal',
          label: 'Nota Fiscal & GTA',
          icon: Receipt,
        },
      ],
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="desktop-sidebar"
        style={{
          width: 260,
          minWidth: 260,
          background: 'rgba(7, 20, 34, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--border-card)',
          minHeight: 'calc(100vh - 65px)',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {navSections.map((sec, secIdx) => (
          <div key={sec.title} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              style={{
                padding: '0 12px 6px',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {sec.title}
            </div>

            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: isActive
                      ? item.isAI
                        ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(14, 165, 233, 0.2))'
                        : 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(2, 132, 199, 0.12))'
                      : item.isAI
                      ? 'rgba(168, 85, 247, 0.08)'
                      : 'transparent',
                    border: isActive
                      ? item.isAI
                        ? '1px solid rgba(168, 85, 247, 0.45)'
                        : '1px solid rgba(56, 189, 248, 0.3)'
                      : item.isAI
                      ? '1px solid rgba(168, 85, 247, 0.2)'
                      : '1px solid transparent',
                    color: isActive
                      ? item.isAI
                        ? '#c084fc'
                        : 'var(--aqua-300)'
                      : item.isAI
                      ? '#e9d5ff'
                      : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon
                      size={18}
                      color={
                        isActive
                          ? item.isAI
                            ? '#c084fc'
                            : '#38bdf8'
                          : item.isAI
                          ? '#a855f7'
                          : '#94a3b8'
                      }
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      style={{
                        background: item.badgeCrit ? 'rgba(244, 63, 94, 0.25)' : 'rgba(245, 158, 11, 0.25)',
                        color: item.badgeCrit ? '#fb7185' : '#fbbf24',
                        border: `1px solid ${item.badgeCrit ? 'rgba(244, 63, 94, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        <div
          style={{
            marginTop: 'auto',
            padding: '14px 12px',
            background: 'rgba(15, 30, 48, 0.6)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            River Life • Carcinicultura
          </div>
          <div style={{ fontSize: '0.72rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot ideal" /> Litopenaeus vannamei • IA Ativa
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-nav-bar">
        {[
          { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
          { id: 'inventory', label: 'Estoque', icon: Package },
          { id: 'ai', label: 'IA Copilot', icon: Sparkles, isAI: true },
          { id: 'feeding', label: 'Manejos', icon: UtensilsCrossed },
          { id: 'water', label: 'Água', icon: Droplets },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id && !showAllModules;
          return (
            <button
              key={item.id}
              onClick={() => {
                setShowAllModules(false);
                setActiveTab(item.id);
              }}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} color={item.isAI ? '#c084fc' : undefined} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Button to open all 12 modules on mobile */}
        <button
          onClick={() => setShowAllModules(!showAllModules)}
          className={`mobile-nav-item ${showAllModules ? 'active' : ''}`}
          style={{
            background: showAllModules ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
            color: showAllModules ? 'var(--aqua-300)' : 'var(--text-secondary)',
          }}
        >
          {showAllModules ? <X size={20} color="#38bdf8" /> : <Menu size={20} color="#38bdf8" />}
          <span>{showAllModules ? 'Fechar' : 'Módulos'}</span>
        </button>
      </nav>

      {/* Mobile All Modules Modal / Drawer */}
      {showAllModules && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 890,
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
          onClick={() => setShowAllModules(false)}
        >
          <div
            style={{
              background: 'rgba(10, 25, 45, 0.98)',
              borderTop: '1px solid var(--border-card)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '20px 16px 85px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>Todos os Módulos</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manejo completo da carcinicultura</span>
              </div>
              <button
                onClick={() => setShowAllModules(false)}
                className="btn btn-secondary btn-icon"
                style={{ borderRadius: '50%', width: 36, height: 36 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {navSections.flatMap((sec) => sec.items).map((item) => {
                const Icon = item.icon;
                const isCurrent = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowAllModules(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: isCurrent
                        ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.25), rgba(2, 132, 199, 0.15))'
                        : 'rgba(255, 255, 255, 0.04)',
                      border: isCurrent
                        ? '1px solid rgba(56, 189, 248, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.07)',
                      color: isCurrent ? 'var(--aqua-300)' : 'var(--text-primary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: isCurrent ? 700 : 500,
                    }}
                  >
                    <Icon size={18} color={item.isAI ? '#c084fc' : isCurrent ? '#38bdf8' : '#94a3b8'} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
