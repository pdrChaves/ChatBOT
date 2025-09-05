const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

// ====== INICIALIZAÇÃO ======
const client = new Client({
    authStrategy: new LocalAuth(), 
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

const delay = ms => new Promise(res => setTimeout(res, ms));

// ====== ESTADOS E COOLDOWNS ======
const userCooldowns = new Map(); // { '551199999999@c.us': timestamp }
const userStates = new Map();    // { '551199999999@c.us': 'menu' | 'escolherFuncionario' | 'handover' | 'novo' }
const userInitiated = new Map(); // marca se o usuário iniciou a conversa
const triggerKeywords = ['olá','ola','oi','dia','tarde','noite','atendimento'];

let reconnectAttempts = 0;
const MAX_RECONNECT = 5;

// ====== EVENTOS DE CONEXÃO ======
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    reconnectAttempts = 0; // zera tentativas
    console.log('✅ Tudo certo! WhatsApp conectado.');

    const chats = await client.getChats();
    const grupos = chats.filter(chat => chat.isGroup);

    console.log("📋 Lista de grupos que você participa:");
    grupos.forEach(group => {
        console.log(`${group.name} -> ${group.id._serialized}`);
    });
});

client.on('disconnected', (reason) => {
    console.log('❌ Cliente desconectado:', reason);
    if (reconnectAttempts < MAX_RECONNECT) {
        reconnectAttempts++;
        console.log(`🔄 Tentando reconectar... (${reconnectAttempts}/${MAX_RECONNECT})`);
        setTimeout(() => client.initialize(), 5000);
    } else {
        console.log("🚫 Limite de tentativas atingido. Reinicie manualmente.");
    }
});

process.on('uncaughtException', (err) => {
    console.error('❌ Erro não tratado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Promessa rejeitada:', promise, 'Motivo:', reason);
});

client.initialize();

// ====== MENU INICIAL ======
async function sendIntro(msg) {
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const name = contact.pushname || "Usuário";

    await chat.sendStateTyping();
    await delay(2000);

    await client.sendMessage(
        msg.from,
        `Olá, ${name.split(" ")[0]}! Sou o assistente virtual da Dou-lhe3 arrematei! Como posso ajudá-lo hoje?\n\n` +
        `1 - Como funciona os leilões?\n` +
        `2 - Como funciona nossa assessoria?\n` +
        `3 - Grupo de Oportunidades Dou-lhe 3 Arrematei\n` +
        `4 - Nossas redes sociais\n` +
        `5 - Qual o valor da assessoria?\n` +
        `6 - Atendimento Humanizado\n\n` +
        `➡️ Digite *0* a qualquer momento para voltar a este menu.`
    );
    userCooldowns.set(msg.from, Date.now());
    userStates.set(msg.from, "menu");
}

// ====== ESCOLHA DE FUNCIONÁRIO ======
async function handleFuncionario(msg) {
    let funcionario = "";
    let funcionarioNum = "";

    switch (msg.body.trim()) {
        case '1':
            funcionario = "Marino Barros";
            funcionarioNum = "5512997766363@c.us";
            break;
        case '2':
            funcionario = "Samuel Calazans";
            funcionarioNum = "5512988779303@c.us";
            break;
        case '3':
            funcionario = "Flávio Barros";
            funcionarioNum = "5512997752750@c.us";
            break;
        case '4':
            funcionario = "Sem preferência";
            funcionarioNum = "120363362518310323@g.us"; 
            break;
        default:
            return;
    }

    const contact = await msg.getContact();
    const userName = contact.pushname || "Usuário";
    const userNumber = msg.from.replace('@c.us', '');

    // Mensagem para o usuário
    await client.sendMessage(
        msg.from,
        `✅ Entendido! Vou encaminhar seu pedido de atendimento para ${funcionario}.\n\n➡️ Digite *0* para voltar ao menu.`
    );

    // Mensagem para o funcionário
    await client.sendMessage(
        funcionarioNum,
        `📢 Novo atendimento!\n\n` +
        `Nome: ${userName}\n` +
        `Número: +${userNumber}\n` +
        `Para falar com o cliente, clique aqui: https://wa.me/${userNumber}\n\n` +
        `Deseja falar com: ${funcionario}`
    );

    // Estado de handover -> o bot para de responder até reset
    userStates.set(msg.from, "handover");
}

