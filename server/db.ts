import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'zap-analytics.db');

let db: SqlJsDatabase;

export async function initDb(): Promise<void> {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      name TEXT NOT NULL,
      url TEXT,
      path TEXT,
      referrer TEXT,
      referrer_domain TEXT,
      screen_width INTEGER,
      props TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_events_site_created ON events(site_id, created_at)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_events_site_name ON events(site_id, name)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_events_session ON events(site_id, session_id)`);

  save();
}

function save() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

interface EventInput {
  site_id: string;
  session_id: string;
  name: string;
  url: string;
  referrer: string | null;
  screen_width: number | null;
  props: Record<string, unknown>;
}

export function insertEvent(event: EventInput): void {
  let urlPath = '/';
  let referrerDomain: string | null = null;

  try { urlPath = new URL(event.url).pathname; } catch {}
  try { if (event.referrer) referrerDomain = new URL(event.referrer).hostname; } catch {}

  db.run(
    `INSERT INTO events (site_id, session_id, name, url, path, referrer, referrer_domain, screen_width, props)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      event.site_id, event.session_id, event.name, event.url, urlPath,
      event.referrer, referrerDomain, event.screen_width,
      JSON.stringify(event.props),
    ]
  );
  save();
}

function queryAll(sql: string, params: unknown[] = []): Record<string, unknown>[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: Record<string, unknown>[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function queryOne(sql: string, params: unknown[] = []): Record<string, unknown> {
  const results = queryAll(sql, params);
  return results[0] || {};
}

export function getStats(siteId: string, since: string) {
  return queryOne(`
    SELECT
      COUNT(CASE WHEN name = 'pageview' THEN 1 END) AS pageviews,
      COUNT(DISTINCT CASE WHEN name = 'pageview' THEN session_id END) AS unique_visitors,
      COUNT(CASE WHEN name = 'product_view' THEN 1 END) AS product_views,
      COUNT(CASE WHEN name = 'add_to_cart' THEN 1 END) AS add_to_cart,
      COUNT(CASE WHEN name = 'checkout_start' THEN 1 END) AS checkout_starts,
      COUNT(CASE WHEN name = 'purchase' THEN 1 END) AS purchases,
      COALESCE(SUM(
        CASE WHEN name = 'purchase'
        THEN CAST(json_extract(props, '$.revenue') AS REAL)
        ELSE 0 END
      ), 0) AS total_revenue
    FROM events
    WHERE site_id = ? AND created_at >= ?
  `, [siteId, since]);
}

export function getDailyRevenue(siteId: string, since: string) {
  return queryAll(`
    SELECT
      date(created_at) AS date,
      COALESCE(SUM(CAST(json_extract(props, '$.revenue') AS REAL)), 0) AS revenue,
      COUNT(*) AS transactions
    FROM events
    WHERE site_id = ? AND name = 'purchase' AND created_at >= ?
    GROUP BY date(created_at)
    ORDER BY date ASC
  `, [siteId, since]);
}

export function getTopProducts(siteId: string, since: string) {
  return queryAll(`
    SELECT
      json_extract(props, '$.product') AS product,
      COUNT(CASE WHEN name = 'product_view' THEN 1 END) AS views,
      COUNT(CASE WHEN name = 'add_to_cart' THEN 1 END) AS add_to_cart,
      COUNT(CASE WHEN name = 'purchase' THEN 1 END) AS purchases,
      COALESCE(SUM(
        CASE WHEN name = 'purchase'
        THEN CAST(json_extract(props, '$.revenue') AS REAL)
        ELSE 0 END
      ), 0) AS revenue
    FROM events
    WHERE site_id = ? AND created_at >= ?
      AND json_extract(props, '$.product') IS NOT NULL
    GROUP BY json_extract(props, '$.product')
    ORDER BY views DESC
    LIMIT 20
  `, [siteId, since]);
}

export function getTrafficSources(siteId: string, since: string) {
  return queryAll(`
    SELECT
      COALESCE(referrer_domain, 'Direct') AS source,
      COUNT(DISTINCT session_id) AS visitors
    FROM events
    WHERE site_id = ? AND name = 'pageview' AND created_at >= ?
    GROUP BY referrer_domain
    ORDER BY visitors DESC
    LIMIT 10
  `, [siteId, since]);
}

export function getConversionFunnel(siteId: string, since: string) {
  return queryOne(`
    SELECT
      COUNT(DISTINCT CASE WHEN name = 'pageview' THEN session_id END) AS visited,
      COUNT(DISTINCT CASE WHEN name = 'product_view' THEN session_id END) AS viewed_product,
      COUNT(DISTINCT CASE WHEN name = 'add_to_cart' THEN session_id END) AS added_to_cart,
      COUNT(DISTINCT CASE WHEN name = 'checkout_start' THEN session_id END) AS started_checkout,
      COUNT(DISTINCT CASE WHEN name = 'purchase' THEN session_id END) AS purchased
    FROM events
    WHERE site_id = ? AND created_at >= ?
  `, [siteId, since]);
}

export function getLiveEvents(siteId: string, limit: number = 50) {
  return queryAll(`
    SELECT id, name, url, path, props, created_at
    FROM events
    WHERE site_id = ?
    ORDER BY id DESC
    LIMIT ?
  `, [siteId, limit]);
}