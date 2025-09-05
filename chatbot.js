const qrcode = require('qrcode-terminal');
const { Client, Buttons, List, MessageMedia } = require('whatsapp-web.js');
const client = new Client();

const delay = ms => new Promise(res => setTimeout(res, ms)); //delay

// ====== ESTADOS E COOLDOWNS ======
const userCooldowns = new Map(); // { '551199999999@c.us': timestamp }
const userStates = new Map(); // { '551199999999@c.us': 'menu' }
const userInitiated = new Map(); // marca se o usuário iniciou a conversa

const triggerKeywords = ['olá', 'Olá', 'ola', 'Ola', 'Oi',  'oi', 'dia', 'tarde', 'noite', 'atendimento']; //palavras que ativam o bot

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
}); //qr code para conectar

client.on('ready', async () => {
    console.log('✅ Tudo certo! WhatsApp conectado.');

    const chats = await client.getChats();
    const grupos = chats.filter(chat => chat.isGroup);

    console.log("📋 Lista de grupos que você participa:");
    grupos.forEach(group => {
        console.log(`${group.name} -> ${group.id._serialized}`);
    });

    console.log("⚠️ Copie o ID do grupo desejado e substitua no switch (case '4').");
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
        `3 - Participar do grupo para receber as melhores oportunidades de imóveis\n` +
        `4 - Nossas redes sociais\n` +
        `5 - Quanto é o investimento em nossos serviços?\n` +
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
            await client.sendMessage(msg.from, "❌ Opção inválida. Digite apenas 1, 2, 3 ou 4\n\n➡️ Digite *0* para voltar ao menu.");
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

    // Reinicia o estado do usuário
    userStates.set(msg.from, "novo");
    userCooldowns.set(msg.from, 0);
}

// ====== MENU PRINCIPAL ======
async function handleMenu(msg) {
    const chat = await msg.getChat();
    const option = msg.body.trim();

    switch (option) {
        case '1':
            await chat.sendStateTyping();
            await delay(2000);
            await client.sendMessage(
                msg.from,
                '🏠 Leilão de imóveis é uma forma de comprar imóveis por preços abaixo do mercado.\n' +
                '⚖️ Pode ser judicial (quando o bem é penhorado por dívidas) ou extrajudicial (quando o banco retoma por falta de pagamento).\n' +
                '📌 Funciona assim: é publicado um edital → acontece o 1º leilão (valor de avaliação) → se não vender, vai para o 2º leilão (valor mínimo menor).\n' +
                '💰 Quem dá o maior lance, leva.\n\n➡️ Digite *0* para voltar ao menu.'
            );
            break;
        case '2':
            await chat.sendStateTyping();
            await delay(2000);
            await client.sendMessage(
                msg.from,
                'Nossa assessoria te acompanha em todas as etapas do processo:\n' +
                '🧐 Analisamos o edital e os riscos;\n' +
                '🎯 Montamos estratégia de lance personalizada;\n' +
                '📌 Ajudamos você a se cadastrar no site do leiloeiro;\n' +
                '🤝 Acompanhamos até você conseguir a posse do imóvel.\n\n' +
                'Você só paga se arrematar!\n\n➡️ Digite *0* para voltar ao menu.'
            );
            break;
        case '3':
            await chat.sendStateTyping();
            await delay(2000);
            await client.sendMessage(msg.from, 'Seja bem-vindo(a) ao nosso grupo!!');
            await client.sendMessage(msg.from, '👉 Link: https://chat.whatsapp.com/FDTNyTiSibq6Qq2l6csJpw\n\n➡️ Digite *0* para voltar ao menu.');
            break;
        case '4':
            await chat.sendStateTyping();
            await delay(1000);
            await client.sendMessage(msg.from, 'Aqui estão nossas redes sociais:');
            await client.sendMessage(msg.from, 'Instagram: https://www.instagram.com/doulhe_3_arrematei');
            await client.sendMessage(msg.from, 'Facebook: https://www.facebook.com/profile.php?id=61567777044020');
            await client.sendMessage(msg.from, 'Site: https://www.doulhe3arrematei.com.br/\n\n➡️ Digite *0* para voltar ao menu.');
            break;
        case '5':
            await chat.sendStateTyping();
            await delay(2000);
            await client.sendMessage(
                msg.from,
                'O valor da nossa assessoria varia conforme o imóvel:\n\n' +
                '- Até R$ 500.000,00: 10% sobre o arremate\n' +
                '- Acima de R$ 500.000,00: 5% sobre o arremate\n\n' +
                'Se não arrematar, não paga nada.\n' +
                'Tudo com contrato formal.\n\n➡️ Digite *0* para voltar ao menu.'
            );
            break;
        case '6':
            await chat.sendStateTyping();
            await delay(2000);
            await client.sendMessage(
                msg.from,
                '🤝 Atendimento Humanizado confirmado!\n\n' +
                'Com qual dos nossos atendentes você gostaria de falar?\n' +
                '1 - Marino Barros\n' +
                '2 - Samuel Calazans\n' +
                '3 - Flávio Barros\n' +
                '4 - Sem preferência\n\n➡️ Digite *0* para voltar ao menu.'
            );
            userStates.set(msg.from, "escolherFuncionario");
            break;
        default:
            await client.sendMessage(msg.from, "❌ Opção inválida.\n\n➡️ Digite *0* para voltar ao menu.");
            break;
    }
}

// ====== EVENTO DE MENSAGEM ======
client.on('message', async msg => {
    const userId = msg.from;
    const userState = userStates.get(userId) || "novo";
    const text = msg.body.toLowerCase();

    if (msg.fromMe) return; //se eu mandar mensagem, ele ignora.

    if (msg.body.trim() === '0' && userId.endsWith('@c.us')) {
        await sendIntro(msg);
        return; //opção para voltar ao menu
    }

    if (userState !== "novo" && userId.endsWith('@c.us')) {
        if (userState === "escolherFuncionario") {
            await handleFuncionario(msg);
        } else if (userState === "menu") {
            await handleMenu(msg);
        }
        return;
    }

    // ======= CHECA SE O USUÁRIO INICIOU A CONVERSA =======
    if (!userInitiated.get(userId)) {
        // Usuário enviou a primeira mensagem
        userInitiated.set(userId, true);

        // ======= CHECA PALAVRA-CHAVE PARA ATIVAR O BOT =======
        const hasTrigger = triggerKeywords.some(keyword => text.includes(keyword));
        if (hasTrigger && userState === "novo" && userId.endsWith('@c.us')) {
            await sendIntro(msg);
        }
    }
});
