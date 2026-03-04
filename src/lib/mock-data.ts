// Mock data generators for Zap Analytics

export interface ProductData {
  id: string;
  name: string;
  category: string;
  views: number;
  addToCart: number;
  checkoutStart: number;
  zapInitiated: number;
  zapComplete: number;
  revenue: number;
  avgZapSize: number;
  trend: number[];
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  transactions: number;
}

export interface TrafficSource {
  name: string;
  value: number;
  color: string;
}

export interface FeedEvent {
  id: string;
  type: 'product_view' | 'add_to_cart' | 'checkout_start' | 'zap_initiated' | 'zap_complete';
  product: string;
  amount?: number;
  timestamp: number;
}

export interface HeatmapCell {
  day: number;
  hour: number;
  value: number;
}

export interface MerchantStats {
  pubkeyPrefix: string;
  volume: number;
  products: number;
  zaps: number;
}

const PRODUCT_NAMES = [
  'Lightning Candles',
  'Bitcoin Hoodie',
  'Pleb T-Shirt',
  'Satoshi Stickers',
  'Node Runner Mug',
  'HODL Hat',
  'Nostr Purple Scarf',
  'Cold Storage Case',
  'Cypherpunk Poster',
  'Block Height Clock',
  'Mining Rig Keychain',
  'Proof of Work Tee',
];

const PRODUCT_CATEGORIES = [
  'Apparel', 'Accessories', 'Home & Decor', 'Stickers & Prints', 'Tech', 'Collectibles',
];

const NOSTR_CLIENTS = ['Damus', 'Amethyst', 'Primal', 'Coracle', 'Snort', 'Iris', 'Nostrudel'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSparkline(length: number, baseValue: number): number[] {
  const data: number[] = [];
  let current = baseValue;
  for (let i = 0; i < length; i++) {
    current = Math.max(0, current + randomInt(-baseValue * 0.3, baseValue * 0.3));
    data.push(Math.round(current));
  }
  return data;
}

export function generateProducts(): ProductData[] {
  return PRODUCT_NAMES.map((name, i) => {
    const views = randomInt(200, 5000);
    const addToCart = Math.round(views * (0.08 + Math.random() * 0.15));
    const checkoutStart = Math.round(addToCart * (0.3 + Math.random() * 0.3));
    const zapInitiated = Math.round(checkoutStart * (0.5 + Math.random() * 0.3));
    const zapComplete = Math.round(zapInitiated * (0.6 + Math.random() * 0.3));
    const avgZapSize = randomInt(500, 50000);
    const revenue = zapComplete * avgZapSize;

    return {
      id: `product-${i}`,
      name,
      category: PRODUCT_CATEGORIES[i % PRODUCT_CATEGORIES.length],
      views,
      addToCart,
      checkoutStart,
      zapInitiated,
      zapComplete,
      revenue,
      avgZapSize,
      trend: generateSparkline(14, zapComplete),
    };
  });
}

export function generateDailyRevenue(days: number): DailyRevenue[] {
  const data: DailyRevenue[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseRevenue = isWeekend ? randomInt(80000, 250000) : randomInt(150000, 500000);
    const transactions = Math.round(baseRevenue / randomInt(3000, 15000));

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: baseRevenue,
      transactions,
    });
  }
  return data;
}

export function generateTrafficSources(): TrafficSource[] {
  return [
    { name: 'Direct', value: 35, color: '#f7931a' },
    { name: 'Damus', value: 22, color: '#8b5cf6' },
    { name: 'Primal', value: 18, color: '#22c55e' },
    { name: 'Amethyst', value: 12, color: '#0ea5e9' },
    { name: 'External Web', value: 8, color: '#f59e0b' },
    { name: 'Unknown', value: 5, color: '#6b7280' },
  ];
}

