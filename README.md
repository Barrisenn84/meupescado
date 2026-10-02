# Meu Pescado 🦐🌊🤖
### Plataforma de Gestão Completa para Carcinicultura Tropical (*Litopenaeus vannamei*), Pós-Larvas & Inteligência Artificial

O **Meu Pescado** é um ecossistema tecnológico completo dedicado exclusivamente à **Carcinicultura** (cultivo intensivo de camarão marinho *Litopenaeus vannamei*, berçários e manejo de pós-larvas). A plataforma integra **Inteligência Artificial Generativa em Tempo Real (Google Gemini)**, **Comando por Voz Multilateral**, **Visão Computacional Multimodal (Foto/Scanner IA)** e conexão direta com as principais **APIs públicas brasileiras e globais**.

---

## 🌟 Destaques Tecnológicos & IA

### 1. 🎤 Controle Total do Sistema por Voz ("Voz IA")
- **Interação Natural:** Fale diretamente no microfone do celular ou computador para navegar e operar todo o sistema.
- **Navegação Imediata:** *"Abrir Estoque"*, *"Ir para Viveiros"*, *"Ver Qualidade da Água"*, *"Alimentação e Bandejas"*, *"Despesca"*, *"Comercial e Finanças"*, *"Relatórios"*, etc.
- **Ações Rápidas por Voz:** *"Novo Manejo"*, *"Povoar Lote"*, *"Tirar Foto"*, *"Atualizar Dados"*.
- **Consultas com Áudio Falado (TTS):** Faça qualquer pergunta técnica zootécnica ao **Dr. Camarão** e ouça a resposta por áudio na beira do viveiro.

### 2. 📷 Fotografia com Smartphone & Visão Computacional ("Foto & Visão IA")
- **Captura Nativa:** Aciona a câmera traseira do celular ou aceita upload de qualquer imagem da galeria.
- **5 Modos Especialistas:**
  1. 🍽️ **Bandeja de Ração (Comedouros):** Mede a % exata de sobra, detecta fezes e lodo, prescrevendo o ajuste exato de arraçoamento (+10%, manter, -15%, suspender).
  2. 🦐 **Saúde & Biometria do Camarão:** Inspeciona hepatopâncreas (coloração/atrofia), repleção do trato digestivo, manchas na carapaça (WSSV), opacidade muscular (IMNV) e estágio de muda.
  3. 💧 **Qualidade da Água & Fitas:** Leitura colorimétrica de testes de pH, amônia ($NH_3$), nitrito ($NO_2$) e fitoplâncton dominante.
  4. 🧾 **Nota Fiscal & Saco de Insumos (OCR Inteligente):** Extrai nome do produto, marca, kg, preço unitário e lote com **botão de 1 clique para salvar diretamente no estoque**.
  5. 🔍 **Diagnóstico Livre:** Avaliação de aeradores, tubulações, solo do fundo e qualquer estrutura da fazenda.

### 3. 🤖 Dr. Camarão (ShrimpAI Copilot) & Motor Dual Resiliente
- **Motor Primário:** Google Generative AI (Gemini Flash) conectado via RAG aos dados reais de biomassa, lotes e viveiros da fazenda.
- **Motor Secundário (Zero Falha):** Motor especialista local heurístico que garante respostas instantâneas caso a internet caia no campo.

### 4. 🌐 Conexão com APIs Públicas Gratuitas
- **BrasilAPI Feriados:** Projeção comercial de picos de demanda de camarão (Semana Santa, Carnaval, Festas de Fim de Ano).
- **BrasilAPI CEP v2:** Preenchimento automático de endereços da fazenda e fornecedores.
- **Banco Central (BCB/SGS):** Consulta automática de taxas de Crédito Rural (PRONAF, PRONAMP) e Selic.
- **Open-Meteo Solar & Pressure:** Radiação Solar ($W/m^2$), Pressão Barométrica ($hPa$) e Evapotranspiração diária ($ET_0$).

---

## 🦐 Os 16 Módulos do Sistema

1. **Painel Geral (Dashboard 360°):** Biomassa total (kg), FCA médio, sobrevivência média, alertas críticos de oxigênio/alcalinidade e previsão de despesca.
2. **Viveiros & Berçários:** Cadastro de viveiros com georreferenciamento, lâmina d'água ($m^2$), profundidade, volume ($m^3$) e aeração mecânica total (HP).
3. **Lotes de Camarão & Povoamento:** Rastreabilidade de larvicultura de origem, estágio de pós-larvas (PL10-PL15), teste de estresse salino e curva de sobrevivência.
4. **Alimentação & Bandejas (Comedouros):** Manejo por comedouros, monitoramento de sobras e cálculo automático de arraçoamento.
5. **Qualidade da Água & Balanço Iônico:** pH, oxigênio dissolvido, salinidade, temperatura, cálculo estequiométrico da relação Mg:Ca (3,1:1) e calagem ($CaCO_3$ / $NaHCO_3$).
6. **Mortalidade & Ciclo de Mudas (Ecdise):** Acompanhamento de mudas lunares e alertas precoces de patógenos (WSSV, IMNV, AHPND).
7. **Despescas & Comercialização:** Registro de colheitas parciais ou totais, classificação comercial (80/100 a 40/50) e receita apurada.
8. **Controle de Estoque & Insumos Inteligente:** Gestão de rações, fertilizantes e químicos com projeção IA de dias de autonomia e reposição.
9. **Módulo Comercial, Vendas & Finanças:** Contas bancárias, vendas faturadas, contas a pagar/receber e fluxo de caixa diário.
10. **Central de Relatórios Zootécnicos & DRE/DFC:** 9 relatórios integrados com DRE contábil e Demonstração do Fluxo de Caixa.
11. **Previsão de Despesca & Projeção Biométrica:** Simulação de ganho de peso (GPD) e data ótima de mercado.
12. **Minha Fazenda:** Cadastro institucional, perfil hídrico, licença ambiental e clima meteorológico integrado.
13. **WhatsApp & IA Zap Comunicação:** Notificações automáticas para gerentes e compradores.
14. **Equipamentos & Eficiência Energética:** Horímetro, custos de energia elétrica por kg despescado e alertas de manutenção preventiva.
15. **Nota Fiscal & Guia de Trânsito Animal (GTA):** Gestão fiscal e sanitária em conformidade com o MAPA.
16. **ShrimpAI Copilot Suíte:** Central interativa do assistente especialista.

---

## 🛠️ Como Executar

### Pré-requisitos
- Python 3.11+
- Node.js 18+ (opcional para desenvolvimento; o bundle compilado em `frontend/dist` já está incluso)

### Execução Rápida (1 Clique)
Para iniciar o sistema e gerar o link público HTTPS seguro (Cloudflare Tunnel), execute:
```cmd
iniciar_sistema_publico.bat
```

### Execução Manual
1. **Configurar variáveis de ambiente:**
   Copie `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. **Instalar dependências do backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Iniciar o Servidor de Produção (FastAPI + React SPA):**
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
   Acesse no navegador:
   - **Aplicação Completa:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
   - **Documentação Swagger:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 📄 Licença
Propriedade de **Meu Pescado - Carcinicultura & IA** (River Life). Todos os direitos reservados.
