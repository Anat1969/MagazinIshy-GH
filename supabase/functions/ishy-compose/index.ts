// MagazinIshy-GH (מגזין מהמרחב הפנימי): turns one merhav case (three lenses + synthesis)
// into a magazine article in the voice of "המהות".
// Reads merhav_cases / merhav_readings, writes ishy_articles only (shared project cultura-GH).
// Text: Gemini free tier first (GEMINI_API_KEY), Claude (ANTHROPIC_API_KEY) as fallback only.
// Privacy: only the distilled, anonymous lens readings are sent, never the raw case body.
// No login (like both parent apps), capped at HOURLY_LIMIT articles per hour.
import Anthropic from "npm:@anthropic-ai/sdk";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SB = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };
const HOURLY_LIMIT = 20;
const MJ_TAIL = "Documentary realism, Professional architecture photography, 1:1 --ar 1:1 --no text, words, writing, frame divisions";
const LENSES = ["biographical", "tzimtzum", "buddhist"] as const;
const LENS_NAME: Record<string, string> = {
  biographical: "ייעוץ ביוגרפי",
  tzimtzum: "פסיכולוגיית הצמצום",
  buddhist: "פסיכולוגיה בודהיסטית",
};

// ---------------------------------------------------------------- instruction
// The distillation standard (Claude-GH docs/ai-text-standard.md) + the magazine editor + the
// clinical guardrails of merhav-analyze.
const SYSTEM = `את/ה העורך/ת הראשי/ת של "מגזין מהמרחב הפנימי", מגזין עברי שהופך תהליך של חשיבה על מקרה לכתבה.
החומר: מקרה אנונימי שנקרא דרך שלוש עדשות (ייעוץ ביוגרפי, פסיכולוגיית הצמצום, פסיכולוגיה בודהיסטית) וסינתזה.
זקק, אל תתאר. עברית טבעית, קצרה ומקצועית. בלי סימני קריאה, בלי אימוג'י, בלי מילים ריקות, בלי קלישאות.
על האדם שבמקרה כותבים בגוף שלישי ("היא", "הוא"), לעולם לא "המשתמשת". לא מוסיפים פרטים מזהים.

מבנה הכתבה:
- title: כותרת קצרה וחזקה, 2 עד 5 מילים, בלי כוכביות.
- subtitle: שורת תובנה עד 8 מילים, מסתיימת בנקודה. המושג המרכזי ב-**כוכביות כפולות**.
- lede: משפט פתיחה אחד, עד 20 מילים, עם 2 עד 3 הבלטות ב-**.
- sections: בדיוק שלושה פרקים, אחד לכל עדשה, בסדר biographical, tzimtzum, buddhist.
  lens: מזהה העדשה. heading: 2 עד 4 מילים. insight: שורת תובנה עד 8 מילים עם הבלטה אחת.
  body: 60 עד 100 מילים. דימוי מוחשי אחד. שומרים על ההבדל: כל עדשה עונה על שאלה אחרת ופועלת במנגנון אחר.
- synthesis: heading, insight, body (70 עד 110 מילים): מה שלוש העדשות מסכימות עליו, איפה הן משלימות, איפה המתח, ומה מתאים עכשיו.
- quote: משפט אחד מתוך הכתבה שאפשר לתלות על קיר, בלי כוכביות.
- haiku: שלוש שורות בעברית, בערך 5-7-5 הברות, דימוי מרחבי אחד מתוך המרחבים של העדשות.
- turn: from ו-to, שתיים עד ארבע מילים כל אחד: ממה למה עובר האדם בכתבה.
- action: צעד אחד לשבוע הקרוב, משפט אחד עד 20 מילים, עם הבלטה אחת.
- visual_prompt_he: פרומפט למידג'רני בעברית בלבד, שורה אחת רציפה, לשער הכתבה: מרחב אחד שמגלם את הסינתזה. סדר: רעיון ליבה חזותי, סוג המרחב, חומר ומרקם, מקור אור, קומפוזיציה, פלטה, נוף ישראלי כשמתאים, זווית מצלמה, שעה ביום. בלי אנשים, בלי טקסט, בלי פרמטרים.

הבלטות: מושגים, מספרים ושמות שיטות. לא מילות קישור ולא משפט שלם.
גבולות: לא קובעים אבחנה ולא ממליצים על תרופות. בלי עקיפה רוחנית ("לשחרר", "זה שיעור"). מקורות: רק אנשים וספרים אמיתיים שמופיעים בחומר.
עובדות: רק מה שמופיע בחומר. מזקקים ושומרים על המשמעות. לא ממציאים נתונים, מספרים או שמות.`;

// ---------------------------------------------------------------- schema
const SECTION_PROPS = { heading: "string", insight: "string", body: "string" };
const FIELDS = ["title", "subtitle", "lede", "quote", "action", "visual_prompt_he"];

