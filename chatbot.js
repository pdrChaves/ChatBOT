// ====== IMPORTS ======
const qrcode = require('qrcode-terminal');
const { Client, Buttons, List, MessageMedia } = require('whatsapp-web.js');
const client = new Client();

// ====== FUNÇÃO DE DELAY ======
const delay = ms => new Promise(res => setTimeout(res, ms));

// ====== ESTADOS E COOLDOWNS ======
const userCooldowns = new Map(); // { '551199999999@c.us': timestamp }
const userStates = new Map(); // { '551199999999@c.us': 'menu' }

// ====== INICIALIZAÇÃO DO CLIENTE ======
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});
 // ====== CONFIRMAÇÃO DE LOGIN =====
client.on('ready', async () => {
    console.log('✅ Tudo certo! WhatsApp conectado.');

    // Lista todos os grupos para pegar o ID
    const chats = await client.getChats();
    const grupos = chats.filter(chat => chat.isGroup);

    console.log("📋 Lista de grupos que você participa:");
    grupos.forEach(group => {
        console.log(`${group.name} -> ${group.id._serialized}`);
    });

    console.log("⚠️ Copie o ID do grupo desejado e substitua no switch (case '4').");
});

client.initialize();

// ====== FUNÇÃO DE MENU INICIAL ======
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
        `6 - Atendimento Humanizado`
    );

    userCooldowns.set(msg.from, Date.now());
    userStates.set(msg.from, "menu");
}

// ====== FUNÇÃO PARA ESCOLHA DE FUNCIONÁRIO ======
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
            await client.sendMessage(msg.from, "❌ Opção inválida. Digite apenas 1, 2, 3 ou 4");
            return;
    }

    const contact = await msg.getContact();
    const userName = contact.pushname || "Usuário";
    const userNumber = msg.from.replace('@c.us', '');

    // Mensagem para o usuário
    await client.sendMessage(
        msg.from,
        `✅ Entendido! Vou encaminhar seu pedido de atendimento para ${funcionario}.`
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

// ====== FUNÇÃO PARA MENU PRINCIPAL ======
async function handleMenu(msg) {
    const chat = await msg.getChat();
    const option = msg.body.trim();

    switch (option) {
        case '1':
            await chat.sendStateTyping();
            await delay(2000);
            await client.sendMessage(
                msg.from,
                '🏠 Leilão de imóveis é uma forma de comprar imóveis por preços abaixo do mercado. \n' +
                '⚖️ Pode ser judicial (quando o bem é penhorado por dívidas) ou extrajudicial (quando o banco retoma por falta de pagamento). \n' +
                '📌 Funciona assim: é publicado um edital com todas as regras → acontece o 1º leilão (valor de avaliação) → se não vender, vai para o 2º leilão (com valor mínimo menor). \n' +
                '💰 Quem dá o maior lance, leva.'
            );
            break;
        case '2':
            await chat.sendStateTyping();
            await delay(2000);
            await client.sendMessage(
                msg.from,
                'Nossa assessoria te acompanha e orienta em todas as etapas do processo:\n' +
                '🧐 Fazemos uma análise minuciosa do edital, identificando todos os pontos importantes, possíveis pendências e riscos do imóvel;\n' +
                '🎯 Montamos uma estratégia de lance personalizada;\n' +
                '📝 Formalizamos tudo com contrato e transparência;\n' +
                '📌 Ajudamos você a se cadastrar no site do leiloeiro;\n' +
                '🤝 Acompanhamos até você conseguir a posse do imóvel.\n\n' +
                'É um serviço completo e você só paga se arrematar!'
            );
            break;
        case '3':
            await chat.sendStateTyping();
            await delay(2000);
            await client.sendMessage(msg.from, 'Seja bem vindo(a) ao nosso grupo!!');
            await client.sendMessage(msg.from, 'Link: https://chat.whatsapp.com/FDTNyTiSibq6Qq2l6csJpw');
            break;
        case '4':
            await chat.sendStateTyping();
            await delay(1000);
            await client.sendMessage(msg.from, 'Aqui estão nossas redes sociais:');
            await client.sendMessage(msg.from, 'Instagram: https://www.instagram.com/doulhe_3_arrematei');
            await client.sendMessage(msg.from, 'Facebook: https://www.facebook.com/profile.php?id=61567777044020');
            await client.sendMessage(msg.from, 'Site: https://www.doulhe3arrematei.com.br/');
            break;
        case '5':
            await chat.sendStateTyping();
            await delay(2000);
            await client.sendMessage(msg.from, 'O valor da nossa assessoria varia conforme o valor do imóvel:\n\n' +
                '- Imóveis de até R$ 500.000,00: cobramos 10% sobre o valor arrematado\n' +
                '- Imóveis acima de R$ 500.000,00: cobramos 5% sobre o valor arrematado\n\n' +
                'Se o imóvel não for arrematado, você não paga nada.\n' +
                'Tudo formalizado com contrato de prestação de serviços.'
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
                '4 - Sem preferência'
            );
            userStates.set(msg.from, "escolherFuncionario");
            break;
        default:
            // não faz nada se opção inválida
            break;
    }
}

// ====== EVENTO DE MENSAGEM ======
client.on('message', async msg => {
    const userId = msg.from;
    const userState = userStates.get(userId) || "novo";

    // ======= CHAMA SENDINTRO AUTOMATICAMENTE =======
    if(userState === "novo" && msg.from.endsWith('@c.us')) {
        await sendIntro(msg);
        return;
    }

    // ======= ESCOLHA DE FUNCIONÁRIO =======
    if(userState === "escolherFuncionario" && userId.endsWith('@c.us')) {
        await handleFuncionario(msg);
        return;
    }

    // ======= MENU PRINCIPAL =======
    if(userState === "menu" && userId.endsWith('@c.us')) {
        await handleMenu(msg);
        return;
    }
});
