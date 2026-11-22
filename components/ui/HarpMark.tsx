'use client';

import { useMemo } from 'react';
import { harpSvgMarkup } from '@/lib/harpGeometry';

/** The same harp outline used by the 3D model, as an inline SVG mark. */
export default function HarpMark({ className = '', color = 'currentColor' }: { className?: string; color?: string }) {
  const html = useMemo(() => harpSvgMarkup(color), [color]);
  return <span aria-hidden className={`inline-block [&>svg]:h-full [&>svg]:w-auto ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
