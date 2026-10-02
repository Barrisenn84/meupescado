from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime as dt

from ..database import get_db
from ..models import WhatsAppAlertConfig, WhatsAppMessageLog, Pond, ShrimpBatch, HarvestLog, WaterQualityLog, FeedInventory
from ..schemas import (
    WhatsAppConfigCreate, WhatsAppConfigResponse,
    WhatsAppMessageLogResponse, WhatsAppBotChatRequest, WhatsAppBotChatResponse
)

router = APIRouter(prefix="/api/whatsapp", tags=["WhatsApp & Alertas Inteligentes"])


def get_or_create_config(db: Session) -> WhatsAppAlertConfig:
    cfg = db.query(WhatsAppAlertConfig).first()
    if not cfg:
        cfg = WhatsAppAlertConfig(
            user_name="Collermhann",
            phone_number="(84) 9 8858-5211",
            notify_despesca=True,
            notify_sync=True,
            notify_water_critical=True,
            notify_low_stock=True,
            notify_daily_ai_summary=True,
            auto_ai_agent_enabled=True
        )
        db.add(cfg)
        db.commit()
        db.refresh(cfg)
    return cfg


@router.get("/config", response_model=WhatsAppConfigResponse)
def get_whatsapp_config(db: Session = Depends(get_db)):
    return get_or_create_config(db)


@router.put("/config", response_model=WhatsAppConfigResponse)
def update_whatsapp_config(payload: WhatsAppConfigCreate, db: Session = Depends(get_db)):
    cfg = get_or_create_config(db)
    for key, value in payload.dict().items():
        setattr(cfg, key, value)
    cfg.updated_at = dt.datetime.utcnow()
    db.commit()
    db.refresh(cfg)
    return cfg


@router.get("/messages", response_model=List[WhatsAppMessageLogResponse])
def get_whatsapp_messages(limit: int = 30, db: Session = Depends(get_db)):
    msgs = db.query(WhatsAppMessageLog).order_by(WhatsAppMessageLog.timestamp.desc()).limit(limit).all()
    return msgs


