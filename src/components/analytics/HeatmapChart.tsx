import { useMemo } from 'react';
import type { HeatmapCell } from '@/lib/mock-data';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HeatmapChartProps {
  data: HeatmapCell[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => {
  if (i === 0) return '12a';
  if (i < 12) return `${i}a`;
  if (i === 12) return '12p';
  return `${i - 12}p`;
});

function getHeatColor(value: number, max: number): string {
  if (max === 0) return 'rgba(247, 147, 26, 0.02)';
  const intensity = value / max;
  if (intensity === 0) return 'rgba(247, 147, 26, 0.02)';
  if (intensity < 0.2) return 'rgba(247, 147, 26, 0.1)';
  if (intensity < 0.4) return 'rgba(247, 147, 26, 0.25)';
  if (intensity < 0.6) return 'rgba(247, 147, 26, 0.4)';
  if (intensity < 0.8) return 'rgba(247, 147, 26, 0.6)';
  return 'rgba(247, 147, 26, 0.85)';
}

export function HeatmapChart({ data }: HeatmapChartProps) {
  const maxValue = useMemo(() => Math.max(...data.map((c) => c.value)), [data]);

  const grid = useMemo(() => {
    const g: Record<string, number> = {};
    for (const cell of data) {
      g[`${cell.day}-${cell.hour}`] = cell.value;
    }
    return g;
  }, [data]);

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Peak Activity Hours</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Zap activity by day and hour (UTC)</p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex items-center mb-1">
            <div className="w-8" /> {/* Spacer for day labels */}
            {HOURS.map((hour, i) => (
              i % 3 === 0 ? (
                <div key={i} className="flex-1 text-center text-[9px] text-muted-foreground" style={{ minWidth: 0 }}>
                  {hour}
                </div>
              ) : (
                <div key={i} className="flex-1" style={{ minWidth: 0 }} />
              )
            ))}
          </div>

          {/* Grid */}
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="flex items-center gap-0.5 mb-0.5">
              <div className="w-8 text-[10px] text-muted-foreground font-medium">{day}</div>
              {HOURS.map((_, hourIndex) => {
                const value = grid[`${dayIndex}-${hourIndex}`] || 0;
                return (
                  <Tooltip key={hourIndex} delayDuration={100}>
                    <TooltipTrigger asChild>
                      <div
                        className="heatmap-cell flex-1 aspect-square rounded-[3px] cursor-default"
                        style={{
                          backgroundColor: getHeatColor(value, maxValue),
                          minWidth: 0,
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p className="font-medium">{day} {HOURS[hourIndex]}</p>
                      <p className="text-muted-foreground">{value} zaps</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-end gap-1 mt-3">
            <span className="text-[9px] text-muted-foreground mr-1">Less</span>
            {[0.02, 0.1, 0.25, 0.4, 0.6, 0.85].map((opacity) => (
              <div
                key={opacity}
                className="h-3 w-3 rounded-[2px]"
                style={{ backgroundColor: `rgba(247, 147, 26, ${opacity})` }}
              />
            ))}
            <span className="text-[9px] text-muted-foreground ml-1">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
