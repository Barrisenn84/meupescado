import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Phone,
  CheckCircle2,
  Bell,
  Sparkles,
  Bot,
  RefreshCw,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Check,
  CheckCheck,
  Smartphone,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { WhatsAppAlertConfig, WhatsAppMessageLog } from '../types';
import { api } from '../services/api';

export const WhatsAppView: React.FC = () => {
  const [config, setConfig] = useState<WhatsAppAlertConfig>({
    user_name: 'Collermhann',
    phone_number: '(84) 9 8858-5211',
    notify_despesca: true,
    notify_sync: true,
    notify_water_critical: true,
    notify_low_stock: true,
    notify_daily_ai_summary: true,
    auto_ai_agent_enabled: true,
  });

  const [messages, setMessages] = useState<WhatsAppMessageLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testingType, setTestingType] = useState<string | null>(null);

  // Bot chat simulator
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: 'Olá, Collermhann! Sou o assistente de IA da fazenda River Life no WhatsApp. Como posso ajudar com os viveiros hoje?',
      time: '10:30',
    },
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cfg, msgs] = await Promise.all([
        api.getWhatsAppConfig(),
        api.getWhatsAppMessages(20),
      ]);
      if (cfg) setConfig(cfg);
      if (msgs) setMessages(msgs);
    } catch (err) {
      console.error('Erro ao carregar dados do WhatsApp:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateWhatsAppConfig(config);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Erro ao salvar configuração do WhatsApp');
    }
  };

  const handleSendTest = async (type: string) => {
    try {
      setTestingType(type);
      const newMsg = await api.sendTestWhatsAppNotification(type);
      setMessages((prev) => [newMsg, ...prev]);
      alert(`Mensagem de teste de '${type}' enviada com sucesso para ${config.phone_number}!`);
    } catch (err) {
      alert('Erro ao disparar mensagem de teste');
    } finally {
      setTestingType(null);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setChatHistory((prev) => [...prev, { sender: 'user', text: userText, time: now }]);
    setChatInput('');
    setIsBotTyping(true);

    try {
      const res = await api.chatWithWhatsAppBot(userText, config.phone_number);
      const botTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setChatHistory((prev) => [...prev, { sender: 'bot', text: res.bot_reply, time: botTime }]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Desculpe, ocorreu uma instabilidade ao conectar aos sensores da fazenda. Tente novamente em alguns segundos.',
          time: now,
        },
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <span>River Life (Área Fazenda)</span>
            <span>•</span>
            <span style={{ color: '#25D366' }}>Comunicação & Mensageria</span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquare size={28} color="#25D366" />
            Notificações no WhatsApp & Bot IA
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Configuração de disparos automáticos de despesca, sincronização offline, alertas de água e assistente de IA interativo via Zap
          </p>
        </div>

        <button onClick={loadData} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
          <RefreshCw size={17} />
          <span>Atualizar</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1fr) 420px', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: WhatsApp Settings & Triggers matching Screenshot 1 and 3 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* User & Phone Bar (Matching exact layout from Screenshot 1 & 3) */}
          <div
            className="glass-card"
            style={{
              padding: '20px 24px',
              borderLeft: '4px solid #25D366',
            }}
          >
            <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Usuário</label>
                  <select
                    value={config.user_name}
                    onChange={(e) => setConfig({ ...config, user_name: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="Collermhann">Collermhann (Administrador)</option>
                    <option value="Gerente Operacional">Gerente Operacional (Fazenda)</option>
                    <option value="Técnico Aquícola">Técnico Aquícola</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Telefone com DDD *</label>
                  <input
                    type="text"
                    required
                    value={config.phone_number}
                    onChange={(e) => setConfig({ ...config, phone_number: e.target.value })}
                    placeholder="(84) 9 8858-5211"
                    className="input"
                    style={{ width: '100%', fontWeight: 700, letterSpacing: '0.04em' }}
                  />
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--amber-400)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Smartphone size={15} />
                <span>Adicione seu número com DDD para habilitar a funcionalidade de disparos em tempo real.</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', color: '#e9d5ff' }}>
                  <input
                    type="checkbox"
                    checked={config.auto_ai_agent_enabled}
                    onChange={(e) => setConfig({ ...config, auto_ai_agent_enabled: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: '#a855f7' }}
                  />
                  <span>Habilitar Respostas Inteligentes por IA (Bot ShrimpAI Zap)</span>
                </label>

                <button type="submit" className="btn btn-primary" style={{ background: '#25D366', borderColor: '#25D366' }}>
                  {savedSuccess ? 'Salvo com Sucesso!' : 'Salvar Configuração'}
                </button>
              </div>
            </form>
          </div>

          {/* Trigger Cards (Exact match to Screenshot 3 + 10x Upgrades) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={20} color="#38bdf8" />
              Gatilhos de Notificações Ativos
            </h3>

            {/* Trigger 1: Despesca Realizada */}
            <div
              className="glass-card"
              style={{
                padding: '18px 20px',
                border: config.notify_despesca ? '1px solid rgba(37, 211, 102, 0.4)' : '1px solid var(--border-subtle)',
                background: config.notify_despesca ? 'rgba(7, 24, 40, 0.85)' : 'rgba(7, 18, 30, 0.5)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={config.notify_despesca}
                    onChange={(e) => setConfig({ ...config, notify_despesca: e.target.checked })}
                    style={{ width: 18, height: 18, accentColor: '#25D366' }}
                  />
                  <strong style={{ fontSize: '1rem', color: '#ffffff' }}>Manejo de Despesca</strong>
                </label>

                <button
                  onClick={() => handleSendTest('despesca')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', borderColor: '#25D366', color: '#25D366' }}
                >
                  <Send size={13} />
                  <span>Testar Disparo</span>
                </button>
              </div>

              {/* Message Template Preview (Matching Screenshot 1 & 3) */}
              <div
                style={{
                  background: 'rgba(11, 30, 20, 0.8)',
                  border: '1px solid rgba(37, 211, 102, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  fontSize: '0.82rem',
                  fontFamily: 'monospace',
                  color: '#e2e8f0',
                  lineHeight: 1.5,
                }}
              >
                <div style={{ color: '#25D366', fontWeight: 700, marginBottom: '4px' }}>
                  *🐟 Despesca Realizada - [FAZENDA]*
                </div>
                <div>O *[TANQUE]* foi despescado. Veja seus resultados:</div>
                <div style={{ marginTop: '6px' }}>🔹 Biomassa: 3.450,00 kg</div>
                <div>🔹 Biometria: 12,40 g (Classe 60/70)</div>
                <div>🔹 População despescada: 278.200 un</div>
                <div>🔹 Dias de cultivo: 78 dias</div>
                <div>🔹 Custo/kg: R$ 11,85 • Faturamento: R$ 86.250,00</div>
                <div style={{ marginTop: '6px', color: '#38bdf8' }}>📲 Acesse o app para mais detalhes!</div>
              </div>
            </div>

            {/* Trigger 2: Sincronização app offline */}
            <div
              className="glass-card"
              style={{
                padding: '18px 20px',
                border: config.notify_sync ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid var(--border-subtle)',
                background: config.notify_sync ? 'rgba(7, 24, 40, 0.85)' : 'rgba(7, 18, 30, 0.5)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={config.notify_sync}
                    onChange={(e) => setConfig({ ...config, notify_sync: e.target.checked })}
                    style={{ width: 18, height: 18, accentColor: '#38bdf8' }}
                  />
                  <strong style={{ fontSize: '1rem', color: '#ffffff' }}>Sincronização de Campo (Offline)</strong>
                </label>

                <button
                  onClick={() => handleSendTest('sync')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', borderColor: '#38bdf8', color: '#38bdf8' }}
                >
                  <Send size={13} />
                  <span>Testar Disparo</span>
                </button>
              </div>

              {/* Message Template Preview (Matching Screenshot 1 & 3) */}
              <div
                style={{
                  background: 'rgba(7, 24, 38, 0.8)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  fontSize: '0.82rem',
                  fontFamily: 'monospace',
                  color: '#e2e8f0',
                  lineHeight: 1.5,
                }}
              >
                <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '4px' }}>
                  🔄 *Sincronização Offline - [FAZENDA]*
                </div>
                <div>O usuário *[USUARIO]* sincronizou as informações que estavam armazenadas offline no app de campo:</div>
                <div style={{ marginTop: '6px' }}>[🔹 *Nutrição* 🔹 *Biometria* 🔹 *Mortalidade* 🔹 *Calagem* 🔹 *Arraçoamento* 🔹 *Análise de água*]</div>
                <div style={{ marginTop: '6px', color: '#f59e0b' }}>🔸 Data e hora da sincronização: *[DATA_HORA]*</div>
                <div style={{ color: '#38bdf8' }}>📲 Acesse o app para visualizar os dados atualizados!</div>
              </div>
            </div>

            {/* Trigger 3: Alerta de Qualidade da Água (10x Better!) */}
            <div
              className="glass-card"
              style={{
                padding: '18px 20px',
                border: config.notify_water_critical ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={config.notify_water_critical}
                    onChange={(e) => setConfig({ ...config, notify_water_critical: e.target.checked })}
                    style={{ width: 18, height: 18, accentColor: '#f43f5e' }}
                  />
                  <strong style={{ fontSize: '1rem', color: '#ffffff' }}>Qualidade da Água Crítica (OD e Alcalinidade)</strong>
                </label>

                <button
                  onClick={() => handleSendTest('water_critical')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', borderColor: '#f43f5e', color: '#f43f5e' }}
                >
                  <Send size={13} />
                  <span>Testar Disparo</span>
                </button>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Dispara mensagem imediata se o Oxigênio Dissolvido (OD) cair abaixo de 3.5 mg/L de madrugada ou se a alcalinidade ficar abaixo de 110 mg/L durante a fase de muda.
              </div>
            </div>

            {/* Trigger 4: Estoque Baixo */}
            <div
              className="glass-card"
              style={{
                padding: '18px 20px',
                border: config.notify_low_stock ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={config.notify_low_stock}
                    onChange={(e) => setConfig({ ...config, notify_low_stock: e.target.checked })}
                    style={{ width: 18, height: 18, accentColor: '#f59e0b' }}
                  />
                  <strong style={{ fontSize: '1rem', color: '#ffffff' }}>Estoque Baixo & Previsão de Ruptura IA</strong>
                </label>

                <button
                  onClick={() => handleSendTest('estoque')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', borderColor: '#f59e0b', color: '#f59e0b' }}
                >
                  <Send size={13} />
                  <span>Testar Disparo</span>
                </button>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Avisa quando a autonomia de qualquer tipo de ração estiver abaixo de 7 dias com sugestão de pedido de compra.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive WhatsApp Bot Simulator (10X AI POWER) */}
        <div
          className="glass-card"
          style={{
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '740px',
            border: '1px solid rgba(37, 211, 102, 0.35)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* WhatsApp Chat Header */}
          <div
            style={{
              background: '#075E54',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#ffffff',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #128C7E, #25D366)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bot size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                ShrimpAI • Fazenda River Life
              </div>
              <div style={{ fontSize: '0.72rem', color: '#A7E8D0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="pulse-dot ideal" style={{ width: 6, height: 6 }} /> online via WhatsApp
              </div>
            </div>
          </div>

          {/* WhatsApp Chat Background & Messages Area */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'linear-gradient(rgba(11, 20, 26, 0.94), rgba(11, 20, 26, 0.94)), url("/grid.svg")',
            }}
          >
            <div style={{ textAlign: 'center', margin: '6px 0' }}>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                }}
              >
                MENSAGENS CRIPTOGRAFADAS • IA ATIVA
              </span>
            </div>

            {chatHistory.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={idx}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: isUser ? '#005C4B' : '#202C33',
                    color: '#E9EDEF',
                    padding: '10px 12px',
                    borderRadius: isUser ? '8px 0px 8px 8px' : '0px 8px 8px 8px',
                    fontSize: '0.85rem',
                    lineHeight: 1.4,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    wordBreak: 'break-word',
                  }}
                >
                  <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '4px',
                      fontSize: '0.65rem',
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginTop: '4px',
                    }}
                  >
                    <span>{msg.time}</span>
                    {isUser && <CheckCheck size={13} color="#53BDEB" />}
                  </div>
                </div>
              );
            })}

            {isBotTyping && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  background: '#202C33',
                  color: '#8696A0',
                  padding: '8px 14px',
                  borderRadius: '0px 8px 8px 8px',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={14} color="#25D366" />
                <span>ShrimpAI consultando viveiros...</span>
              </div>
            )}
          </div>

          {/* Quick prompt suggestions */}
          <div
            style={{
              padding: '8px 12px',
              background: '#202C33',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
            }}
          >
            {[
              'Estoque de ração',
              'Alcalinidade deu 95 mg/L no V03',
              'Previsão de despesca',
              'Fase da lua e mudas',
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => setChatInput(prompt)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '4px 10px',
                  color: '#D1D7DB',
                  fontSize: '0.72rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendChatMessage}
            style={{
              background: '#202C33',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <input
              type="text"
              placeholder="Digite uma mensagem no WhatsApp..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{
                flex: 1,
                background: '#2A3942',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#E9EDEF',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: chatInput.trim() ? '#00A884' : '#2A3942',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: chatInput.trim() ? 'pointer' : 'default',
                transition: 'background 0.2s',
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
