import type { LensId, ThreeId } from './types';

// Inherited from מרחב פנימי (Psichologya src/lenses.js): the same lens keeps the same colour
// in both apps, so a reader who knows one app can read the other (doctrine principle 7).
export interface Lens {
  id: LensId;
  name: string;
  short: string;
  plate: string; // the printing-plate name in this app's DNA
  question: string;
  color: string;
  soft: string;
}

export const LENSES: Lens[] = [
  { id: 'biographical', name: 'ייעוץ ביוגרפי', short: 'ביוגרפית', plate: 'ענבר־זמן', question: 'איפה האדם נמצא בזמן חייו', color: '#a8742f', soft: '#efe2cf' },
  { id: 'tzimtzum', name: 'פסיכולוגיית הצמצום', short: 'צמצום', plate: 'אינדיגו־נסיגה', question: 'איך האדם נמצא מול האחר ומול העבר', color: '#41508a', soft: '#dfe2ef' },
  { id: 'buddhist', name: 'פסיכולוגיה בודהיסטית', short: 'בודהיסטית', plate: 'אזוב־נשימה', question: 'איך האדם מחזיק את החוויה ברגע הזה', color: '#5b7c63', soft: '#dde8df' },
  { id: 'synthesis', name: 'סינתזה', short: 'סינתזה', plate: 'דיו־הדפסה', question: 'מה מתאים לאדם הזה עכשיו', color: '#2b2926', soft: '#e7e3dc' },
];

export const LENS = Object.fromEntries(LENSES.map((l) => [l.id, l])) as Record<LensId, Lens>;
export const THREE: ThreeId[] = ['biographical', 'tzimtzum', 'buddhist'];
