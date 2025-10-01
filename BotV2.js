const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth(), 
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

const delay = ms => new Promise(res => setTimeout(res, ms));

const userStates = new Map(); //etapas
const userInitiated = new Map(); //úsuario inicia conversa
const userLastInteraction = new Map(); //timestamp da última interação
const TIMEOUT_MS = 60 * 60 * 1000; 
const triggerKeywords = ['olá','ola','oi','dia','tarde','noite','atendimento'];

let reconnectAttempts = 0;
const MAX_RECONNECT = 5;

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    reconnectAttempts = 0;
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

function isUserInactive(userId) {
    const lastTime = userLastInteraction.get(userId);
    if (!lastTime) return true;
    const now = Date.now();
    return now - lastTime > TIMEOUT_MS;
}

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
    userStates.set(msg.from, "menu");
}

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

    await client.sendMessage(
        msg.from,
        `✅ Entendido! Vou encaminhar seu pedido de atendimento para ${funcionario}.\n\n➡️ Digite *0* para voltar ao menu.`
    );

    await client.sendMessage(
        funcionarioNum,
        `📢 Novo atendimento!\n\n` +
        `Nome: ${userName}\n` +
        `Número: +${userNumber}\n` +
        `Para falar com o cliente, clique aqui: https://wa.me/${userNumber}\n\n` +
        `Deseja falar com: ${funcionario}`
    );

    userStates.set(msg.from, "handover");
}

async function handleMenu(msg) {
    const chat = await msg.getChat();
    const option = msg.body.trim();

    switch (option) {
        case '1':
            await chat.sendStateTyping(); await delay(2000);
            await client.sendMessage(msg.from,
                '🏠 Leilão de imóveis é uma forma de comprar imóveis por preços abaixo do mercado.\n'+
                '⚖️ Pode ser judicial (quando o bem é penhorado por dívidas) ou extrajudicial (quando o banco retoma por falta de pagamento).\n'+
                '📌 Funciona assim: é publicado um edital → acontece o 1º leilão (valor de avaliação) → se não vender, vai para o 2º leilão (valor mínimo menor).'+
                '\n💰 Quem dá o maior lance, leva.\n\n'+
                '➡️ Digite 0 para voltar ao menu.'
            );
            break;
        case '2':
            await chat.sendStateTyping(); await delay(2000);
            await client.sendMessage(msg.from,
                'Nossa assessoria te acompanha e orienta em todas as etapas do processo:\n'+
                '🧐 Fazemos uma análise minuciosa do edital, identificando todos os pontos importantes, possíveis pendências e riscos do imóvel;\n'+
                '🎯 Montamos uma estratégia de lance personalizada;\n'+
                '📝 Formalizamos tudo com contrato e transparência;\n'+
                '📌 Ajudamos você a se cadastrar no site do leiloeiro;\n'+
                '🤝 Acompanhamos até você conseguir a posse do imóvel.\n\n'+
                'É um serviço completo e você só paga se arrematar!\n'+
                'Digite *0* para voltar ao menu.'
            );
            break;
        case '3':
            await chat.sendStateTyping(); await delay(2000);
            await client.sendMessage(msg.from, 'Seja bem-vindo(a) ao nosso grupo!!');
            await client.sendMessage(msg.from, '👉 Link: https://chat.whatsapp.com/FDTNyTiSibq6Qq2l6csJpw\n\n➡️ Digite *0* para voltar ao menu.');
            break;
        case '4':
            await chat.sendStateTyping(); await delay(1000);
            await client.sendMessage(msg.from, 'Aqui estão nossas redes sociais: \nInstagram: https://www.instagram.com/doulhe_3_arrematei \n'+
                'Facebook: https://www.facebook.com/profile.php?id=61567777044020\n'+
                'Site: https://www.doulhe3arrematei.com.br/\n\n'+
                '➡️ Digite *0* para voltar ao menu.');
            break;
        case '5':
            await chat.sendStateTyping(); await delay(2000);
            await client.sendMessage(msg.from,
                'O valor da nossa assessoria varia conforme o valor do imóvel:\n\n'+
                '- Imóveis de até R$ 500.000,00: cobramos 10% sobre o valor arrematado\n'+
                '- Imóveis acima de R$ 500.000,00: cobramos 5% sobre o valor arrematado\n\n'+
                'Se o imóvel não for arrematado, você não paga nada.\n'+
                'Tudo formalizado com contrato de prestação de serviços.'
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
            break;
    }
}

client.on('message', async msg => {
    const userId = msg.from;
    const userState = userStates.get(userId) || "novo";
    const text = msg.body.toLowerCase();

    if (msg.fromMe) return;

    userLastInteraction.set(userId, Date.now());

    if (msg.body.trim() === '0' && userId.endsWith('@c.us')) {
        await sendIntro(msg);
        return;
    }

    if (userState === "handover") return;

    if (userState === "escolherFuncionario") {
        await handleFuncionario(msg);
        return;
    } else if (userState === "menu") {
        await handleMenu(msg);
        return;
    }

    const hasTrigger = triggerKeywords.some(keyword => text.includes(keyword));

    if (
        hasTrigger &&
        userState === "novo" &&
        userId.endsWith('@c.us') &&
        isUserInactive(userId)
    ) {
        await sendIntro(msg);
        userInitiated.set(userId, true);
    }
});
