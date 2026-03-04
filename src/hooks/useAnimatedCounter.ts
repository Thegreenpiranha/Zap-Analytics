import { useState, useEffect, useRef } from 'react';

export function useAnimatedCounter(
  end: number,
  duration: number = 1500,
  delay: number = 0,
): number {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number>(0);
  const prevEndRef = useRef(0);

  useEffect(() => {
    const startValue = prevEndRef.current;
    prevEndRef.current = end;

    const timeout = setTimeout(() => {
      startTimeRef.current = null;

      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(startValue + (end - startValue) * eased);

        setCount(current);

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        }
      };

      animFrameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [end, duration, delay]);

  return count;
}
