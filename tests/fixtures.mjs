// Real rows from cultura-GH (merhav_cases + merhav_readings, ishy_articles), 05.11.2026.
const img = (c, l, t) => [{ at: '2026-10-18T21:38:00Z', url: `https://ktqmwpbzcnzkhjskqisy.supabase.co/storage/v1/object/public/merhav-media/cases/${c}/${l}-${t}.png` }];
const C2 = '420d725a-cc82-4290-a742-5c565d3d4512';
export const CASES = [
  { id: '52c8a7f2-efe6-48a7-80d8-76e02111a3d1', code: 'גידול', title: 'דרייב מול גוף קורס', created_at: '2026-10-19T14:58:34Z', risk_level: 'concern', merhav_readings: [
    { lens: 'biographical', distill: 'המרחב מוריד אותה בהדרגה מקצב של עשייה אל מקום של עמידה וראייה, ומאפשר לה לבחור לאן ממשיכים.', images: [], updated_at: '2026-10-19T15:01:50Z' },
    { lens: 'tzimtzum', distill: 'המרחב מאפשר לה לשבת במקום שהקיר עצמו פינה בשבילה, וללמוד שריק אינו כישלון.', images: [], updated_at: '2026-10-19T15:01:48Z' },
    { lens: 'buddhist', distill: 'מקום שבו הגוף מורשה לעצור, והעצירה מרגישה כמו נשימה ולא כמו כישלון.', images: [], updated_at: '2026-10-19T15:01:55Z' },
    { lens: 'synthesis', distill: 'המרחב מאפשר לה לעבור מעשייה אל מנוחה בהדרגה, ולגלות שמקום פנוי מחזיק אותה.', images: [], updated_at: '2026-10-19T15:03:05Z' } ] },
  { id: C2, code: 'בדיקה: מקרה 1  - פחד קהל', title: 'פחד קהל בפורום מקצועי', created_at: '2026-10-18T21:26:08Z', risk_level: 'none', merhav_readings: [
    { lens: 'tzimtzum', distill: 'המרחב מלמד אותה שאפשר לעמוד במקום ברור ולהשאיר בכוונה מקום ריק שהאחר נכנס אליו.', images: img(C2, 'tzimtzum', 1), updated_at: '2026-10-18T21:38:00Z' },
    { lens: 'biographical', distill: 'המרחב מוביל אותה ממעבר צר ושחוק אל סף מואר ופתוח, כך שהיא מגיעה לנקודת הדיבור כשכל השנים שעברה מאחוריה ולא מולה.', images: img(C2, 'biographical', 2), updated_at: '2026-10-18T21:37:12Z' },
    { lens: 'buddhist', distill: 'המרחב מחזיר את המשקל לרגליים ואת הנשימה לקצב איטי, כך שאפשר לעמוד מול מרחב פתוח בלי להתכווץ.', images: img(C2, 'buddhist', 3), updated_at: '2026-10-18T21:40:05Z' },
    { lens: 'synthesis', distill: 'המרחב הזה מעביר אותה ממעבר צר אל חצר פתוחה, שבה היא עומדת על אבן יציבה ומשאירה מקום לשיחה.', images: img(C2, 'synthesis', 4), updated_at: '2026-10-18T21:48:59Z' } ] },
  { id: '2b5443f3-c517-4636-b673-94189c2109f4', code: 'דוגמה 1', title: 'חיים של מישהי אחרת', created_at: '2026-10-18T20:59:02Z', risk_level: 'concern', merhav_readings: [
    { lens: 'buddhist', distill: 'מרחב שמאפשר לה לעצור, לנשום ולתת לרצון ליצור להופיע בלי אשמה.', images: [], updated_at: '2026-10-18T21:00:02Z' },
    { lens: 'tzimtzum', distill: 'מרחב שבו קיר נסוג ומשאיר לה מקום שאיש אחר לא ממלא.', images: [], updated_at: '2026-10-18T21:00:11Z' },
    { lens: 'biographical', distill: 'המרחב מוביל אותה ממה שנשא אותה עד כה אל מה שמבקש להיוולד, בלי למחוק את הדרך שעברה.', images: [], updated_at: '2026-10-18T21:00:13Z' } ] },
];

