'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Sections from './Sections';
import Chrome from './ui/Chrome';
import Preloader from './ui/Preloader';
import { buildTimeline, clearAnimatedStyles } from '@/lib/timeline';

const Stage = dynamic(() => import('./three/Stage'), { ssr: false });

export default function Experience() {
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(false);
  const [flags, setFlags] = useState({ reduced: false, lowPower: false });

  // environment flags + fonts
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    document.documentElement.classList.add('is-loading');
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const lowPower = window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4;
    setFlags({ reduced: mq.matches, lowPower });
    const onChange = () => setFlags((f) => ({ ...f, reduced: mq.matches }));
    mq.addEventListener('change', onChange);

    const min = new Promise((r) => setTimeout(r, 1100));
    Promise.all([document.fonts?.ready, min]).then(() => setReady(true));
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // build (and rebuild on meaningful resizes) the scroll timeline
  useEffect(() => {
    if (!ready) return;
    let kill = buildTimeline({ reduced: flags.reduced });
    let w = window.innerWidth;
    let h = window.innerHeight;
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        // ignore the mobile URL-bar show/hide (small height-only changes)
        if (window.innerWidth === w && Math.abs(window.innerHeight - h) < 140) return;
        w = window.innerWidth;
        h = window.innerHeight;
        kill();
        clearAnimatedStyles();
        kill = buildTimeline({ reduced: flags.reduced });
      }, 200);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(t);
      kill();
      clearAnimatedStyles();
    };
  }, [ready, flags.reduced]);

  useEffect(() => {
    if (entered) document.documentElement.classList.remove('is-loading');
  }, [entered]);

  // smooth in-page anchors (CSS smooth scrolling would fight ScrollTrigger)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href')!.slice(1);
      const target = id === 'top' ? null : document.getElementById(id);
      e.preventDefault();
      const extra = id === 'discover' ? window.innerHeight * 0.3 : 0;
      const top = target ? target.getBoundingClientRect().top + window.scrollY + extra : 0;
      window.scrollTo({ top, behavior: flags.reduced ? 'auto' : 'smooth' });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [flags.reduced]);

  return (
    <>
      <Preloader done={ready} onExited={() => setEntered(true)} />
      <Stage reducedMotion={flags.reduced} lowPower={flags.lowPower} />
      <Chrome ready={ready} />
      <Sections />
      <div className="grain" aria-hidden />
    </>
  );
}
