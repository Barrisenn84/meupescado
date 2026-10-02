import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Command,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Compass,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenQuickAction: () => void;
  onOpenNewBatch: () => void;
  onOpenVision: () => void;
  onRefresh: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenQuickAction,
  onOpenNewBatch,
  onOpenVision,
  onRefresh,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [lastFeedback, setLastFeedback] = useState<string>('Clique no microfone ou fale seu comando...');
  const [isAnswering, setIsAnswering] = useState<boolean>(false);
  const [audioFeedbackEnabled, setAudioFeedbackEnabled] = useState<boolean>(true);
  const [executedAction, setExecutedAction] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Text-To-Speech (Dr. Camarão speaking)
  const speakText = (text: string) => {
    if (!audioFeedbackEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Clean markdown tags for natural speech
      const clean = text
        .replace(/[*_#`~>]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .slice(0, 240); // Concise spoken response

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
    }
  };

  // Initialize SpeechRecognition
  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setLastFeedback('Reconhecimento de voz não suportado neste navegador. Use o Google Chrome ou Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setLastFeedback('Dr. Camarão está ouvindo... Fale com clareza perto do microfone.');
    };

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);

      // If final phrase received, process command
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        processVoiceCommand(currentTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setLastFeedback('Permissão de microfone negada. Autorize o microfone no navegador.');
      } else {
        setLastFeedback(`Erro no microfone (${event.error}). Clique para tentar novamente.`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Auto-start listening on modal open
    try {
      recognition.start();
    } catch (_) {}

    return () => {
      try {
        recognition.stop();
        window.speechSynthesis?.cancel();
      } catch (_) {}
    };
  }, [isOpen]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setLastFeedback('Microfone pausado.');
    } else {
      setTranscript('');
      setExecutedAction(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Natural Language Voice Command Processor
  const processVoiceCommand = async (phrase: string) => {
    const p = phrase.toLowerCase().trim();
    if (!p) return;

    setExecutedAction(null);

    // 1. Navigation commands
    if (p.includes('estoque') || p.includes('insumo') || p.includes('produtos')) {
      onNavigateTab('inventory');
      const msg = 'Abrindo Controle de Estoque e Insumos.';
      setLastFeedback(msg);
      setExecutedAction('inventory');
      speakText(msg);
      return;
    }

    if (p.includes('viveiro') || p.includes('tanque') || p.includes('berçário') || p.includes('bercario')) {
      onNavigateTab('ponds');
      const msg = 'Navegando para Viveiros e Berçários.';
      setLastFeedback(msg);
      setExecutedAction('ponds');
      speakText(msg);
      return;
    }

    if (p.includes('lote') || p.includes('povoamento') || p.includes('povoar')) {
      onNavigateTab('batches');
      const msg = 'Abrindo Lotes de Camarão ativos.';
      setLastFeedback(msg);
      setExecutedAction('batches');
      speakText(msg);
      return;
    }

    if (p.includes('alimentação') || p.includes('alimentacao') || p.includes('ração') || p.includes('racao') || p.includes('bandeja') || p.includes('comedouro')) {
      onNavigateTab('feeding');
      const msg = 'Exibindo Manejo de Bandejas e Arraçoamento.';
      setLastFeedback(msg);
      setExecutedAction('feeding');
      speakText(msg);
      return;
    }

    if (p.includes('água') || p.includes('agua') || p.includes('oxigênio') || p.includes('oxigenio') || p.includes('salinidade') || p.includes('alcalinidade')) {
      onNavigateTab('water');
      const msg = 'Mostrando Parâmetros de Qualidade da Água e Balanço Iônico.';
      setLastFeedback(msg);
      setExecutedAction('water');
      speakText(msg);
      return;
    }

    if (p.includes('mortalidade') || p.includes('muda') || p.includes('ecdise') || p.includes('sanidade')) {
      onNavigateTab('mortality');
      const msg = 'Abrindo registros de Sanidade e Ciclo de Mudas.';
      setLastFeedback(msg);
      setExecutedAction('mortality');
      speakText(msg);
      return;
    }

    if (p.includes('despesca') || p.includes('venda') || p.includes('colheita')) {
      onNavigateTab('harvest');
      const msg = 'Navegando para Módulo de Despescas e Vendas.';
      setLastFeedback(msg);
      setExecutedAction('harvest');
      speakText(msg);
      return;
    }

    if (p.includes('comercial') || p.includes('financeiro') || p.includes('caixa') || p.includes('faturamento')) {
      onNavigateTab('commercial');
      const msg = 'Abrindo Gestão Comercial, Vendas e Fluxo de Caixa.';
      setLastFeedback(msg);
      setExecutedAction('commercial');
      speakText(msg);
      return;
    }

    if (p.includes('relatório') || p.includes('relatorio') || p.includes('dre') || p.includes('dfc')) {
      onNavigateTab('reports');
      const msg = 'Abrindo Central de Relatórios e DRE da Fazenda.';
      setLastFeedback(msg);
      setExecutedAction('reports');
      speakText(msg);
      return;
    }

    if (p.includes('previsão') || p.includes('previsao') || p.includes('projeção') || p.includes('projecao')) {
      onNavigateTab('forecast');
      const msg = 'Abrindo Previsão de Despesca e Simulação Biométrica.';
      setLastFeedback(msg);
      setExecutedAction('forecast');
      speakText(msg);
      return;
    }

    if (p.includes('minha fazenda') || p.includes('fazenda') || p.includes('clima') || p.includes('perfil')) {
      onNavigateTab('farm');
      const msg = 'Abrindo Minha Fazenda, Clima e Indicadores Oficiais.';
      setLastFeedback(msg);
      setExecutedAction('farm');
      speakText(msg);
      return;
    }

    if (p.includes('whatsapp') || p.includes('zap') || p.includes('mensagem')) {
      onNavigateTab('whatsapp');
      const msg = 'Abrindo Central WhatsApp e Robô IA Zap.';
      setLastFeedback(msg);
      setExecutedAction('whatsapp');
      speakText(msg);
      return;
    }

    if (p.includes('equipamento') || p.includes('aerador') || p.includes('energia')) {
      onNavigateTab('equipment');
      const msg = 'Abrindo Parque de Equipamentos e Eficiência Energética.';
      setLastFeedback(msg);
      setExecutedAction('equipment');
      speakText(msg);
      return;
    }

    if (p.includes('fiscal') || p.includes('nota fiscal') || p.includes('gta')) {
      onNavigateTab('fiscal');
      const msg = 'Abrindo Notas Fiscais e Emissão de GTA.';
      setLastFeedback(msg);
      setExecutedAction('fiscal');
      speakText(msg);
      return;
    }

    if (p.includes('painel') || p.includes('dashboard') || p.includes('início') || p.includes('inicio')) {
      onNavigateTab('dashboard');
      const msg = 'Retornando ao Painel Geral da Fazenda.';
      setLastFeedback(msg);
      setExecutedAction('dashboard');
      speakText(msg);
      return;
    }

    // 2. Action Triggers
    if (p.includes('novo manejo') || p.includes('manejo rápido') || p.includes('manejo rapido')) {
      onClose();
      onOpenQuickAction();
      speakText('Abrindo modal de manejo rápido.');
      return;
    }

    if (p.includes('novo lote') || p.includes('cadastrar lote') || p.includes('estocar')) {
      onClose();
      onOpenNewBatch();
      speakText('Abrindo cadastro de novo lote de pós-larvas.');
      return;
    }

    if (p.includes('tirar foto') || p.includes('fotografar') || p.includes('câmera') || p.includes('camera') || p.includes('foto')) {
      onClose();
      onOpenVision();
      speakText('Abrindo scanner fotográfico de Visão Computacional.');
      return;
    }

    if (p.includes('atualizar') || p.includes('recarregar') || p.includes('sincronizar')) {
      onRefresh();
      const msg = 'Dados da fazenda atualizados com sucesso.';
      setLastFeedback(msg);
      speakText(msg);
      return;
    }

    // 3. Fallback: Ask Dr. Camarão (ShrimpAI Copilot)
    try {
      setIsAnswering(true);
      setLastFeedback('Consultando Dr. Camarão via Gemini...');
      const res = await api.askAICopilot(phrase);
      setLastFeedback(res.answer);
      speakText(res.answer);
    } catch (err: any) {
      const errMsg = 'Comando registrado. Diga o que deseja fazer ou pergunte ao Dr. Camarão.';
      setLastFeedback(errMsg);
    } finally {
      setIsAnswering(false);
    }
  };

  if (!isOpen) return null;

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
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          background: 'var(--bg-secondary)',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(168, 85, 247, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
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
            background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.15), rgba(14, 165, 233, 0.1))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, #a855f7, #38bdf8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)',
              }}
            >
              <Mic size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Controle por Voz IA • Dr. Camarão
                </h3>
                <span
                  style={{
                    background: 'rgba(168, 85, 247, 0.2)',
                    border: '1px solid rgba(168, 85, 247, 0.5)',
                    color: '#e9d5ff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  LIVE AUDIO
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Fale qualquer comando para navegar, consultar parâmetros ou tirar dúvidas da fazenda
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setAudioFeedbackEnabled(!audioFeedbackEnabled)}
              className="btn btn-secondary btn-icon"
              style={{ borderRadius: '50%', padding: '6px' }}
              title={audioFeedbackEnabled ? 'Desativar Resposta por Áudio' : 'Ativar Resposta por Áudio'}
            >
              {audioFeedbackEnabled ? <Volume2 size={18} color="#38bdf8" /> : <VolumeX size={18} color="var(--text-muted)" />}
            </button>

            <button
              onClick={onClose}
              className="btn btn-secondary btn-icon"
              style={{ borderRadius: '50%', padding: '6px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Visualizer & Mic Center */}
        <div
          style={{
            padding: '32px 24px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '18px',
          }}
        >
          {/* Animated Glowing Mic Circle */}
          <div style={{ position: 'relative' }}>
            {isListening && (
              <div
                style={{
                  position: 'absolute',
                  inset: -14,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(56, 189, 248, 0) 70%)',
                  animation: 'pulse 1.4s infinite ease-in-out',
                }}
              />
            )}
            <button
              type="button"
              onClick={toggleListening}
              style={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                background: isListening
                  ? 'linear-gradient(135deg, #a855f7, #ec4899)'
                  : 'linear-gradient(135deg, #1e293b, #334155)',
                border: `3px solid ${isListening ? '#ffffff' : 'var(--border-subtle)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: isListening
                  ? '0 0 30px rgba(168, 85, 247, 0.6)'
                  : '0 4px 12px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s',
                zIndex: 2,
              }}
            >
              {isListening ? (
                <Mic size={38} color="#ffffff" />
              ) : (
                <MicOff size={38} color="var(--text-muted)" />
              )}
            </button>
          </div>

          <span
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: isListening ? '#c084fc' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isListening ? (
              <>
                <span className="pulse-dot" style={{ background: '#c084fc' }} />
                <span>Ouvindo em tempo real... Toque no microfone para pausar</span>
              </>
            ) : (
              <span>Toque no botão para ativar o microfone</span>
            )}
          </span>

          {/* Transcript Display */}
          <div
            style={{
              width: '100%',
              minHeight: '64px',
              maxHeight: '100px',
              overflowY: 'auto',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 16px',
              fontSize: '1rem',
              color: transcript ? '#ffffff' : 'var(--text-muted)',
              fontStyle: transcript ? 'normal' : 'italic',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {transcript || 'Aguardando sua fala (ex: "Abrir Estoque", "Como está a água?")...'}
          </div>

          {/* Assistant Feedback Box */}
          <div
            style={{
              width: '100%',
              background: isAnswering
                ? 'rgba(14, 165, 233, 0.1)'
                : executedAction
                ? 'rgba(16, 185, 129, 0.1)'
                : 'rgba(168, 85, 247, 0.08)',
              border: `1px solid ${
                isAnswering
                  ? 'rgba(14, 165, 233, 0.3)'
                  : executedAction
                  ? 'rgba(16, 185, 129, 0.3)'
                  : 'rgba(168, 85, 247, 0.25)'
              }`,
              borderRadius: 'var(--radius-lg)',
              padding: '14px 18px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#c084fc" />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#e9d5ff', textTransform: 'uppercase' }}>
                Resposta do Dr. Camarão:
              </span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#f1f5f9', lineHeight: 1.5, maxHeight: 180, overflowY: 'auto' }}>
              {lastFeedback}
            </div>
          </div>

          {/* Quick Voice Chips */}
          <div style={{ width: '100%', textAlign: 'left' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>
              Exemplos de Comandos Rápidos que você pode falar:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                'Abrir Estoque',
                'Ver Qualidade da Água',
                'Alimentação e Bandejas',
                'Fotografar Comedouro',
                'Comercial e Finanças',
                'Manejo Rápido',
                'Como calcular calagem?',
                'Qual o oxigênio ideal?',
              ].map((cmd, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTranscript(cmd);
                    processVoiceCommand(cmd);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(15, 30, 48, 0.6)',
                  }}
                >
                  <span>🗣️ "{cmd}"</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