function geminiSchema() {
  const S = { type: "STRING" };
  const sec = (extra: Record<string, unknown> = {}) => ({
    type: "OBJECT",
    required: [...Object.keys(extra), ...Object.keys(SECTION_PROPS)],
    properties: { ...extra, heading: S, insight: S, body: S },
  });
  return {
    type: "OBJECT",
    required: [...FIELDS, "sections", "synthesis", "haiku", "turn"],
    properties: {
      ...Object.fromEntries(FIELDS.map((f) => [f, S])),
      sections: { type: "ARRAY", items: sec({ lens: { type: "STRING", enum: [...LENSES] } }) },
      synthesis: sec(),
      haiku: { type: "ARRAY", items: S },
      turn: { type: "OBJECT", required: ["from", "to"], properties: { from: S, to: S } },
    },
  };
}

function jsonSchema() {
  const S = { type: "string" };
  const obj = (props: Record<string, unknown>) => ({ type: "object", additionalProperties: false, required: Object.keys(props), properties: props });
  const sec = obj({ heading: S, insight: S, body: S });
  return obj({
    ...Object.fromEntries(FIELDS.map((f) => [f, S])),
    sections: { type: "array", items: obj({ lens: { type: "string", enum: [...LENSES] }, heading: S, insight: S, body: S }) },
    synthesis: sec,
    haiku: { type: "array", items: S },
    turn: obj({ from: S, to: S }),
  });
}

// ---------------------------------------------------------------- models
// gemini-2.5-flash first: the lite model returned chapters under the 60-word floor (05.11.2026).
const GEMINI_MODELS = [...new Set([Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash", "gemini-flash-latest", "gemini-flash-lite-latest"])];
const MIN_WORDS = 45; // a chapter shorter than this is sent to the next model

async function geminiOnce(key: string, model: string, user: string) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: geminiSchema(), temperature: 0.8 },
    }),
    signal: AbortSignal.timeout(55000),
  });
  if (!r.ok) throw Object.assign(new Error(`Gemini ${model} ${r.status}`), { status: r.status });
  const j = await r.json();
  const text = j?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  return JSON.parse(text);
}

async function viaGemini(key: string, user: string) {
  let last: unknown;
  for (const model of GEMINI_MODELS) {
    try {
      const article = await geminiOnce(key, model, user);
      const short = list(article.sections).some((x) => words((x as Row).body) < MIN_WORDS);
      if (short && model !== GEMINI_MODELS[GEMINI_MODELS.length - 1]) { last = new Error(`${model}: short chapters`); continue; }
      return { article, model };
    } catch (err) {
      last = err;
      const status = (err as { status?: number }).status;
      if (status === 400 || status === 401 || status === 403) throw err; // wrong key: no other model will help
    }
  }
  throw last;
}

async function viaClaude(key: string, user: string) {
  const client = new Anthropic({ apiKey: key });
  const response = await client.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 8000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SYSTEM,
    output_config: { effort: "low", format: { type: "json_schema", schema: jsonSchema() } },
    messages: [{ role: "user", content: user }],
  } as never);
  if (response.stop_reason === "refusal") throw new Error("refusal");
  const text = response.content.filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("");
  return { article: JSON.parse(text), model: "claude" };
}

// ---------------------------------------------------------------- material
type Row = Record<string, unknown>;
const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const list = (v: unknown) => (Array.isArray(v) ? v : []);

function material(c: Row, readings: Row[]) {
  const by = Object.fromEntries(readings.map((r) => [r.lens, r]));
  const intake = (c.intake ?? {}) as Row;
  const parts = [`כותרת העבודה של המקרה: ${s(c.title) || s(c.code)}`, `מה הובן בבירור: ${s(intake.reflection)}`];
  for (const lens of LENSES) {
    const r = by[lens];
    if (!r) continue;
    const k = (r.content ?? {}) as Row;
    const tool = (k.tool ?? {}) as Row;
    const space = (k.space ?? {}) as Row;
    parts.push(
      [
        `## עדשה: ${LENS_NAME[lens]} (${lens})`,
        `השאלה: ${s(k.question)}`,
        `הקריאה המרכזית: ${s(k.core)}`,
        `נקודות: ${list(k.points).map((p) => `${s((p as Row).label)}: ${s((p as Row).text)}`).join(" | ")}`,
        `הייחוד: ${s(k.uniqueness)}`,
        `המענה: ${s(k.response)}`,
        `הכלי: ${s(tool.name)}, ${s(tool.how)}`,
        `הגבול: ${s(k.limit)}`,
        `המרחב: ${s(space.distill) || s(r.distill)} (${s(space.principle)})`,
        `מקורות: ${list(k.sources).map(s).join(", ")}`,
      ].join("\n"),
    );
  }
  const y = by.synthesis;
  if (y) {
    const k = (y.content ?? {}) as Row;
    parts.push(
      [
        `## סינתזה`,
        `תמונה אחת: ${s(k.image)}`,
        `הסכמה: ${s(k.agree)}`,
        `השלמה: ${s(k.complement)}`,
        `מתח: ${s(k.tension)}`,
        `מה מתאים עכשיו: ${s(k.now)}`,
        `המלצה: ${s(k.recommendation)}`,
        `צעד הבא: ${s(k.next_step)}`,
        `לימוד: ${s(k.learning)}`,
        `המרחב: ${s(y.distill)}`,
      ].join("\n"),
    );
  }
  return parts.join("\n\n");
}

