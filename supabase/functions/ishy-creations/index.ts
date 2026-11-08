// MagazinIshy-GH: creations.json for <app-creations> (AppOfApp-GH docs/creations-standard.md), built live from
// ishy_articles, so a new article becomes a room on its own and TAARUCHA has a public address to import from.
// GET only, public read of published rows. No new text: every word comes from the articles or the lens dictionary.
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const SB_URL = Deno.env.get("SUPABASE_URL")!;
const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
type Row = Record<string, any>;

// The lens dictionary of מרחב פנימי (Psichologya src/lenses.js): question and mechanism of change.
const LENS = {
  biographical: { name: "ייעוץ ביוגרפי", plate: "ענבר־זמן", question: "איפה האדם נמצא בזמן חייו", mechanism: "משמעות והתמצאות", tension: "בין מה שנשאר מאחור למה שנפתח" },
  tzimtzum: { name: "פסיכולוגיית הצמצום", plate: "אינדיגו־נסיגה", question: "איך האדם נמצא מול האחר ומול העבר שלו", mechanism: "פינוי מקום ושכתוב", tension: "בין מלא לריק" },
  buddhist: { name: "פסיכולוגיה בודהיסטית", plate: "אזוב־נשימה", question: "איך האדם מחזיק את החוויה ברגע הזה", mechanism: "הפחתת היאחזות וטיפוח חמלה", tension: "בין קבוע לארעי" },
} as const;

const mark = (t: string) => String(t || "").replace(/\*\*([^*]+)\*\*/g, "==$1==");
const plain = (t: string) => String(t || "").replace(/\*\*/g, "");
const credit = "שער: fal, מתוך פרומפט הכתבה. מגזין מהמרחב הפנימי";

function articleRoom(a: Row) {
  const k = a.content || {};
  const img = a.image_url || undefined;
  const cr: Row[] = [];
  if (img) cr.push({ id: "1", style: "poster", title: k.title, text: mark(k.lede), image: img, credit, kicker: a.case_title });
  cr.push({ id: "2", style: "quote", quote: k.quote, who: "מגזין מהמרחב הפנימי", cite: k.title });
  cr.push({ id: "3", style: "fromto", title: "ממה למה", from: k.turn?.from, to: k.turn?.to, fromLabel: "לפני", toLabel: "אחרי", text: mark(k.synthesis?.insight) });
  cr.push({ id: "4", style: "haiku", lines: (k.haiku || []).slice(0, 3), text: k.title });
  cr.push({ id: "5", style: "essay", title: k.synthesis?.heading || k.title, text: mark(k.lede), ...(img ? { image: img, credit } : {}),
    body: [...(k.sections || []).map((s: Row) => mark(s.body)), mark(k.synthesis?.body)] });
  cr.push({ id: "6", style: "insight", title: mark(k.subtitle), text: mark(k.action), kicker: "צעד לשבוע" });
  return { id: `a-${a.id.slice(0, 8)}`, zone: "הבנה", title: k.title, sub: plain(k.subtitle), creations: cr.slice(0, 6) };
}

function lensRoom(id: keyof typeof LENS, arts: Row[]) {
  const L = LENS[id];
  const secs = arts.map((a) => ({ a, s: (a.content?.sections || []).find((x: Row) => x.lens === id) })).filter((x) => x.s);
  const cr: Row[] = [
    { id: "1", style: "insight", title: L.question, text: `המנגנון: ==${L.mechanism}==. המתח: ${L.tension}.`, kicker: L.plate },
    { id: "2", style: "gradient", title: L.name, text: secs[0] ? mark(secs[0].s.insight) : L.mechanism },
  ];
  if (secs[1]) cr.push({ id: "3", style: "quote", quote: plain(secs[1].s.insight), who: L.name, cite: secs[1].a.content?.title });
  if (secs.length) cr.push({ id: "4", style: "post", title: `${L.name}: מה העדשה ראתה`, text: secs.map((x) => `${x.a.content?.title}: ${plain(x.s.insight)}`).join("\n"), tags: [L.plate, "מגזין_מהמרחב_הפנימי"] });
  return { id: `lens-${id}`, zone: "ידע", title: `${L.name}: ${L.question}`, sub: `המנגנון: ${L.mechanism}`, creations: cr };
}

function actionRoom(arts: Row[]) {
  const a0 = arts[0]?.content || {};
  const cr: Row[] = [
    { id: "1", style: "insight", title: "צעד אחד לשבוע הקרוב", text: mark(a0.action), kicker: a0.title },
    { id: "2", style: "post", title: "שלושה צעדים, שלושה מקרים", text: arts.map((a) => `${a.content?.title}: ${plain(a.content?.action)}`).join("\n"), tags: ["צעד_לשבוע"] },
  ];
  if (arts[1]) cr.push({ id: "3", style: "gradient", title: arts[1].content?.title, text: mark(arts[1].content?.action) });
  cr.push({ id: "4", style: "fromto", title: "ממה למה", from: a0.turn?.from, to: a0.turn?.to, fromLabel: "לפני", toLabel: "אחרי", text: mark(a0.synthesis?.insight) });
  return { id: "act-week", zone: "יישום", title: "מה עושים השבוע", sub: "הצעד שכל כתבה מסתיימת בו", creations: cr };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const r = await fetch(`${SB_URL}/rest/v1/ishy_articles?select=id,case_id,case_title,content,image_url,created_at&published=eq.true&order=created_at.desc`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  const all: Row[] = r.ok ? await r.json() : [];
  // newest article per case: one room per case
  const seen = new Set();
  const arts = all.filter((a) => (seen.has(a.case_id) ? false : (seen.add(a.case_id), true)));
  const body = {
    app: {
      id: "magazinishy", name: "מגזין מהמרחב הפנימי", url: "https://magazinishy.vercel.app", repo: "Anat1969/MagazinIshy-GH",
      description: "שלוש עדשות נדפסות לכתבה אחת. כל חדר הוא מקרה מהמרחב הפנימי, או עדשה אחת דרך כל המקרים.",
      article: { layout: "magazine" },
      palette: { a: "#a8742f", b: "#41508a", c: "#5b7c63", s: "#2f7d4f", accent: "#a8742f", ink: "#2b2926", marker: "#fff1a8", paper: "#ffffff", paper2: "#f7f6f3" },
    },
    topics: [...(["biographical", "tzimtzum", "buddhist"] as const).map((id) => lensRoom(id, arts)), ...arts.map(articleRoom), ...(arts.length ? [actionRoom(arts)] : [])],
  };
  return new Response(JSON.stringify(body), { headers: { ...CORS, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=300" } });
});
