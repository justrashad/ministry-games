import { useEffect, useRef, useState } from 'react';

/** Animates a number toward its target. Jumps instantly when motion is reduced. */
export function useCountUp(target: number, reduced: boolean, durationMs = 700): number {
  const [shown, setShown] = useState(target);
  const fromRef = useRef(target);
  const frameRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(frameRef.current);
    const from = fromRef.current;
    if (reduced || from === target) {
      fromRef.current = target;
      setShown(target);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(from + (target - from) * eased);
      fromRef.current = value;
      setShown(value);
      if (t < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, reduced, durationMs]);

  return shown;
}
