import { LENS } from '../lenses';
import { sharePct } from '../insight';
import type { Article, LensId } from '../types';

const ORDER: LensId[] = ['biographical', 'tzimtzum', 'buddhist', 'synthesis'];

/** The share bar: how much of the article each lens carries, in words. */
export default function Ribbon({ article, big = false }: { article: Article; big?: boolean }) {
  const p = sharePct(article);
  return (
    <div className={`ribbon${big ? ' ribbon--big' : ''}`} role="img" aria-label={ORDER.map((k) => `${LENS[k].name} ${p[k]}%`).join(', ')}>
      {ORDER.map((k) => (
        <span key={k} style={{ width: `${p[k]}%`, background: LENS[k].color }} title={`${LENS[k].name}: ${p[k]}%`}>
          {big && p[k] >= 9 && <b>{p[k]}%</b>}
        </span>
      ))}
    </div>
  );
}
