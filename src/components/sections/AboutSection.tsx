// ─── ABOUT SIXDX — SixDX ─────────────────────────────────────────────────────
// Figma node: 323:85  /  "About SixDX"
//
// Layout (Figma-exact):
//   Outer section:  padding 120px 28px,  gap 28px,  bg #FFFFFF
//   Upper row:      heading + body  |  CTA button        (gap 32px)
//   Lower row:      quote  |  image  |  features list    (gap 28px, align-end)
//
// WebGL:
//   • Image frame background   → GradientCanvas (domain-warped GLSL shader)
//   • Quote text gradient      → second GradientCanvas (hidden) → toDataURL()
//     Both canvases share identical shader + speed → perfectly synced.
//
// Customisation guide — ALL content and design values live in the CONFIG
// block below the imports. JSX below that should never need touching.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import PrimaryButton    from '../ui/PrimaryButton'
import GradientCanvas   from '../ui/GradientCanvas'
import GradientControls, { loadGradientConfig } from '../ui/GradientControls'
import MagicRings       from '../ui/MagicRings'
import type { GradientConfig } from '../ui/GradientCanvas'
import { colors, textStyles } from '../../styles/tokens'

// ═══════════════════════════════════════════════════════════════════════════════
// ── SECTION-SPECIFIC LAYOUT VALUES
// These are About-section-only — not shared across the site.
// Typography and colour come from ../../styles/tokens.
// ═══════════════════════════════════════════════════════════════════════════════

