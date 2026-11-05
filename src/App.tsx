import { useCallback, useEffect, useMemo, useState } from 'react';
import { listArticles, listCases } from './api';
import type { MenuItem } from './components/AIMenu';
import TopBar from './components/TopBar';
import Article from './pages/Article';
import Cases from './pages/Cases';
import Home from './pages/Home';
import Issue from './pages/Issue';
import { go, useRoute } from './route';
import type { Article as A, Case } from './types';

export default function App() {
  const route = useRoute();
  const [cases, setCases] = useState<Case[]>([]);
  const [articles, setArticles] = useState<A[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    try {
      const [c, a] = await Promise.all([listCases(), listArticles()]);
      setCases(c);
      setArticles(a);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const names: Record<string, string> = { home: 'בית', cases: 'מקרים להפקה', issue: 'הגיליון' };
    const a = route.page === 'article' ? articles.find((x) => x.id === route.id) : null;
    document.title = `${a ? a.content.title : names[route.page]} · מגזין מהמרחב הפנימי`;
  }, [route, articles]);

  const onComposed = useCallback((a: A) => {
    setArticles((list) => [a, ...list]);
    setToast('הכתבה הודפסה ונשמרה בגיליון');
  }, []);

  const items: MenuItem[] = useMemo(
    () => [
      { label: 'הפקת כתבה ממקרה', onSelect: () => go('/cases') },
      ...(route.page === 'article' ? [{ label: 'הדפסה בגודל A4', onSelect: () => window.print() }] : []),
      { label: 'רענון הנתונים', hint: 'מהמרחב הפנימי', onSelect: () => load().then(() => setToast('הנתונים עודכנו')) },
    ],
    [route.page, load],
  );

  return (
    <>
      <TopBar route={route} items={items} />
      {route.page === 'home' && <Home cases={cases} articles={articles} status={status} />}
      {route.page === 'cases' && <Cases cases={cases} articles={articles} open={route.open} status={status} onComposed={onComposed} />}
      {route.page === 'issue' && <Issue articles={articles} status={status} />}
      {route.page === 'article' && <Article id={route.id} articles={articles} cases={cases} status={status} onToast={setToast} />}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
