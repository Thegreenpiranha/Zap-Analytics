import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { TrafficSource } from '@/lib/mock-data';

interface TrafficSourcesProps {
  data: TrafficSource[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: TrafficSource }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    const item = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-xs font-medium text-foreground">{item.name}</span>
        </div>
        <p className="mt-1 text-sm font-bold text-foreground">{item.value}%</p>
      </div>
    );
  }
  return null;
}

export function TrafficSources({ data }: TrafficSourcesProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Traffic Sources</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Where buyers discover your products</p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="h-48 w-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={78}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="transition-opacity hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2.5 w-full">
          {data.map((source) => (
            <div key={source.name} className="flex items-center justify-between group">
              <div className="flex items-center gap-2.5">
                <div
                  className="h-2.5 w-2.5 rounded-full transition-transform group-hover:scale-125"
                  style={{ backgroundColor: source.color }}
                />
                <span className="text-xs font-medium text-foreground">{source.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${source.value}%`,
                      backgroundColor: source.color,
                    }}
                  />
                </div>
                <span className="text-xs font-semibold text-muted-foreground w-8 text-right">
                  {source.value}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
