/// <reference lib="webworker" />
import { build, type CrowdSound } from './crowdSynth';

/* Builds crowd sounds off the main thread and hands the samples back. */
self.onmessage = (e: MessageEvent<CrowdSound>) => {
  const [left, right] = build(e.data);
  (self as unknown as Worker).postMessage({ name: e.data, left, right }, [left.buffer, right.buffer]);
};
