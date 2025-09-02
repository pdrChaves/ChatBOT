// leitor de qr code
const qrcode = require('qrcode-terminal');
const { Client, Buttons, List, MessageMedia } = require('whatsapp-web.js');
const client = new Client();

// serviço de leitura do qr code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// verificação
client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms)); // Função delay

// Armazena último disparo de apresentação por usuário
const userCooldowns = new Map(); // { '551199999999@c.us': timestamp }

// Armazena estado de conversa por usuário
// Exemplo de estados: "novo", "menu", "atendimentoHumano"
const userStates = new Map(); // { '551199999999@c.us': 'menu' }

client.on('message', async msg => {
    const userId = msg.from;
    const now = Date.now();

    // Função para disparar menu inicial
    async function sendIntro() {
        const chat = await msg.getChat();
        const contact = await msg.getContact();
        const name = contact.pushname;

        await chat.sendStateTyping();
        await delay(2000);

        await client.sendMessage(
            msg.from,
            `Olá, ${name.split(" ")[0]}! Sou o assistente virtual da Dou-lhe3 arrematei! Como posso ajudá-lo hoje?\n\n1 - Como funciona os leilões? \n2 - Como funciona nossa assessoria? \n3 - Participar do grupo para receber as melhores oportunidades de imóveis \n4 - Nossas redes sociais \n5 - Quanto é o investimento em nossos serviços?\n6 - Atendimento Humanizado`
        );

        // Atualiza controle de tempo e estado
        userCooldowns.set(userId, now);
        userStates.set(userId, "menu");
    }

    // ======================
    // BLOCO DE INTRODUÇÃO
    // ======================
    if (
        msg.body.match(/(dia|tarde|noite|oi|olá|ola|imovel|informação|informacao)/i) &&
        userId.endsWith('@c.us')
    ) {
        const lastInteraction = userCooldowns.get(userId) || 0;
        const userState = userStates.get(userId) || "novo";

        // Só manda a apresentação se:
        // 1 - Passou mais de 1h desde a última (3600000 ms)
        // OU 2 - Estado é "novo"
        if (now - lastInteraction > 3600000 || userState === "novo") {
            await sendIntro();
            return; // evita cair nos outros fluxos
        }
    }

    // ======================
    // OPÇÕES DO MENU
    // ======================
    if (msg.body === '1' && userId.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(1000);
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(
            msg.from,
            '🏠 Leilão de imóveis é uma forma de comprar imóveis por preços abaixo do mercado. \n⚖️ Pode ser judicial (quando o bem é penhorado por dívidas) ou extrajudicial (quando o banco retoma por falta de pagamento). \n📌 Funciona assim: é publicado um edital com todas as regras → acontece o 1º leilão (valor de avaliação) → se não vender, vai para o 2º leilão (com valor mínimo menor). \n💰 Quem dá o maior lance, leva.'
        );
    } 
    else if (msg.body === '2' && userId.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(1000); 
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(
            msg.from,
            'Nossa assessoria te acompanha e orienta em todas as etapas do processo:\n🧐 Fazemos uma análise minuciosa do edital, identificando todos os pontos importantes, possíveis pendências e riscos do imóvel;\n🎯 Montamos uma estratégia de lance personalizada;\n📝 Formalizamos tudo com contrato e transparência;\n📌 Ajudamos você a se cadastrar no site do leiloeiro;\n🤝 Acompanhamos até você conseguir a posse do imóvel. \n\nÉ um serviço completo e você só paga se arrematar!'
        );
    } 
    else if (msg.body === '3' && userId.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(1000); 
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(msg.from, 'Seja bem vindo(a) ao nosso grupo!!');
        await client.sendMessage(msg.from, 'Aqui está o link: https://chat.whatsapp.com/FDTNyTiSibq6Qq2l6csJpw');
    } 
    else if (msg.body === '4' && userId.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(1000); 
        await chat.sendStateTyping(); 
        await delay(1000);
        await client.sendMessage(msg.from, 'Aqui estão nossas redes sociais! para você ficar por dentro de tudo que rola no mundo dos leilões!');
        await delay(1000);
        await chat.sendStateTyping(); 
        await delay(1000);
        await client.sendMessage(msg.from, 'Instagram: https://www.instagram.com/doulhe_3_arrematei');
        await delay(1000);
        await chat.sendStateTyping(); 
        await delay(1000);
        await client.sendMessage(msg.from, 'Facebook: https://www.facebook.com/profile.php?id=61567777044020');
        await delay(1000);
        await chat.sendStateTyping(); 
        await delay(1000);
        await client.sendMessage(msg.from, 'Site: https://www.doulhe3arrematei.com.br/');
    } 
    else if (msg.body === '5' && userId.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(1000); 
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(
            msg.from,
            "O valor da nossa assessoria varia conforme o valor do imóvel:\n\n- Imóveis de até R$ 500.000,00: cobramos 10% sobre o valor arrematado\n- Imóveis acima de R$ 500.000,00: cobramos 5% sobre o valor arrematado\n\nE o melhor: se o imóvel não for arrematado, você não paga nada.\nTudo é formalizado com um contrato de prestação de serviços, garantindo total transparência e segurança jurídica."
        );
    } 
    else if (msg.body === '6' && userId.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(1000);
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(
            msg.from,
            '🤝 Atendimento Humanizado confirmado!\n\n' +
            'Com qual dos nossos atendentes você gostaria de falar?\n' +
            '1 - Marino\n' +
            '2 - Samuel\n' +
            '3 - Sem preferência'
        );
        
        // Muda estado para escolher funcionário
        userStates.set(userId, "escolherFuncionario");
    }

    // ======================
    // ESCOLHA DO FUNCIONÁRIO
    // ======================
    else if (userStates.get(userId) === "escolherFuncionario" && userId.endsWith('@c.us')) {
        let funcionario = "";
        let funcionarioNum = ""; // número ou grupo no WhatsApp

        switch (msg.body) {
            case '1':
                funcionario = "Marino";
                funcionarioNum = "5512997766363@c.us";
                break;
            case '2':
                funcionario = "Samuel";
                funcionarioNum = "5512988779303@c.us";
                break;
            default:
                await client.sendMessage(msg.from, "❌ Opção inválida. Digite apenas 1, 2 ou 3 ");
                return;
        }

        await client.sendMessage(
            msg.from,
            `✅ Entendido! Vou encaminhar seu pedido de atendimento para ${funcionario === "Sem preferência" ? "o grupo da equipe" : funcionario}.`
        );

        // Notificação para o funcionário ou grupo
        await client.sendMessage(
            funcionarioNum,
            `📢 Novo atendimento!\n\nUsuário: ${msg.from}\nDeseja falar com: ${funcionario}`
        );

        // Atualiza estado
        userStates.set(userId, "atendimentoHumano");
    }
});
