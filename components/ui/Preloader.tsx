'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import HarpMark from './HarpMark';

/** Counts up while fonts + scene warm up, then wipes away. */
export default function Preloader({ done, onExited }: { done: boolean; onExited: () => void }) {
  const [n, setN] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      // ease toward 90% on time alone; the last 10% waits for readiness
      const target = done ? 100 : Math.min(90, 90 * (1 - Math.exp(-t * 1.4)));
      setN((v) => (v < target ? Math.min(target, v + Math.max(0.6, (target - v) * 0.12)) : v));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [done]);

  useEffect(() => {
    if (done && n >= 100) {
      const id = setTimeout(() => setShow(false), 250);
      return () => clearTimeout(id);
    }
  }, [done, n]);

  return (
    <AnimatePresence onExitComplete={onExited}>
      {show && (
        <motion.div
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-cream text-malt"
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          role="status"
          aria-label="Loading"
        >
          <div className="relative h-24 w-16 text-malt/10">
            <HarpMark className="absolute inset-0 h-full" />
            <div className="absolute inset-0 text-gold" style={{ clipPath: `inset(${100 - n}% 0% 0% 0%)` }}>
              <HarpMark className="h-full" />
            </div>
          </div>
          <p className="mt-8 font-display text-[44px] tabular-nums leading-none">{Math.floor(n)}</p>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.4em] text-malt/60">Malta Guinness</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
