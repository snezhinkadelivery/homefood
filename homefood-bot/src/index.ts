import 'dotenv/config';
import { bot } from './bot';
import { startServer } from './api/server';
import { startReviewCron } from './jobs/reviewCron';

async function main(): Promise<void> {
  // 1. Запустить HTTP сервер
  startServer();

  // 2. Зарегистрировать команды меню
  try {
    await bot.telegram.setMyCommands([
      { command: 'start', description: 'Открыть меню' },
      { command: 'myorders', description: 'Мои заказы' },
      { command: 'admin', description: 'Войти в CRM' },
    ]);
    console.log('[bot] commands registered');
  } catch (err) {
    console.error('[bot] setMyCommands error:', err);
  }

  // 3. Установить webhook если задан WEBHOOK_URL
  const webhookUrl = process.env.WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const url = webhookUrl.endsWith('/webhook')
        ? webhookUrl
        : `${webhookUrl}/webhook`;
      await bot.telegram.setWebhook(url);
      console.log(`[bot] webhook set to ${url}`);
    } catch (err) {
      console.error('[bot] setWebhook error:', err);
    }
  } else {
    console.warn('[bot] WEBHOOK_URL not set — webhook not configured');
  }

  // 3. Запустить cron отзывов
  startReviewCron();

  console.log('HomeFood Bot started 🏠');
}

main().catch((err) => {
  console.error('[main] fatal error:', err);
  process.exit(1);
});
