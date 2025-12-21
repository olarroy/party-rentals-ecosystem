
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import express from 'express';
import { QueryHandler } from './handlers/queryHandler.js';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || 3000;
const URL = process.env.RENDER_EXTERNAL_URL; // Render provides this automatically

if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
    console.error('❌ ERROR: TELEGRAM_BOT_TOKEN is missing or default in .env');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const queryHandler = new QueryHandler();
const app = express();

app.use(express.json());

// Start message
bot.start((ctx) => {
    ctx.reply(`👋 ¡Hola ${ctx.from.first_name}! Soy el Orquestador MCP.\nPregúntame lo que necesites sobre tu negocio.\n\nPrueba: "Dame sugerencias de IA"`);
});

// Handle all text messages
bot.on('text', async (ctx) => {
    const message = ctx.message.text;

    // Show "Typing..." status
    await ctx.sendChatAction('typing');

    try {
        const reply = await queryHandler.handleMessage(message);
        await ctx.replyWithMarkdown(reply);
    } catch (error) {
        console.error(error);
        await ctx.reply('❌ Tuve un error interno procesando tu solicitud.');
    }
});

// Webhook / Polling Logic
const startBot = async () => {
    if (process.env.NODE_ENV === 'production' && URL) {
        // PRODUCTION: Use Webhooks
        const webhookPath = `/telegraf/${bot.secretPathComponent()}`;
        app.use(webhookPath, await bot.createWebhook({ domain: URL }));

        console.log(`🚀 Bot running in PRODUCTION mode (Webhooks) at ${URL}`);

        // Keep-alive endpoint for UptimeRobot
        app.get('/keep-alive', (req, res) => {
            res.send('I am alive! 🤖');
        });

        app.listen(PORT, () => {
            console.log(`HTTP Server listening on port ${PORT}`);
        });

    } else {
        // DEVELOPMENT: Use Polling
        console.log('🛠️ Bot running in DEVELOPMENT mode (Polling)');
        bot.launch().catch(err => {
            console.error('❌ Failed to launch bot:', err);
        });
    }
};

startBot();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
