// ─── STACK SECTION — SixDX ───────────────────────────────────────────────────
// Two-phase scroll-pinned section:
//
// Phase 1 (scrub 0 → 1):  "taking  [▓▓▓▓▓]  precision  forward"
//   The image div grows from 0 → 100vw, pushing the words apart.
//   As it expands the words colour-shift to white then disappear.
//
// Phase 2 (scrub 1.1 → ~1.8):  Stats_Container appears
//   The image div is now full-screen. The Stats_Container (Figma 323:72)
//   fades in as children of that div: heading → subtext → 3 stat cards.
//
// The Stats_Container is the CHILD of the image div — it is clipped
// while the div is still expanding (overflow:hidden) and only becomes
// readable once the div fills the viewport.
//
// Stat numbers are animated by <CountUp> (once, IntersectionObserver-triggered).
// The overflow:hidden clip keeps them invisible until the div is full-width,
// so CountUp fires at exactly the right moment.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { gsap, ScrollTrigger } from '../../animations/gsap.config'
import CountUp from '../ui/CountUp'
import type { CountUpHandle } from '../ui/CountUp'
import { fonts, colors } from '../../styles/tokens'

const STACK_IMAGE = '/images/stats-section.webp'

type StackSectionStyle = CSSProperties & {
  '--stack-progress': number
}

// ─── CONTENT — edit freely ───────────────────────────────────────────────────
// The headline words that bracket the expanding image
const LEFT_WORDS  = ['Precision', 'driven']  // rendered left of the image
const RIGHT_WORD  = ['Forward', 'Motion']                // rendered right of the image

const HEADING =
  'Standard industrial training has not kept pace with the environments it is meant to prepare people for.'

const SUBTEXT =
  'A flat animation, a screen-recorded walkthrough, a stock-footage montage. None of it communicates the weight of a pressurised valve, the heat of a furnace floor, or the consequence of a wrong sequence inside a confined space.'

// Split into structured data so CountUp can animate the numeric part.
// Customise CountUp props per stat via the optional `countUpProps` key.
const STATS: {
  value:  number
  suffix: string
  prefix?: string
  label:  string
  /** Override any CountUp prop for this specific stat */
  countUpProps?: Partial<{
    duration:  number
    delay:     number
    decimals:  number
    ease:      string
    threshold: number
  }>
}[] = [
  {
    value:  68,
    suffix: '%',
    label:  'Improvement in first-time procedure retention versus slide-based training.',
    countUpProps: { duration: 1.4, ease: 'power2.out' },
  },
  {
    value:  40,
    suffix: '%',
    label:  'Reduction in refresher training cycles over the first twelve months of deployment.',
    countUpProps: { duration: 1.2, ease: 'power2.out' },
  },
  {
    value:  0,
    suffix: '%',
    label:  'Compliance rejections across HSE-reviewed modules delivered to date.',
    countUpProps: { duration: 0.6, ease: 'power2.out' },
  },
]
// ─────────────────────────────────────────────────────────────────────────────

