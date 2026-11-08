import { CREATIONS_URL } from '../config';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'app-creations': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { src?: string; heading?: string };
    }
  }
}

/** "יצירות": the shared <app-creations> room (AppOfApp-GH creations-standard), fed live by the articles.
 *  The component writes its own what / how / what comes out, so the page adds no head of its own. */
export default function Creations() {
  return (
    <main className="frame page">
      <app-creations src={CREATIONS_URL} heading="כל כתבה נפרשת לחדר של יצירות" />
      <p className="explain" style={{ marginTop: 12 }}>
        כל מילה ביצירות לקוחה מהכתבות ומהמילון של העדשות במרחב הפנימי. חדר חדש נוצר מעצמו עם כל כתבה.
      </p>
    </main>
  );
}
