// ─── WHAT WE CREATE — SixDX ───────────────────────────────────────────────────
// Figma node : 323:193  "Services Section"
// Mechanic   : Terminal Industries sticky-scroll (panels wipe via clip-path)
//
// Exact Figma measurements used throughout:
//   Section padding   : 100px top/bottom, 28px left/right, gap 60px
//   Heading           : Marund 60px / -3.6px tracking / 0.9 lh / #1C0B05
//   Description       : HN 22.65px / -0.6795px / lh 1.2 / 60% opacity / w 584px
//   Image frame       : full width, 617px (Figma static) → flex:1 in sticky
//   Details gap       : 24px between image and details row
//   Service title     : HN 22.65px / -0.6795px / lh 1 / #1C0B05
//   Service desc      : HN 14px / -0.14px / lh 1.28 / 50% opacity / w 325px
//
// To add a service: append an object to SERVICES. Everything auto-adjusts.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
// GSAP only — no ScrollTrigger. Progress driven by native scroll events (Lenis
// calls window.scrollTo() each frame, which fires native 'scroll' on window).
import { gsap } from '../../animations/gsap.config'
import { colors, textStyles } from '../../styles/tokens'

// ── Section-local aliases (non-token values stay here) ────────────────────────
const T = {
  border : colors.ink10,
  trackBg: colors.white25,
  overlay: colors.overlay50,
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// ── CONTENT  — edit only this block
// ═══════════════════════════════════════════════════════════════════════════════
export interface ServiceItem {
  /** Displayed at 22.65 px HN — left side of the details row */
  title: string
  /** Split into lines for the clip-mask animation — right side of details row */
  bodyLines: string[]
  media: {
    type   : 'image' | 'video'
    src    : string
    alt?   : string
    poster?: string
  }
}

// Figma CDN asset — replace with /public/images/ before launch
const IMG_1 = 'https://www.figma.com/api/mcp/asset/d1b0dc8d-bf34-4f06-844b-4028871bada0'
const IMG_2 = 'https://images.unsplash.com/photo-1773332585815-f106a5d6ed6c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
const IMG_3 = 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

export const SERVICES: ServiceItem[] = [
  {
    title: 'SOP-based modules',
    bodyLines: [
      'Every environment is built from your site documentation, P&IDs, and technical drawings. Nothing is approximated for the camera.',
    ],
    media: { type: 'image', src: IMG_1, alt: 'SOP-based modules' },
  },
  {
    title: 'Incident reconstruction',
    bodyLines: [
      'Every environment is built from your site documentation, P&IDs, and technical drawings. Nothing is approximated for the camera.',
    ],
    media: { type: 'image', src: IMG_2, alt: 'Incident reconstruction' },
  },
  {
    title: 'Plant familiarisation walkthrough',
    bodyLines: [
      'Every environment is built from your site documentation, P&IDs, and technical drawings. Nothing is approximated for the camera.  ',
    ],
    media: { type: 'image', src: IMG_3, alt: 'Plant familiarisation' },
  },
  /* ← Add more services here */
]

// ═══════════════════════════════════════════════════════════════════════════════
// ── COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function WhatWeCreateSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const N = SERVICES.length

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    // ── DOM queries ────────────────────────────────────────────────────────
    // Clip-path goes on the PANEL (whole panel including details row).
    // This way image AND text wipe up together, exactly tracking scroll.
    const panels = [...section.querySelectorAll<HTMLDivElement>('[data-panel]')]
    const fills  = [...section.querySelectorAll<HTMLDivElement>('[data-fill]')]

    // quickSetter for fills — zero-tween, per-frame precision
    fills.forEach(f => gsap.set(f, { transformOrigin: 'top', scaleY: 0 }))
    const setFill = fills.map(f => gsap.quickSetter(f, 'scaleY') as (v: number) => void)

    // ── Initial state ──────────────────────────────────────────────────────
    // Panel 0 is the permanent base layer — always fully visible.
    // Panels 1…N are stacked on top in z-order, hidden above (top inset 100%).
    panels[0].style.clipPath = 'inset(0% 0 0% 0)'
    for (let i = 1; i < N; i++) panels[i].style.clipPath = 'inset(100% 0 0% 0)'

    // Smooth-step easing for the clip scrub (S-curve, feels physical)
    const ss = (t: number) => t * t * (3 - 2 * t)

    // ── Scroll driver ──────────────────────────────────────────────────────
    // Every property — clip-path AND fill — is a pure function of scroll
    // position. No tweens, no thresholds, no band-change events.
    const handleScroll = () => {
      const rect       = section.getBoundingClientRect()
      const scrollable = section.offsetHeight - window.innerHeight
      if (scrollable <= 0 || rect.top > 0) return

      const progress = Math.max(0, Math.min(1, -rect.top / scrollable))
      const raw      = progress * N
      const band     = Math.min(Math.floor(raw), N - 1)
      const sub      = band === N - 1 ? Math.min(raw - (N - 1), 1) : raw - band

      // Each panel's clip-path is computed fresh every frame:
      //   panel < band  → fully revealed (was already wiped in)
      //   panel = band  → wiping DOWN from top, top inset shrinks as sub → 1
      //   panel > band  → still hidden above (top inset 100%)
      for (let i = 0; i < N; i++) {
        if (i < band) {
          panels[i].style.clipPath = 'inset(0% 0 0% 0)'
        } else if (i === band) {
          // Panel 0 is the base, never clipped. Panels 1+ reveal top-to-bottom.
          if (i === 0) {
            panels[0].style.clipPath = 'inset(0% 0 0% 0)'
          } else {
            const pct = ((1 - ss(sub)) * 100).toFixed(2)
            panels[i].style.clipPath = `inset(${pct}% 0 0% 0)`
          }
        } else {
          panels[i].style.clipPath = 'inset(100% 0 0% 0)'
        }
      }

      // Fill bars follow the same logic — past panels full, current tracks sub
      for (let i = 0; i < N; i++) {
        if (i < band)       setFill[i](1)
        else if (i === band) setFill[i](sub)
        else                 setFill[i](0)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    const rafId = requestAnimationFrame(handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(rafId)
      fills.forEach(f => gsap.killTweensOf(f))
    }
  }, [])

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════
          STATIC HEADER  (Figma 323:194 — scrolls normally, not sticky)
          padding: 100px 28px  /  flex row  /  space-between
      ══════════════════════════════════════════════════════════════════════ */}
      <div data-theme="light" style={{
        background    : colors.white,
        padding       : '100px 28px',
        display       : 'flex',
        alignItems    : 'flex-start',
        justifyContent: 'space-between',
        width         : '100%',
        boxSizing     : 'border-box',
        borderBottom  : `1px solid ${T.border}`,
      }}>
        {/* Heading — h2 token */}
        <h2 style={{
          ...textStyles.h2,
          color     : colors.ink,
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}>
          What We Create
        </h2>

        {/* Description — h4 token at 60% opacity */}
        <p style={{
          ...textStyles.h4,
          lineHeight: 1.2,
          color      : colors.ink,
          opacity    : 0.6,
          width      : 584,
          flexShrink : 0,
        }}>
          Training is not a single format. Different failures need different kinds of film.
          The work below describes the six production types SixDX builds — each one engineered
          for a specific learning outcome, each one delivered to the same cinematic standard.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          STICKY SCROLL  —  (N + 1) × 100svh of scroll space
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={sectionRef}
        aria-label="What We Create — services"
        style={{ position: 'relative', height: `${(N + 1) * 100}svh` }}
      >
        {/* Sticky wrapper — stays at top:0, height 100svh */}
        <div style={{ position: 'sticky', top: 0, height: '100svh', overflow: 'hidden' }}>

          {SERVICES.map((item, i) => (
            <div
              key={i}
              data-panel={i}
              style={{
                position     : 'absolute',
                inset        : 0,
                display      : 'flex',
                flexDirection: 'column',
                // Ascending z-index: panel 0 is the base, panel N-1 sits on top.
                // Clip-path on this element controls how much of the panel is visible.
                zIndex       : i + 1,
                willChange   : 'clip-path',
              }}
            >

              {/* ── IMAGE ────────────────────────────────────────────────── */}
              <div
                style={{
                  flex    : 1,
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#0a0a0a',
                }}
              >
                {item.media.type === 'video' ? (
                  <video
                    src={item.media.src}
                    poster={item.media.poster}
                    autoPlay muted loop playsInline
                    aria-hidden="true"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <img
                    src={item.media.src}
                    alt={item.media.alt ?? item.title}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    style={{
                      position  : 'absolute',
                      inset     : 0,
                      width     : '100%',
                      height    : '100%',
                      objectFit : 'cover',
                      objectPosition: 'bottom',  // matches Figma object-bottom
                    }}
                  />
                )}

                {/* Dark overlay */}
                <div aria-hidden="true" style={{
                  position: 'absolute', inset: 0,
                  background: T.overlay,  // colors.overlay50
                  zIndex: 1,
                }} />

                {/* Progress sidebar — left edge, vertically centred */}
                <div style={{
                  position : 'absolute',
                  left     : 'clamp(1.5rem, 4vw, 4.5rem)',
                  top      : '50%',
                  transform: 'translateY(-50%)',
                  display  : 'flex',
                  alignItems: 'flex-start',
                  gap      : '0.6rem',
                  zIndex   : 2,
                }}>
                  {/* Track + fill */}
                  <div style={{
                    width       : 2,
                    height      : 193,
                    background  : T.trackBg,   // colors.white25
                    borderRadius: 2,
                    position    : 'relative',
                    overflow    : 'hidden',
                  }}>
                    <div
                      data-fill={i}
                      style={{
                        position       : 'absolute',
                        inset          : 0,
                        background     : colors.white,
                        transform      : 'scaleY(0)',
                        transformOrigin: 'top',
                        borderRadius   : 2,
                        willChange     : 'transform',
                      }}
                    />
                  </div>

                </div>
              </div>

              {/* ── DETAILS ROW (Figma 323:200) ────────────────────────── */}
              {/* padding 24px top (matches 24px gap in Figma), 28px sides   */}
              <div style={{
                flexShrink    : 0,
                display       : 'flex',
                alignItems    : 'flex-start',
                justifyContent: 'space-between',
                padding       : '24px 28px',
                background    : colors.white,
                borderTop     : `1px solid ${T.border}`,
                boxSizing     : 'border-box',
              }}>

                {/* Service title — h4 token */}
                <p style={{
                  ...textStyles.h4,
                  lineHeight: 1,
                  color     : colors.ink,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {item.title}
                </p>

                {/* Description — label token at 50% opacity */}
                <p style={{
                  ...textStyles.label,
                  color    : colors.ink,
                  opacity  : 0.5,
                  width    : 325,
                  flexShrink: 0,
                }}>
                  {item.bodyLines.join(' ')}
                </p>

              </div>
            </div>
          ))}

        </div>
      </section>
    </>
  )
}
