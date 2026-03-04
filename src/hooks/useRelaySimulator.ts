import { useState, useEffect, useCallback, useRef } from 'react';
import { generateFeedEvent, type FeedEvent } from '@/lib/mock-data';

const MAX_EVENTS = 50;

export function useRelaySimulator(active: boolean = true) {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addEvent = useCallback(() => {
    const event = generateFeedEvent();
    setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS));
  }, []);

  useEffect(() => {
    if (!active) {
      setIsConnected(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Simulate connection delay
    const connectTimeout = setTimeout(() => {
      setIsConnected(true);

      // Generate a few initial events
      const initial: FeedEvent[] = [];
      for (let i = 0; i < 5; i++) {
        initial.push({
          ...generateFeedEvent(),
          timestamp: Date.now() - (5 - i) * 3000,
        });
      }
      setEvents(initial);

      // Start streaming events
      intervalRef.current = setInterval(() => {
        addEvent();
      }, 2000 + Math.random() * 3000); // 2-5 seconds
    }, 800);

    return () => {
      clearTimeout(connectTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [active, addEvent]);

  return { events, isConnected };
}
