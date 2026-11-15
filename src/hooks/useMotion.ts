import { useEffect, useState } from 'react';
import { useSettings } from '../state/settingsStore';

function systemPrefersReduced(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Combines the OS preference with the app's own animation settings. */
export function useReducedMotion(): boolean {
  const { visuals } = useSettings();
  const [system, setSystem] = useState(systemPrefersReduced);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setSystem(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  if (!visuals.animations || visuals.motion === 'reduced') return true;
  if (visuals.motion === 'full') return false;
  return system;
}

/** Writes the motion mode to <html data-motion> so CSS can swap animations for simple fades. */
export function useApplyMotionAttribute(): boolean {
  const reduced = useReducedMotion();
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';
  }, [reduced]);
  return reduced;
}

export function useCelebrations(): boolean {
  const { visuals } = useSettings();
  const reduced = useReducedMotion();
  return visuals.celebrations && !reduced;
}
