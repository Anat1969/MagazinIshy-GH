import { Fragment } from 'react';

/** Renders **word** as a highlighter mark (the AI distillation standard). */
export default function RichText({ text, as: Tag = 'p', className }: { text: string; as?: 'p' | 'span' | 'h2' | 'h3' | 'div'; className?: string }) {
  const parts = String(text || '').split(/(\*\*[^*]+\*\*)/g);
  return (
    <Tag className={className}>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? <mark key={i}>{p.slice(2, -2)}</mark> : <Fragment key={i}>{p}</Fragment>,
      )}
    </Tag>
  );
}

export const plain = (t: string) => String(t || '').replace(/\*\*/g, '');
