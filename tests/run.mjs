// Playwright against `vite preview`, with mocks for every Supabase call.
// Clicks every button, checks the request that is sent, mobile overflow, installability,
// reduced motion and the A&I logo, and saves screenshots to tests/screens (or $SHOTS).
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ARTICLE, ARTICLES, CASES } from './fixtures.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const SHOTS = process.env.SHOTS || join(ROOT, 'tests/screens');
mkdirSync(SHOTS, { recursive: true });
const BASE = 'http://localhost:4173';
let failed = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`);
  if (!cond) failed++;
};

const server = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], { cwd: ROOT, stdio: 'ignore' });
for (let i = 0; i < 40; i++) {
  try { await fetch(BASE); break; } catch { await new Promise((r) => setTimeout(r, 250)); }
}

const PNG = readFileSync(join(ROOT, 'public/icon-512.png'));
const fontCache = new Map();
const composed = [];

async function wire(ctx) {
  await ctx.route('https://appofapp-gh.vercel.app/ai-menu.js', (r) => r.fulfill({ contentType: 'text/javascript', body: readFileSync(join(ROOT, 'tests/ai-menu.local.js')) }));
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => {
    const url = r.request().url();
    try {
      if (!fontCache.has(url)) fontCache.set(url, execFileSync('curl', ['-sS', '-m', '15', '-A', 'Mozilla/5.0 Chrome/120', url]));
      return r.fulfill({ body: fontCache.get(url), contentType: url.includes('css') ? 'text/css' : 'font/woff2', headers: { 'access-control-allow-origin': '*' } });
    } catch { return r.abort(); }
  });
  await ctx.route(/AppOfApp-GH\/creations\.js|appofapp-gh\.vercel\.app\/creations\.js/, (r) => r.fulfill({ contentType: 'text/javascript', body: readFileSync(join(ROOT, 'tests/creations.local.js')) }));
  await ctx.route(/functions\/v1\/ishy-creations/, (r) => r.fulfill({ contentType: 'application/json', body: readFileSync(join(ROOT, 'tests/creations-fixture.json')) }));
  await ctx.route(/supabase\.co\/storage\//, (r) => r.fulfill({ contentType: 'image/png', body: PNG }));
  await ctx.route(/supabase\.co\/rest\/v1\/merhav_cases/, (r) => r.fulfill({ json: CASES }));
  await ctx.route(/supabase\.co\/rest\/v1\/ishy_articles/, (r) => r.fulfill({ json: ARTICLES }));
  await ctx.route(/supabase\.co\/functions\/v1\/ishy-compose/, async (r) => {
    composed.push(JSON.parse(r.request().postData() || '{}'));
    await new Promise((res) => setTimeout(res, 400));
    r.fulfill({ json: { article: { ...ARTICLE, id: '11111111-2222-3333-4444-555555555555', case_id: CASES[2].id } } });
  });
}

const profile = join(tmpdir(), `ishy-${Date.now()}`);
const ctx = await chromium.launchPersistentContext(profile, { viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', locale: 'he-IL' });
await wire(ctx);
const page = ctx.pages()[0] || (await ctx.newPage());
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

// ---------------------------------------------------------------- home
await page.goto(`${BASE}/#/`);
await page.waitForSelector('[data-testid="waiting"]');
await page.waitForTimeout(1800);
ok((await page.getAttribute('html', 'dir')) === 'rtl', 'document is RTL');
ok(await page.locator('ai-menu .logo').isVisible(), 'A&I logo button in the top bar');
ok(!(await page.locator('header >> text=העתקת קישור').first().isVisible().catch(() => false)), 'no loose development buttons in the bar');
const waiting = (await page.textContent('[data-testid="waiting"]')).trim();
ok(waiting.startsWith('0'), `home: waiting count computed from data (${waiting})`);
ok(await page.locator('text=מובילה ב-').first().isVisible(), 'home: insight under the lens chart');
ok((await page.locator('[data-aoa-demo="large"]').count()) === 1 && (await page.getAttribute('html', 'data-aoa-demo-slots')) !== null, 'home: demo video slot in the hero');
ok((await page.locator('.press svg rect').count()) >= 4, 'home: the three plates + synthesis are drawn');
await page.hover('.press__legend button:nth-child(2)');
ok((await page.getAttribute('.press__legend button:nth-child(2)', 'aria-pressed')) === 'true', 'home: legend hover focuses a plate');
await page.screenshot({ path: join(SHOTS, 'home-1440.png'), fullPage: true });
const homeH = await page.evaluate(() => document.documentElement.scrollHeight / innerHeight);
console.log(`     home scroll ratio ${homeH.toFixed(2)}`);

// logo menu holds the app actions
await page.click('ai-menu .logo');
await page.waitForTimeout(200);
ok(await page.locator('ai-menu').getByText('הפקת כתבה ממקרה').isVisible(), 'logo menu holds "הפקת כתבה ממקרה"');
await page.keyboard.press('Escape');