export function generateFeedEvent(): FeedEvent {
  const types: FeedEvent['type'][] = [
    'product_view', 'product_view', 'product_view', // weighted more heavily
    'add_to_cart', 'add_to_cart',
    'checkout_start',
    'zap_initiated',
    'zap_complete',
  ];

  const type = types[randomInt(0, types.length - 1)];
  const product = PRODUCT_NAMES[randomInt(0, PRODUCT_NAMES.length - 1)];
  const amount = type === 'zap_complete' ? randomInt(1000, 100000) : undefined;

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    product,
    amount,
    timestamp: Date.now(),
  };
}

export function generateHeatmapData(): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      // More activity during business hours and evenings
      let baseValue = 0;
      if (hour >= 9 && hour <= 22) {
        baseValue = randomInt(5, 80);
        if (hour >= 17 && hour <= 21) baseValue += randomInt(20, 50); // evening bump
      } else {
        baseValue = randomInt(0, 15);
      }
      // Weekends are slightly less active
      if (day === 0 || day === 6) baseValue = Math.round(baseValue * 0.7);

      cells.push({ day, hour, value: baseValue });
    }
  }
  return cells;
}

export function generateMerchantStats(): MerchantStats[] {
  const merchants: MerchantStats[] = [];
  for (let i = 0; i < 10; i++) {
    const prefix = Array.from({ length: 8 }, () =>
      '0123456789abcdef'[randomInt(0, 15)]
    ).join('');
    merchants.push({
      pubkeyPrefix: prefix,
      volume: randomInt(100000, 5000000),
      products: randomInt(3, 50),
      zaps: randomInt(10, 500),
    });
  }
  return merchants.sort((a, b) => b.volume - a.volume);
}

export function getEventIcon(type: FeedEvent['type']): string {
  switch (type) {
    case 'product_view': return '👁';
    case 'add_to_cart': return '🛒';
    case 'checkout_start': return '💳';
    case 'zap_initiated': return '⚡';
    case 'zap_complete': return '✅';
  }
}

export function getEventLabel(event: FeedEvent): string {
  switch (event.type) {
    case 'product_view': return `Product viewed — ${event.product}`;
    case 'add_to_cart': return `Added to cart — ${event.product}`;
    case 'checkout_start': return `Checkout started — ${event.product}`;
    case 'zap_initiated': return `Zap initiated — ${event.product}`;
    case 'zap_complete': return `Zap confirmed — ${formatSats(event.amount || 0)}`;
  }
}

export function formatSats(sats: number): string {
  if (sats >= 1000000) return `${(sats / 1000000).toFixed(2)}M sats`;
  if (sats >= 1000) return `${(sats / 1000).toFixed(1)}k sats`;
  return `${sats.toLocaleString()} sats`;
}

export function satsToUsd(sats: number, btcPrice: number = 97500): string {
  const btc = sats / 100000000;
  const usd = btc * btcPrice;
  if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}k`;
  return `$${usd.toFixed(2)}`;
}

export function generateAggregateStats(products: ProductData[], timeRange: string) {
  const multiplier = timeRange === 'today' ? 0.05 : timeRange === '7d' ? 0.35 : timeRange === '30d' ? 1 : 3;

  const totalViews = Math.round(products.reduce((sum, p) => sum + p.views, 0) * multiplier);
  const uniqueVisitors = Math.round(totalViews * 0.62);
  const totalZaps = Math.round(products.reduce((sum, p) => sum + p.zapComplete, 0) * multiplier);
  const totalRevenue = Math.round(products.reduce((sum, p) => sum + p.revenue, 0) * multiplier);

  // Previous period comparisons
  const viewsChange = randomInt(-8, 25);
  const visitorsChange = randomInt(-5, 20);
  const zapsChange = randomInt(-3, 30);
  const revenueChange = randomInt(-10, 35);

  return {
    totalViews,
    uniqueVisitors,
    totalZaps,
    totalRevenue,
    viewsChange,
    visitorsChange,
    zapsChange,
    revenueChange,
  };
}

export function getNostrClients(): string[] {
  return NOSTR_CLIENTS;
}
