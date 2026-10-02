import React from 'react';
import {
  Scale,
  UtensilsCrossed,
  Droplets,
  HeartPulse,
  TrendingUp,
  Sparkles,
  X,
} from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActionSelect: (action: string) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onActionSelect,
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'ai',
      title: 'Consultar ShrimpAI Copilot',
      desc: 'Tirar dúvidas de aclimatação, estresse de PLs e ecdise com IA',
      icon: Sparkles,
      color: '#c084fc',
      bg: 'rgba(168, 85, 247, 0.18)',
      tab: 'ai',
    },
    {
      id: 'trays',
      title: 'Checar Bandejas (Comedouros)',
      desc: 'Inspecionar sobras e receber recomendação de ajuste de ração',
      icon: UtensilsCrossed,
      color: 'var(--amber-400)',
      bg: 'rgba(245, 158, 11, 0.15)',
      tab: 'feeding',
    },
    {
      id: 'water',
      title: 'Medição da Água & Alcalinidade',
      desc: 'Registrar OD de fundo, Salinidade, pH e Alcalinidade para muda',
      icon: Droplets,
      color: 'var(--aqua-400)',
      bg: 'rgba(14, 165, 233, 0.15)',
      tab: 'water',
    },
    {
      id: 'biometry',
      title: 'Biometria (Tarrafada)',
      desc: 'Lançar peso médio do camarão, intestino cheio e fase de muda',
      icon: Scale,
      color: 'var(--purple-400)',
      bg: 'rgba(168, 85, 247, 0.15)',
      tab: 'batches',
    },
    {
      id: 'mortality',
      title: 'Registrar Baixas / Ocorrências',
      desc: 'Lançar mortandade e causas (casca mole, anóxia, parasitose)',
      icon: HeartPulse,
      color: 'var(--rose-400)',
      bg: 'rgba(244, 63, 94, 0.15)',
      tab: 'mortality',
    },
    {
      id: 'harvest',
      title: 'Registrar Despesca de Camarão',
      desc: 'Despesca por classe comercial (60/70, 50/60) e receita',
      icon: TrendingUp,
      color: 'var(--emerald-400)',
      bg: 'rgba(16, 185, 129, 0.15)',
      tab: 'harvest',
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Manejo Rápido na Beira do Viveiro</h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Selecione a ação para lançamento imediato
            </span>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{ width: 32, height: 32 }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  onActionSelect(act.tab);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(15, 30, 48, 0.8)',
                  border: '1px solid var(--border-card)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = act.color;
                  e.currentTarget.style.background = 'rgba(22, 42, 66, 0.9)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-card)';
                  e.currentTarget.style.background = 'rgba(15, 30, 48, 0.8)';
                }}
              >
                <div style={{
                  background: act.bg,
                  color: act.color,
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={22} />
                </div>
                <div>
                  <strong style={{ display: 'block', color: '#ffffff', fontSize: '0.92rem' }}>
                    {act.title}
                  </strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {act.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
