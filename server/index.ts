import express from 'express';
import cors from 'cors';
import path from 'path';
import { getSessionId } from './session';
import {
  initDb,
  insertEvent,
  getStats,
  getDailyRevenue,
  getTopProducts,
  getTrafficSources,
  getConversionFunnel,
  getLiveEvents,
} from './db';

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

app.use(cors());
app.use(express.json({ limit: '1kb' }));

app.get('/js/zap-track.js', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'tracker', 'zap-track.js'));
});

app.post('/api/event', (req, res) => {
  try {
    const { site_id, name, url, referrer, screen_width, props } = req.body;

    if (!site_id || !name || !url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const allowedEvents = [
      'pageview', 'product_view', 'add_to_cart', 'remove_from_cart',
      'checkout_start', 'purchase', 'custom',
    ];
    if (!allowedEvents.includes(name) && !name.startsWith('custom:')) {
      return res.status(400).json({ error: 'Invalid event name' });
    }

    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim()
      || req.socket.remoteAddress
      || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const sessionId = getSessionId(site_id, ip, userAgent);

    const safeProps = typeof props === 'object' && props !== null ? props : {};
    delete safeProps.email;
    delete safeProps.name;
    delete safeProps.phone;
    delete safeProps.ip;

    insertEvent({
      site_id,
      session_id: sessionId,
      name,
      url,
      referrer: referrer || null,
      screen_width: screen_width || null,
      props: safeProps,
    });

    res.status(202).json({ ok: true });
  } catch (err) {
    console.error('[ingestion error]', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

function getSinceDate(range: string): string {
  const now = new Date();
  switch (range) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    case '7d':
      return new Date(now.getTime() - 7 * 86400000).toISOString();
    case '30d':
      return new Date(now.getTime() - 30 * 86400000).toISOString();
    case '90d':
      return new Date(now.getTime() - 90 * 86400000).toISOString();
    default:
      return new Date(now.getTime() - 30 * 86400000).toISOString();
  }
}

app.get('/api/stats/:siteId', (req, res) => {
  const since = getSinceDate(req.query.range as string);
  res.json(getStats(req.params.siteId, since));
});

app.get('/api/revenue/:siteId', (req, res) => {
  const since = getSinceDate(req.query.range as string);
  res.json(getDailyRevenue(req.params.siteId, since));
});

app.get('/api/products/:siteId', (req, res) => {
  const since = getSinceDate(req.query.range as string);
  res.json(getTopProducts(req.params.siteId, since));
});

app.get('/api/sources/:siteId', (req, res) => {
  const since = getSinceDate(req.query.range as string);
  res.json(getTrafficSources(req.params.siteId, since));
});

app.get('/api/funnel/:siteId', (req, res) => {
  const since = getSinceDate(req.query.range as string);
  res.json(getConversionFunnel(req.params.siteId, since));
});

app.get('/api/live/:siteId', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  res.json(getLiveEvents(req.params.siteId, limit));
});

// Initialize DB then start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Zap Analytics API running on :${PORT}`);
    console.log(`Event ingestion: POST http://localhost:${PORT}/api/event`);
    console.log(`Dashboard API:   GET  http://localhost:${PORT}/api/stats/:siteId`);
    console.log(`Tracking script: GET  http://localhost:${PORT}/js/zap-track.js`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});