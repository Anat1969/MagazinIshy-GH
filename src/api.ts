import { SUPABASE_ANON, SUPABASE_URL } from './config';
import type { Article, Case } from './types';

const H = { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` };

async function readJson<T>(r: Response): Promise<T> {
  const text = await r.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* not json */
  }
  if (!r.ok) {
    const d = data as { error?: string; message?: string } | null;
    throw new Error(d?.error || d?.message || `שגיאה ${r.status}`);
  }
  return data as T;
}

export async function listCases(): Promise<Case[]> {
  const q = 'select=id,code,title,created_at,risk_level,merhav_readings(lens,distill,images,updated_at)&order=created_at.desc&limit=80';
  return readJson(await fetch(`${SUPABASE_URL}/rest/v1/merhav_cases?${q}`, { headers: H }));
}

export async function listArticles(): Promise<Article[]> {
  return readJson(await fetch(`${SUPABASE_URL}/rest/v1/ishy_articles?select=*&order=created_at.desc&limit=200`, { headers: H }));
}

export async function compose(caseId: string): Promise<Article> {
  const r = await readJson<{ article: Article }>(
    await fetch(`${SUPABASE_URL}/functions/v1/ishy-compose`, {
      method: 'POST',
      headers: { ...H, 'Content-Type': 'application/json' },
      body: JSON.stringify({ caseId }),
    }),
  );
  return r.article;
}
