import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  generateMerchantStats,
  generateHeatmapData,
  formatSats,
} from '@/lib/mock-data';
import { HeatmapChart } from './HeatmapChart';
import { cn } from '@/lib/utils';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}

function BarTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-xs font-bold text-foreground">{formatSats(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

export function RelayOperatorView() {
  const merchants = useMemo(() => generateMerchantStats(), []);
  const heatmapData = useMemo(() => generateHeatmapData(), []);

  const totalVolume = merchants.reduce((s, m) => s + m.volume, 0);
  const totalProducts = merchants.reduce((s, m) => s + m.products, 0);
  const totalZaps = merchants.reduce((s, m) => s + m.zaps, 0);

  const topCategories = [
    { name: 'Apparel', count: 847, percentage: 32 },
    { name: 'Accessories', count: 623, percentage: 24 },
    { name: 'Home & Decor', count: 412, percentage: 16 },
    { name: 'Digital Goods', count: 389, percentage: 15 },
    { name: 'Stickers & Prints', count: 201, percentage: 8 },
    { name: 'Other', count: 134, percentage: 5 },
  ];

  const merchantChartData = merchants.slice(0, 8).map((m) => ({
    name: `${m.pubkeyPrefix.slice(0, 6)}...`,
    volume: m.volume,
  }));

  return (
    <div className="space-y-5">
      {/* Aggregate stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Commerce Volume', value: formatSats(totalVolume), sub: 'across all merchants' },
          { label: 'Active Products', value: totalProducts.toLocaleString(), sub: 'listed on relay' },
          { label: 'Total Zaps', value: totalZaps.toLocaleString(), sub: 'confirmed payments' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border/50 bg-card p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-bitcoin">{stat.value}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Most active merchants */}
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Most Active Merchants</h3>
            <p className="text-xs text-muted-foreground mt-0.5">By commerce volume (pubkey prefix only)</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={merchantChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 9, fontFamily: 'JetBrains Mono Variable' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 9 }}
                  tickFormatter={(v) => formatSats(v)}
                  width={55}
                />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="volume" fill="#f7931a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top categories */}
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Top Product Categories</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Distribution across the relay</p>
          </div>
          <div className="space-y-3">
            {topCategories.map((cat, i) => {
              const colors = ['#f7931a', '#8b5cf6', '#22c55e', '#0ea5e9', '#f59e0b', '#6b7280'];
              return (
                <div key={cat.name} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">{cat.count} products</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary/50">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500 group-hover:brightness-110',
                      )}
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: colors[i],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <HeatmapChart data={heatmapData} />

      {/* Merchant leaderboard */}
      <div className="rounded-xl border border-border/50 bg-card p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">Merchant Leaderboard</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Top sellers by total volume</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/50">
                <th className="pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">#</th>
                <th className="pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pubkey</th>
                <th className="pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Products</th>
                <th className="pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Zaps</th>
                <th className="pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Volume</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((m, i) => (
                <tr key={m.pubkeyPrefix} className="border-b border-border/30 last:border-b-0 hover:bg-secondary/20 transition-colors">
                  <td className="py-2.5 text-xs text-muted-foreground font-medium">{i + 1}</td>
                  <td className="py-2.5">
                    <span className="font-mono text-xs text-foreground">{m.pubkeyPrefix}...</span>
                  </td>
                  <td className="py-2.5 text-right text-xs text-foreground">{m.products}</td>
                  <td className="py-2.5 text-right text-xs text-foreground">{m.zaps}</td>
                  <td className="py-2.5 text-right text-xs font-semibold text-bitcoin">{formatSats(m.volume)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
