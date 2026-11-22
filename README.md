# Malta Guinness — scroll-driven brand experience

Next.js 15 · TypeScript · Tailwind 4 · GSAP ScrollTrigger · React Three Fiber · Framer Motion

```bash
npm install
npm run assets   # (re)builds the bottle cut-out + silhouette profile from the reference photo
npm run dev
```

## How it works

| Piece | File |
| --- | --- |
| Scroll choreography (single master timeline, 1 unit = 1 scroll px) | `lib/timeline.ts` |
| Shared animation state read by the 3D scene | `lib/rig.ts` |
| Harp model (soundbox, neck, forepillar, scroll, foot, strings) | `lib/harpGeometry.ts`, `components/three/Harp.tsx` |
| Bottle model (lathe from the photo's measured silhouette, label, cap, condensation) | `components/three/Bottle.tsx`, `lib/textures.ts`, `lib/bottleProfile.json` |
| Page content & scene markup | `components/Sections.tsx` |

Scenes: **Harp intro** → **harp turns, strings pluck, a seam cracks, halves split apart** →
**bottle slides out of the core light** → **Discover the drink** (5 facts while the bottle turns) →
**Make every moment count** → **dark scalloped brand section** → **moments gallery** → **heritage** →
**finale spotlight**.

Everything in the WebGL scene is a pure function of scroll position, so scrolling up plays it in reverse.

## Assets — please read

* **Bottle**: modelled in 3D. The silhouette is measured from `public/assets/malta-bottle-reference.jpg`
  (`scripts/cutout-bottle.mjs`). The **label is a hand-built, high-resolution rebuild** of the label in that
  photo (layout, colours and printed words copied from it); the "Malta" wordmark is approximated with the
  Lilita One typeface. For a pixel-perfect label, drop official flat label artwork into `public/assets/` and
  set `LABEL_ART_URL` in `lib/textures.ts`.
* **Harp**: a Brian Boru–style harp modelled in code in the Guinness orientation. It is not the official
  vector asset. If you have the official harp artwork, its outline can replace the centre-line shapes in
  `lib/harpGeometry.ts`.
* **Product photography** (moments cards) is the supplied reference photo, cut out automatically.

## Content

Copy is limited to verifiable statements: "non alcoholic malt drink" and "Vitality · Goodness · Energy"
are printed on the label; the harp has been the Guinness emblem since 1862 (trademark 1876); Arthur
Guinness signed the St. James's Gate lease in 1759. No nutrition, ingredient or health claims are made.
The footer states this is an independent concept, not an official Guinness/Diageo site.
