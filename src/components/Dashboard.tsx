import { type TimeRange, type Stats, type DailyRevenue, type Product, type TrafficSource, type Funnel, type LiveEvent } from '../hooks/useAnalytics';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface DashboardProps {
  data: {
    stats: Stats;
    dailyRevenue: DailyRevenue[];
    products: Product[];
    sources: TrafficSource[];
    funnel: Funnel;
    liveEvents: LiveEvent[];
    isLoading: boolean;
    isConnected: boolean;
    error: string | null;
  };
  siteId: string;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  currency: 'GBP' | 'USD' | 'EUR' | 'sats';
  onCurrencyChange: (c: 'GBP' | 'USD' | 'EUR' | 'sats') => void;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: '£', USD: '$', EUR: '€', sats: '₿',
};

const BTC_PRICE_GBP = 78000;
const RATES: Record<string, number> = {
  GBP: BTC_PRICE_GBP / 100_000_000,
  USD: 97500 / 100_000_000,
  EUR: 90000 / 100_000_000,
  sats: 1,
};

function formatRevenue(sats: number, currency: string): string {
  if (currency === 'sats') {
    if (sats >= 1_000_000) return `${(sats / 1_000_000).toFixed(2)}M sats`;
    if (sats >= 1_000) return `${(sats / 1_000).toFixed(1)}k sats`;
    return `${sats.toLocaleString()} sats`;
  }
  const value = sats * RATES[currency];
  const sym = CURRENCY_SYMBOLS[currency];
  if (value >= 1000) return `${sym}${(value / 1000).toFixed(1)}k`;
  if (value >= 1) return `${sym}${value.toFixed(2)}`;
  return `${sym}${value.toFixed(4)}`;
}

function formatRevenueAxis(sats: number, currency: string): string {
  if (currency === 'sats') {
    if (sats >= 1000) return `${(sats / 1000).toFixed(0)}k`;
    return String(sats);
  }
  const value = sats * RATES[currency];
  const sym = CURRENCY_SYMBOLS[currency];
  if (value >= 1000) return `${sym}${(value / 1000).toFixed(0)}k`;
  return `${sym}${value.toFixed(0)}`;
}

const EVENT_LABELS: Record<string, string> = {
  pageview: 'Page view',
  product_view: 'Viewed product',
  add_to_cart: 'Added to cart',
  checkout_start: 'Started checkout',
  purchase: 'Purchase',
};

const EVENT_DOTS: Record<string, string> = {
  pageview: '🔵',
  product_view: '👁️',
  add_to_cart: '🛒',
  checkout_start: '💳',
  purchase: '✅',
};

const FUNNEL_STEPS = [
  { key: 'visited', label: 'Visited Site' },
  { key: 'viewed_product', label: 'Viewed Product' },
  { key: 'added_to_cart', label: 'Added to Cart' },
  { key: 'started_checkout', label: 'Started Checkout' },
  { key: 'purchased', label: 'Purchased' },
];

const SOURCE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#fb923c', '#94a3b8'];

