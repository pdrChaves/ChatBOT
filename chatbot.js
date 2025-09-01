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

    if (msg.body.match(/(dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola|Imovel|imovel|quero saber|Quero saber)/i) && msg.from.endsWith('@c.us')) {

        const chat = await msg.getChat();

        await delay(2000); //delay 3 segundos
        await chat.sendStateTyping(); // Simula Digitação
        const contact = await msg.getContact(); //Pegando o contato
        const name = contact.pushname; //Pegando o nome do contato
        await delay(3000);
        await client.sendMessage(msg.from,'Olá! '+ name.split(" ")[0] + ', sou o assistente virtual da Doulhe3 arrematei!. Como posso ajudá-lo hoje? Por favor, digite uma das opções abaixo:\n\n1 - Como funciona os leilões? \n2 - Como funciona nossa a nossa acessoria? \n3 - Participar do grupo para receber as melhores oportunidades de imóveis \n4 - Nossas redes sociais \n5 - Atendimento Humanizado'); //Primeira mensagem de texto
        
    }

    if (msg.body !== null && msg.body === '1' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();


        await delay(3000); //delay de 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000);
        await client.sendMessage(msg.from, 'A opção 1 está funcionando \n');

        await delay(2000); //delay de 2 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await client.sendMessage(msg.from, 'COMO FUNCIONA?\nÉ muito simples.\n\n1º Passo\nPRIMEIRO PASSO.\n\n2º Passo\nSEGUNDO PASSO.\n\n3º Passo\nTERCEIRO PASSO');

        /*await delay(3000); //delay de 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000);
        await client.sendMessage(msg.from, 'Acesse nosso site para mais saber: https://doulhe3arrematei.com.br');
        */

    }

    if (msg.body !== null && msg.body === '2' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();


        await delay(3000); //Delay de 3000 milisegundos mais conhecido como 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000);
        await client.sendMessage(msg.from, 'TEXTO QUEM SOMOS');

        /*await delay(3000); //delay de 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000);
        */
    }

    if (msg.body !== null && msg.body === '3' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();


        await delay(3000); //Delay de 3000 milisegundos mais conhecido como 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000);
        await client.sendMessage(msg.from, 'Link do nosso grupo de oportunidades: https://chat.whatsapp.com/FDTNyTiSibq6Qq2l6csJpw');
        
        /*
        await delay(3000); //delay de 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000);
        await client.sendMessage(msg.from, 'Link para cadastro: https://doulhe3arrematei.com.br');
        */
    }

    if (msg.body !== null && msg.body === '4' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();

        await delay(3000); //Delay de 3000 milisegundos mais conhecido como 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000);
        await client.sendMessage(msg.from, 'Nossas redes sociais\nInstagram: https://www.instagram.com/doulhe_3_arrematei \nFacebook: https://www.facebook.com/profile.php?id=61567777044020 \nSite: https://www.doulhe3arrematei.com.br/');

    }

    if (msg.body !== null && msg.body === '5' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();

        await delay(3000); //Delay de 3000 milisegundos mais conhecido como 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000);
        await client.sendMessage(msg.from, 'Se você tiver outras dúvidas ou precisar de mais informações, por favor, fale aqui nesse whatsapp ou visite nosso site: https://doulhe3arrematei.com.br ');

    }
});
