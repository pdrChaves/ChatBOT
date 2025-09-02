// leitor de qr code
const qrcode = require('qrcode-terminal');
const { Client, Buttons, List, MessageMedia } = require('whatsapp-web.js');
const client = new Client();

// serviço de leitura do qr code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// verificação
client.on('ready', async () => {
    console.log('Tudo certo! WhatsApp conectado.');

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

const delay = ms => new Promise(res => setTimeout(res, ms)); // Função delay

// Armazena último disparo de apresentação por usuário
const userCooldowns = new Map(); // { '551199999999@c.us': timestamp }

// Armazena estado de conversa por usuário
// Exemplo de estados: "novo", "menu", "escolherFuncionario", "atendimentoHumano"
const userStates = new Map(); // { '551199999999@c.us': 'menu' }

// Função para disparar menu inicial
async function sendIntro(msg) {
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const name = contact.pushname;

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

    // Atualiza controle de tempo e estado
    userCooldowns.set(msg.from, Date.now());
    userStates.set(msg.from, "menu");
}

client.on('message', async msg => {
    const userId = msg.from;
    const now = Date.now();
    const userState = userStates.get(userId) || "novo";

   if (userState === "escolherFuncionario" && userId.endsWith('@c.us')) {
    let funcionario = "";
    let funcionarioNum = ""; // funcionário ou grupo
    // @c.us para contatos
    // @g.us para grupos

    switch (msg.body) {
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

    // Pega informações do usuário para envio ao funcionário
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
    userStates.set(userId, "novo");
    userCooldowns.set(userId, 0);

    return; // importante: impede cair no menu principal
}
    // ======================
    // 3. OPÇÕES DO MENU
    // ======================
    if (userState === "menu" && userId.endsWith('@c.us')) {
        const chat = await msg.getChat();

        switch (msg.body) {
            case '1':
                await delay(1000);
                await chat.sendStateTyping();
                await delay(2000);
                await client.sendMessage(
                    userId,
                    '🏠 Leilão de imóveis é uma forma de comprar imóveis por preços abaixo do mercado. \n⚖️ Pode ser judicial (quando o bem é penhorado por dívidas) ou extrajudicial (quando o banco retoma por falta de pagamento). \n📌 Funciona assim: é publicado um edital com todas as regras → acontece o 1º leilão (valor de avaliação) → se não vender, vai para o 2º leilão (com valor mínimo menor). \n💰 Quem dá o maior lance, leva.'
                );
                break;
            case '2':
                await delay(1000); 
                await chat.sendStateTyping();
                await delay(2000);
                await client.sendMessage(
                    userId,
                    'Nossa assessoria te acompanha e orienta em todas as etapas do processo:\n🧐 Fazemos uma análise minuciosa do edital, identificando todos os pontos importantes, possíveis pendências e riscos do imóvel;\n🎯 Montamos uma estratégia de lance personalizada;\n📝 Formalizamos tudo com contrato e transparência;\n📌 Ajudamos você a se cadastrar no site do leiloeiro;\n🤝 Acompanhamos até você conseguir a posse do imóvel. \n\nÉ um serviço completo e você só paga se arrematar!'
                );
                break;
            case '3':
                await delay(1000); 
                await chat.sendStateTyping();
                await delay(2000);
                await client.sendMessage(userId, 'Seja bem vindo(a) ao nosso grupo!!');
                await client.sendMessage(userId, 'Aqui está o link: https://chat.whatsapp.com/FDTNyTiSibq6Qq2l6csJpw');
                break;
            case '4':
                await delay(1000); 
                await chat.sendStateTyping(); 
                await delay(1000);
                await client.sendMessage(userId, 'Aqui estão nossas redes sociais! para você ficar por dentro de tudo que rola no mundo dos leilões');
                await client.sendMessage(userId, 'Instagram: https://www.instagram.com/doulhe_3_arrematei');
                await client.sendMessage(userId, 'Facebook: https://www.facebook.com/profile.php?id=61567777044020');
                await client.sendMessage(userId, 'Site: https://www.doulhe3arrematei.com.br/');
                break;
            case '5':
                await delay(1000); 
                await chat.sendStateTyping();
                await delay(2000);
                await client.sendMessage(userId, 'O valor da nossa assessoria varia conforme o valor do imóvel:\n\n- Imóveis de até R$ 500.000,00: cobramos 10% sobre o valor arrematado\n- Imóveis acima de R$ 500.000,00: cobramos 5% sobre o valor arrematado\n\nE o melhor: se o imóvel não for arrematado, você não paga nada.\n\nTudo é formalizado com um contrato de prestação de serviços, garantindo total transparência e segurança jurídica.');
                break;
            case '6':
                await delay(1000);
                await chat.sendStateTyping();
                await delay(2000);
                await client.sendMessage(
                    userId,
                    '🤝 Atendimento Humanizado confirmado!\n\n' +
                    'Com qual dos nossos atendentes você gostaria de falar?\n' +
                    '1 - Marino Barros\n' +
                    '2 - Samuel Calazans\n' +
                    '3 - Flávio Barros \n' +
                    '4 - Sem preferência '
                );
                userStates.set(userId, "escolherFuncionario");
                break;
            default:
                // nenhuma ação se não for uma opção válida
                break;
        }
    }
});
