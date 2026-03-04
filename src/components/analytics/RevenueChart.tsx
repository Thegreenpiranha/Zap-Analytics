import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts';
import type { DailyRevenue } from '@/lib/mock-data';
import { formatSats } from '@/lib/mock-data';

interface RevenueChartProps {
  data: DailyRevenue[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    return (
      <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-xl">
        <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: entry.dataKey === 'revenue' ? '#f7931a' : '#8b5cf6',
              }}
            />
            <span className="text-xs text-muted-foreground">
              {entry.dataKey === 'revenue' ? 'Revenue' : 'Transactions'}:
            </span>
            <span className="text-xs font-bold text-foreground">
              {entry.dataKey === 'revenue'
                ? formatSats(entry.value)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Revenue Over Time</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Daily sats received & transaction count</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-bitcoin" />
            <span className="text-[10px] text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-purple" />
            <span className="text-[10px] text-muted-foreground">Transactions</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f7931a" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f7931a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="revenue"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickFormatter={(v) => formatSats(v)}
              width={60}
            />
            <YAxis
              yAxisId="transactions"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 10 }}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              stroke="#f7931a"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
            <Line
              yAxisId="transactions"
              type="monotone"
              dataKey="transactions"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 2"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
