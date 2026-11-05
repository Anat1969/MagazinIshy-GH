import { useEffect, useRef } from 'react';
import { DEV_CHAT_URL } from '../config';

export interface MenuItem {
  label: string;
  hint?: string;
  pressed?: boolean;
  disabled?: boolean;
  onSelect: () => unknown;
}
interface MenuElement extends HTMLElement {
  items: MenuItem[];
  status: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'ai-menu': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { chat?: string; research?: string };
    }
  }
}

/** The A&I logo button (https://appofapp-gh.vercel.app/ai-menu.js). Every system action lives inside it. */
export default function AIMenu({ items }: { items: MenuItem[] }) {
  const ref = useRef<MenuElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      el.items = items;
    };
    if (customElements.get('ai-menu')) apply();
    else customElements.whenDefined('ai-menu').then(apply);
  }, [items]);
  return <ai-menu ref={ref} chat={DEV_CHAT_URL} />;
}
