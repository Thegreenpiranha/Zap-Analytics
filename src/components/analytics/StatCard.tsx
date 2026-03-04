import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  format?: (n: number) => string;
  change: number;
  icon: React.ReactNode;
  delay?: number;
  accentColor?: 'orange' | 'purple' | 'green' | 'blue';
}

export function StatCard({
  title,
  value,
  format,
  change,
  icon,
  delay = 0,
  accentColor = 'orange',
}: StatCardProps) {
  const animatedValue = useAnimatedCounter(value, 1500, delay);
  const displayValue = format ? format(animatedValue) : animatedValue.toLocaleString();
  const isPositive = change >= 0;

  const accentClasses = {
    orange: 'from-bitcoin/10 to-transparent border-bitcoin/20',
    purple: 'from-purple/10 to-transparent border-purple/20',
    green: 'from-emerald-500/10 to-transparent border-emerald-500/20',
    blue: 'from-sky-500/10 to-transparent border-sky-500/20',
  };

  const iconBg = {
    orange: 'bg-bitcoin/10 text-bitcoin',
    purple: 'bg-purple/10 text-purple',
    green: 'bg-emerald-500/10 text-emerald-500',
    blue: 'bg-sky-500/10 text-sky-500',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border bg-gradient-to-b p-5 transition-all duration-300 hover:scale-[1.02]',
        accentClasses[accentColor],
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle gradient orb background */}
      <div
        className={cn(
          'absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-20 blur-2xl',
          accentColor === 'orange' && 'bg-bitcoin',
          accentColor === 'purple' && 'bg-purple',
          accentColor === 'green' && 'bg-emerald-500',
          accentColor === 'blue' && 'bg-sky-500',
        )}
      />

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight text-foreground animate-count-up">
            {displayValue}
          </p>
        </div>
        <div className={cn('rounded-lg p-2.5', iconBg[accentColor])}>
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        {isPositive ? (
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5 text-red-400" />
        )}
        <span
          className={cn(
            'text-xs font-semibold',
            isPositive ? 'text-emerald-400' : 'text-red-400',
          )}
        >
          {isPositive ? '+' : ''}{change}%
        </span>
        <span className="text-xs text-muted-foreground">vs prev period</span>
      </div>
    </div>
  );
}