@router.post("/send-test", response_model=WhatsAppMessageLogResponse)
def send_test_whatsapp_notification(template_type: str = "despesca", db: Session = Depends(get_db)):
    cfg = get_or_create_config(db)
    farm_name = "Fazenda River Life"
    now_str = dt.datetime.now().strftime("%d/%m/%Y às %H:%M")

    if template_type == "despesca":
        # Formato exato visto no screenshot 1 e 3 do usuário
        content = (
            f"*🐟 Despesca Realizada - {farm_name}*\n\n"
            f"O *Viveiro 02 (Engorda Intermediária)* foi despescado. Veja seus resultados:\n\n"
            f"🔹 *Biomassa:* 3.450,00 kg\n"
            f"🔹 *Biometria:* 12,40 g (Classe 60/70)\n"
            f"🔹 *População despescada:* 278.200 camarões\n"
            f"🔹 *Dias de cultivo:* 78 dias\n"
            f"🔹 *Custo/kg:* R$ 11,85\n"
            f"🔹 *Custo total:* R$ 40.882,50\n"
            f"🔹 *Faturamento:* R$ 86.250,00 (Preço R$ 25,00/kg)\n"
            f"🔹 *Lucro Líquido:* R$ 45.367,50 (Margem: 52,6%)\n\n"
            f"📲 Acesse o app Meu Pescado para mais detalhes!"
        )
    elif template_type == "sync":
        # Formato exato visto no screenshot 1 e 3
        content = (
            f"🔄 *Sincronização Offline - {farm_name}*\n\n"
            f"O usuário *{cfg.user_name}* sincronizou as informações que estavam armazenadas offline no aplicativo de campo, referentes aos manejos:\n\n"
            f"🔹 *Nutrição* (4 tratos registrados)\n"
            f"🔹 *Biometria* (amostragem Viveiro 01: 7,8g)\n"
            f"🔹 *Mortalidade* (0 anormalidades)\n"
            f"🔹 *Calagem* (aplicação de 200kg calcário)\n"
            f"🔹 *Arraçoamento* (bandejas 100% limpas)\n"
            f"🔹 *Análise de água* (OD, pH, alcalinidade ok)\n\n"
            f"🔸 Data e hora da sincronização: *{now_str}*\n\n"
            f"📲 Acesse o app para visualizar os dados atualizados!"
        )
    elif template_type == "water_critical":
        content = (
            f"🚨 *ALERTA CRÍTICO: QUALIDADE DA ÁGUA - {farm_name}*\n\n"
            f"⚠️ *Viveiro 03 (Engorda Intensiva)* requer atenção imediata:\n\n"
            f"🔴 *Alcalinidade:* 95 mg/L CaCO3 (Mínimo recomendado: 120 mg/L)\n"
            f"🔴 *Oxigênio Dissolvido:* 3,2 mg/L às 05:15 (Queda perigosa)\n"
            f"🔹 *Fase da Lua:* Minguante gibosa (Muda ativa detectada)\n\n"
            f"🤖 *Recomendação ShrimpAI:* Ligar imediatamente +2 aeradores mecânicos e aplicar *180 kg de Bicarbonato de Sódio* para tamponar o pH e evitar casca mole/canibalismo!"
        )
    elif template_type == "estoque":
        content = (
            f"📦 *ALERTA DE ESTOQUE BAIXO - {farm_name}*\n\n"
            f"⚠️ *Ração Funcional Imuno-Boost 38% PB* atingiu nível de alerta:\n\n"
            f"🔹 *Estoque atual:* 180,00 kg\n"
            f"🔹 *Mínimo de segurança:* 300,00 kg\n"
            f"🔹 *Autonomia estimada:* 5 dias restantes\n\n"
            f"🤖 *Sugestão IA:* Emitir pedido de compra de 500 kg com o fornecedor Samaria Nutrição Animal antes do próximo ciclo de arraçoamento."
        )
    else:
        content = (
            f"☀️ *Resumo Matinal da Fazenda - {farm_name}*\n\n"
            f"Bom dia, *{cfg.user_name}*! Aqui está o panorama das 07h00:\n\n"
            f"🦐 *Biomassa total:* 15.420 kg em 5 viveiros\n"
            f"🍽️ *Arraçoamento previsto:* 620 kg hoje (4 tratos)\n"
            f"💧 *Água:* Viveiros 01, 02 e 04 ideais; Viveiro 03 necessita bicarbonato\n"
            f"🌙 *Lua de hoje:* Minguante gibosa (77% iluminada)\n"
            f"🌧️ *Previsão:* Chuva leve (0,8 mm) às 10h\n\n"
            f"Tenha um excelente dia de produção!"
        )

    log = WhatsAppMessageLog(
        direction="OUTGOING",
        phone_number=cfg.phone_number,
        message_type=template_type.upper(),
        content=content,
        status="ENVIADO",
        timestamp=dt.datetime.utcnow()
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.post("/chat", response_model=WhatsAppBotChatResponse)
def chat_with_whatsapp_bot(payload: WhatsAppBotChatRequest, db: Session = Depends(get_db)):
    """
    Simulador do Bot IA do WhatsApp ("ShrimpAI Zap")
    Permite que o proprietário ou tratador envie mensagens de voz ou texto
    e receba respostas instantâneas com dados da fazenda e ações executadas!
    """
    msg = payload.user_message.strip().lower()

    # Save incoming user message
    user_log = WhatsAppMessageLog(
        direction="INCOMING",
        phone_number=payload.phone_number or "(84) 9 8858-5211",
        message_type="IA_CHAT",
        content=payload.user_message,
        status="LIDO",
        timestamp=dt.datetime.utcnow()
    )
    db.add(user_log)
    db.commit()

    reply = ""
    intent = "OUTROS"
    action = None
    executed = False

    if "estoque" in msg or "ração" in msg or "insumo" in msg:
        intent = "CONSULTA_ESTOQUE"
        items = db.query(FeedInventory).all()
        total_kg = sum(i.current_stock_kg for i in items if "ração" in i.item_type.lower())
        total_val = sum(i.current_stock_kg * i.cost_per_kg for i in items)
        low_items = [i.name for i in items if i.current_stock_kg <= i.min_stock_alert_kg]

        reply = (
            f"📦 *Estoque Atual no Almoxarifado:*\n\n"
            f"Temos *{(total_kg/1000):.2f} toneladas* de ração estocadas (~24 dias de autonomia).\n"
            f"Valor imobilizado: *R$ {total_val:,.2f}*.\n\n"
        )
        if low_items:
            reply += f"⚠️ *Itens abaixo do mínimo:* {', '.join(low_items[:3])}.\n"
        reply += "💡 Deseja que eu emita uma sugestão de ordem de compra?"
        action = "SUGESTAO_COMPRA"

    elif "água" in msg or "alcalinidade" in msg or "oxigênio" in msg or "od" in msg:
        intent = "QUALIDADE_AGUA"
        ponds = db.query(Pond).all()
        critical_count = sum(1 for p in ponds if (p.last_alkalinity_mg_l or 140) < 110)
        reply = (
            f"💧 *Status da Qualidade da Água:*\n\n"
            f"Monitorando {len(ponds)} viveiros.\n"
            f"Viveiro 01: OD 5.2 mg/L • pH 7.8 • Alc 140 mg/L (Ideal)\n"
            f"Viveiro 02: OD 4.8 mg/L • pH 8.0 • Alc 135 mg/L (Ideal)\n"
            f"Viveiro 03: OD 3.4 mg/L • pH 7.4 • Alc 95 mg/L (⚠️ Atenção: alcalinidade baixa)\n\n"
            f"🤖 *Ação Recomendada:* Aplicar 180 kg de Bicarbonato de Sódio no Viveiro 03."
        )
        action = "CALCULO_BICARBONATO"

    elif "despesca" in msg or "faturamento" in msg or "lucro" in msg:
        intent = "DESPESCA_FINANCEIRO"
        reply = (
            f"💰 *Projeção de Despesca & Faturamento:*\n\n"
            f"🔹 *Biomassa ativa:* 15.420 kg\n"
            f"🔹 *Faturamento projetado:* R$ 385.600,00\n"
            f"🔹 *Custo em cultivo:* R$ 142.850,00\n"
            f"🔹 *Lucro líquido esperado:* R$ 242.750,00 (Margem: 63%)\n\n"
            f"A próxima despesca programada é no *Viveiro 04 (Lote 2026-ENG-01)* para o dia 28/10 na Lua Cheia."
        )
        action = "PROGRAMACAO_DESPESCA"

    elif "lua" in msg or "muda" in msg or "clima" in msg:
        intent = "CLIMA_LUA"
        reply = (
            f"🌙 *Fase Lunar & Clima da Fazenda:*\n\n"
            f"Fase de hoje: *Minguante gibosa (77% iluminada)*\n"
            f"Tempo: 32°C, nublado com vento de 16 km/h.\n\n"
            f"🦐 *Impacto Zootécnico:* Os camarões estão endurecendo a carapaça pós-muda. O apetite está alto nas bandejas (+8%). Ideal para realizar amostragem de peso nas tarrafas."
        )

    else:
        intent = "GERAL"
        reply = (
            f"Olá, *Collermhann*! Sou o assistente de IA da fazenda *River Life* no WhatsApp.\n\n"
            f"Você pode me perguntar sobre:\n"
            f"🔹 *'Estoque de ração'* (níveis e autonomia)\n"
            f"🔹 *'Qualidade da água'* (OD e alcalinidade)\n"
            f"🔹 *'Despesca e faturamento'* (projeções)\n"
            f"🔹 *'Fase da lua e mudas'* (comportamento)\n\n"
            f"Como posso ajudar o manejo agora?"
        )

    # Save outgoing bot reply
    bot_log = WhatsAppMessageLog(
        direction="OUTGOING",
        phone_number=payload.phone_number or "(84) 9 8858-5211",
        message_type="IA_CHAT",
        content=reply,
        status="ENVIADO",
        timestamp=dt.datetime.utcnow()
    )
    db.add(bot_log)
    db.commit()

    return {
        "bot_reply": reply,
        "detected_intent": intent,
        "suggested_action": action,
        "action_executed": executed
    }
