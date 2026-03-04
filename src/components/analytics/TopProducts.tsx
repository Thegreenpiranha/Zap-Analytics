import { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { ProductData } from '@/lib/mock-data';
import { formatSats } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface TopProductsProps {
  products: ProductData[];
}

export function TopProducts({ products }: TopProductsProps) {
  const sorted = useMemo(
    () => [...products].sort((a, b) => b.revenue - a.revenue).slice(0, 8),
    [products],
  );

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Top Products</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Ranked by revenue</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/50">
              <th className="pb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Product
              </th>
              <th className="pb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                Views
              </th>
              <th className="pb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                Zap Rate
              </th>
              <th className="pb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                Revenue
              </th>
              <th className="pb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                Avg Zap
              </th>
              <th className="pb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right w-20">
                Trend
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((product, i) => {
              const zapRate = product.views > 0 ? (product.zapComplete / product.views) * 100 : 0;
              const trendData = product.trend.map((v, idx) => ({ v, idx }));
              const isUp = product.trend[product.trend.length - 1] >= product.trend[0];

              return (
                <tr
                  key={product.id}
                  className={cn(
                    'border-b border-border/30 transition-colors hover:bg-secondary/30',
                    i === sorted.length - 1 && 'border-b-0',
                  )}
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-[10px] font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-xs font-medium text-foreground">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-xs font-medium text-foreground">
                      {product.views.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        zapRate >= 3
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : zapRate >= 1
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-red-500/10 text-red-400',
                      )}
                    >
                      {zapRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-xs font-semibold text-bitcoin">
                      {formatSats(product.revenue)}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-xs font-medium text-foreground">
                      {formatSats(product.avgZapSize)}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="ml-auto h-6 w-16">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <Line
                            type="monotone"
                            dataKey="v"
                            stroke={isUp ? '#22c55e' : '#ef4444'}
                            strokeWidth={1.5}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