export default function StackSection() {
  // ── Phase 1 refs ───────────────────────────────────────────────────────────
  const sectionRef     = useRef<HTMLElement>(null)
  const whiteLayerRef  = useRef<HTMLDivElement>(null)
  // Dark sentinel — display:none during phase 1 (white bg), display:block during
  // phase 2 (full-screen image). The Navbar's dark IntersectionObserver watches
  // it, so dark wins over the section's data-theme="light" when stats are active.
  const darkSentinelRef = useRef<HTMLDivElement>(null)
  const h2Ref         = useRef<HTMLHeadingElement>(null)
  const leftTextRef   = useRef<HTMLDivElement>(null)
  const rightTextRef  = useRef<HTMLDivElement>(null)

  // ── Phase 2 refs (Stats_Container children) ────────────────────────────────
  const headingRef    = useRef<HTMLParagraphElement>(null)
  const subtextRef    = useRef<HTMLParagraphElement>(null)
  const statRefs      = useRef<(HTMLDivElement | null)[]>([])
  const countUpRefs   = useRef<(CountUpHandle | null)[]>([])

  useEffect(() => {
    const section     = sectionRef.current
    const whiteLayer  = whiteLayerRef.current
    const h2Container = h2Ref.current
    const leftText    = leftTextRef.current
    const rightText   = rightTextRef.current
    const heading     = headingRef.current
    const subtext     = subtextRef.current

    if (!section || !whiteLayer || !h2Container || !leftText || !rightText || !heading || !subtext) return

    // Query stat cards directly from the DOM — bypasses any React ref array
    // quirks and guarantees we always get all 3 cards.
    const statCards = [...section.querySelectorAll<HTMLDivElement>('[data-stat-card]')]

    // Preload the background image so it's ready when the div expands
    const preload = new Image()
    preload.onload = () => ScrollTrigger.refresh()
    preload.src = STACK_IMAGE

    const matchMedia = gsap.matchMedia()
    const context = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (reduceMotion) {
        section.style.setProperty('--stack-progress', '1')
        gsap.set(whiteLayer, { autoAlpha: 1 })
        gsap.set([leftText, rightText], { autoAlpha: 0 })
        gsap.set([heading, subtext, ...stats], { autoAlpha: 1 })
        return
      }

      matchMedia.add(
        {
          desktop: '(min-width: 768px)',
          mobile:  '(max-width: 767px)',
        },
        () => {
          section.style.setProperty('--stack-progress', '0')

          // ── Phase 1 initial state ──────────────────────────────────────────
          gsap.set([leftText, rightText], {
            autoAlpha: 1,
            x: 0,
            willChange: 'transform, opacity',
          })
          gsap.set(whiteLayer, { autoAlpha: 1, willChange: 'opacity' })

          // ── Phase 2 initial state (all hidden) ────────────────────────────
          gsap.set([heading, subtext, ...statCards], { autoAlpha: 0, y: 30 })

          // ── Timeline ─────────────────────────────────────────────────────
          // Extended to '+=560%' to give room for both phases + a hold at end.
          // Phase 1 tweens run at scrub positions 0 → 1.
          // Phase 2 tweens run at scrub positions 1.1 → ~1.7.
          // A dummy hold tween at 2.5 extends total duration so the last stat
          // lands at ~65% of the scroll range instead of the very end.
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger:             section,
              start:               'top top',
              end:                 '+=560%',
              pin:                 true,
              scrub:               1,
              anticipatePin:       1,
              refreshPriority:     -1,
              invalidateOnRefresh: true,
              onUpdate: () => {
                const sentinel = darkSentinelRef.current
                if (!sentinel) return
                // Phase 1 (image expanding): sentinel hidden → section's
                // data-theme="light" wins → light nav.
                // Phase 2 (full-screen image + stats): sentinel shown →
                // dark observer fires → dark wins.
                sentinel.style.display = timeline.time() >= 1 ? 'block' : 'none'
              },
              onLeaveBack: () => {
                // Reset sentinel when scrolling back above the section
                if (darkSentinelRef.current) darkSentinelRef.current.style.display = 'none'
              },
            },
          })

          // ── PHASE 1: image expands ─────────────────────────────────────────
          timeline.to(section,     { '--stack-progress': 1, ease: 'power1.inOut', duration: 1 }, 0)
          timeline.to(h2Container, {
            x: () => -(leftText.getBoundingClientRect().width - rightText.getBoundingClientRect().width) / 2,
            ease: 'power1.inOut',
            duration: 1,
          }, 0)
          timeline.to([leftText, rightText], { color: colors.white, ease: 'power1.inOut', duration: 1 }, 0)
          // Quick fade just after image fully covers screen
          timeline.to([leftText, rightText], { autoAlpha: 0, ease: 'none', duration: 0.05 }, 1.02)

          // ── PHASE 2: Stats_Container appears ──────────────────────────────
          // fromTo so scrub reversal always returns to correct hidden state.
          // Stats shifted to 1.26 + i*0.11 (was 1.36 + i*0.13) so last stat
          // ends at ~1.64. A hold tween at 2.5 extends the timeline to ~2.5s,
          // placing the last stat at 65% of scroll range (not 91%).
          timeline.fromTo(heading, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, ease: 'power3.out', duration: 0.18 }, 1.12)
          timeline.fromTo(subtext, { autoAlpha: 0, y: 30 }, { autoAlpha: 0.6, y: 0, ease: 'power3.out', duration: 0.16 }, 1.22)
          statCards.forEach((card, i) => {
            timeline.fromTo(
              card,
              { autoAlpha: 0, y: 24, scale: 0.96 },
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                ease: 'power3.out',
                duration: 0.16,
                onComplete: () => countUpRefs.current[i]?.start(),
              },
              1.26 + i * 0.11,
            )
          })

          // Extend the timeline's total duration to 2.5 s so the last stat card
          // lands at ~60% of the scroll range instead of the very end (100%).
          // addLabel at a position beyond current totalDuration is the correct
          // GSAP API for padding a timeline — it cannot be optimised away.
          timeline.addLabel('hold', 2.5)

          return () => { timeline.kill() }
        },
      )
    }, section)

    return () => {
      matchMedia.revert()
      context.revert()
      preload.onload = null
      ScrollTrigger.refresh()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-label="Industrial training outcomes"
      data-theme="light"
      className="relative h-screen overflow-hidden bg-black"
      style={{ '--stack-progress': 0 } as StackSectionStyle}
    >
      {/* Dark sentinel — invisible, observed by Navbar's dark IntersectionObserver.
          display:none during phase 1 (white bg → light nav).
          display:block during phase 2 (full-screen image → dark nav wins). */}
      <div
        ref={darkSentinelRef}
        data-theme="dark"
        aria-hidden="true"
        style={{
          position:      'absolute',
          inset:         0,
          display:       'none',
          pointerEvents: 'none',
          opacity:       0,
          zIndex:        -1,
        }}
      />
      <div className="relative h-screen w-full overflow-hidden">

        {/* White base layer — fades as image expands (phase 1) */}
        <div
          ref={whiteLayerRef}
          aria-hidden="true"
          className="absolute inset-0 z-10 bg-white"
        />

        {/* "taking  [image]  precision  forward" row */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-visible text-[#15100f]"
          style={{ fontFamily: fonts.hn }}
        >
          <h2
            ref={h2Ref}
            className="relative z-30 m-0 flex w-max items-center justify-center text-[30px] font-normal leading-none md:text-[36px]"
            style={{ gap: `max(0px, calc((1 - var(--stack-progress)) * 0.375rem))` }}
          >
            {/* Left words — edit LEFT_WORDS at the top of this file */}
            <div
              ref={leftTextRef}
              aria-label="Left text"
              className="flex items-center gap-3 whitespace-nowrap"
            >
              {LEFT_WORDS.map(w => <span key={w}>{w}</span>)}
            </div>

            {/* ── Expanding image div — Stats_Container lives here ────────────
                height: 100svh  →  full-height vertical strip growing 0 → 100vw.
                overflow:hidden clips Stats_Container while still expanding;
                once width = 100vw the section is fully covered and stats appear.
                CountUp's IntersectionObserver fires naturally at this point
                because the clipped element only becomes "visible" once the
                parent reaches full width.
                ─────────────────────────────────────────────────────────────── */}
            <div
              aria-label="Stats section"
              className="relative shrink-0 overflow-hidden bg-cover bg-center bg-no-repeat"
              style={{
                width:           `calc(var(--stack-progress) * 100vw)`,
                height:          '100svh',
                backgroundImage: `url("${STACK_IMAGE}")`,
              }}
            >
              {/* Dark gradient overlay — left side readable, right fades */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.50) 40%, rgba(0,0,0,0.16) 100%)',
                }}
              />

              {/* ── Stats_Container (Figma 323:72) ──────────────────────────
                  Positioned left, vertically centred within the image div.
                  All children start hidden (autoAlpha:0) and are animated
                  in during phase 2 once the image div covers the viewport.
                  ─────────────────────────────────────────────────────────── */}
              <div
                className="absolute inset-0 flex flex-col justify-center"
                style={{ padding: '100px 28px', maxWidth: 640 }}
              >
                {/* Heading */}
                <p
                  ref={headingRef}
                  style={{
                    fontFamily:    fonts.marund,
                    fontSize:      'clamp(1.75rem, 2.5vw, 2.25rem)',
                    letterSpacing: '-0.03em',
                    lineHeight:    1.1,
                    color:         colors.white,
                    margin:        0,
                    marginBottom:  24,
                  }}
                >
                  {HEADING}
                </p>

                {/* Subtext */}
                <p
                  ref={subtextRef}
                  style={{
                    fontFamily:   fonts.hn,
                    fontSize:     14,
                    lineHeight:   1.4,
                    color:        colors.white,
                    maxWidth:     560,
                    margin:       0,
                    marginBottom: 24,
                  }}
                >
                  {SUBTEXT}
                </p>

                {/* Stat cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {STATS.map((stat, i) => (
                    <div
                      key={i}
                      data-stat-card
                      ref={(el) => { statRefs.current[i] = el }}
                      style={{
                        backdropFilter:       'blur(6px)',
                        WebkitBackdropFilter: 'blur(6px)',
                        background:           colors.white08,
                        borderRadius:         2,
                        padding:              12,
                        display:              'flex',
                        flexDirection:        'column',
                        gap:                  8,
                      }}
                    >
                      {/* Animated stat number — starts only after card entrance finishes */}
                      <CountUp
                        ref={(el) => { countUpRefs.current[i] = el }}
                        value={stat.value}
                        suffix={stat.suffix}
                        prefix={stat.prefix}
                        {...stat.countUpProps}
                        style={{
                          fontFamily:    fonts.marund,
                          fontSize:      22.65,
                          letterSpacing: '-0.03em',
                          lineHeight:    1,
                          color:         colors.white,
                        }}
                      />

                      {/* Stat label */}
                      <p
                        style={{
                          fontFamily: fonts.hn,
                          fontSize:   14,
                          lineHeight: 1.4,
                          color:      colors.white60,
                          maxWidth:   560,
                          margin:     0,
                        }}
                      >
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right word */}
            <div
              ref={rightTextRef}
              aria-label="Right text"
              className="flex items-center gap-3 whitespace-nowrap"
            >
              {RIGHT_WORD.map(w => <span key={w}>{w}</span>)}
            </div>
          </h2>
        </div>

        {/* Screen-reader accessible content */}
        <div className="sr-only">
          <h2>Standard industrial training has not kept pace.</h2>
          <p>
            Standard industrial training has not kept pace with the environments it is meant to prepare people for.
          </p>
          <ul>
            <li>68% improvement in first-time procedure retention.</li>
            <li>40% reduction in refresher training cycles.</li>
            <li>0% compliance rejections across reviewed modules.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
