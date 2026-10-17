import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import { clientUrls, isProd } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import serverRoutes from './routes/serverRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import devRoutes from './routes/devRoutes.js';
import swaggerRouter from './docs/swaggerRouter.js';

export const app = express();

// Number of proxies in front of the app (e.g. Vercel rewrite + host load balancer), so rate limits see the real client IP.
app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 1));
app.disable('x-powered-by');

// Exempt Swagger UI documentation from strict CSP and embedder policies so it renders smoothly
app.use((req, res, next) => {
  if (req.path.startsWith('/api-docs') || req.path === '/docs' || req.path === '/swagger') {
    return next();
  }
  return helmet()(req, res, next);
});
app.use(
  cors({
    origin: isProd() ? clientUrls() : [...clientUrls(), 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(morgan(isProd() ? 'combined' : 'dev'));
app.use(cookieParser());

// Stripe signature verification needs the raw body, so this mounts before the JSON parser.
app.use('/api/webhook', webhookRoutes);

app.use(express.json({ limit: '100kb' }));

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 600,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'rate_limited', message: 'Too many requests. Please slow down.' },
  })
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'coco-cloud-backend', timestamp: new Date().toISOString() });
});

// Older builds posted funnel leads here; relay them to the Hibarri API instead of dropping them.
// The browser sends these as text/plain to avoid a CORS preflight.
app.post('/api/coco/leads', express.text({ type: 'text/plain', limit: '100kb' }), async (req, res) => {
  const endpoint = process.env.LEADS_ENDPOINT;
  if (!endpoint || !/^https?:\/\//.test(endpoint)) return res.status(503).json({ error: 'not_configured' });
  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body,
    });
    return res.status(upstream.ok ? 200 : 502).json({ success: upstream.ok });
  } catch (err) {
    console.error('[Leads] Relay failed:', err?.message);
    return res.status(502).json({ error: 'relay_failed' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/dev', devRoutes);

// Swagger / OpenAPI documentation routes
app.get(['/docs', '/swagger'], (req, res) => res.redirect('/api-docs'));
app.use('/api-docs', swaggerRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'not_found', message: 'Route not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'invalid_json', message: 'Request body is not valid JSON' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'payload_too_large', message: 'Request body is too large' });
  }
  if (err?.name === 'ValidationError' || err?.name === 'CastError') {
    return res.status(400).json({ error: 'invalid_request', message: 'Some fields are invalid' });
  }

  const status = err?.status && err.status >= 400 && err.status < 600 ? err.status : 500;
  if (status >= 500) console.error('[AppError]', err);
  return res.status(status).json({
    error: err?.code && typeof err.code === 'string' ? err.code : status >= 500 ? 'server_error' : 'bad_request',
    message: status < 500 && err?.expose !== false ? err.message : 'Something went wrong. Please try again.',
  });
});
