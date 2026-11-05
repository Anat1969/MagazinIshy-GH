import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import Press from '../components/Press';
import Ribbon from '../components/Ribbon';
import RichText from '../components/RichText';
import { MAHUT_URL, merhavCaseUrl } from '../config';
import { formatDate, readingMinutes, shareInsight } from '../insight';
import { LENS, THREE } from '../lenses';
import type { Article as A, Case } from '../types';

interface Props {
  id: string;
  articles: A[];
  cases: Case[];
  status: 'loading' | 'ready' | 'error';
  onToast: (t: string) => void;
}

const latestImage = (c: Case | undefined, lens: string) => {
  const r = c?.merhav_readings.find((x) => x.lens === lens);
  const imgs = r?.images || [];
  return imgs.length ? imgs[imgs.length - 1].url : null;
};

export default function Article({ id, articles, cases, status, onToast }: Props) {
  const reduce = useReducedMotion();
  const i = articles.findIndex((a) => a.id === id);
  const a = articles[i];
  const c = cases.find((x) => x.id === a?.case_id);

  // A treatment given to one chapter is given to all, or to none: images only when all three lenses have one.
  const imgs = useMemo(() => THREE.map((l) => latestImage(c, l)), [c]);
  const allImgs = imgs.every(Boolean);
  const cover = latestImage(c, 'synthesis');

  if (status === 'loading') return <p className="frame state">טוען את הכתבה.</p>;
  if (!a)
    return (
      <p className="frame state">
        הכתבה לא נמצאה. <a href="#/issue">לגיליון</a>
      </p>
    );

  const k = a.content;
  const newer = articles[i - 1];
  const older = articles[i + 1];
  const readTime = (lens: string) => c?.merhav_readings.find((r) => r.lens === lens)?.updated_at;
  const axis = [
    { label: 'מקרה', when: c?.created_at, c: 'var(--ink)', text: a.case_title || a.case_code || '' },
    ...THREE.map((l) => ({ label: LENS[l].short, when: readTime(l), c: LENS[l].color, text: LENS[l].question })),
    { label: 'כתבה', when: a.created_at, c: 'var(--press)', text: `${readingMinutes(a)} דקות קריאה` },
  ];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(k.visual_prompt_he);
      onToast('הפרומפט הועתק');
    } catch {
      onToast('לא הצלחתי להעתיק. מסמנים ומעתיקים ידנית.');
    }
  };
  const enter = (d: number) => (reduce ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.5 } });

  return (
    <main className="frame art">
      <section className="art__top">
        <div>
          <span className="mono kicker">
            מתוך המרחב הפנימי · {a.case_title || a.case_code} · {formatDate(a.created_at)}
          </span>
          <h1 className="art__title">{k.title}</h1>
          <RichText className="art__sub" text={k.subtitle} />
          <RichText className="art__lede" text={k.lede} />
          <div className="axis" aria-label="ציר התהליך: מהמקרה לכתבה">
            {axis.map((x) => (
              <div key={x.label} style={{ ['--c' as string]: x.c }}>
                <b>{x.label}</b>
                <span className="mono mute">{x.when ? new Date(x.when).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' }) : '—'}</span>
              </div>
            ))}
          </div>
          <p className="explain">ציר התהליך: מתי נכתב המקרה, מתי נקראה כל עדשה, ומתי הודפסה הכתבה. הצבע הוא העדשה.</p>
        </div>
        <div>
          <div className="art__cover">
            {cover ? <img src={cover} alt="המרחב של הסינתזה, מתוך המרחב הפנימי" /> : <Press label={k.turn.to || 'כתבה'} />}
          </div>
          <p className="art__credit mono mute">
            {cover ? 'המרחב של הסינתזה, כפי שנשמר במרחב הפנימי.' : 'אין עדיין תמונת סינתזה במרחב הפנימי. השער הוא שלוש הפלטות.'}
          </p>
        </div>
      </section>

      <section className="share" aria-label="כמה מהכתבה הגיע מכל עדשה">
        <Ribbon article={a} big />
        <RichText className="share__insight" text={shareInsight(a)} />
      </section>

      <section className="chapters">
        {k.sections.map((s, j) => (
          <motion.article className="chapter" key={s.lens} style={{ ['--c' as string]: LENS[s.lens].color }} {...enter(0.1 + j * 0.12)}>
            {allImgs && (
              <div className="chapter__img">
                <img src={imgs[j]!} alt={`המרחב של ${LENS[s.lens].name}`} loading="lazy" />
              </div>
            )}
            <div className="chapter__plate">
              <span className="mono" style={{ color: LENS[s.lens].color }}>
                {LENS[s.lens].plate}
              </span>
              <span className="mono mute">{LENS[s.lens].name}</span>
            </div>
            <h2>{s.heading}</h2>
            <RichText className="chapter__insight" text={s.insight} />
            <RichText className="chapter__body" text={s.body} />
          </motion.article>
        ))}
      </section>

      <section className="synth">
        <div>
          <span className="mono" style={{ color: 'var(--press)' }}>
            דיו־הדפסה · סינתזה
          </span>
          <h2>{k.synthesis.heading}</h2>
          <RichText className="chapter__insight" text={k.synthesis.insight} />
        </div>
        <RichText className="synth__body" text={k.synthesis.body} />
      </section>

      <section className="coda">
        <blockquote className="quote" style={{ margin: 0 }}>
          {k.quote}
        </blockquote>
        <div className="haiku" aria-label="הייקו">
          <span className="mono mute">הייקו</span>
          {k.haiku.map((l, j) => (
            <span key={j}>{l}</span>
          ))}
        </div>
        <div className="turn" aria-label="ממה למה">
          <span className="mono mute">ממה למה</span>
          <span className="turn__from">{k.turn.from}</span>
          <span className="turn__line" />
          <span className="turn__to">{k.turn.to}</span>
        </div>
      </section>

      <div className="action">
        <span className="mono solution">צעד לשבוע הקרוב · </span>
        <RichText as="span" text={k.action} />
      </div>

      <section className="prompt">
        <div>
          <span className="mono mute">פרומפט שער למידג'רני</span>
          <p dir="rtl">{k.visual_prompt_he}</p>
        </div>
        <button className="btn" type="button" onClick={copy} data-testid="copy-prompt">
          העתקת הפרומפט
        </button>
      </section>

      <footer className="sources">
        {a.case_id && (
          <a className="btn btn--quiet" href={merhavCaseUrl(a.case_id)} target="_blank" rel="noreferrer">
            המקרה המלא במרחב הפנימי
          </a>
        )}
        <a className="btn btn--quiet" href={MAHUT_URL} target="_blank" rel="noreferrer">
          המהות, המגזין שממנו הקול
        </a>
        <span className="mono mute small">נכתב על ידי {a.model?.startsWith('gemini') ? 'Gemini' : 'Claude'} מתוך הקריאות של המרחב הפנימי. לא אבחנה ולא טיפול.</span>
      </footer>

      <nav className="pager" aria-label="כתבה קודמת והבאה">
        {newer ? (
          <a href={`#/a/${newer.id}`}>
            <span className="mono mute">חדשה יותר</span>
            <br />
            {newer.content.title}
          </a>
        ) : (
          <span />
        )}
        {older ? (
          <a href={`#/a/${older.id}`}>
            <span className="mono mute">קודמת</span>
            <br />
            {older.content.title}
          </a>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
