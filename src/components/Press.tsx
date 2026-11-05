import { motion, useReducedMotion } from 'framer-motion';
import { LENS, THREE } from '../lenses';
import type { LensId } from '../types';

// The central object: three printing plates, one per lens, that slide into register.
// Where all three overlap is the article (the synthesis plate). One movement, then it stops.
const VB = { w: 100, h: 82 };
const SIZE = { w: 52, h: 46 };
// label: the outer corner of each plate, where no other plate covers it.
const AT: Record<string, { x: number; y: number; from: { x: number; y: number }; lx: number; ly: number; anchor: 'start' | 'end' }> = {
  biographical: { x: 40, y: 6, from: { x: 26, y: -10 }, lx: 90, ly: 11, anchor: 'start' },
  tzimtzum: { x: 8, y: 14, from: { x: -26, y: -4 }, lx: 10, ly: 19, anchor: 'end' },
  buddhist: { x: 26, y: 30, from: { x: 0, y: 22 }, lx: 76, ly: 73, anchor: 'start' },
};

function intersection() {
  const xs = THREE.map((k) => AT[k].x);
  const ys = THREE.map((k) => AT[k].y);
  const x1 = Math.max(...xs);
  const y1 = Math.max(...ys);
  const x2 = Math.min(...xs) + SIZE.w;
  const y2 = Math.min(...ys) + SIZE.h;
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

function Reg({ x, y }: { x: number; y: number }) {
  return (
    <g stroke="#141311" strokeWidth="0.25" fill="none" opacity="0.7">
      <circle cx={x} cy={y} r="1.6" />
      <line x1={x - 2.8} y1={y} x2={x + 2.8} y2={y} />
      <line x1={x} y1={y - 2.8} x2={x} y2={y + 2.8} />
    </g>
  );
}

export default function Press({ focus, label = 'כתבה', compact = false }: { focus?: LensId | null; label?: string; compact?: boolean }) {
  const reduce = useReducedMotion();
  const mid = intersection();
  const dim = (id: LensId) => (focus && focus !== id ? 0.15 : 0.62);
  return (
    <div className="press" aria-hidden={compact}>
      <svg viewBox={`-6 -6 ${VB.w + 12} ${VB.h + 12}`} role="img" aria-label="שלוש פלטות של עדשות שנדפסות לכתבה אחת">
        <Reg x={-2} y={-2} />
        <Reg x={VB.w + 2} y={-2} />
        <Reg x={-2} y={VB.h + 2} />
        <Reg x={VB.w + 2} y={VB.h + 2} />
        {THREE.map((id, i) => {
          const p = AT[id];
          return (
            <motion.g
              key={id}
              initial={reduce ? false : { x: p.from.x, y: p.from.y, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              transition={{ duration: 1.1, delay: 0.15 + i * 0.18, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <rect x={p.x} y={p.y} width={SIZE.w} height={SIZE.h} fill={LENS[id].color} opacity={dim(id)} style={{ transition: 'opacity .25s' }} />
              {!compact && (
                <text x={p.lx} y={p.ly} fontSize="3.4" fill="#fff" style={{ direction: 'rtl', fontFamily: 'var(--sans)', fontWeight: 700 }} textAnchor={p.anchor} opacity={focus && focus !== id ? 0.3 : 1}>
                  {LENS[id].short}
                </text>
              )}
            </motion.g>
          );
        })}
        <motion.g initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.35, duration: 0.6 }}>
          <rect x={mid.x} y={mid.y} width={mid.w} height={mid.h} fill={LENS.synthesis.color} opacity={focus && focus !== 'synthesis' ? 0.35 : 0.92} style={{ transition: 'opacity .25s' }} />
          {!compact && (
            <text x={mid.x + mid.w / 2} y={mid.y + mid.h / 2 + 1.4} fontSize="4" fill="#fff" textAnchor="middle" style={{ direction: 'rtl', fontFamily: 'var(--sans)', fontWeight: 700 }}>
              {label}
            </text>
          )}
        </motion.g>
      </svg>
    </div>
  );
}