export function Dashboard({ data, siteId, timeRange, onTimeRangeChange, currency, onCurrencyChange }: DashboardProps) {
  const { stats, dailyRevenue, products, sources, funnel, liveEvents, isLoading, isConnected } = data;
  const timeRanges: { label: string; value: TimeRange }[] = [
    { label: 'Today', value: 'today' },
    { label: '7 days', value: '7d' },
    { label: '30 days', value: '30d' },
    { label: '90 days', value: '90d' },
  ];
  const currencies: ('GBP' | 'USD' | 'EUR' | 'sats')[] = ['GBP', 'USD', 'EUR', 'sats'];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-0">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/5 -mx-4 sm:-mx-6 px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white leading-none">Zap Analytics</h1>
              <p className="text-[10px] text-zinc-500 mt-0.5">Privacy-preserving ecommerce analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency selector */}
            <div className="flex items-center bg-white/5 rounded-lg p-0.5">
              {currencies.map((c) => (
                <button
                  key={c}
                  onClick={() => onCurrencyChange(c)}
                  className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
                    currency === c
                      ? 'bg-indigo-500 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {c === 'sats' ? '₿ sats' : `${CURRENCY_SYMBOLS[c]} ${c}`}
                </button>
              ))}
            </div>

            {/* Time range */}
            <div className="flex items-center bg-white/5 rounded-lg p-0.5">
              {timeRanges.map((r) => (
                <button
                  key={r.value}
                  onClick={() => onTimeRangeChange(r.value)}
                  className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
                    timeRange === r.value
                      ? 'bg-indigo-500 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Status */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5">
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-live-pulse' : 'bg-red-400'}`} />
              <span className={`text-[10px] font-medium ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                {isLoading ? 'Loading' : isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex gap-5 mt-5">
        {/* Main column */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Page Views" value={num(stats.pageviews).toLocaleString()} />
            <StatCard label="Unique Visitors" value={num(stats.unique_visitors).toLocaleString()} />
            <StatCard label="Orders" value={num(stats.purchases).toLocaleString()} />
            <StatCard label="Revenue" value={formatRevenue(num(stats.total_revenue), currency)} highlight />
          </div>

          {/* Conversion funnel */}
          <Card title="Conversion Funnel">
            <div className="flex items-end gap-1 h-32">
              {FUNNEL_STEPS.map((step, i) => {
                const val = num((funnel as Record<string, number>)[step.key]);
                const maxVal = Math.max(num(funnel.visited), 1);
                const pct = Math.max((val / maxVal) * 100, 4);
                const prevVal = i > 0 ? num((funnel as Record<string, number>)[FUNNEL_STEPS[i - 1].key]) : 0;
                const dropoff = i > 0 && prevVal > 0 ? Math.round((val / prevVal) * 100) : null;
                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-zinc-400">{val}</span>
                    {dropoff !== null && (
                      <span className="text-[9px] text-zinc-600">{dropoff}%</span>
                    )}
                    <div className="w-full rounded-t-md bg-indigo-500/20 relative" style={{ height: `${pct}%` }}>
                      <div className="absolute inset-0 rounded-t-md bg-indigo-500" style={{ opacity: 1 - i * 0.15 }} />
                    </div>
                    <span className="text-[9px] text-zinc-500 text-center leading-tight mt-1">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Revenue chart */}
          <Card title="Revenue">
            {dailyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dailyRevenue}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#71717a' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#71717a' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatRevenueAxis(v, currency)}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#a1a1aa' }}
                    formatter={(value: number) => [formatRevenue(value, currency), 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#6366f1' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-zinc-600 text-sm">
                No revenue data yet
              </div>
            )}
          </Card>

          {/* Two columns: Sources + Products */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Traffic sources */}
            <Card title="Traffic Sources" className="lg:col-span-2">
              {sources.length > 0 ? (
                <div className="space-y-2">
                  {sources.map((s, i) => {
                    const total = sources.reduce((sum, x) => sum + num(x.visitors), 0);
                    const pct = total > 0 ? Math.round((num(s.visitors) / total) * 100) : 0;
                    return (
                      <div key={s.source}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-300">{s.source}</span>
                          <span className="text-zinc-500">{num(s.visitors)} · {pct}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: SOURCE_COLORS[i % SOURCE_COLORS.length] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-zinc-600 text-sm">No data yet</div>
              )}
            </Card>

            {/* Top products */}
            <Card title="Top Products" className="lg:col-span-3">
              {products.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-zinc-500 border-b border-white/5">
                        <th className="text-left py-2 font-medium">Product</th>
                        <th className="text-right py-2 font-medium">Views</th>
                        <th className="text-right py-2 font-medium">Cart</th>
                        <th className="text-right py-2 font-medium">Orders</th>
                        <th className="text-right py-2 font-medium">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p, i) => (
                        <tr key={i} className="border-b border-white/5 last:border-0">
                          <td className="py-2 text-zinc-300">{p.product}</td>
                          <td className="py-2 text-right text-zinc-400">{num(p.views)}</td>
                          <td className="py-2 text-right text-zinc-400">{num(p.add_to_cart)}</td>
                          <td className="py-2 text-right text-zinc-400">{num(p.purchases)}</td>
                          <td className="py-2 text-right text-zinc-300 font-medium">
                            {formatRevenue(num(p.revenue), currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-zinc-600 text-sm">No data yet</div>
              )}
            </Card>
          </div>

          {/* Footer */}
          <footer className="pt-4 pb-8 text-center">
            <p className="text-[10px] text-zinc-600">
              Zap Analytics · No cookies · No personal data · Open source ·{' '}
              <a href="https://github.com/Thegreenpiranha/Zap-Analytics" target="_blank" rel="noopener" className="text-indigo-400 hover:underline">
                GitHub
              </a>
            </p>
          </footer>
        </div>

        {/* Live feed sidebar */}
        <div className="hidden xl:block w-72 flex-shrink-0">
          <div className="sticky top-[72px] h-[calc(100vh-88px)]">
            <Card title="Live Feed" className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                {liveEvents.length > 0 ? (
                  liveEvents.map((e) => {
                    let parsedProps: Record<string, unknown> = {};
                    try { parsedProps = JSON.parse(e.props); } catch {}
                    const label = EVENT_LABELS[e.name] || e.name;
                    const dot = EVENT_DOTS[e.name] || '⚪';
                    const product = parsedProps.product as string;
                    const revenue = parsedProps.revenue as number;
                    const time = new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div key={e.id} className="flex items-start gap-2 py-1.5 px-2 rounded-md hover:bg-white/5 transition-colors">
                        <span className="text-xs mt-0.5">{dot}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-zinc-300 truncate">
                            {label}
                            {product && <span className="text-zinc-500"> · {product}</span>}
                          </p>
                          {revenue && (
                            <p className="text-[10px] text-emerald-400 font-medium">
                              {formatRevenue(revenue, currency)}
                            </p>
                          )}
                        </div>
                        <span className="text-[9px] text-zinc-600 flex-shrink-0">{time}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-32 text-zinc-600 text-xs">
                    Waiting for events...
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small components ──

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
      <p className="text-[11px] text-zinc-500 font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-1 tracking-tight ${highlight ? 'text-indigo-400' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/[0.03] border border-white/5 rounded-xl p-4 ${className || ''}`}>
      <h3 className="text-xs font-medium text-zinc-400 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function num(v: unknown): number {
  return Number(v) || 0;
}