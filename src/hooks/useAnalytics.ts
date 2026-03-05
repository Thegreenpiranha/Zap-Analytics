import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type TimeRange = 'today' | '7d' | '30d' | '90d';

interface Stats {
  pageviews: number;
  unique_visitors: number;
  product_views: number;
  add_to_cart: number;
  checkout_starts: number;
  purchases: number;
  total_revenue: number;
}

interface DailyRevenue {
  date: string;
  revenue: number;
  transactions: number;
}

interface Product {
  product: string;
  views: number;
  add_to_cart: number;
  purchases: number;
  revenue: number;
}

interface TrafficSource {
  source: string;
  visitors: number;
}

interface Funnel {
  visited: number;
  viewed_product: number;
  added_to_cart: number;
  started_checkout: number;
  purchased: number;
}

interface LiveEvent {
  id: number;
  name: string;
  url: string;
  path: string;
  props: string;
  created_at: string;
}

interface AnalyticsData {
  stats: Stats;
  dailyRevenue: DailyRevenue[];
  products: Product[];
  sources: TrafficSource[];
  funnel: Funnel;
  liveEvents: LiveEvent[];
  isLoading: boolean;
  error: string | null;
}

const EMPTY_STATS: Stats = {
  pageviews: 0, unique_visitors: 0, product_views: 0,
  add_to_cart: 0, checkout_starts: 0, purchases: 0, total_revenue: 0,
};

const EMPTY_FUNNEL: Funnel = {
  visited: 0, viewed_product: 0, added_to_cart: 0,
  started_checkout: 0, purchased: 0,
};

export function useAnalytics(siteId: string, timeRange: TimeRange): AnalyticsData {
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sources, setSources] = useState<TrafficSource[]>([]);
  const [funnel, setFunnel] = useState<Funnel>(EMPTY_FUNNEL);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const base = `${API_BASE}/api`;
      const range = `range=${timeRange}`;

      const [statsRes, revenueRes, productsRes, sourcesRes, funnelRes, liveRes] =
        await Promise.all([
          fetch(`${base}/stats/${siteId}?${range}`),
          fetch(`${base}/revenue/${siteId}?${range}`),
          fetch(`${base}/products/${siteId}?${range}`),
          fetch(`${base}/sources/${siteId}?${range}`),
          fetch(`${base}/funnel/${siteId}?${range}`),
          fetch(`${base}/live/${siteId}?limit=50`),
        ]);

      setStats(await statsRes.json());
      setDailyRevenue(await revenueRes.json());
      setProducts(await productsRes.json());
      setSources(await sourcesRes.json());
      setFunnel(await funnelRes.json());
      setLiveEvents(await liveRes.json());
      setError(null);
    } catch (err) {
      setError('Failed to connect to analytics API');
      console.error('[useAnalytics]', err);
    } finally {
      setIsLoading(false);
    }
  }, [siteId, timeRange]);

  // Fetch on mount and when timeRange changes
  useEffect(() => {
    setIsLoading(true);
    fetchAll();
  }, [fetchAll]);

  // Poll every 30 seconds for live updates
  useEffect(() => {
    intervalRef.current = setInterval(fetchAll, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAll]);

  return { stats, dailyRevenue, products, sources, funnel, liveEvents, isLoading, error };
}