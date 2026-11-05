import { LENS, THREE } from './lenses';
import type { Article, Case, LensId, ThreeId } from './types';

// Every number on screen comes with a sentence that says what it teaches.
// All of it is computed from the data, never written by hand.

export const ready = (c: Case) => {
  const have = new Set(c.merhav_readings.map((r) => r.lens));
  return THREE.every((l) => have.has(l)) && have.has('synthesis') && c.risk_level !== 'acute';
};

export function sharePct(a: Article): Record<LensId, number> {
  const s = a.share || {};
  const total = (['biographical', 'tzimtzum', 'buddhist', 'synthesis'] as LensId[]).reduce((n, k) => n + (s[k] || 0), 0) || 1;
  const out = {} as Record<LensId, number>;
  for (const k of ['biographical', 'tzimtzum', 'buddhist', 'synthesis'] as LensId[]) out[k] = Math.round(((s[k] || 0) / total) * 100);
  return out;
}

export function leadLens(a: Article): ThreeId {
  const p = sharePct(a);
  return [...THREE].sort((x, y) => p[y] - p[x])[0];
}

/** One sentence that reads the share bar of a single article. */
export function shareInsight(a: Article): string {
  const p = sharePct(a);
  const sorted = [...THREE].sort((x, y) => p[y] - p[x]);
  const top = sorted[0];
  const low = sorted[2];
  const gap = p[top] - p[low];
  if (gap <= 6) return `שלוש העדשות נושאות את הכתבה **כמעט שווה בשווה**, והסינתזה מחזיקה **${p.synthesis}%**.`;
  return `**${LENS[top].name}** נושאת **${p[top]}%** מהכתבה, פי **${(p[top] / Math.max(p[low], 1)).toFixed(1)}** מ${LENS[low].short}.`;
}

/** Across the issue: which lens leads most often. */
export function issueLead(articles: Article[]) {
  const counts: Record<ThreeId, number> = { biographical: 0, tzimtzum: 0, buddhist: 0 };
  for (const a of articles) counts[leadLens(a)]++;
  const top = [...THREE].sort((x, y) => counts[y] - counts[x])[0];
  return { counts, top };
}

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });

export const words = (t: string) => t.replace(/\*\*/g, '').split(/\s+/).filter(Boolean).length;

export const readingMinutes = (a: Article) => {
  const c = a.content;
  const n = c.sections.reduce((m, s) => m + words(s.body), 0) + words(c.synthesis.body) + words(c.lede);
  return Math.max(1, Math.round(n / 180));
};
