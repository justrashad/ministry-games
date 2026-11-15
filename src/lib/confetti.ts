/** A tiny dependency-free confetti burst on a temporary canvas. */

const COLORS = ['#ffcf4d', '#fff0c4', '#8279e6', '#4cc3ff', '#ff8a65', '#34d399', '#f472b6'];

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  color: string;
  shape: 'rect' | 'circle';
}

let active = 0;

export function fireConfetti(options: { count?: number; durationMs?: number } = {}): void {
  if (typeof document === 'undefined' || active > 1) return;
  const count = options.count ?? 140;
  const duration = options.durationMs ?? 2800;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: '60' });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }
  active += 1;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  const pieces: Piece[] = Array.from({ length: count }, (_, i) => {
    const fromLeft = i % 2 === 0;
    return {
      x: fromLeft ? w * 0.15 : w * 0.85,
      y: h * 0.75,
      vx: (fromLeft ? 1 : -1) * (3 + Math.random() * 6),
      vy: -(9 + Math.random() * 9),
      size: 6 + Math.random() * 8,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
      color: COLORS[i % COLORS.length],
      shape: Math.random() > 0.3 ? 'rect' : 'circle',
    };
  });

  const start = performance.now();
  const frame = (now: number) => {
    const elapsed = now - start;
    ctx.clearRect(0, 0, w, h);
    const fade = Math.max(0, 1 - Math.max(0, elapsed - duration * 0.6) / (duration * 0.4));
    ctx.globalAlpha = fade;
    for (const p of pieces) {
      p.vy += 0.32;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    if (elapsed < duration) requestAnimationFrame(frame);
    else {
      canvas.remove();
      active -= 1;
    }
  };
  requestAnimationFrame(frame);
}
