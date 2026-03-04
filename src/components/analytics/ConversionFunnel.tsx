import { useMemo } from 'react';
import type { ProductData } from '@/lib/mock-data';

interface ConversionFunnelProps {
  products: ProductData[];
}

interface FunnelStep {
  label: string;
  count: number;
  percentage: number;
  dropoff: number;
  color: string;
}

export function ConversionFunnel({ products }: ConversionFunnelProps) {
  const steps = useMemo<FunnelStep[]>(() => {
    const views = products.reduce((s, p) => s + p.views, 0);
    const cart = products.reduce((s, p) => s + p.addToCart, 0);
    const checkout = products.reduce((s, p) => s + p.checkoutStart, 0);
    const initiated = products.reduce((s, p) => s + p.zapInitiated, 0);
    const complete = products.reduce((s, p) => s + p.zapComplete, 0);

    const raw = [
      { label: 'Views', count: views, color: '#6b7280' },
      { label: 'Add to Cart', count: cart, color: '#0ea5e9' },
      { label: 'Checkout', count: checkout, color: '#8b5cf6' },
      { label: 'Zap Initiated', count: initiated, color: '#f59e0b' },
      { label: 'Zap Complete', count: complete, color: '#f7931a' },
    ];

    return raw.map((step, i) => {
      const prevCount = i === 0 ? step.count : raw[i - 1].count;
      const percentage = prevCount > 0 ? (step.count / prevCount) * 100 : 0;
      const dropoff = i === 0 ? 0 : 100 - percentage;
      return { ...step, percentage: i === 0 ? 100 : percentage, dropoff };
    });
  }, [products]);

  const maxCount = steps[0]?.count || 1;

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Conversion Funnel</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Purchase journey drop-off analysis</p>
        </div>
        <div className="text-xs text-muted-foreground">
          Overall: <span className="font-semibold text-bitcoin">{steps.length > 0 ? ((steps[steps.length - 1].count / maxCount) * 100).toFixed(1) : 0}%</span>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => {
          const barWidth = (step.count / maxCount) * 100;

          return (
            <div key={step.label} className="group">
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">{step.label}</span>
                  {i > 0 && (
                    <span className="text-[10px] font-medium text-red-400/80">
                      −{step.dropoff.toFixed(1)}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    {step.count.toLocaleString()}
                  </span>
                  {i > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      ({step.percentage.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-7 overflow-hidden rounded-md bg-secondary/50">
                <div
                  className="absolute inset-y-0 left-0 rounded-md transition-all duration-700 ease-out group-hover:brightness-110"
                  style={{
                    width: `${barWidth}%`,
                    background: `linear-gradient(90deg, ${step.color}cc, ${step.color})`,
                  }}
                />
                {/* Connector arrow */}
                {i < steps.length - 1 && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-muted-foreground/30">
                    ↓
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
