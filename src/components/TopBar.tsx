import AIMenu, { type MenuItem } from './AIMenu';
import type { Route } from '../route';

function Mark() {
  // App icon, no text: three plates in register.
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <rect x="9" y="1" width="15" height="14" fill="#a8742f" opacity="0.7" />
      <rect x="1" y="4" width="15" height="14" fill="#41508a" opacity="0.7" />
      <rect x="5" y="10" width="15" height="14" fill="#5b7c63" opacity="0.7" />
      <rect x="9" y="10" width="7" height="5" fill="#2b2926" />
    </svg>
  );
}

const NAV: { href: string; label: string; page: Route['page'] }[] = [
  { href: '#/issue', label: 'הגיליון', page: 'issue' },
  { href: '#/cases', label: 'מקרים להפקה', page: 'cases' },
];

export default function TopBar({ route, items }: { route: Route; items: MenuItem[] }) {
  return (
    <header className="bar">
      <div className="frame bar__in">
        <a className="brand" href="#/" aria-label="מגזין מהמרחב הפנימי, דף הבית">
          <Mark />
          <span>מגזין מהמרחב הפנימי</span>
        </a>
        <nav className="nav" aria-label="ניווט תוכן">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} aria-current={route.page === n.page || (n.page === 'issue' && route.page === 'article') ? 'page' : undefined}>
              {n.label}
            </a>
          ))}
        </nav>
        <AIMenu items={items} />
      </div>
    </header>
  );
}