// ====== MENU PRINCIPAL ======
async function handleMenu(msg) {
    const chat = await msg.getChat();
    const option = msg.body.trim();

    switch (option) {
        case '1':
            await chat.sendStateTyping(); await delay(2000);
            await client.sendMessage(msg.from,
                '🏠 Leilão de imóveis é uma forma de comprar imóveis por preços abaixo do mercado.\n' +
                '⚖️ Pode ser judicial ou extrajudicial.\n' +
                '📌 Edital → 1º leilão (avaliação) → 2º leilão (valor menor).\n' +
                '💰 Quem dá o maior lance, leva.\n\n➡️ Digite *0* para voltar ao menu.'
            );
            break;
        case '2':
            await chat.sendStateTyping(); await delay(2000);
            await client.sendMessage(msg.from,
                'Nossa assessoria te acompanha em todas as etapas:\n' +
                '🧐 Analisamos o edital;\n🎯 Montamos estratégia;\n📌 Auxiliamos cadastro;\n🤝 Acompanhamos até a posse.\n\n' +
                'Você só paga se arrematar!\n\n➡️ Digite *0* para voltar ao menu.'
            );
            break;
        case '3':
            await chat.sendStateTyping(); await delay(2000);
            await client.sendMessage(msg.from, 'Seja bem-vindo(a) ao nosso grupo!!');
            await client.sendMessage(msg.from, '👉 Link: https://chat.whatsapp.com/FDTNyTiSibq6Qq2l6csJpw\n\n➡️ Digite *0* para voltar ao menu.');
            break;
        case '4':
            await chat.sendStateTyping(); await delay(1000);
            await client.sendMessage(msg.from, 'Aqui estão nossas redes sociais: \nInstagram: https://www.instagram.com/doulhe_3_arrematei \nFacebook: https://www.facebook.com/profile.php?id=61567777044020 \nSite: https://www.doulhe3arrematei.com.br/\n\n➡️ Digite *0* para voltar ao menu.');
            break;
        case '5':
            await chat.sendStateTyping(); await delay(2000);
            await client.sendMessage(msg.from,
                'O valor da nossa assessoria varia:\n\n' +
                '- Até R$ 500.000: 10% sobre o arremate\n' +
                '- Acima de R$ 500.000: 5% sobre o arremate\n\n' +
                'Se não arrematar, não paga nada.\n\n➡️ Digite *0* para voltar ao menu.'
            );
            break;
        case '6':
            await chat.sendStateTyping(); await delay(2000);
            await client.sendMessage(msg.from,
                '🤝 Atendimento Humanizado!\n\n' +
                '1 - Marino Barros\n2 - Samuel Calazans\n3 - Flávio Barros\n4 - Sem preferência\n\n➡️ Digite *0* para voltar ao menu.'
            );
            userStates.set(msg.from, "escolherFuncionario");
            break;
        default:
            await client.sendMessage(msg.from, 
            );
            break;
    }
}

// ====== EVENTO DE MENSAGEM ======
client.on('message', async msg => {
    const userId = msg.from;
    const userState = userStates.get(userId) || "novo";
    const text = msg.body.toLowerCase();

    if (msg.fromMe) return; // ignora mensagens do próprio bot

    // Cooldown de 20 segundos
    const cooldown = 20 * 1000; 
    const lastMsg = userCooldowns.get(userId) || 0;
    if (Date.now() - lastMsg < cooldown && userState !== "handover") return;

    if (msg.body.trim() === '0' && userId.endsWith('@c.us')) {
        await sendIntro(msg);
        return;
    }

    // Se está em atendimento humano, o bot não responde
    if (userState === "handover") return;

    if (userState === "escolherFuncionario") {
        await handleFuncionario(msg);
        return;
    } else if (userState === "menu") {
        await handleMenu(msg);
        userCooldowns.set(userId, Date.now());
        return;
    }

    // ======= PRIMEIRA INTERAÇÃO =======
    if (!userInitiated.get(userId)) {
        userInitiated.set(userId, true);
        const hasTrigger = triggerKeywords.some(keyword => text.includes(keyword));
        if (hasTrigger && userState === "novo" && userId.endsWith('@c.us')) {
            await sendIntro(msg);
        }
    }
});
