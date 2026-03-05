import { useState, useCallback } from 'react';
import { useSeoMeta } from '@unhead/react';
import {
  Eye,
  Users,
  Zap,
  DollarSign,
  Copy,
  Check,
  Settings,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatSats, satsToUsd } from '@/lib/mock-data';
import { useAnalytics } from '@/hooks/useAnalytics';
import { StatCard } from '@/components/analytics/StatCard';
import { ConversionFunnel } from '@/components/analytics/ConversionFunnel';
import { TopProducts } from '@/components/analytics/TopProducts';
import { TrafficSources } from '@/components/analytics/TrafficSources';
import { RevenueChart } from '@/components/analytics/RevenueChart';
import { LiveFeed } from '@/components/analytics/LiveFeed';
import { RelayOperatorView } from '@/components/analytics/RelayOperatorView';
import { OnboardingModal } from '@/components/analytics/OnboardingModal';

type TimeRange = 'today' | '7d' | '30d' | '90d';

const SITE_ID = import.meta.env.VITE_SITE_ID || 'test-store';

const Index = () => {
  useSeoMeta({
    title: 'Zap Analytics — Privacy-Preserving Ecommerce Intelligence',
    description: 'Track your shop performance with zero cookies, no personal data, and fully privacy-preserving analytics.',
  });

  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('merchant');

  const {
    stats,
    dailyRevenue,
    products,
    sources,
    funnel,
    liveEvents,
    isLoading,
    error,
  } = useAnalytics(SITE_ID, timeRange);

  // Map API data to component formats
  const isConnected = !error && !isLoading;

  const feedEvents = liveEvents.map((e) => {
    let parsedProps: Record<string, unknown> = {};
    try { parsedProps = JSON.parse(e.props); } catch {}
    return {
      id: String(e.id),
      type: e.name as 'product_view' | 'add_to_cart' | 'checkout_start' | 'zap_initiated' | 'zap_complete',
      product: (parsedProps.product as string) || e.path || '/',
      amount: (parsedProps.revenue as number) || undefined,
      timestamp: new Date(e.created_at).getTime(),
    };
  });

  // Map products for TopProducts component
  const productData = products.map((p, i) => ({
    id: `product-${i}`,
    name: p.product || 'Unknown',
    category: 'All',
    views: Number(p.views) || 0,
    addToCart: Number(p.add_to_cart) || 0,
    checkoutStart: 0,
    zapInitiated: 0,
    zapComplete: Number(p.purchases) || 0,
    revenue: Number(p.revenue) || 0,
    avgZapSize: Number(p.purchases) > 0 ? Math.round(Number(p.revenue) / Number(p.purchases)) : 0,
    trend: [],
  }));

  // Map sources for TrafficSources component
  const sourceColors = ['#f7931a', '#8b5cf6', '#22c55e', '#0ea5e9', '#f59e0b', '#6b7280', '#ef4444', '#ec4899', '#14b8a6', '#a855f7'];
  const totalVisitors = sources.reduce((sum, s) => sum + Number(s.visitors), 0);
  const trafficData = sources.map((s, i) => ({
    name: s.source,
    value: totalVisitors > 0 ? Math.round((Number(s.visitors) / totalVisitors) * 100) : 0,
    color: sourceColors[i % sourceColors.length],
  }));

  // Map funnel for ConversionFunnel component
  const funnelProducts = [{
    id: 'funnel-all',
    name: 'All Products',
    category: 'All',
    views: Number(funnel.viewed_product) || 0,
    addToCart: Number(funnel.added_to_cart) || 0,
    checkoutStart: Number(funnel.started_checkout) || 0,
    zapInitiated: Number(funnel.started_checkout) || 0,
    zapComplete: Number(funnel.purchased) || 0,
    revenue: Number(stats.total_revenue) || 0,
    avgZapSize: 0,
    trend: [],
  }];

  const handleCopySnippet = useCallback(() => {
    const snippet = `<script defer data-api="https://your-zap-instance.com/api/event" data-site="${SITE_ID}" src="https://your-zap-instance.com/js/zap-track.js"></script>`;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  const timeRanges: { label: string; value: TimeRange }[] = [
    { label: 'Today', value: 'today' },
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
    { label: '90d', value: '90d' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-foreground">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bitcoin/10">
                  <Zap className="h-4.5 w-4.5 text-bitcoin" fill="currentColor" />
                </div>
                <div>
                  <h1 className="text-sm font-bold tracking-tight text-foreground leading-none">
                    Zap Analytics
                  </h1>
                  <p className="text-[9px] text-muted-foreground tracking-wide uppercase">
                    Privacy-Preserving Commerce
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleCopySnippet}
                    className="flex items-center gap-1.5 rounded-md bg-secondary/50 px-2.5 py-1.5 transition-colors hover:bg-secondary"
                  >
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {SITE_ID}
                    </span>
                    {copied ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Click to copy tracking snippet</p>
                </TooltipContent>
              </Tooltip>

              <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/5 border border-emerald-500/20 px-2.5 py-1.5">
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    isConnected ? 'bg-emerald-400 animate-live-pulse' : 'bg-red-400',
                  )}
                />
                <span className={cn(
                  'text-[10px] font-medium',
                  isConnected ? 'text-emerald-400' : 'text-red-400',
                )}>
                  {isLoading ? 'Loading...' : isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg bg-secondary/50 p-0.5">
                {timeRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setTimeRange(range.value)}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-[10px] font-semibold transition-all',
                      timeRange === range.value
                        ? 'bg-bitcoin text-black shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setShowOnboarding(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 py-5">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-5">
            <TabsList className="bg-secondary/50 border border-border/30">
              <TabsTrigger
                value="merchant"
                className="text-xs data-[state=active]:bg-bitcoin/10 data-[state=active]:text-bitcoin"
              >
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                Merchant View
              </TabsTrigger>
              <TabsTrigger
                value="relay"
                className="text-xs data-[state=active]:bg-purple/10 data-[state=active]:text-purple"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Self-Host
              </TabsTrigger>
            </TabsList>

            <div className="flex md:hidden items-center gap-1.5">
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  isConnected ? 'bg-emerald-400 animate-live-pulse' : 'bg-red-400',
                )}
              />
              <span className="text-[10px] font-medium text-emerald-400">
                {isConnected ? 'Live' : '...'}
              </span>
            </div>
          </div>

          <TabsContent value="merchant" className="mt-0">
            <div className="flex flex-col xl:flex-row gap-5">
              <div className="flex-1 min-w-0 space-y-5">
                {/* Hero Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <StatCard
                    title="Page Views"
                    value={Number(stats.pageviews) || 0}
                    change={0}
                    icon={<Eye className="h-4 w-4" />}
                    delay={0}
                    accentColor="orange"
                  />
                  <StatCard
                    title="Unique Visitors"
                    value={Number(stats.unique_visitors) || 0}
                    change={0}
                    icon={<Users className="h-4 w-4" />}
                    delay={100}
                    accentColor="purple"
                  />
                  <StatCard
                    title="Purchases"
                    value={Number(stats.purchases) || 0}
                    change={0}
                    icon={<Zap className="h-4 w-4" />}
                    delay={200}
                    accentColor="green"
                  />
                  <StatCard
                    title="Total Revenue"
                    value={Number(stats.total_revenue) || 0}
                    format={formatSats}
                    change={0}
                    icon={<DollarSign className="h-4 w-4" />}
                    delay={300}
                    accentColor="blue"
                  />
                </div>

                <div className="flex justify-end -mt-3">
                  <span className="text-[10px] text-muted-foreground">
                    ≈ {satsToUsd(Number(stats.total_revenue) || 0)} USD
                  </span>
                </div>

                {/* Conversion Funnel */}
                <ConversionFunnel products={funnelProducts} />

                {/* Revenue Chart */}
                <RevenueChart data={dailyRevenue} />

                {/* Two column: Traffic + Products */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                  <div className="lg:col-span-2">
                    <TrafficSources data={trafficData} />
                  </div>
                  <div className="lg:col-span-3">
                    <TopProducts products={productData} />
                  </div>
                </div>

                <footer className="pt-4 pb-8 text-center">
                  <p className="text-[10px] text-muted-foreground">
                    Zap Analytics
                    {' · '}No cookies · No personal data · Fully privacy-preserving
                  </p>
                </footer>
              </div>

              {/* Right: Live Feed Sidebar */}
              <div className="xl:w-72 2xl:w-80 flex-shrink-0">
                <div className="xl:sticky xl:top-[72px] h-auto xl:h-[calc(100vh-88px)]">
                  <LiveFeed events={feedEvents} isConnected={isConnected} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="relay" className="mt-0">
            <RelayOperatorView />

            <footer className="pt-6 pb-8 text-center">
              <p className="text-[10px] text-muted-foreground">
                Zap Analytics
                {' · '}Open source · Self-hostable · No individual user tracking
              </p>
            </footer>
          </TabsContent>
        </Tabs>
      </main>

      <OnboardingModal open={showOnboarding} onComplete={handleOnboardingComplete} />
    </div>
  );
};

export default Index;