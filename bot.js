const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config(); 

const token = process.env.TOKEN; 
const bot = new TelegramBot(token, {polling: true});

const options = {
  method: 'POST',
  url: 'https://chatgpt-42.p.rapidapi.com/conversationgpt4-2',
  headers: {
    'x-rapidapi-key': process.env.RAPIDAPI_KEY, 
    'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: {
    messages: [
      {
        role: 'user',
        content: ''
      }
    ],
    system_prompt: '',
    temperature: 0.9,
    top_k: 5,
    top_p: 0.9,
    max_tokens: 256,
    web_access: false
  }
};

bot.onText(/\/start/, async (msg) => {
  const chatID = msg.chat.id;
  await bot.sendMessage(chatID, 'Welcome to the bot! Send me a request and I will try to respond with code snippets if necessary.');
});

bot.onText(/.*/, async (msg) => {
    const chatID = msg.chat.id;
    const userMessage = msg.text;

    options.data.messages[0].content = userMessage;
    const sentMessage = await bot.sendMessage(chatID, 'В процессе ⏳ ...');
    
    try {
        const response = await axios.request(options); 
        const data = response.data;
        const formattedResponse = `\`\`\`${data.result}\`\`\``;

        await bot.editMessageText(formattedResponse, {
            chat_id: chatID,
            message_id: `${sentMessage.message_id}`,
            parse_mode: '*Poll question* in Markdown'  // Ensure Markdown formatting is used for code blocks
        });
    } catch (error) {
        console.error(error);
        bot.editMessageText('Sorry, there was an error processing your request.', {
            chat_id: chatID,
            message_id: sentMessage.message_id
        });
    }
});
