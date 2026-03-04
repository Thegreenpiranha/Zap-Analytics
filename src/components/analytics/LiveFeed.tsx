import { ScrollArea } from '@/components/ui/scroll-area';
import type { FeedEvent } from '@/lib/mock-data';
import { getEventIcon, getEventLabel } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface LiveFeedProps {
  events: FeedEvent[];
  isConnected: boolean;
}

function formatTimestamp(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

const typeColors: Record<FeedEvent['type'], string> = {
  product_view: 'border-l-gray-500',
  add_to_cart: 'border-l-sky-500',
  checkout_start: 'border-l-purple',
  zap_initiated: 'border-l-amber-500',
  zap_complete: 'border-l-bitcoin',
};

export function LiveFeed({ events, isConnected }: LiveFeedProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-card flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Relay Activity</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">Live anonymised events</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              isConnected ? 'bg-emerald-400 animate-live-pulse' : 'bg-red-400',
            )}
          />
          <span className="text-[10px] text-muted-foreground">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 space-y-1">
          {events.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              Waiting for events...
            </p>
          ) : (
            events.map((event, i) => (
              <div
                key={event.id}
                className={cn(
                  'flex items-start gap-2.5 rounded-lg border-l-2 bg-secondary/30 px-3 py-2 transition-all hover:bg-secondary/50',
                  typeColors[event.type],
                  i === 0 && 'animate-feed-in',
                )}
              >
                <span className="text-sm mt-0.5 flex-shrink-0">{getEventIcon(event.type)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-foreground leading-tight truncate">
                    {getEventLabel(event)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatTimestamp(event.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
