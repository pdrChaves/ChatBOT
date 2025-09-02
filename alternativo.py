import asyncio
import json
from pyppeteer import launch
import os

# ====== CONFIGURAÇÃO ======
STATE_FILE = "user_state.json"
ADMIN_NUMBER = "551199999999@c.us"  # substitua pelo seu número para receber notificações
trigger_keywords = ["olá", "oi", "bom dia", "leilão", "doulhe"]

# ====== ESTADOS ======
user_states = {}       # {user_id: "menu" | "escolherFuncionario" | "novo"}
user_initiated = {}    # {user_id: True/False}

# ====== PERSISTÊNCIA ======
def load_state():
    global user_states, user_initiated
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            user_states = data.get("user_states", {})
            user_initiated = data.get("user_initiated", {})
            print("[INFO] Estado carregado do arquivo.")

def save_state():
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump({"user_states": user_states, "user_initiated": user_initiated}, f, ensure_ascii=False, indent=4)
        print("[INFO] Estado salvo.")

# ====== DELAY ======
async def delay(ms):
    await asyncio.sleep(ms / 1000)

# ====== ENVIO DE MENSAGEM ======
async def send_message(page, user_id, text):
    try:
        await page.evaluate(f"""
            (async () => {{
                const chat = Store.Chat.get("{user_id}");
                if(chat) await chat.sendMessage("{text}");
            }})();
        """)
        print(f"[BOT] Enviando para {user_id}: {text}")
    except Exception as e:
        print(f"[ERRO] Falha ao enviar mensagem: {e}")
    await delay(1000)

# ====== NOTIFICAÇÕES AO ADMIN ======
async def notify_admin(page, message):
    try:
        await send_message(page, ADMIN_NUMBER, f"[NOTIFICAÇÃO BOT] {message}")
    except Exception as e:
        print(f"[ERRO] Falha ao notificar administrador: {e}")

# ====== MENU INICIAL ======
async def send_intro(page, user_id, user_name):
    message = f"Olá, {user_name.split()[0]}! Sou o assistente virtual da Dou-lhe3 arrematei! Como posso ajudá-lo hoje?\n\n" \
              "1 - Como funciona os leilões?\n" \
              "2 - Como funciona nossa assessoria?\n" \
              "3 - Participar do grupo para receber as melhores oportunidades de imóveis\n" \
              "4 - Nossas redes sociais\n" \
              "5 - Quanto é o investimento em nossos serviços?\n" \
              "6 - Atendimento Humanizado"
    await send_message(page, user_id, message)
    user_states[user_id] = "menu"
    save_state()

# ====== ESCOLHA DE FUNCIONÁRIO ======
async def handle_funcionario(page, user_id, option, user_name):
    mapping = {
        "1": ("Marino Barros", "5512997766363@c.us"),
        "2": ("Samuel Calazans", "5512988779303@c.us"),
        "3": ("Flávio Barros", "5512997752750@c.us"),
        "4": ("Sem preferência", "120363362518310323@g.us")
    }
    if option not in mapping:
        await send_message(page, user_id, "❌ Opção inválida. Digite apenas 1, 2, 3 ou 4")
        return
    funcionario, funcionario_num = mapping[option]
    await send_message(page, user_id, f"✅ Entendido! Vou encaminhar seu pedido de atendimento para {funcionario}.")
    await send_message(page, funcionario_num, f"📢 Novo atendimento!\n\nNome: {user_name}\nDeseja falar com: {funcionario}")
    await notify_admin(page, f"Novo atendimento iniciado com {funcionario}. Cliente: {user_name}")
    user_states[user_id] = "novo"
    save_state()

# ====== MENU PRINCIPAL ======
async def handle_menu(page, user_id, option):
    if option == "1":
        msg = '🏠 Leilão de imóveis é uma forma de comprar imóveis por preços abaixo do mercado. ⚖️ Pode ser judicial ou extrajudicial. 📌 1º leilão → 2º leilão se não vender. 💰 Quem dá o maior lance, leva.'
        await send_message(page, user_id, msg)
    elif option == "2":
        msg = 'Nossa assessoria acompanha todo o processo: análise do edital, estratégia de lance, cadastro no site do leiloeiro e acompanhamento até a posse do imóvel.'
        await send_message(page, user_id, msg)
    elif option == "3":
        await send_message(page, user_id, 'Seja bem vindo(a) ao nosso grupo!!\nLink: https://chat.whatsapp.com/FDTNyTiSibq6Qq2l6csJpw')
    elif option == "4":
        await send_message(page, user_id, 'Redes sociais:\nInstagram: https://www.instagram.com/doulhe_3_arrematei\nFacebook: https://www.facebook.com/profile.php?id=61567777044020\nSite: https://www.doulhe3arrematei.com.br/')
    elif option == "5":
        msg = 'Valor da assessoria:\n- Até R$500.000: 10%\n- Acima de R$500.000: 5%\nSe não arrematar, não paga.'
        await send_message(page, user_id, msg)
    elif option == "6":
        msg = '🤝 Atendimento Humanizado:\n1 - Marino Barros\n2 - Samuel Calazans\n3 - Flávio Barros\n4 - Sem preferência'
        await send_message(page, user_id, msg)
        user_states[user_id] = "escolherFuncionario"
        save_state()

# ====== EVENTO DE MENSAGEM ======
async def on_message(page, user_id, text, user_name="Usuário"):
    state = user_states.get(user_id, "novo")
    text_lower = text.lower()

    if state != "novo":
        if state == "escolherFuncionario":
            await handle_funcionario(page, user_id, text, user_name)
        elif state == "menu":
            await handle_menu(page, user_id, text)
        return

    if not user_initiated.get(user_id):
        user_initiated[user_id] = True
        if any(k in text_lower for k in trigger_keywords):
            await send_intro(page, user_id, user_name)
        save_state()

# ====== MONITORA MENSAGENS ======
async def monitor_messages(page):
    await page.evaluate("""
        window.incomingMessages = [];
        Store.Msg.on('add', (msg) => {
            if(msg.isIncoming() && !msg.isNotification){
                window.incomingMessages.push({from: msg.id._serialized, body: msg.body});
            }
        });
    """)
    while True:
        try:
            messages = await page.evaluate("window.incomingMessages.splice(0, window.incomingMessages.length);")
            for msg in messages:
                user_id = msg['from']
                body = msg['body']
                asyncio.create_task(on_message(page, user_id, body))
        except Exception as e:
            print(f"[ERRO] Falha ao monitorar mensagens: {e}")
            try:
                await notify_admin(page, f"Erro no monitoramento: {e}")
            except:
                pass
            break
        await asyncio.sleep(1)

# ====== INICIALIZAÇÃO COM RECONEXÃO ======
async def start_bot():
    load_state()
    while True:
        try:
            browser = await launch(headless=False, args=['--no-sandbox'])
            page = await browser.newPage()
            await page.goto('https://web.whatsapp.com')
            print("⚠️ Escaneie o QR code no navegador para logar.")
            await asyncio.sleep(15)  # tempo para login
            await notify_admin(page, "Bot iniciado e conectado ao WhatsApp Web.")
            await monitor_messages(page)
        except Exception as e:
            print(f"[INFO] Reconectando devido ao erro: {e}")
            try:
                await notify_admin(page, f"Bot reconectando devido ao erro: {e}")
            except:
                pass
            await asyncio.sleep(5)
        finally:
            try:
                await browser.close()
            except:
                pass
            print("[INFO] Tentando reconectar...")

asyncio.run(start_bot())
