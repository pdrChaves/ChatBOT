// leitor de qr code
const qrcode = require('qrcode-terminal');
const { Client, Buttons, List, MessageMedia } = require('whatsapp-web.js'); // Mudança Buttons
const client = new Client();
// serviço de leitura do qr code
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});
// verificação
client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});
 
client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms)); // Função delay entre uma ação e outra

client.on('message', async msg => {

    if (msg.body.match(/(dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola|Imovel|imovel|saber|informação|informacao| )/i) && msg.from.endsWith('@c.us')) {

        const chat = await msg.getChat();

        await delay(2000); //delay 3 segundos
        await chat.sendStateTyping(); // Simula Digitação
        const contact = await msg.getContact(); //Pegando o contato
        const name = contact.pushname; //Pegando o nome do contato
        await delay(3000);
        await client.sendMessage(msg.from,'Olá! '+ name.split(" ")[0] + ', sou o assistente virtual da Dou-lhe3 arrematei!. Como posso ajudá-lo hoje? Por favor, digite uma das opções abaixo:\n\n1 - Como funciona os leilões? \n2 - Como funciona nossa a nossa acessoria? \n3 - Participar do grupo para receber as melhores oportunidades de imóveis \n4 - Nossas redes sociais \n5 - Quanto é o investimento em nossos serviços?\n 6 - Atendimento Humanizado'); //Primeira mensagem de texto
        
    }

    if (msg.body !== null && msg.body === '1' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();


        await delay(1000); //delay de 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(2000);
        await client.sendMessage(msg.from, '🏠 Leilão de imóveis é uma forma de comprar imóveis por preços abaixo do mercado. \n⚖️ Pode ser judicial (quando o bem é penhorado por dívidas) ou extrajudicial (quando o banco retoma por falta de pagamento). \n📌 Funciona assim: é publicado um edital com todas as regras → acontece o 1º leilão (valor de avaliação) → se não vender, vai para o 2º leilão (com valor mínimo menor). \n💰 Quem dá o maior lance, leva.');
    }

    if (msg.body !== null && msg.body === '2' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(1000); 
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(2000);
        await client.sendMessage(msg.from, 'Nossa assessoria te acompanha e orienta em todas as etapas do processo:\n🧐 Fazemos uma análise minuciosa do edital, identificando todos os pontos importantes, possíveis pendências e riscos do imóvel;\n🎯 Montamos uma estratégia de lance personalizada;\n📝 Formalizamos tudo com contrato e transparência;\n📌 Ajudamos você a se cadastrar no site do leiloeiro;\n🤝 Acompanhamos até você conseguir a posse do imóvel. \n\nÉ um serviço completo e você só paga se arrematar!');
    }

    if (msg.body !== null && msg.body === '3' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(1000); 
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(msg.from, 'Seja bem vindo(a) ao nosso grupo!!')
        await client.sendMessage(msg.from, 'Aqui está o link: https://chat.whatsapp.com/FDTNyTiSibq6Qq2l6csJpw');
    }

    if (msg.body !== null && msg.body === '4' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();

        await delay(1000); 
        await chat.sendStateTyping(); 
        await delay(2000);
        await client.sendMessage(msg.from, 'Aqui estão nossas redes sociais! para você ficar por dentro de tudo que rola no mundo dos leilões!')
        await chat.sendStateTyping(); 
        await delay(2000);
        await client.sendMessage(msg.from, 'Instagram: https://www.instagram.com/doulhe_3_arrematei');
        await chat.sendStateTyping(); 
        await delay(2000);
        await client.sendMessage(msg.from, 'Facebook: https://www.facebook.com/profile.php?id=61567777044020');
        await chat.sendStateTyping(); 
        await delay(2000);
        await client.sendMessage(msg.from, 'Site: https://www.doulhe3arrematei.com.br/');

    }

    if (msg.body !== null && msg.body === '5' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await delay(1000); 
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(msg.from, "O valor da nossa assessoria varia conforme o valor do imóvel:\n\n- Imóveis de até R$ 500.000,00: cobramos 10% sobre o valor arrematado\n- Imóveis acima de R$ 500.000,00: cobramos 5% sobre o valor arrematado\n\nE o melhor: se o imóvel não for arrematado, você não paga nada.\nTudo é formalizado com um contrato de prestação de serviços, garantindo total transparência e segurança jurídica.");
    }

    if (msg.body !== null && msg.body === '6' && msg.from.endsWith('@c.us')){
        await delay(1000);
        await chat.sendStateTyping();
        await delay(2000);
        await client.sendMessage(msg.from, 'Perfeito! um de nossos atendentes ira te atender assim que possivel.');
    }
});