const words = (t: unknown) => s(t).replace(/\*\*/g, "").split(/\s+/).filter(Boolean).length;

function clean(a: Row) {
  const sections = LENSES.map((lens) => list(a.sections).find((x) => (x as Row).lens === lens) as Row | undefined)
    .filter(Boolean)
    .map((x) => ({ lens: x!.lens, heading: s(x!.heading), insight: s(x!.insight), body: s(x!.body) }));
  if (sections.length !== 3) throw new Error("missing lens section");
  const syn = (a.synthesis ?? {}) as Row;
  const turn = (a.turn ?? {}) as Row;
  const out = {
    title: s(a.title).replace(/\*\*/g, ""),
    subtitle: s(a.subtitle),
    lede: s(a.lede),
    sections,
    synthesis: { heading: s(syn.heading), insight: s(syn.insight), body: s(syn.body) },
    quote: s(a.quote).replace(/\*\*/g, ""),
    haiku: list(a.haiku).map(s).filter(Boolean).slice(0, 3),
    turn: { from: s(turn.from), to: s(turn.to) },
    action: s(a.action),
    visual_prompt_he: `${s(a.visual_prompt_he).replace(/[.,\s]+$/, "")}, ${MJ_TAIL}`,
  };
  if (!out.title || !out.synthesis.body) throw new Error("empty article");
  // Share of the article carried by each lens: words of its chapter, and the synthesis apart.
  const share: Record<string, number> = {};
  for (const x of sections) share[String(x.lens)] = words(x.heading) + words(x.insight) + words(x.body);
  share.synthesis = words(out.synthesis.heading) + words(out.synthesis.insight) + words(out.synthesis.body);
  return { content: out, share };
}

// ---------------------------------------------------------------- server
async function rest(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...init,
    headers: { ...SB, "Content-Type": "application/json", Prefer: "return=representation", ...(init.headers ?? {}) },
  });
  if (!r.ok) throw new Error(`DB ${r.status}: ${await r.text()}`);
  return r.status === 204 ? null : await r.json();
}

async function createdLastHour(): Promise<number> {
  const since = new Date(Date.now() - 3600_000).toISOString();
  const r = await fetch(`${SB_URL}/rest/v1/ishy_articles?select=id&created_at=gte.${since}`, {
    method: "HEAD",
    headers: { ...SB, Prefer: "count=exact" },
  });
  return Number((r.headers.get("content-range") ?? "").split("/")[1]) || 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: { caseId?: string };
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const caseId = String(body.caseId ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(caseId)) return json({ error: "צריך לבחור מקרה." }, 400);

  if ((await createdLastHour()) >= HOURLY_LIMIT) {
    return json({ error: "הופקו הרבה כתבות בשעה האחרונה. אפשר לנסות שוב בעוד שעה." }, 429);
  }

  const c = (await rest(`merhav_cases?id=eq.${caseId}&select=id,code,title,intake,risk_level`))?.[0];
  if (!c) return json({ error: "המקרה לא נמצא במרחב הפנימי." }, 404);
  if (c.risk_level === "acute") return json({ error: "מקרה עם סיכון חריף לא הופך לכתבה." }, 409);
  const readings = (await rest(`merhav_readings?case_id=eq.${caseId}&select=lens,content,distill`)) as Row[];
  const have = new Set(readings.map((r) => r.lens));
  if (!LENSES.every((l) => have.has(l)) || !have.has("synthesis")) {
    return json({ error: "למקרה עוד אין שלוש עדשות וסינתזה. משלימים אותו במרחב הפנימי." }, 409);
  }

  const user = `${material(c, readings)}\n\nכתבו כתבה אחת מתוך התהליך הזה.`;
  let result: { article: Row; model: string } | null = null;
  const errors: string[] = [];
  const gKey = Deno.env.get("GEMINI_API_KEY")?.trim();
  if (gKey) {
    try { result = await viaGemini(gKey, user); } catch (e) { errors.push(String((e as Error).message)); }
  }
  if (!result) {
    const aKey = Deno.env.get("ANTHROPIC_API_KEY")?.trim();
    if (aKey) {
      try { result = await viaClaude(aKey, user); } catch (e) { errors.push(String((e as Error).message)); }
    }
  }
  if (!result) return json({ error: "המודל לא זמין כרגע. נסו שוב בעוד דקה.", detail: errors }, 502);

  let cleaned;
  try { cleaned = clean(result.article); } catch (e) {
    return json({ error: "הכתבה חזרה חסרה. נסו להפיק שוב.", detail: String((e as Error).message) }, 502);
  }

  const [saved] = await rest("ishy_articles", {
    method: "POST",
    body: JSON.stringify({
      case_id: c.id,
      case_code: c.code,
      case_title: c.title,
      content: cleaned.content,
      share: cleaned.share,
      model: result.model,
    }),
  });
  return json({ article: saved });
});
