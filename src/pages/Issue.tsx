import { useMemo, useState } from 'react';
import Ribbon from '../components/Ribbon';
import RichText from '../components/RichText';
import { formatDate, leadLens, readingMinutes } from '../insight';
import { LENS, THREE } from '../lenses';
import type { Article, ThreeId } from '../types';

type Group = 'date' | 'lens' | 'case';

export default function Issue({ articles, status }: { articles: Article[]; status: 'loading' | 'ready' | 'error' }) {
  const [group, setGroup] = useState<Group>('date');
  const [only, setOnly] = useState<ThreeId | 'all'>('all');

  const groups = useMemo(() => {
    const list = only === 'all' ? articles : articles.filter((a) => leadLens(a) === only);
    const key = (a: Article) =>
      group === 'lens' ? `${LENS[leadLens(a)].name} מובילה` : group === 'case' ? a.case_title || a.case_code || 'מקרה' : new Date(a.created_at).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
    const m = new Map<string, Article[]>();
    for (const a of list) m.set(key(a), [...(m.get(key(a)) || []), a]);
    return [...m.entries()];
  }, [articles, group, only]);

  return (
    <main className="frame page">
      <section className="head">
        <div>
          <span className="mono kicker">הגיליון</span>
          <h1>
            <span className="mono">{articles.length}</span> כתבות, כל אחת מודפסת משלוש פלטות.
          </h1>
        </div>
        <div className="head__why">
          <p>
            <b>למה</b>לראות את כל הכתבות במבט, ואיזו עדשה נושאת כל אחת.
          </p>
          <p>
            <b>מה עושים</b>מקבצים לפי זמן, עדשה או מקרה, ופותחים כתבה.
          </p>
          <p>
            <b>מה יוצא</b>קריאה, הדפסה בגודל A4, והעתקת פרומפט השער.
          </p>
        </div>
      </section>

      <div className="tools" role="toolbar" aria-label="קיבוץ וסינון">
        <span className="tools__label">מקובץ לפי {group === 'date' ? 'חודש' : group === 'lens' ? 'עדשה מובילה' : 'מקרה'}</span>
        <div className="chips">
          {(['date', 'lens', 'case'] as Group[]).map((g) => (
            <button key={g} className="chip" type="button" aria-pressed={group === g} onClick={() => setGroup(g)}>
              {g === 'date' ? 'חודש' : g === 'lens' ? 'עדשה' : 'מקרה'}
            </button>
          ))}
        </div>
        <span className="tools__label">עדשה מובילה</span>
        <div className="chips">
          {THREE.map((l) => (
            <button key={l} className="chip" type="button" aria-pressed={only === l} onClick={() => setOnly(l)}>
              <span className="dot" style={{ background: LENS[l].color }} />
              {LENS[l].short}
            </button>
          ))}
          <button className="chip" type="button" aria-pressed={only === 'all'} onClick={() => setOnly('all')}>
            הכול
          </button>
        </div>
      </div>

      {status === 'loading' && <p className="state">טוען את הגיליון.</p>}
      {status === 'ready' && !articles.length && (
        <p className="state">
          הגיליון ריק. <a href="#/cases">בוחרים מקרה ומפיקים כתבה ראשונה.</a>
        </p>
      )}
      {status === 'ready' && articles.length > 0 && !groups.length && <p className="state">אין כתבה שהעדשה הזו מובילה בה. בוחרים "הכול".</p>}

      <div className="grid">
        {groups.map(([g, list]) => [
          <h2 className="groupHead" key={`h-${g}`}>
            {g} · {list.length}
          </h2>,
          ...list.map((a) => (
            <a className="card" key={a.id} href={`#/a/${a.id}`} data-testid="card">
              <Ribbon article={a} />
              <span className="mono mute">{a.case_title || a.case_code}</span>
              <h3>{a.content.title}</h3>
              <RichText text={a.content.subtitle} />
              <div className="card__meta mono mute">
                <span>{formatDate(a.created_at)}</span>
                <span>{readingMinutes(a)} דקות קריאה</span>
              </div>
            </a>
          )),
        ])}
      </div>
      <p className="explain" style={{ marginTop: 12 }}>
        הפס בראש כל כתבה: אחוז המילים שכל עדשה נושאת. ענבר ביוגרפית, אינדיגו צמצום, אזוב בודהיסטית, דיו סינתזה.
      </p>
    </main>
  );
}
