import { Split, Eyebrow } from './ui/Split';
import HarpMark from './ui/HarpMark';
import { Barley, CrownCap, Droplets, GlassIce, Sunburst } from './ui/LineArt';

/**
 * All page content. Sticky "stages" give each scroll-driven scene room to
 * play; every element the timeline animates carries a data-a="…" hook.
 *
 * Stacking: the WebGL canvas is fixed at z-index 5. A sticky element always
 * forms its own stacking context, so each pinned scene is TWO sticky layers
 * sharing the same scroll range: a back layer (z auto → beneath the canvas:
 * backgrounds, giant type behind the bottle) and a front overlay (z-10 →
 * above the canvas: coins, copy, buttons). The dark brand + heritage sections
 * are z-20 and opaque, so they physically cover the bottle as they rise.
 */

export const FACTS = [
  {
    n: '01',
    title: 'Non-alcoholic',
    body: 'Malta Guinness is a non-alcoholic malt drink. It says so right on the label, beneath the harp and the name.',
  },
  {
    n: '02',
    title: 'Rich malt character',
    body: 'Malt is the heart of it: a deep, rounded flavour, and a colour as dark as the glass it comes in.',
  },
  {
    n: '03',
    title: 'A distinctive taste',
    body: 'Sweet, full-bodied and unmistakably malty. A taste people recognise from the very first sip.',
  },
  {
    n: '04',
    title: 'Made to refresh',
    body: 'At its best ice-cold: straight from a beaded, chilled bottle or poured slowly over ice.',
  },
  {
    n: '05',
    title: 'Iconic by heritage',
    body: 'The harp on the label is the emblem of Guinness, adopted in 1862 and registered as a trademark in 1876.',
  },
];

const COINS = [
  // desktop position (l/t) and mobile position (lm/tm)
  { b: 'Non-alcoholic', s: 'Malt drink', d: 136, l: '12%', t: '62%', lm: '3%', tm: '76%' },
  { b: 'Rich malt', s: 'Character', d: 112, l: '74%', t: '58%', lm: '70%', tm: '76%' },
  { b: 'Ice cold', s: 'Best served', d: 96, l: '64%', t: '8%', lm: '72%', tm: '44%' },
  { b: 'Vitality', s: 'Goodness · Energy', d: 122, l: '22%', t: '6%', lm: '68%', tm: '11%' },
];

const MOMENTS = [
  { n: '01', word: 'Ice cold', body: 'Straight from the fridge, the glass beaded with condensation.', bg: 'from-[#f2c95c] to-[#d4952c]', ink: 'text-malt' },
  { n: '02', word: 'Over ice', body: 'Poured slowly into a tall glass, the colour of polished mahogany.', bg: 'from-[#c8701c] to-[#8a3f0d]', ink: 'text-cream' },
  { n: '03', word: 'At the table', body: 'Shared with family and friends over the meals that matter.', bg: 'from-[#a3141a] to-[#5e080c]', ink: 'text-cream' },
  { n: '04', word: 'The pause', body: 'A golden moment in the middle of a long, busy day.', bg: 'from-[#f6ecda] to-[#e5cf9f]', ink: 'text-malt' },
];

