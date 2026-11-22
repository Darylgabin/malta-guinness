'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HarpMark from './HarpMark';

const CHAPTERS = [
  { id: 'story', label: 'The Harp' },
  { id: 'discover', label: 'The Drink' },
  { id: 'brand', label: 'The Character' },
  { id: 'moments', label: 'The Moments' },
  { id: 'heritage', label: 'The Heritage' },
  { id: 'finale', label: 'The Finale' },
];

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // land a little into sticky scenes so their opening state is visible
  const extra = id === 'discover' ? window.innerHeight * 0.3 : id === 'finale' ? window.innerHeight * 1.2 : 0;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + extra, behavior: reduce ? 'auto' : 'smooth' });
}

export default function Chrome({ ready }: { ready: boolean }) {
  const [open, setOpen] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (!ready) return;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setPct(Math.round((window.scrollY / Math.max(1, max)) * 100));
      const mid = window.scrollY + window.innerHeight * 0.5;
      let idx = 0;
      CHAPTERS.forEach((c, i) => {
        const el = document.getElementById(c.id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= mid) idx = i;
      });
      setChapter(idx);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const r = () => ScrollTrigger.refresh();
    window.addEventListener('load', r);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('load', r);
    };
  }, [ready]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      {/* top bar — blends against light and dark scenes alike */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-[4vw] py-5 text-[#f4ecdd] mix-blend-difference">
        <a href="#top" aria-label="Malta Guinness, back to top" className="pointer-events-auto flex items-center gap-2.5">
          <HarpMark className="h-8" />
          <span className="font-display text-[15px] uppercase tracking-[0.12em] max-sm:hidden">Malta Guinness</span>
        </a>
        <button
          onClick={() => setOpen(true)}
          className="pointer-events-auto rounded-full border border-current px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em]"
          aria-expanded={open}
          aria-controls="site-menu"
        >
          Menu
        </button>
      </header>

      {/* chapter + progress */}
      <div className="pointer-events-none fixed bottom-5 left-[4vw] z-50 w-[min(240px,62vw)] text-[#f4ecdd] mix-blend-difference" aria-hidden>
        <div className="mb-2 flex items-baseline justify-between text-[10px] font-semibold uppercase tracking-[0.28em]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={chapter}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {String(chapter + 1).padStart(2, '0')} — {CHAPTERS[chapter].label}
            </motion.span>
          </AnimatePresence>
          <span className="tabular-nums">{pct}%</span>
        </div>
        <div className="h-px w-full bg-current/25">
          <div className="h-px origin-left bg-current" style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="site-menu"
            aria-label="Chapters"
            className="fixed inset-0 z-[70] flex flex-col justify-between bg-night px-[5vw] py-6 text-cream"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2.5 text-goldlight">
                <HarpMark className="h-8" />
                <span className="font-display text-[15px] uppercase tracking-[0.12em] text-cream">Malta Guinness</span>
              </span>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full border border-cream/40 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em]"
                autoFocus
              >
                Close
              </button>
            </div>
            <ul className="space-y-1">
              {CHAPTERS.map((c, i) => (
                <motion.li
                  key={c.id}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button
                    onClick={() => {
                      setOpen(false);
                      setTimeout(() => scrollToId(c.id), 350);
                    }}
                    className="group flex items-baseline gap-5 text-left"
                  >
                    <span className="w-8 font-sans text-[11px] font-semibold tracking-[0.2em] text-goldlight/70">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-display text-[clamp(40px,7.5vw,96px)] uppercase leading-[1] text-cream transition group-hover:text-goldlight">
                      {c.label}
                    </span>
                  </button>
                </motion.li>
              ))}
            </ul>
            <p className="max-w-md text-[11px] leading-relaxed text-cream/40">
              A scroll-driven concept experience for Malta Guinness, the non-alcoholic malt drink.
            </p>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
