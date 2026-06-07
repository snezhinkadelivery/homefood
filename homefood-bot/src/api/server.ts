import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { bot } from '../bot';
import { sendOrderCreatedNotification } from '../notifications/orderCreated';
import { sendStatusNotification } from '../notifications/statusChanged';

const app = express();

// CORS — разрешаем запросы от TMA и CRM
app.use((req: Request, res: Response, next: NextFunction) => {
  const allowed = [
    'https://homefood-drab.vercel.app',
    'https://homefood-crm.vercel.app',
  ];
  const origin = req.headers.origin ?? '';
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-bot-secret');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json());

// Health check — без авторизации
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', bot: 'HomeFood' });
});

// Webhook — без авторизации (проверяет Telegram по токену в URL)
app.post('/webhook', async (req: Request, res: Response) => {
  try {
    await bot.handleUpdate(req.body);
  } catch (err) {
    console.error('[webhook] handleUpdate error:', err);
  }
  res.sendStatus(200);
});

// Middleware проверки секрета для /api/* маршрутов
function requireBotSecret(req: Request, res: Response, next: NextFunction): void {
  const secret = process.env.BOT_SECRET;
  if (secret && req.headers['x-bot-secret'] !== secret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

app.use('/api', requireBotSecret);

// Уведомление о новом заказе
app.post('/api/new-order', async (req: Request, res: Response) => {
  const { order_id } = req.body as { order_id: number; tg_id: number };
  if (!order_id) {
    res.status(400).json({ error: 'order_id is required' });
    return;
  }
  try {
    await sendOrderCreatedNotification(order_id);
    res.json({ success: true });
  } catch (err) {
    console.error('[/api/new-order] error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Уведомление о смене статуса
app.post('/api/status-changed', async (req: Request, res: Response) => {
  const { order_id, status } = req.body as { order_id: number; status: string };
  if (!order_id || !status) {
    res.status(400).json({ error: 'order_id and status are required' });
    return;
  }
  try {
    await sendStatusNotification(order_id, status);
    res.json({ success: true });
  } catch (err) {
    console.error('[/api/status-changed] error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export function startServer(): void {
  const port = Number(process.env.PORT) || 3001;
  app.listen(port, () => {
    console.log(`[server] HTTP server listening on port ${port}`);
  });
}

export { app };