export const ARTICLE = {
  id: '7a4ab0bb-4c53-4728-b6ec-e32e369112f3', case_id: C2, case_code: 'בדיקה: מקרה 1  - פחד קהל', case_title: 'פחד קהל בפורום מקצועי', model: 'gemini-2.5-flash', created_at: '2026-11-05T01:39:12Z',
  share: { buddhist: 65, tzimtzum: 66, synthesis: 81, biographical: 68 },
  content: {
    title: 'קול בחדר מהנדסים', subtitle: 'ניסיון עשיר נפגש עם חסימת **קול** ותיקה.',
    lede: 'אישה בת 57 עם **פחד קהל** ותיק נתקלת בחסימת **קול** בתפקיד חדש ומשמעותי.',
    sections: [
      { lens: 'biographical', heading: 'משימת השלב', insight: 'הפחד מחסימה טכנית לשומר **סף** חדש.', body: 'בגיל 57, שנה לאחר הצומת הירחי השלישי, המשימה משתנה מהוכחת יכולת להעברת ניסיון. הפחד מלהישמע אינו חדש, אך כעת הוא חוסם תפקיד הדורש קול. הקול המהיר והלא יציב נשמע כקול ילדה נבחנת, לא כאישה מנוסה. היא מוזמנת לעבור ממעבר צר ושחוק אל סף מואר ופתוח, ולדבר מעמדת מומחית המביאה ידע.' },
      { lens: 'tzimtzum', heading: 'מפגש וצמצום', insight: 'להשאיר **מקום** לאחר במקום למלא חלל.', body: 'מול הקהל היא נעה בין מילוי כל החלל בדיבור מהיר להיעלמות בקול מהוסס. בשני המצבים אין מפגש אמיתי. **צמצום הדדי** פירושו לתפוס מקום מקצועי וברור, ואז לסגת כדי שהמהנדסים יביאו את בעיותיהם. קיר שנסוג ומשאיר חצר לשיחה מדגים את המרחב הרצוי.' },
      { lens: 'buddhist', heading: 'בין חץ לחץ', insight: 'המאבק בפחד מחריף את **התגובה** ברגע האמת.', body: 'הפחד העולה הוא **החץ הראשון**, תגובה גופנית מוכרת. מה שמאיץ את הקצב ומקפיץ את הקול הוא **החץ השני**: המאבק בפחד, השיפוט העצמי והקשב שנודד מהתוכן אל עצמה. אדמה יציבה מתחת, שמיים פתוחים מעל, מאפשרים עמידה נוכחת מול הפחד.' },
    ],
    synthesis: { heading: 'נקודת מפגש', insight: 'שלוש עדשות מצביעות על **חסימה גופנית ומבנית**.', body: 'העדשות מסכימות על שלושה דברים: נקודת התקיעה היא המעבר לחלק הפרקטי; היא ניצבת כנבחנת ולא כעמיתה; ואף אחת מהן אינה מורידה לבדה את העוררות הגופנית. הביוגרפית נותנת עמדה, הצמצום מבנה, והבודהיסטית פעולה ברגע. אם העוררות לא יורדת, הפניה ל-**CBT** הכרחית.' },
    quote: 'הפחד שעולה מול מהנדסים ומנהלים הוא החץ הראשון.',
    haiku: ['סף מואר פתוח', 'קיר נסוג חצר לשיחה', 'אדמה יציבה'],
    turn: { from: 'נבחנת מבוהלת', to: 'מומחית נוכחת' },
    action: 'תרגול שלוש הדקות הראשונות של המצגת הבאה: **פתיחה, הדגמה, שאלה** לקהל.',
    visual_prompt_he: 'שביל עתיק המוביל לחצר מרווחת ופתוחה, במרכזה אבן גדולה ויציבה, נוף גלילי, Documentary realism, Professional architecture photography, 1:1 --ar 1:1 --no text, words, writing, frame divisions',
  },
};

const second = JSON.parse(JSON.stringify(ARTICLE));
Object.assign(second, { id: '532f74cc-41b5-422a-9c69-7d356c2ec7c5', case_id: '52c8a7f2-efe6-48a7-80d8-76e02111a3d1', case_code: 'גידול', case_title: 'דרייב מול גוף קורס', created_at: '2026-11-05T01:42:57Z', share: { buddhist: 70, tzimtzum: 65, synthesis: 97, biographical: 69 } });
Object.assign(second.content, { title: 'דחף מול גוף קורס', subtitle: 'כוח חיים ישן פוגש את **צומת הירח השלישי**.' });
export const ARTICLES = [second, ARTICLE];
