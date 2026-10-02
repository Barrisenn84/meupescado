import React, { useState, useEffect } from 'react';
import {
  Home, MapPin, Wind, Droplets, Sun, Waves, DollarSign,
  TrendingUp, Building2, CheckCircle2, AlertTriangle, Search,
  RefreshCw, FileText, Phone, Mail, ShieldCheck, Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export const MyFarmView: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [tides, setTides] = useState<any>(null);
  const [market, setMarket] = useState<any>(null);
  const [currency, setCurrency] = useState<any>(null);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [creditIndices, setCreditIndices] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Supplier search via BrasilAPI
  const [searchCnpj, setSearchCnpj] = useState('');
  const [consultedSupplier, setConsultedSupplier] = useState<any>(null);
  const [searchingCnpj, setSearchingCnpj] = useState(false);

  // CEP search via BrasilAPI
  const [searchCep, setSearchCep] = useState('');
  const [consultedCep, setConsultedCep] = useState<any>(null);
  const [searchingCep, setSearchingCep] = useState(false);

  // Editing profile
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const loadAll = async () => {
    setLoading(true);
    try {
      const [prof, w, t, m, c, h, cr] = await Promise.all([
        api.getFarmProfile(),
        api.getLiveWeather(),
        api.getParaibaTides(),
        api.getShrimpMarketPrices(),
        api.getCurrencyQuotes(),
        api.getCommercialHolidays(),
        api.getCreditIndices(),
      ]);
      setProfile(prof);
      setEditForm(prof);
      setWeather(w);
      setTides(t);
      setMarket(m);
      setCurrency(c);
      setHolidays(h?.holidays || []);
      setCreditIndices(cr);
    } catch (err) {
      console.error('Erro ao carregar dados de Minha Fazenda:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateFarmProfile(editForm);
      setIsEditing(false);
      loadAll();
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    }
  };

  const handleSearchCnpj = async () => {
    if (!searchCnpj) return;
    setSearchingCnpj(true);
    try {
      const data = await api.consultCNPJ(searchCnpj);
      setConsultedSupplier(data);
    } catch (err: any) {
      alert('Erro na consulta: ' + err.message);
    } finally {
      setSearchingCnpj(false);
    }
  };

  const handleSearchCep = async () => {
    if (!searchCep) return;
    setSearchingCep(true);
    try {
      const data = await api.consultCEP(searchCep);
      setConsultedCep(data);
      if (isEditing) {
        setEditForm((prev: any) => ({
          ...prev,
          zip_code: data.cep,
          address: `${data.street || ''} - ${data.neighborhood || ''}`,
          city: data.city,
          state: data.state
        }));
      }
    } catch (err: any) {
      alert('Erro na consulta do CEP: ' + err.message);
    } finally {
      setSearchingCep(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '1.45rem', color: '#fff', fontWeight: 800 }}>
              Minha Fazenda • João Pessoa / PB
            </h2>
            <span style={{ fontSize: '0.74rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
              Bacia Litorânea Paraibana
            </span>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Cadastro Oficial, Meteorologia Open-Meteo, Tábua de Marés, Feriados BrasilAPI e Crédito Banco Central
          </span>
        </div>

        <button onClick={loadAll} className="btn btn-secondary btn-sm">
          <RefreshCw size={15} />
          <span>Atualizar Sensores & Cotações</span>
        </button>
      </div>

      {/* Grid: Live Weather & Tides widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Open-Meteo Weather Widget */}
        <div
          className="glass-card"
          style={{
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(15, 30, 48, 0.85))',
            border: '1px solid rgba(56, 189, 248, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem' }}>
                <Sun size={17} />
                <span>Open-Meteo ao Vivo • João Pessoa - PB</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Coords: -7.115, -34.863 (Bacia do Paraíba)</div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
              {weather?.current?.temperature_c}°C
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px 10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Vento Alísio</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>{weather?.current?.wind_speed_kmh} km/h</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px 10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pressão Barom.</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#cbd5e1' }}>{weather?.current?.surface_pressure_hpa || 1012} hPa</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '8px 10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Evapotranspiração</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399' }}>{weather?.forecast_today?.evapotranspiration_et0_mm || 4.8} mm/d</div>
            </div>
          </div>

          <div style={{ marginBottom: '10px', background: 'rgba(255, 255, 255, 0.03)', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Índice Fotossintético:</span>
            <strong style={{ color: '#38bdf8' }}>{weather?.carciniculture_ai_evaluation?.photosynthesis_index || 'ÓTIMO (Diatomáceas)'}</strong>
          </div>

          {weather?.carciniculture_ai_evaluation?.alerts?.map((a: string, i: number) => (
            <div key={i} style={{ fontSize: '0.78rem', color: '#e2e8f0', background: 'rgba(56, 189, 248, 0.1)', padding: '8px 12px', borderRadius: '8px', borderLeft: '3px solid #38bdf8', lineHeight: 1.4, marginTop: '6px' }}>
              {a}
            </div>
          ))}
        </div>

        {/* Paraíba Tides Widget (Cabedelo / João Pessoa) */}
        <div
          className="glass-card"
          style={{
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(15, 30, 48, 0.85))',
            border: '1px solid rgba(99, 102, 241, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Waves size={20} color="#818cf8" />
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>Tábua de Marés da Paraíba</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Porto de Cabedelo / Litoral Sul & Norte PB</div>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', background: 'rgba(129, 140, 248, 0.2)', color: '#818cf8', padding: '3px 8px', borderRadius: '10px', fontWeight: 700 }}>
              {tides?.current_tidal_status}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '12px' }}>
            {tides?.tide_events_today?.map((ev: any, idx: number) => (
              <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '8px 10px', borderRadius: '8px', borderLeft: ev.type.includes('PREAMAR') ? '3px solid #34d399' : '3px solid #f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.82rem', color: '#fff' }}>
                  <span>{ev.time}</span>
                  <span style={{ color: ev.type.includes('PREAMAR') ? '#34d399' : '#f59e0b' }}>{ev.height_m}m</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{ev.type.split(' ')[0]}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '0.76rem', color: '#cbd5e1', background: 'rgba(129, 140, 248, 0.1)', padding: '8px 12px', borderRadius: '8px', lineHeight: 1.4 }}>
            💡 <strong>Manejo Energético IA:</strong> {tides?.energy_saving_tip_ai}
          </div>
        </div>

        {/* Currency & Commodities Impact (AwesomeAPI) */}
        <div
          className="glass-card"
          style={{
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(15, 30, 48, 0.85))',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={20} color="#34d399" />
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>Câmbio & Custo de Ração</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AwesomeAPI em Tempo Real</div>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399' }}>
              USD: R$ {currency?.usd?.bid?.toFixed(2)}
            </span>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '12px' }}>
            A ração comercial de camarão tem 60% dos custos atrelados ao farelo de soja e farinha de peixe importada. Câmbio atual em <strong>R$ {currency?.usd?.bid?.toFixed(2)}</strong> mantém o preço da saca 25kg estabilizado em ~R$ 138,00.
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Euro Comercial: R$ {currency?.eur?.bid?.toFixed(2)}</span>
            <span style={{ color: '#34d399' }}>Mercado Estável</span>
          </div>
        </div>
      </div>

      {/* Regional Shrimp Market Table (Paraíba & Nordeste) */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>
              Balcão de Cotações Regionais (João Pessoa, Recife e Natal)
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Preços de referência pagos por frigoríficos e distribuidores</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>Litopenaeus vannamei Fresco / Resfriado</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 30, 48, 0.8)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left' }}>Classe Comercial</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Gramatura Média</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Preço Mínimo / kg</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Preço Máximo / kg</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Demanda Regional</th>
                <th style={{ padding: '10px 14px', textAlign: 'left' }}>Canal Principal</th>
              </tr>
            </thead>
            <tbody>
              {market?.classes?.map((c: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: '#38bdf8' }}>{c.class}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#e2e8f0' }}>{c.weight_avg_g} g</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', color: '#cbd5e1' }}>R$ {c.price_min_rs?.toFixed(2)}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#34d399' }}>R$ {c.price_max_rs?.toFixed(2)}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <span style={{ background: c.demand === 'MUITO ALTA' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.15)', color: c.demand === 'MUITO ALTA' ? '#34d399' : '#38bdf8', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700 }}>
                      {c.demand}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{c.destination}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commercial Holidays & Central Bank Rural Credit Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* BrasilAPI Holidays Card */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 700 }}>
                Feriados Nacionais & Picos Comerciais
              </h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>BrasilAPI • Previsão de Ágio e Demanda por Camarão</span>
            </div>
            <span style={{ fontSize: '0.72rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 8px', borderRadius: '10px', fontWeight: 700 }}>
              Safra 2026
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {holidays.map((h: any, idx: number) => (
              <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px 12px', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{h.name}</strong>
                  <span style={{ color: '#38bdf8', fontSize: '0.76rem', fontWeight: 700 }}>{h.date.split('-').reverse().join('/')}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '3px' }}>
                  {h.market_strategy}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600, marginTop: '2px' }}>
                  🗓️ {h.recommended_harvest_window}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Central Bank Credit Indices Card */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 700 }}>
                Crédito Rural & Indicadores Econômicos
              </h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Banco Central do Brasil (SGS API Pública)</span>
            </div>
            <span style={{ fontSize: '0.72rem', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '3px 8px', borderRadius: '10px', fontWeight: 700 }}>
              Taxas Oficiais
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Taxa Selic Meta</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>{creditIndices?.selic_target_pct || 10.75}% a.a.</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>PRONAF Custeio Pesca</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>{creditIndices?.pronaf_custeio_pct || 5.0}% a.a.</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>PRONAMP Médio Produtor</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fbbf24' }}>{creditIndices?.pronamp_medio_produtor_pct || 8.0}% a.a.</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Inflação de Ração Est.</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#cbd5e1' }}>{creditIndices?.feed_inflation_index_pct || 3.8}% a.a.</div>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#e2e8f0', background: 'rgba(52, 211, 153, 0.1)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #34d399', lineHeight: 1.4 }}>
            💡 <strong>Estratégia Financeira IA:</strong> {creditIndices?.ai_financial_advice}
          </div>
        </div>
      </div>

      {/* Farm Official Registration & BrasilAPI Lookup (CNPJ + CEP) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Farm Profile Details */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 700 }}>Dados Cadastrais da Fazenda</h3>
            <button onClick={() => setIsEditing(!isEditing)} className="btn btn-secondary btn-sm">
              {isEditing ? 'Cancelar' : 'Editar Cadastro'}
            </button>
          </div>

          {!isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Razão Social:</span><strong style={{ color: '#fff' }}>{profile?.corporate_name}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>CNPJ:</span><span style={{ color: '#cbd5e1' }}>{profile?.cnpj}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Inscrição Estadual:</span><span style={{ color: '#cbd5e1' }}>{profile?.state_registration}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>CEP / Endereço:</span><span style={{ color: '#cbd5e1' }}>{profile?.zip_code} - {profile?.address}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Localização:</span><span style={{ color: '#38bdf8' }}>{profile?.city} - {profile?.state}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Lâmina d'Água:</span><span style={{ color: '#34d399', fontWeight: 700 }}>{profile?.water_surface_hectares} ha ({profile?.total_area_hectares} ha total)</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Licença Ambiental:</span><span style={{ color: '#c084fc', fontWeight: 600 }}>{profile?.environmental_license}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Responsável Técnico:</span><span style={{ color: '#fff' }}>{profile?.technician_in_charge}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Registro Profissional:</span><span style={{ color: '#94a3b8' }}>{profile?.council_registration}</span></div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nome da Fazenda</label>
                <input className="form-control" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Razão Social</label>
                <input className="form-control" value={editForm.corporate_name || ''} onChange={e => setEditForm({ ...editForm, corporate_name: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CNPJ</label>
                  <input className="form-control" value={editForm.cnpj || ''} onChange={e => setEditForm({ ...editForm, cnpj: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Telefone</label>
                  <input className="form-control" value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>Salvar Dados</button>
            </form>
          )}
        </div>

        {/* BrasilAPI Partner & CEP Lookup */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Building2 size={20} color="#38bdf8" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 700 }}>Consultas Oficiais BrasilAPI</h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Validação instantânea de CNPJ e CEP com autocompletar</span>
            </div>
          </div>

          {/* CNPJ Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Consultar CNPJ de Parceiro/Fornecedor</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="form-control"
                placeholder="CNPJ (ex: 18234567000189)"
                value={searchCnpj}
                onChange={e => setSearchCnpj(e.target.value)}
              />
              <button onClick={handleSearchCnpj} disabled={searchingCnpj} className="btn btn-primary">
                <Search size={16} />
                <span>{searchingCnpj ? 'Buscando...' : 'Buscar'}</span>
              </button>
            </div>
          </div>

          {consultedSupplier && (
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', marginBottom: '14px' }}>
              <div style={{ fontWeight: 700, color: '#38bdf8' }}>{consultedSupplier.razao_social}</div>
              <div style={{ color: '#fff' }}>{consultedSupplier.nome_fantasia || '-'}</div>
              <div style={{ color: '#94a3b8' }}>{consultedSupplier.cidade} - {consultedSupplier.uf} • {consultedSupplier.situacao_cadastral}</div>
            </div>
          )}

          {/* CEP Input */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Consultar CEP & Endereço</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="form-control"
                placeholder="CEP (ex: 58000000)"
                value={searchCep}
                onChange={e => setSearchCep(e.target.value)}
              />
              <button onClick={handleSearchCep} disabled={searchingCep} className="btn btn-secondary">
                <Search size={16} />
                <span>{searchingCep ? 'Buscando...' : 'CEP'}</span>
              </button>
            </div>
          </div>

          {consultedCep && (
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', marginTop: '10px' }}>
              <div style={{ fontWeight: 700, color: '#34d399' }}>{consultedCep.street || 'Logradouro'}</div>
              <div style={{ color: '#cbd5e1' }}>{consultedCep.neighborhood} • {consultedCep.city} - {consultedCep.state}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>CEP: {consultedCep.cep}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
