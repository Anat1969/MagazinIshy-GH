// Mocks for the demo recording (templates/demo.cjs in Claude-GH, DEMO_ROUTES hook): the recorder cannot reach
// supabase.co, so it is served the real rows saved in tests/demo-data.json (merhav cases + ishy articles).
// Images of the merhav spaces are left out of the data: a hole is better than a misleading placeholder.
const fs = require('fs');
const path = require('path');
const D = JSON.parse(fs.readFileSync(path.join(__dirname, 'demo-data.json'), 'utf8'));
const AIMENU = fs.readFileSync(path.join(__dirname, 'ai-menu.local.js'));

module.exports = async (ctx) => {
  await ctx.route('https://appofapp-gh.vercel.app/ai-menu.js', (r) => r.fulfill({ contentType: 'text/javascript', body: AIMENU }));
  await ctx.route(/appofapp-gh\.vercel\.app\/(demo|guide|creations)\.js/, (r) => r.fulfill({ contentType: 'text/javascript', body: '' }));
  await ctx.route(/supabase\.co\/rest\/v1\/merhav_cases/, (r) => r.fulfill({ json: D.cases }));
  await ctx.route(/supabase\.co\/rest\/v1\/ishy_articles/, (r) => r.fulfill({ json: D.articles }));
  await ctx.route(/supabase\.co\/functions\/v1\/ishy-compose/, async (r) => {
    const { caseId } = JSON.parse(r.request().postData() || '{}');
    await new Promise((res) => setTimeout(res, 1200));
    // a new print of the same case's real article, under a new id, so the issue counts it once more as in the app
    const a = D.articles.find((x) => x.case_id === caseId) || D.articles[0];
    r.fulfill({ json: { article: { ...a, id: '00000000-0000-4000-8000-000000000001', created_at: new Date().toISOString() } } });
  });
};
