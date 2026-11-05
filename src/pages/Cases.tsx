import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { compose } from '../api';
import { merhavCaseUrl } from '../config';
import { formatDate, ready } from '../insight';
import { LENS, LENSES } from '../lenses';
import { go } from '../route';
import type { Article, Case } from '../types';

type Sort = 'new' | 'ready';
type Filter = 'all' | 'with' | 'without';
const STAGES = ['קורא את שלוש העדשות והסינתזה', 'מזקק פרק לכל עדשה', 'מעמד ציטוט, הייקו וצעד לשבוע', 'מדפיס ושומר בגיליון'];

interface Props {
  cases: Case[];
  articles: Article[];
  open: string | null;
  status: 'loading' | 'ready' | 'error';
  onComposed: (a: Article) => void;
}

function CaseOpen({ c, articles, onComposed }: { c: Case; articles: Article[]; onComposed: (a: Article) => void }) {
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState('');
  const by = Object.fromEntries(c.merhav_readings.map((r) => [r.lens, r]));
  const isReady = ready(c);

  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 6000);
    return () => clearInterval(t);
  }, [busy]);

  const run = async () => {
    setBusy(true);
    setStage(0);
    setError('');
    try {
      const a = await compose(c.id);
      onComposed(a);
      go(`/a/${a.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <motion.div className="case__open" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
      <div className="case__full">
        {LENSES.map((l) => (
          <div key={l.id} style={{ ['--c' as string]: l.color }}>
            <b>{l.name}</b>
            <p>{by[l.id]?.distill || <span className="mute">אין עדיין קריאה בעדשה הזו.</span>}</p>
          </div>
        ))}
      </div>
      <div className="case__act">
        <button className="btn btn--primary" type="button" onClick={run} disabled={busy || !isReady} data-testid="compose">
          {articles.length ? 'הפקת כתבה נוספת' : 'הפקת כתבה'}
        </button>
        {!isReady && <p className="error">{c.risk_level === 'acute' ? 'מקרה עם סיכון חריף לא הופך לכתבה.' : 'חסרות עדשות או סינתזה. משלימים במרחב הפנימי.'}</p>}
        {busy && (
          <div className="composing" aria-live="polite">
            {STAGES.map((s, i) => (
              <span key={s} className={i < stage ? 'done' : i === stage ? 'on' : ''}>
                {s}
              </span>
            ))}
            <span className="explain">בערך חצי דקה. Gemini החינמי קודם, Claude כגיבוי.</span>
          </div>
        )}
        {error && <p className="error">{error}</p>}
        <a className="btn" href={merhavCaseUrl(c.id)} target="_blank" rel="noreferrer">
          פתיחת המקרה במרחב הפנימי
        </a>
        {articles.length > 0 && (
          <div className="case__articles">
            <span className="mono mute">כתבות מהמקרה הזה</span>
            {articles.map((a) => (
              <a key={a.id} href={`#/a/${a.id}`}>
                {a.content.title} <span className="mono mute">{formatDate(a.created_at)}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Cases({ cases, articles, open, status, onComposed }: Props) {
  const [sort, setSort] = useState<Sort>('new');
  const [filter, setFilter] = useState<Filter>('all');
  const byCase = useMemo(() => {
    const m: Record<string, Article[]> = {};
    for (const a of articles) if (a.case_id) (m[a.case_id] ||= []).push(a);
    return m;
  }, [articles]);

  const list = useMemo(() => {
    let l = [...cases];
    if (filter === 'with') l = l.filter((c) => byCase[c.id]?.length);
    if (filter === 'without') l = l.filter((c) => !byCase[c.id]?.length);
    if (sort === 'ready') l.sort((a, b) => Number(ready(b)) - Number(ready(a)) || (byCase[a.id]?.length || 0) - (byCase[b.id]?.length || 0));
    return l;
  }, [cases, filter, sort, byCase]);

  return (
    <main className="frame page">
      <section className="head">
        <div>
          <span className="mono kicker">מקרים להפקה</span>
          <h1>כל מקרה מהמרחב הפנימי הוא כתבה שמחכה.</h1>
        </div>
        <div className="head__why">
          <p>
            <b>למה</b>הקריאות כבר קיימות במרחב הפנימי, ונשארות כאן קשורות אליו.
          </p>
          <p>
            <b>מה עושים</b>פותחים מקרה, רואים את ארבע הפלטות, ולוחצים "הפקת כתבה".
          </p>
          <p>
            <b>מה יוצא</b>כתבה בגיליון, עם פרק לכל עדשה וקישור חזרה למקרה.
          </p>
        </div>
      </section>

      <div className="tools" role="toolbar" aria-label="סידור וסינון">
        <span className="tools__label">מסודר לפי {sort === 'new' ? 'חדש קודם' : 'מוכן להפקה קודם'}</span>
        <div className="chips">
          <button className="chip" type="button" aria-pressed={sort === 'new'} onClick={() => setSort('new')}>
            חדש קודם
          </button>
          <button className="chip" type="button" aria-pressed={sort === 'ready'} onClick={() => setSort('ready')}>
            מוכן קודם
          </button>
        </div>
        <span className="tools__label">מציג</span>
        <div className="chips">
          <button className="chip" type="button" aria-pressed={filter === 'with'} onClick={() => setFilter('with')}>
            רק עם כתבה
          </button>
          <button className="chip" type="button" aria-pressed={filter === 'without'} onClick={() => setFilter('without')}>
            בלי כתבה
          </button>
          <button className="chip" type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
            הכול
          </button>
        </div>
      </div>

      {status === 'loading' && <p className="state">טוען את המקרים מהמרחב הפנימי.</p>}
      {status === 'error' && <p className="state error">לא הצלחתי לקרוא את המרחב הפנימי. מרעננים את הדף בעוד רגע.</p>}
      {status === 'ready' && !list.length && <p className="state">אין מקרים בסינון הזה. בוחרים "הכול".</p>}

      <div className="cases">
        {list.map((c) => {
          const by = Object.fromEntries(c.merhav_readings.map((r) => [r.lens, r]));
          const n = byCase[c.id]?.length || 0;
          const isOpen = open === c.id;
          return (
            <article className="case" key={c.id} data-testid="case">
              <button className="case__row" type="button" aria-expanded={isOpen} onClick={() => go(isOpen ? '/cases' : `/cases/${c.id}`)}>
                <div>
                  <span className="mono mute">{c.code}</span>
                  <div className="case__title">{c.title || c.code}</div>
                </div>
                <div className="case__plates">
                  {LENSES.map((l) => (
                    <span key={l.id} className="case__plate" style={{ ['--c' as string]: LENS[l.id].color }}>
                      {by[l.id]?.distill || '—'}
                    </span>
                  ))}
                </div>
                <span className="case__status">
                  {n ? <span className="solution">{n} כתבות</span> : ready(c) ? 'מוכן להפקה' : <span className="problem">חסר</span>}
                </span>
              </button>
              <AnimatePresence initial={false}>{isOpen && <CaseOpen c={c} articles={byCase[c.id] || []} onComposed={onComposed} />}</AnimatePresence>
            </article>
          );
        })}
      </div>
      <p className="explain" style={{ marginTop: 12 }}>
        כל פס צבע הוא עדשה: ענבר ביוגרפית, אינדיגו צמצום, אזוב בודהיסטית, דיו סינתזה. הטקסט הוא משפט הזיקוק של המרחב שלה.
      </p>
    </main>
  );
}
