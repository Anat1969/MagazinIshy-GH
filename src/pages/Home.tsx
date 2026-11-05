import { useMemo, useState } from 'react';
import Press from '../components/Press';
import RichText from '../components/RichText';
import { MAHUT_URL, MERHAV_URL } from '../config';
import { formatDate, issueLead, ready, sharePct } from '../insight';
import { LENS, LENSES, THREE } from '../lenses';
import type { Article, Case, LensId } from '../types';

interface Props {
  cases: Case[];
  articles: Article[];
  status: 'loading' | 'ready' | 'error';
}

export default function Home({ cases, articles, status }: Props) {
  const [focus, setFocus] = useState<LensId | null>(null);
  const covered = useMemo(() => new Set(articles.map((a) => a.case_id)), [articles]);
  const readyCases = cases.filter(ready);
  const waiting = readyCases.filter((c) => !covered.has(c.id));
  const latest = articles[0];

  // Average share per lens across the issue (small multiples on one common scale).
  const avg = useMemo(() => {
    const out = {} as Record<LensId, number>;
    for (const l of LENSES) out[l.id] = articles.length ? Math.round(articles.reduce((n, a) => n + sharePct(a)[l.id], 0) / articles.length) : 0;
    return out;
  }, [articles]);
  const lead = issueLead(articles);
  const max = Math.max(1, ...THREE.map((k) => avg[k]), avg.synthesis);

  const q1 =
    status !== 'ready'
      ? 'טוען את המקרים מהמרחב הפנימי.'
      : waiting.length
        ? `**${waiting.length}** מקרים עם שלוש עדשות וסינתזה עוד **לא הפכו לכתבה**.`
        : `כל **${readyCases.length}** המקרים המוכנים כבר **הפכו לכתבה**.`;
  const q2 = articles.length
    ? `**${LENS[lead.top].name}** מובילה ב-**${lead.counts[lead.top]}** מתוך **${articles.length}** כתבות.`
    : 'אחרי הכתבה הראשונה יופיע כאן איזו עדשה נושאת יותר.';

  return (
    <main className="frame">
      <section className="hero">
        <div>
          <span className="mono kicker">מקרה אחד · שלוש עדשות · כתבה אחת</span>
          <h1>
            <mark>שלוש עדשות</mark> נדפסות לכתבה אחת.
          </h1>
          <p className="hero__lede">
            המגזין לוקח מקרה מ<b>המרחב הפנימי</b>, קורא את <b>הביוגרפית</b>, <b>הצמצום</b> ו<b>הבודהיסטית</b> כמו שלוש פלטות דפוס,
            <br />
            ומדפיס מהן כתבה בשפה של <b>המהות</b>.
          </p>
          <div className="hero__cta">
            <a className="btn btn--primary" href="#/cases">
              הפקת כתבה ממקרה
            </a>
            <a className="btn" href="#/issue">
              לגיליון
            </a>
          </div>
        </div>
        <div>
          <Press focus={focus} />
          <div className="press__legend" aria-label="מקרא הפלטות">
            {LENSES.map((l) => (
              <button
                key={l.id}
                type="button"
                style={{ ['--c' as string]: l.color }}
                aria-pressed={focus === l.id}
                onMouseEnter={() => setFocus(l.id)}
                onMouseLeave={() => setFocus(null)}
                onFocus={() => setFocus(l.id)}
                onBlur={() => setFocus(null)}
              >
                <b style={{ color: l.color }}>{l.plate}</b>
                {l.name}
              </button>
            ))}
          </div>
          <p className="explain">כל ריבוע הוא פלטה של עדשה אחת. המקום שבו שלושתן נפגשות הוא הסינתזה, ומשם נולדת הכתבה.</p>
        </div>
      </section>

      <section className="questions" aria-label="שלוש השאלות">
        <div className="q">
          <span className="q__ask">כמה מקרים מחכים לכתבה?</span>
          <span className="q__num" data-testid="waiting">
            {status === 'ready' ? waiting.length : '·'}
            <small>מתוך {readyCases.length} מוכנים</small>
          </span>
          <RichText className="q__insight" text={q1} />
          <span className="explain">מוכן: מקרה עם שלוש עדשות וסינתזה, בלי סיכון חריף.</span>
        </div>
        <div className="q">
          <span className="q__ask">איזו עדשה נושאת את הכתבות?</span>
          <div className="bars" role="img" aria-label="נתח ממוצע של כל עדשה בכתבות">
            {LENSES.map((l) => (
              <div className="bars__row" key={l.id}>
                <span>{l.short}</span>
                <span className="bars__track">
                  <span className="bars__fill" style={{ width: `${(avg[l.id] / max) * 100}%`, background: l.color }} />
                </span>
                <span className="bars__val">{avg[l.id]}%</span>
              </div>
            ))}
          </div>
          <RichText className="q__insight" text={q2} />
          <span className="explain">נמדד: אחוז המילים בכל פרק מתוך הכתבה, בממוצע על כל הגיליון. הצבע הוא העדשה.</span>
        </div>
        <div className="q">
          <span className="q__ask">מה הודפס אחרון?</span>
          {latest ? (
            <a className="q__latest" href={`#/a/${latest.id}`}>
              <span className="mono mute">{formatDate(latest.created_at)}</span>
              <h3>{latest.content.title}</h3>
              <RichText className="small" text={latest.content.subtitle} />
            </a>
          ) : (
            <p className="q__insight">{status === 'ready' ? 'עוד לא הודפסה כתבה. בוחרים מקרה ומפיקים.' : 'טוען.'}</p>
          )}
          <span className="explain">
            <b className="mono">{articles.length}</b> כתבות בגיליון, מ-<b className="mono">{covered.size}</b> מקרים.
          </span>
        </div>
      </section>

      <section className="triad" aria-label="בעיה, פתרון ותובנה">
        <div style={{ ['--c' as string]: 'var(--problem)' }}>
          <b>בעיה</b>
          <p>
            קריאה של מקרה דרך <b>שלוש עדשות</b> נשארת כרטיסים נפרדים. אין ממנה <b>סיפור</b> שאפשר לקרוא, ללמד או לפרסם.
          </p>
        </div>
        <div style={{ ['--c' as string]: 'var(--solution)' }}>
          <b>פתרון</b>
          <p>
            עורך אחד מקבל את <b>שלוש הקריאות והסינתזה</b>, ומדפיס כתבה: פרק לכל עדשה, סינתזה, ציטוט, הייקו ו<b>צעד לשבוע</b>.
          </p>
        </div>
        <div style={{ ['--c' as string]: '#8a6d00' }}>
          <b>תובנה</b>
          <p>
            <mark>ההבדל בין העדשות</mark> הוא החומר של הכתבה. לכן כל כתבה מראה כמה ממנה הגיע מכל עדשה.
          </p>
        </div>
      </section>

      <section className="sisters" aria-label="שלוש אפליקציות, שלוש שאלות">
        <h2>שלוש אפליקציות, שלוש שאלות.</h2>
        <a className="sister" href={MERHAV_URL} target="_blank" rel="noreferrer">
          <span className="mono">מקור הקריאות</span>
          <b>מרחב פנימי</b>
          <span>מה כל עדשה רואה במקרה, ואיזה מרחב היא בונה?</span>
        </a>
        <a className="sister" href={MAHUT_URL} target="_blank" rel="noreferrer">
          <span className="mono">מקור הקול</span>
          <b>מהות</b>
          <span>מה המהות של מחשבה גולמית אחת?</span>
        </a>
        <div className="sister sister--here">
          <span className="mono">כאן</span>
          <b>מגזין מהמרחב הפנימי</b>
          <span>איך תהליך של שלוש עדשות הופך לכתבה אחת?</span>
        </div>
      </section>

      <footer className="foot mono mute">
        <span>השראה: סימני הרישום של דפוס ארבעה צבעים, והעיצוב של וילי פלקהאוס Willy Fleckhaus למגזין twen, 1959.</span>
        <span>הטקסט: Gemini החינמי, Claude כגיבוי. נשלחות רק הקריאות האנונימיות.</span>
      </footer>
    </main>
  );
}