const T = {
  // ── Section spacing ────────────────────────────────────────────────────────
  padV:       120,    // top / bottom padding (px)
  padH:       28,     // left / right padding (px)
  sectionGap: 28,     // vertical gap between upper ↔ lower row

  // ── Upper row ──────────────────────────────────────────────────────────────
  upperGap: 32,       // gap between left column and CTA button

  // ── Lower row ──────────────────────────────────────────────────────────────
  lowerGap: 28,
  imageH:   480,     // image / lower-row height (px)

  // ── Quote ──────────────────────────────────────────────────────────────────
  // Static fallback gradient shown immediately while WebGL canvas warms up
  quoteFallback: 'linear-gradient(117.15deg, #1C0B05 15.67%, #C65732 41.27%, #74331D 69.14%, #000000 82.62%)',
  // How often (ms) the hidden WebGL canvas is sampled via toDataURL()
  quoteRefreshMs: 50,

  // ── Image frame ────────────────────────────────────────────────────────────
  imageRadius: 2,

  // ── Feature items ──────────────────────────────────────────────────────────
  featureGap:    32,   // gap between feature rows
  featureItemGap: 12,  // gap inside one feature (badge → title → body)

  // Feature number badge (24 × 24 px)
  featBadgeSize:   24,
  featBadgeRadius: 4,
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// ── CONTENT ───────────────────────────────────────────────────────────────────
// Edit text, links, and image path here. Never touch the JSX below.
// ═══════════════════════════════════════════════════════════════════════════════

const HEADING = 'What SixDX is'

const DESCRIPTION_PRIMARY =
  'We are the arm of SixD Engineering a company that has spent the last twenty years inside the heaviest end of industry, working with the operators, engineers, and HSE teams.'

const DESCRIPTION_SECONDARY =
  'We make photorealistic 3D visualisation, animation, and training films for industrial, architecture, and product-design clients.'

const CTA_LABEL = 'Explore SixD'
const CTA_HREF  = 'https://www.sixd.co.uk'   // ← change to real destination

const QUOTE =
  '"We don\'t bring technology to your plant. We bring your plant\'s intelligence back to you."'

// TODO: download this to /public/images/about-image.webp and swap the src.
// Figma CDN URL expires ~7 days from when the design was last opened.
const ABOUT_IMAGE_SRC = 'https://www.figma.com/api/mcp/asset/a633e2b7-f354-4253-9e5a-c8ec057dc016'
const ABOUT_IMAGE_ALT = 'SixDX industrial visualisation reference'

const FEATURES = [
  {
    number: '01',
    title:  'Modelled, not imagined',
    body:   'Every environment is built from your site documentation, P&IDs, and technical drawings. Nothing is approximated for the camera.',
  },
  {
    number: '02',
    title:  'Cinematic render standards',
    body:   'Every module is produced with multi-pass lighting and physically based materials. No asset-library shortcuts. No stock environments.',
  },
  {
    number: '03',
    title:  'Built to be defensible.',
    body:   'Every deliverable is engineered for floor use, HSE review, and compliance audit. A training film that cannot survive scrutiny is not a training film.',
  },
] as const

// ═══════════════════════════════════════════════════════════════════════════════
// ── INLINE STYLE HELPERS ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const s = {
  section: {
    background:    colors.white,
    padding:       `${T.padV}px ${T.padH}px`,
    display:       'flex',
    flexDirection: 'column',
    gap:           T.sectionGap,
    width:         '100%',
    boxSizing:     'border-box',
  } satisfies CSSProperties,

  // ── Upper row ──────────────────────────────────────────────────────────────
  upperRow: {
    display:    'flex',
    gap:        T.upperGap,
    alignItems: 'flex-start',
    width:      '100%',
  } satisfies CSSProperties,

  upperLeft: {
    flex:          '1 0 0',
    display:       'flex',
    flexDirection: 'column',
    gap:           24,
    minWidth:      0,
  } satisfies CSSProperties,

  heading: {
    ...textStyles.h2,
    color: colors.ink,
  } satisfies CSSProperties,

  descriptionWrap: {
    display:       'flex',
    flexDirection: 'column',
    gap:           16,
    maxWidth:      800,
    width:         '100%',
  } satisfies CSSProperties,

  // h3 token = HN 36px -3% lh 1
  bodyLg: {
    ...textStyles.h3,
    color: colors.ink,
  } satisfies CSSProperties,

  // h4 token = HN 22.65px -3% lh 1.32, with 60% opacity + custom lh
  bodyMd: {
    ...textStyles.h4,
    lineHeight: 1.2,
    color:      colors.ink,
    opacity:    0.6,
    maxWidth:   600,
  } satisfies CSSProperties,

  // ── Lower row ──────────────────────────────────────────────────────────────
  lowerRow: {
    display:    'flex',
    gap:        T.lowerGap,
    alignItems: 'flex-end',
    width:      '100%',
  } satisfies CSSProperties,

  // ── Quote ──────────────────────────────────────────────────────────────────
  quoteCol: {
    flex:           '1 0 0',
    minWidth:       0,
    height:         T.imageH,
    display:        'flex',
    flexDirection:  'column',
    justifyContent: 'flex-end',
    position:       'relative',   // stacking context for the hidden canvas
  } satisfies CSSProperties,

  // Hidden canvas — same absolute position as quoteCol, supplies WebGL texture
  quoteCanvas: {
    position:      'absolute',
    inset:         0,
    opacity:       0,
    pointerEvents: 'none',
  } satisfies CSSProperties,

  // Quote text — h3 style, background-image set dynamically from WebGL canvas
  quote: {
    ...textStyles.h3,
    position:            'relative',  // above the hidden canvas
    backgroundSize:      'cover',
    backgroundPosition:  'center',
    WebkitBackgroundClip: 'text',
    backgroundClip:      'text',
    WebkitTextFillColor: 'transparent',
    color:               'transparent',
  } satisfies CSSProperties,

  // ── Image frame ────────────────────────────────────────────────────────────
  imageFrame: {
    flex:         '1 0 0',
    height:       T.imageH,
    minWidth:     0,
    borderRadius: T.imageRadius,
    position:     'relative',
    overflow:     'hidden',
    background:   colors.bgDark,
  } satisfies CSSProperties,

  imageEl: {
    position:     'absolute',
    inset:        0,
    width:        '100%',
    height:       '100%',
    objectFit:    'cover',
    mixBlendMode: 'hard-light',
    borderRadius: T.imageRadius,
  } satisfies CSSProperties,

  // ── Features ───────────────────────────────────────────────────────────────
  featuresCol: {
    flex:           '1 0 0',
    minWidth:       0,
    display:        'flex',
    flexDirection:  'column',
    gap:            T.featureGap,
    justifyContent: 'center',
  } satisfies CSSProperties,

  featureItem: {
    display:       'flex',
    flexDirection: 'column',
    gap:           T.featureItemGap,
  } satisfies CSSProperties,

  featBadge: {
    width:          T.featBadgeSize,
    height:         T.featBadgeSize,
    borderRadius:   T.featBadgeRadius,
    background:     colors.ink05,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  } satisfies CSSProperties,

  // label token = HN 14px -1% lh 1.28
  featNum: {
    ...textStyles.label,
    color: colors.ink,
  } satisfies CSSProperties,

  // h4 token = HN 22.65px -3% lh 1.32
  featTitle: {
    ...textStyles.h4,
    lineHeight: 1,
    color:      colors.ink,
  } satisfies CSSProperties,

  // label token at 50% opacity
  featBody: {
    ...textStyles.label,
    color:   colors.ink,
    opacity: 0.5,
  } satisfies CSSProperties,
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── COMPONENT ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function AboutSection() {
  // ── Gradient config — drives both WebGL canvases + the controls panel ─────
  // Initialised from localStorage so settings survive page refresh.
  const [gradientConfig, setGradientConfig] = useState<GradientConfig>(loadGradientConfig)

  // Refs for the WebGL quote text gradient
  const quoteCanvasRef = useRef<HTMLCanvasElement>(null)
  const quoteTextRef   = useRef<HTMLParagraphElement>(null)

  // ── Pipe hidden canvas → quote text background-image ──────────────────────
  // Runs at T.quoteRefreshMs (20fps) — plenty smooth for a slow gradient.
  // The fallback gradient is set immediately so text is never invisible.
  useEffect(() => {
    const el = quoteTextRef.current
    if (!el) return

    // Immediate fallback — static gradient until WebGL canvas is ready
    el.style.backgroundImage = T.quoteFallback

    // Small delay to let GradientCanvas finish WebGL init + first render
    const warmup = setTimeout(() => {
      const canvas = quoteCanvasRef.current
      if (!canvas || canvas.width === 0 || canvas.height === 0) return

      let raf: number
      let lastUpdate = 0

      const tick = (now: number) => {
        if (now - lastUpdate > T.quoteRefreshMs) {
          // JPEG at 70% — fast encode, imperceptible quality loss on gradient
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
          el.style.backgroundImage = `url(${dataUrl})`
          lastUpdate = now
        }
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)

      return () => cancelAnimationFrame(raf)
    }, 300)

    return () => clearTimeout(warmup)
  }, [])

  return (
    <section aria-label="About SixDX" data-theme="light" style={s.section}>

      {/* ── UPPER ROW: heading + description  |  CTA button ──────────────── */}
      <div style={s.upperRow}>

        <div style={s.upperLeft}>
          <h2 style={s.heading}>{HEADING}</h2>

          <div style={s.descriptionWrap}>
            <p style={s.bodyLg}>{DESCRIPTION_PRIMARY}</p>
            <p style={s.bodyMd}>{DESCRIPTION_SECONDARY}</p>
          </div>
        </div>

        {/* Brand-coloured primary button — uses the shared PrimaryButton component */}
        <PrimaryButton
          label={CTA_LABEL}
          href={CTA_HREF}
          variant="brand"
          target="_blank"
          rel="noopener noreferrer"
        />

      </div>

      {/* ── LOWER ROW: quote  |  image  |  features ──────────────────────── */}
      <div style={s.lowerRow}>

        {/* ── Quote column ────────────────────────────────────────────────── */}
        {/* Hidden GradientCanvas positioned behind quote text.
            Its WebGL output is sampled via toDataURL() and applied as
            background-image with background-clip:text to animate the gradient.
            Same speed as image canvas → both flow in perfect sync. */}
        <div style={s.quoteCol}>
          <GradientCanvas
            ref={quoteCanvasRef}
            config={gradientConfig}
            style={s.quoteCanvas}
          />
          <p ref={quoteTextRef} style={s.quote}>{QUOTE}</p>
        </div>

        {/* ── Image frame — WebGL canvas fills the background ─────────────── */}
        <div style={s.imageFrame} aria-hidden="true">
          {/* Layer 1 — Magic rings */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <MagicRings
              color="#CC4D22"
              colorTwo="#FF6A35"
              ringCount={7}
              attenuation={8}
              lineThickness={2.5}
              baseRadius={0.28}
              radiusStep={0.11}
              scaleRate={0.12}
              speed={0.7}
              opacity={0.9}
              noiseAmount={0.05}
              ringGap={1.4}
              followMouse
              mouseInfluence={0.12}
              hoverScale={1.15}
              parallax={0.04}
              clickBurst
            />
          </div>
          {/* Layer 2 — photo sits on top with normal blend so rings stay hidden under it */}
          <img
            src={ABOUT_IMAGE_SRC}
            alt={ABOUT_IMAGE_ALT}
            style={{ ...s.imageEl, mixBlendMode: 'normal', zIndex: 1 }}
          />
        </div>

        {/* ── Features list ───────────────────────────────────────────────── */}
        <div style={s.featuresCol}>
          {FEATURES.map((feat) => (
            <div key={feat.number} style={s.featureItem}>
              <div style={s.featBadge} aria-hidden="true">
                <p style={s.featNum}>{feat.number}</p>
              </div>
              <p style={s.featTitle}>{feat.title}</p>
              <p style={s.featBody}>{feat.body}</p>
            </div>
          ))}
        </div>

      </div>

      {/* Screen-reader content */}
      <div className="sr-only">
        <blockquote>{QUOTE}</blockquote>
      </div>

      {/* ── Gradient controls panel (fixed overlay, toggled via GL pill) ── */}
      <GradientControls
        config={gradientConfig}
        onChange={setGradientConfig}
      />

    </section>
  )
}
