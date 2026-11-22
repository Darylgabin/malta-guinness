import { Fragment, type ReactNode } from 'react';

/**
 * Renders text as individually animatable characters (.ch), grouped in words
 * so lines only wrap between words. `pill` wraps one word in a highlight pill.
 */
export function Split({ text, pill, className = '' }: { text: string; pill?: string; className?: string }) {
  const words = text.split(' ');
  return (
    <span className={className} aria-label={text} role="text">
      {words.map((w, wi) => {
        const chars = [...w].map((c, ci) => (
          <span key={ci} className="ch" aria-hidden>
            {c}
          </span>
        ));
        const isPill = pill && w.replace(/[^\p{L}]/gu, '') === pill;
        return (
          <Fragment key={wi}>
            <span className={`inline-block whitespace-nowrap ${isPill ? 'pill-word' : ''}`} data-word>
              {chars}
            </span>
            {wi < words.length - 1 && <span className="ch" aria-hidden>{' '}</span>}
          </Fragment>
        );
      })}
    </span>
  );
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-sans text-[11px] font-semibold uppercase tracking-[0.32em] ${className}`}>{children}</p>
  );
}