export default function Sections() {
  return (
    <main id="top" className="relative">
      {/* ═════════ SCENES 1–3 · HARP → CRACK → BOTTLE ═════════ */}
      <section id="story" data-chapter="The Harp" className="relative h-[620vh] bg-cream">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,#fff8ea_0%,#f4ecdd_45%,#e8d9bd_100%)]" />
          <div data-a="hero-halo" aria-hidden className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(242,201,92,0.55)_0%,rgba(242,201,92,0)_68%)]" />

          {/* hero headline — sits behind the harp */}
          <h1 className="pointer-events-none absolute inset-0 z-[1] select-none">
            <span data-a="hero-w1" className="extrude extrude-dark absolute left-[4vw] top-[25%] block text-[clamp(60px,12.5vw,220px)] md:top-[24%]">
              <Split text="A taste" />
            </span>
            <span data-a="hero-w2" className="extrude extrude-dark absolute right-[4vw] top-[64%] block text-right text-[clamp(52px,12.5vw,220px)] md:top-[56%]">
              <Split text="of greatness." />
            </span>
          </h1>
        </div>

        {/* front layer: a second sticky overlay painted above the WebGL canvas */}
        <div className="pointer-events-none sticky top-0 z-10 -mt-[100svh] h-[100svh] overflow-hidden">

          <div data-a="hero-intro" className="absolute left-[4vw] top-[11%] z-10 max-w-[15rem] md:top-[15%] md:max-w-[19rem]">
            <Eyebrow className="text-amber">Malta Guinness</Eyebrow>
            <p className="mt-3 font-serif text-[15px] italic leading-snug text-malt/80">
              The non-alcoholic malt drink that carries the harp at the heart of its label.
            </p>
          </div>

          <div data-a="hero-cue" className="absolute bottom-[4.5vh] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-malt">
            <span className="text-[10px] font-semibold uppercase tracking-[0.42em]">Scroll to discover</span>
            <span className="relative block h-12 w-px overflow-hidden bg-malt/15">
              <span className="scroll-cue-line absolute inset-0 bg-malt" />
            </span>
          </div>

          {/* gold coins drifting past (scrubbed) */}
          <div className="pointer-events-none absolute inset-0 z-10 [perspective:900px]" aria-hidden>
            {COINS.map((c, i) => (
              <div key={i} data-a={`coin-${i}`} className="coin left-[var(--l)] top-[var(--t)] max-md:left-[var(--lm)] max-md:top-[var(--tm)]" style={{ ['--l' as string]: c.l, ['--t' as string]: c.t, ['--lm' as string]: c.lm, ['--tm' as string]: c.tm, ['--d' as string]: `clamp(${Math.round(c.d * 0.62)}px, ${c.d / 12}vw, ${c.d}px)` }}>
                <div>
                  <b>{c.b}</b>
                  <small>{c.s}</small>
                </div>
              </div>
            ))}
          </div>

          {/* reveal copy — appears as the bottle emerges */}
          <div className="pointer-events-none absolute inset-0 z-10">
            <div className="absolute left-[4vw] top-[12%] max-w-[46vw] max-md:right-[4vw] max-md:max-w-none md:top-[22%]">
              <Eyebrow className="text-amber" >
                <span data-a="reveal-eyebrow" className="inline-block">Introducing</span>
              </Eyebrow>
              <h2 className="extrude extrude-dark mt-3 text-[clamp(54px,9.6vw,168px)]">
                <span data-a="reveal-l1" className="split-line">
                  <Split text="Malta" />
                </span>
                <span data-a="reveal-l2" className="split-line">
                  <Split text="Guinness" />
                </span>
              </h2>
              <p data-a="reveal-tag" className="mt-6 max-w-[24rem] font-serif text-[clamp(17px,1.5vw,22px)] italic leading-snug text-malt max-md:hidden">
                The richness of malt. <br />
                The joy of refreshment.
              </p>
            </div>
            <div data-a="reveal-side" className="absolute bottom-[9%] right-[4vw] max-w-[17rem] text-right max-md:bottom-[6%] max-md:left-[4vw] max-md:right-auto max-md:max-w-[14rem] max-md:text-left">
              <p className="font-serif text-[17px] italic leading-snug text-malt md:hidden">
                The richness of malt. The joy of refreshment.
              </p>
              <p className="text-[13px] leading-relaxed text-malt/75 max-md:hidden">
                Dark glass, a brown crown cap and a sunburst of gold: the bottle you know, stepping into the spotlight.
              </p>
              <a href="#discover" className="pointer-events-auto mt-4 inline-flex items-center gap-2 rounded-full border border-malt/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-malt transition hover:bg-malt hover:text-cream">
                Discover the drink <span aria-hidden>↓</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════ SCENE 4 · DISCOVER THE DRINK ═════════ */}
      <section id="discover" data-chapter="The Drink" className="relative h-[700vh] bg-cream">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,#fff8ea_0%,#f4ecdd_50%,#e6d4b2_100%)]" />
          <div data-a="disc-rule" aria-hidden className="absolute left-1/2 top-[8%] z-[1] h-[84%] w-px origin-top bg-malt/10" />

          {/* giant line behind the bottle (like "KEEP SIPPING" in the reference) */}
          <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col items-center justify-center text-center">
            <span data-a="moment-l1" className="extrude extrude-dark split-line text-[clamp(40px,12vw,210px)]">
              <Split text="Make every" />
            </span>
            <span data-a="moment-l2" className="extrude extrude-dark split-line text-[clamp(40px,12vw,210px)]">
              <Split text="moment count." />
            </span>
          </div>
        </div>

        {/* front layer */}
        <div className="sticky top-0 z-10 -mt-[100svh] h-[100svh] overflow-hidden">
          <div data-a="disc-head" className="absolute left-0 right-0 top-[8%] z-10 text-center">
            <Eyebrow className="text-amber">Discover the drink</Eyebrow>
          </div>

          {FACTS.map((f, i) => (
            <article
              key={f.n}
              data-a={`fact-${i}`}
              className={`absolute z-10 w-[min(26rem,40vw)] max-md:inset-x-[6vw] max-md:bottom-[7%] max-md:top-auto max-md:w-auto md:top-1/2 md:-translate-y-1/2 ${
                i % 2 === 0 ? 'md:left-[7vw]' : 'md:right-[7vw] md:text-right'
              }`}
            >
              <div className="extrude extrude-dark text-[clamp(70px,11vw,170px)] leading-none max-md:text-[64px]">
                <Split text={f.n} />
              </div>
              <h3 className="mt-4 font-serif text-[clamp(26px,2.6vw,40px)] italic leading-tight text-malt max-md:mt-2">{f.title}</h3>
              <div className={`my-4 h-px w-16 bg-gold max-md:my-3 ${i % 2 ? 'md:ml-auto' : ''}`} />
              <p className="text-[15px] leading-relaxed text-malt/75 max-md:text-[14px]">{f.body}</p>
            </article>
          ))}

          <div data-a="disc-counter" className="absolute bottom-[6%] left-1/2 z-10 flex -translate-x-1/2 gap-2 max-md:hidden" aria-hidden>
            {FACTS.map((f, i) => (
              <span key={f.n} data-a={`dot-${i}`} className="h-[3px] w-8 rounded-full bg-malt/15" />
            ))}
          </div>
        </div>
      </section>

      {/* ═════════ SCENE 5 · THE BRAND EXPERIENCE (covers the canvas) ═════════ */}
      <section id="brand" data-chapter="The Character" className="scallop-top relative z-20 -mt-[100svh] bg-brown text-cream">
        <div className="relative h-[220vh]">
          <div className="sticky top-0 h-[100svh] overflow-hidden">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,#6a3818_0%,#4a2612_45%,#2a140a_100%)]" />
            <div aria-hidden className="absolute inset-0 text-goldlight/40">
              <Barley className="absolute left-[5%] top-[14%] h-[30vh]" />
              <GlassIce className="absolute bottom-[10%] right-[7%] h-[24vh]" />
              <CrownCap className="absolute right-[18%] top-[12%] h-[13vh]" />
              <Droplets className="absolute bottom-[14%] left-[16%] h-[13vh]" />
              <Sunburst className="absolute left-1/2 top-[6%] h-[16vh] -translate-x-1/2" />
            </div>
            <div data-a="brand-coin" className="coin left-[7%] top-[76%] z-10 max-md:hidden" style={{ ['--d' as string]: '110px' }}>
              <div>
                <b>Malta</b>
                <small>Guinness</small>
              </div>
            </div>

            <div className="relative z-10 flex h-full flex-col items-center justify-center px-[5vw] text-center">
              <Eyebrow className="text-goldlight/80">
                <span data-a="brand-eyebrow" className="inline-block">The character</span>
              </Eyebrow>
              <h2 className="extrude extrude-cream mt-6 text-[clamp(52px,10vw,180px)]">
                <span data-a="brand-l1" className="split-line">
                  <Split text="Rich in taste." />
                </span>
                <span data-a="brand-l2" className="split-line">
                  <Split text="Bold in character." pill="Bold" />
                </span>
              </h2>
              <p data-a="brand-copy" className="mt-10 max-w-md font-serif text-[clamp(16px,1.4vw,20px)] italic leading-snug text-cream/80">
                Printed across the label, beneath the sunburst: <br className="max-md:hidden" />
                <span className="not-italic font-sans text-[12px] font-semibold uppercase tracking-[0.3em] text-goldlight">
                  Vitality · Goodness · Energy
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Moments: horizontal gallery */}
        <div id="moments" data-chapter="The Moments" className="relative h-[340vh]">
          <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
            <div className="mb-[5vh] flex items-end justify-between px-[5vw]">
              <h2 className="extrude extrude-gold text-[clamp(44px,7vw,120px)]">
                <span data-a="moments-title" className="split-line">
                  <Split text="Made for every moment" />
                </span>
              </h2>
              <p className="hidden max-w-[16rem] pb-3 text-right text-[13px] leading-relaxed text-cream/60 lg:block">
                Four ways people make the most of it. Keep scrolling.
              </p>
            </div>
            <div data-a="moments-track" className="flex w-max gap-[3vw] pl-[5vw] pr-[20vw]">
              {MOMENTS.map((m) => (
                <article
                  key={m.n}
                  className={`relative h-[min(62vh,560px)] w-[min(78vw,440px)] shrink-0 overflow-hidden rounded-[6px] bg-gradient-to-br ${m.bg} ${m.ink}`}
                >
                  <div aria-hidden className="absolute -right-[10%] top-[10%] h-[92%]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/assets/malta-bottle.png"
                      alt=""
                      className="h-full w-auto rotate-[8deg] drop-shadow-[0_30px_30px_rgba(0,0,0,0.45)]"
                      loading="lazy"
                    />
                  </div>
                  <div className="relative flex h-full flex-col justify-between p-7">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.3em] opacity-70">{m.n} / 04</span>
                    <div className="max-w-[58%]">
                      <h3 className="font-display text-[clamp(40px,4.4vw,64px)] uppercase leading-[0.9]">{m.word}</h3>
                      <p className="mt-4 text-[14px] leading-relaxed opacity-80">{m.body}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="mx-[5vw] mt-[5vh] h-px bg-cream/15">
              <div data-a="moments-bar" className="h-px w-full origin-left scale-x-0 bg-goldlight" />
            </div>
          </div>
        </div>
      </section>

      {/* ═════════ HERITAGE · cream interlude (also covers the canvas) ═════════ */}
      <section id="heritage" data-chapter="The Heritage" className="scallop-top scallop-bottom relative z-20 -mt-[46px] bg-ivory pb-[46px] text-malt">
        <div className="relative h-[220vh]">
          <div className="sticky top-0 grid h-[100svh] items-center overflow-hidden px-[5vw] md:grid-cols-[1fr_1.1fr]">
            <div className="relative mx-auto h-[54vh] max-md:mt-[10vh] max-md:h-[30vh]">
              <div data-a="her-harp" className="h-full text-gold">
                <HarpMark className="h-full" />
              </div>
            </div>
            <div className="max-md:pb-[12vh]">
              <Eyebrow className="text-amber">
                <span data-a="her-eyebrow" className="inline-block">Heritage</span>
              </Eyebrow>
              <h2 className="extrude extrude-dark mt-4 text-[clamp(56px,9vw,160px)]">
                <span data-a="her-title" className="split-line">
                  <Split text="The harp." />
                </span>
              </h2>
              <div data-a="her-copy" className="mt-6 grid max-w-xl gap-6 text-[15px] leading-relaxed text-malt/80 md:grid-cols-2">
                <p>
                  <span className="mb-2 block font-display text-[34px] leading-none text-amber">1759</span>
                  Arthur Guinness signs the lease on the St. James&apos;s Gate brewery in Dublin, where the Guinness story begins.
                </p>
                <p>
                  <span className="mb-2 block font-display text-[34px] leading-none text-amber">1862</span>
                  The harp becomes the emblem of Guinness, and is registered as a trademark in 1876. On Malta Guinness it crowns the label.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════ SCENE 6 · FINAL SHOWCASE (under the canvas) ═════════ */}
      <section id="finale" data-chapter="The Finale" className="relative -mt-[46px] h-[320vh] bg-night text-cream">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,#5a2d12_0%,#2a130a_38%,#120805_75%)]" />
          <div data-a="fin-beam" aria-hidden className="absolute left-1/2 top-0 h-full w-[60vw] -translate-x-1/2 bg-[conic-gradient(from_180deg_at_50%_0%,transparent_160deg,rgba(255,214,140,0.22)_175deg,rgba(255,214,140,0.32)_180deg,rgba(255,214,140,0.22)_185deg,transparent_200deg)] opacity-0 blur-[2px]" />
          <div data-a="fin-floor" aria-hidden className="absolute bottom-[8%] left-1/2 h-[10vh] w-[50vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse,rgba(255,190,90,0.35)_0%,rgba(255,190,90,0)_70%)] opacity-0" />

          <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center">
            <h2 className="extrude extrude-gold text-center text-[clamp(64px,15vw,280px)] max-md:text-[19vw]">
              <span data-a="fin-l1" className="split-line">
                <Split text="Malta" />
              </span>
              <span data-a="fin-l2" className="split-line">
                <Split text="Guinness" />
              </span>
            </h2>
          </div>
        </div>

        {/* front layer */}
        <div className="pointer-events-none sticky top-0 z-10 -mt-[100svh] h-[100svh] overflow-hidden">
          <div className="pointer-events-auto absolute inset-x-0 bottom-[6%] flex flex-col items-center gap-5 max-md:bottom-[11%] px-6 text-center">
            <p data-a="fin-tag" className="font-serif text-[clamp(20px,2.2vw,32px)] italic text-champagne">
              The power of great taste.
            </p>
            <a
              data-a="fin-cta"
              href="#top"
              className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-b from-goldlight to-gold px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.3em] text-night shadow-[0_10px_40px_rgba(242,201,92,0.35)] transition hover:shadow-[0_10px_60px_rgba(242,201,92,0.6)]"
            >
              Discover the experience
              <span aria-hidden className="transition group-hover:-translate-y-0.5">↑</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="relative z-20 bg-night px-[5vw] pb-10 pt-16 text-cream/50">
        <div className="flex flex-col gap-6 border-t border-cream/10 pt-8 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-3 text-goldlight">
            <HarpMark className="h-9" />
            <span className="font-display text-[22px] uppercase tracking-wide text-cream">Malta Guinness</span>
          </div>
          <p className="max-w-xl text-[11px] leading-relaxed">
            An independent concept brand experience. Malta Guinness, Guinness and the Harp device are trademarks of their
            respective owner. This is not an official Guinness or Diageo website. The 3D bottle and harp are rendered
            interpretations; product photography is the supplied reference image.
          </p>
        </div>
      </footer>
    </main>
  );
}