// ---------------------------------------------------------------- cases
await page.click('.nav a[href="#/cases"]');
await page.waitForSelector('[data-testid="case"]');
ok((await page.locator('[data-testid="case"]').count()) === 3, 'cases: three cases from merhav');
await page.click('button.chip:has-text("בלי כתבה")');
ok((await page.locator('[data-testid="case"]').count()) === 1, 'cases: filter "בלי כתבה"');
await page.click('button.chip:has-text("רק עם כתבה")');
ok((await page.locator('[data-testid="case"]').count()) === 2, 'cases: filter "רק עם כתבה"');
await page.click('button.chip:has-text("הכול")');
await page.click('button.chip:has-text("מוכן קודם")');
ok(await page.locator('text=מסודר לפי מוכן להפקה קודם').isVisible(), 'cases: sort label says the current order');
// incomplete case: compose disabled with an explanation
await page.locator('[data-testid="case"]', { hasText: 'חיים של מישהי אחרת' }).locator('.case__row').click();
ok(await page.locator('[data-testid="compose"]').isDisabled(), 'cases: compose disabled when the synthesis is missing');
ok(await page.locator('text=חסרות עדשות או סינתזה').isVisible(), 'cases: missing lens is explained');
ok(page.url().includes(`#/cases/${CASES[2].id}`), 'cases: open case is in the link');
await page.screenshot({ path: join(SHOTS, 'cases-1440.png'), fullPage: true });
// ready case: compose sends the right request and lands on the article
await page.locator('[data-testid="case"]', { hasText: 'פחד קהל' }).locator('.case__row').click();
await page.click('[data-testid="compose"]');
await page.waitForURL(/#\/a\/11111111/);
ok(composed.length === 1 && composed[0].caseId === CASES[1].id, 'compose: posts the caseId to ishy-compose');

// ---------------------------------------------------------------- article
await page.goto(`${BASE}/#/a/${ARTICLE.id}`);
await page.waitForSelector('.art__title');
await page.waitForTimeout(900);
ok((await page.locator('.chapter').count()) === 3, 'article: one chapter per lens');
ok((await page.locator('.chapter__img img').count()) === 3, 'article: all three lens images (all or none)');
ok(await page.locator('.share__insight').isVisible(), 'article: share bar has a computed insight');
ok((await page.locator('.axis div').count()) === 5, 'article: process axis, case to article');
ok((await page.locator('mark').count()) > 3, 'article: highlights rendered as marker');
ok((await page.getAttribute('a:has-text("המקרה המלא במרחב הפנימי")', 'href')).includes(`/case/${ARTICLE.case_id}`), 'article: links back to the merhav case');
await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
await page.click('[data-testid="copy-prompt"]');
ok(await page.locator('.toast').isVisible(), 'article: copy prompt gives feedback');
const clip = await page.evaluate(() => navigator.clipboard.readText());
ok(clip.includes('Documentary realism, Professional architecture photography, 1:1') && clip.includes('--no text, words, writing, frame divisions'), 'article: prompt carries the mandatory tail');
await page.screenshot({ path: join(SHOTS, 'article-1440.png'), fullPage: true });
await page.click('ai-menu .logo');
ok(await page.locator('ai-menu').getByText('הדפסה בגודל A4').isVisible(), 'logo menu: print A4 on an article');
await page.keyboard.press('Escape');

// ---------------------------------------------------------------- issue
await page.click('.nav a[href="#/issue"]');
await page.waitForSelector('[data-testid="card"]');
ok((await page.locator('[data-testid="card"]').count()) === 3, 'issue: the composed article joins the issue (2 + 1)');
await page.click('button.chip:has-text("עדשה")');
ok(await page.locator('.groupHead', { hasText: 'מובילה' }).first().isVisible(), 'issue: grouped by leading lens');
await page.click('button.chip:has-text("מקרה")');
ok((await page.locator('.groupHead').count()) === 2, 'issue: grouped by case');
await page.screenshot({ path: join(SHOTS, 'issue-1440.png'), fullPage: true });
await page.click('[data-testid="card"] >> nth=0');
await page.waitForSelector('.art__title');
ok(page.url().includes('#/a/'), 'issue: card opens the article');

// ---------------------------------------------------------------- creations
await page.click('.nav a[href="#/creations"]');
await page.waitForSelector('app-creations');
await page.waitForTimeout(1500);
const rooms = await page.evaluate(() => {
  const el = document.querySelector('app-creations');
  const root = el && (el.shadowRoot || el);
  return root ? root.textContent : '';
});
ok(rooms.includes('קול בחדר מהנדסים') && rooms.includes('מה עושים השבוע'), 'creations: rooms from the articles and the weekly step');
ok(rooms.includes('פסיכולוגיית הצמצום'), 'creations: a room per lens');
await page.screenshot({ path: join(SHOTS, 'creations-1440.png'), fullPage: true });

// ---------------------------------------------------------------- installability
const cdp = await ctx.newCDPSession(page);
await page.goto(`${BASE}/#/`);
await page.waitForTimeout(500);
const inst = await cdp.send('Page.getInstallabilityErrors');
ok(inst.installabilityErrors.length === 0, `installable (${JSON.stringify(inst.installabilityErrors)})`);
ok(errors.length === 0, `no page errors ${errors.join(' | ')}`);
await ctx.close();

// ---------------------------------------------------------------- mobile + reduced motion
const browser = await chromium.launch();
const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: 'reduce', serviceWorkers: 'block' });
await wire(m);
const mp = await m.newPage();
for (const [name, hash] of [['home', '#/'], ['cases', '#/cases'], ['issue', '#/issue'], ['article', `#/a/${ARTICLE.id}`], ['creations', '#/creations']]) {
  await mp.goto(`${BASE}/${hash}`);
  await mp.waitForTimeout(700);
  const over = await mp.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  ok(over <= 0, `mobile ${name}: no horizontal scroll (${over})`);
  await mp.screenshot({ path: join(SHOTS, `${name}-390.png`), fullPage: true });
}
await mp.goto(`${BASE}/#/a/${ARTICLE.id}`);
await mp.waitForSelector('.chapter');
const op = await mp.evaluate(() => getComputedStyle(document.querySelector('.chapter')).opacity);
ok(op === '1', 'reduced motion: chapters visible without animation');
await browser.close();

server.kill();
rmSync(profile, { recursive: true, force: true });
console.log(failed ? `\n${failed} failed` : '\nall green');
process.exit(failed ? 1 : 0);
