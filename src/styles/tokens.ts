// ─── SIXDX DESIGN TOKENS ─────────────────────────────────────────────────────
// Single source of truth for all typography, colour, and spacing values.
//
// HOW TO USE
//   import { fonts, colors, textStyles } from '@/styles/tokens'
//   style={{ ...textStyles.h2, color: colors.ink }}
//
// HOW TO EDIT
//   • Fonts     → change the string in `fonts`
//   • Colours   → change the hex / rgba in `colors`
//   • Type scale → change values inside `textStyles`
//   All consuming components pick up the change automatically — no search-replace needed.
//
// Figma source file: ZY9szUlXcExFPsFmCtPfQU
// Extracted 2025 — matches local Figma text + colour styles exactly.
// ─────────────────────────────────────────────────────────────────────────────

import type { CSSProperties } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════
// ── 1. FONT FAMILIES
// ═══════════════════════════════════════════════════════════════════════════════

export const fonts = {
  /** Display / heading typeface — Marund */
  marund: 'Marund, sans-serif',
  /** Body / UI typeface — Helvetica Neue */
  hn: 'HelveticaNeue, "Helvetica Neue", Helvetica, Arial, sans-serif',
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// ── 2. COLOUR PALETTE
// ═══════════════════════════════════════════════════════════════════════════════

export const colors = {
  // ── Brand ──────────────────────────────────────────────────────────────────
  /** Primary orange — Figma: Brand 1 */
  brand1:   '#CC4D22',
  /** Gold accent — Figma: Brand 2 */
  brand2:   '#E1A853',
  /** Warm tint — Figma: Brand/Sec */
  brandSec: '#FCF4F2',

  // ── Content ────────────────────────────────────────────────────────────────
  /** Primary text / dark — Figma: Content/Primary */
  ink:   '#1C0B05',
  /** Inverted / white — Figma: Inverted */
  white: '#FFFFFF',
  /** Near-black site background */
  bgDark: '#0a0a0a',

  // ── Alpha variants (ink) ───────────────────────────────────────────────────
  /** ink at 50% — feature body text */
  ink50:  'rgba(28,11,5,0.50)',
  /** ink at 60% — secondary descriptions */
  ink60:  'rgba(28,11,5,0.60)',
  /** ink at 5%  — badge backgrounds */
  ink05:  'rgba(28,11,5,0.05)',
  /** ink at 10% — subtle borders */
  ink10:  'rgba(28,11,5,0.10)',

  // ── Alpha variants (white) ─────────────────────────────────────────────────
  /** white at 70% — dimmed text on dark bg */
  white70: 'rgba(255,255,255,0.70)',
  /** white at 60% — secondary on dark */
  white60: 'rgba(255,255,255,0.60)',
  /** white at 50% — muted on dark */
  white50: 'rgba(255,255,255,0.50)',
  /** white at 30% — placeholder text */
  white30: 'rgba(255,255,255,0.30)',
  /** white at 25% — dividers / track backgrounds */
  white25: 'rgba(255,255,255,0.25)',
  /** white at 8%  — glass input backgrounds + borders */
  white08: 'rgba(255,255,255,0.08)',

  // ── Overlays ───────────────────────────────────────────────────────────────
  /** Black 40% — contact section bg overlay */
  overlay40: 'rgba(0,0,0,0.40)',
  /** Black 50% — WhatWeCreate / Hero image overlays */
  overlay50: 'rgba(0,0,0,0.50)',
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// ── 3. TEXT STYLES
// ═══════════════════════════════════════════════════════════════════════════════
// Rules:
//   • Display sizes (h0–h2) use clamp() for fluid responsive scaling.
//   • Body sizes (h3–body) use fixed rem — they're small enough not to need fluid scaling.
//   • No `color` property here — always set color at the call-site so styles
//     remain context-agnostic (dark vs light sections).
//   • `margin: 0` and `fontWeight: 'normal'` are included everywhere
//     to reset browser defaults; override at call-site only if needed.
//
// Figma type scale:
//   h0  — Marund 155.25px / -7% tracking / 80% lh
//   h1  — Marund 60px     / -4% tracking / 100% lh
//   h2  — Marund 60px     / -6% tracking / 90% lh
//   h3  — HN    36px      / -3% tracking / 100% lh
//   h4  — HN    22.65px   / -3% tracking / 132% lh  (also used as subtitle / feat title)
//   body — HN   14px      /  0% tracking / 140% lh
// ─────────────────────────────────────────────────────────────────────────────

export const textStyles = {

  /**
   * h0 — Hero / full-screen display
   * Figma: Marund 155.25px / -7% / lh 0.8
   * Responsive: scales from ~6rem on mobile to 155.25px on widescreen
   */
  h0: {
    fontFamily:    fonts.marund,
    fontSize:      'clamp(3.5rem, 10vw, 9.703rem)',
    letterSpacing: '-0.07em',
    lineHeight:    0.8,
    fontWeight:    'normal',
    fontStyle:     'normal',
    margin:        0,
  } satisfies CSSProperties,

  /**
   * h1 — Section primary heading (Marund, tighter tracking)
   * Figma: Marund 60px / -4% / lh 1.0
   * Responsive: scales from ~2rem on mobile to 60px on widescreen
   */
  h1: {
    fontFamily:    fonts.marund,
    fontSize:      'clamp(2rem, 4.5vw, 3.75rem)',
    letterSpacing: '-0.04em',
    lineHeight:    1.0,
    fontWeight:    'normal',
    fontStyle:     'normal',
    margin:        0,
  } satisfies CSSProperties,

  /**
   * h2 — Section secondary heading (Marund, looser tracking)
   * Figma: Marund 60px / -6% / lh 0.9
   * Responsive: scales from ~2rem on mobile to 60px on widescreen
   */
  h2: {
    fontFamily:    fonts.marund,
    fontSize:      'clamp(2rem, 4.5vw, 3.75rem)',
    letterSpacing: '-0.06em',
    lineHeight:    0.9,
    fontWeight:    'normal',
    fontStyle:     'normal',
    margin:        0,
  } satisfies CSSProperties,

  /**
   * h3 — Large body / callout
   * Figma: HN Regular 36px / -3% / lh 1.0
   * Responsive: scales from 1.5rem to 2.25rem
   */
  h3: {
    fontFamily:    fonts.hn,
    fontSize:      'clamp(1.5rem, 2.5vw, 2.25rem)',
    letterSpacing: '-0.03em',
    lineHeight:    1.0,
    fontWeight:    'normal',
    margin:        0,
  } satisfies CSSProperties,

  /**
   * h4 — Medium subtitle / feature title
   * Figma: HN Regular 22.65px / -3% / lh 1.32
   * Fixed size — small enough to not need fluid scaling
   */
  h4: {
    fontFamily:    fonts.hn,
    fontSize:      '1.416rem',   // 22.65px
    letterSpacing: '-0.03em',
    lineHeight:    1.32,
    fontWeight:    'normal',
    margin:        0,
  } satisfies CSSProperties,

  /**
   * body — Standard body / UI text
   * Figma: HN Regular 14px / 0% / lh 1.4
   */
  body: {
    fontFamily:    fonts.hn,
    fontSize:      '0.875rem',   // 14px
    letterSpacing: '0em',
    lineHeight:    1.4,
    fontWeight:    'normal',
    margin:        0,
  } satisfies CSSProperties,

  /**
   * bodyMedium — Body weight 500 (nav items, button labels)
   * Same metrics as body, fontWeight 500
   */
  bodyMedium: {
    fontFamily:    fonts.hn,
    fontSize:      '0.875rem',
    letterSpacing: '-0.01em',    // -1% — used in nav + buttons
    lineHeight:    1.4,
    fontWeight:    500,
    margin:        0,
  } satisfies CSSProperties,

  /**
   * label — Small label / caption
   * HN 14px / -1% / lh 1.28 (used in feature numbers, tags)
   */
  label: {
    fontFamily:    fonts.hn,
    fontSize:      '0.875rem',
    letterSpacing: '-0.01em',
    lineHeight:    1.28,
    fontWeight:    'normal',
    margin:        0,
  } satisfies CSSProperties,

} as const
