// ─── HERO SECTION — SixDX ────────────────────────────────────────────────────
// Full-screen video hero. Video currentTime is driven by GSAP ScrollTrigger
// scrub — scroll down = video plays frame-by-frame (Apple-style).
//
// Text interaction: per-character opacity stagger (toptier.relats.com style).
// Each paragraph is split into individual <span> characters.
// GSAP animates opacity 0→1 (enter) and 1→0 (exit) with a left-to-right
// stagger as you scroll. No line measurement, no overflow masks needed.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../animations/gsap.config'
import heroVideo from '../../assets/video/cosmos.mp4'
import { fonts, colors } from '../../styles/tokens'

// ─── CONTENT — edit freely ────────────────────────────────────────────────────
const PARAGRAPHS = [
  'Every critical asset in your facility carries intelligence no manual captures and no schematic fully represents. Until now, it had nowhere to go.',
  "25 years inside the world's most demanding plants translated into intelligence that works.",
  'This is not automation replacing expertise. This is expertise, finally made permanent.',
]
// ─────────────────────────────────────────────────────────────────────────────

// ─── TEXT STYLE — change heading appearance here ─────────────────────────────
// This is the ONLY place you need to touch to restyle the hero text.
const TEXT_STYLE: React.CSSProperties = {
  // ← fontFamily from tokens — change fonts.marund in tokens.ts to update everywhere
  fontFamily:    fonts.marund,

  // Font size — clamp(min, viewport-relative, max)
  // Matches h1 token scale but with a slightly tighter max for hero balance
  fontSize:      'clamp(2rem, 4.2vw, 3.75rem)',

  // Letter spacing — negative = tighter, positive = wider
  letterSpacing: '-0.04em',

  // Line height
  lineHeight:    1.05,

  fontStyle:     'normal',
  fontWeight:    'normal',
  // ← color from tokens — change colors.white in tokens.ts to update everywhere
  color:         colors.white,

  // ── MAX WIDTH — controls the paragraph line length ────────────────────
  // '69rem' ≈ 1104px at default browser font size.
  maxWidth:      '69rem',
}
// ─────────────────────────────────────────────────────────────────────────────

// ─── ANIMATION CONFIG ────────────────────────────────────────────────────────
// Edit these values to tune the scroll rhythm.
const ANIM = {
  // How long the section stays pinned (as % of viewport height stacked on top)
  pinDuration: '+=550%',

  // Text scrub lag only. Video time is updated directly on every scroll tick.
  scrub: 0.35,

  // ── Character opacity fade timings (fraction of the 0→1 scrub timeline) ──
  // fadeIn / fadeOut: how long the opacity sweep takes for each char
  // staggerIn / staggerOut: total time spread across all chars (left→right)
  fadeIn:     0.10,
  fadeOut:    0.08,
  staggerIn:  0.07,   // enter stagger: last char starts 0.07 after first
  staggerOut: 0.04,   // exit stagger: last char starts 0.04 after first

  // ── Per-paragraph timing slots ───────────────────────────────────────────
  // enterAt: position (0–1) where chars start fading IN  (-1 = no enter)
  // exitAt:  position (0–1) where chars start fading OUT (-1 = no exit / stays visible)
  slots: [
    { enter: -1,   exit: 0.20 },   // Para 0: visible from page load, only exits
    { enter: 0.32, exit: 0.55 },   // Para 1: fades in, then out
    { enter: 0.68, exit: -1   },   // Para 2: fades in, stays visible to end
  ],

  // ── Page-load mount animation for paragraph 0 ────────────────────────────
  mountDuration: 0.5,    // opacity sweep duration per char
  mountStagger:  0.5,    // total stagger spread across all chars (seconds)
  mountDelay:    0.4,    // delay before first char starts
  mountEase:     'power2.out',
}
// ─────────────────────────────────────────────────────────────────────────────

// ─── SPLIT TEXT TO CHARS ─────────────────────────────────────────────────────
// Replaces the element's text content with per-character <span> elements.
// Returns the array of char spans — these are what GSAP animates via opacity.
//
// DOM structure produced:
//   <div paragraph>
//     <span word>                         ← inline-block; white-space:nowrap
//       <span char>E</span>               ← inline-block; will-change:opacity
//       <span char>v</span>
//       ...
//     </span>
//     (text node " ")                     ← natural word break point
//     <span word>...</span>
//   </div>
//
// Why this works:
//   - word spans are inline-block → browser wraps full words, never mid-word
//   - text-node spaces between word spans provide natural line-break points
//   - char spans are inline-block → no whitespace gap between letters
//   - will-change:opacity → GPU compositing for smooth animation
// ─────────────────────────────────────────────────────────────────────────────
function splitTextToChars(element: HTMLElement): HTMLElement[] {
  // Preserve original text so re-calling on resize doesn't lose content
  if (!element.hasAttribute('data-original')) {
    element.setAttribute('data-original', element.innerText.trim())
  }
  const text = element.getAttribute('data-original') ?? ''
  element.innerHTML = ''

  const charEls: HTMLElement[] = []
  const words = text.split(' ')

  words.forEach((word, wordIdx) => {
    const wordSpan = document.createElement('span')
    wordSpan.style.cssText = 'display:inline-block;white-space:nowrap;'

    Array.from(word).forEach((char) => {
      const charSpan = document.createElement('span')
      charSpan.style.cssText = 'display:inline-block;will-change:opacity;'
      charSpan.textContent = char
      wordSpan.appendChild(charSpan)
      charEls.push(charSpan)
    })

    element.appendChild(wordSpan)

    // Regular space text node between words — browser can break line here
    if (wordIdx < words.length - 1) {
      element.appendChild(document.createTextNode(' '))
    }
  })

  return charEls
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef   = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const textRefs   = useRef<(HTMLDivElement | null)[]>([])

  const state = useRef<{
    allChars:    HTMLElement[][]
    mountCtx:    gsap.Context | null
    scrollCtx:   gsap.Context | null
    mountTween:  gsap.core.Tween | null
    resizeTimer: number
    videoUrl:    string | null
  }>({
    allChars:    [],
    mountCtx:    null,
    scrollCtx:   null,
    mountTween:  null,
    resizeTimer: 0,
    videoUrl:    null,
  })

  useEffect(() => {
    const section = sectionRef.current
    const video   = videoRef.current
    if (!section || !video) return

    const s = state.current

    const setVideoTime = (progress: number) => {
      if (!video.duration || Number.isNaN(video.duration)) return

      const targetTime = gsap.utils.clamp(
        0,
        Math.max(video.duration - 0.001, 0),
        progress * video.duration,
      )

      if (Math.abs(video.currentTime - targetTime) > 0.001) {
        video.currentTime = targetTime
      }
    }

    // ── BUILD SCROLL TIMELINE ──────────────────────────────────────────────
    // fromTo() is used throughout so GSAP never reads the element's live
    // opacity value — both "from" and "to" are always explicit.
    const buildScrollTimeline = () => {
      s.scrollCtx?.revert()

      s.scrollCtx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start:   'top top',
            end:     ANIM.pinDuration,
            pin:     true,
            scrub:   ANIM.scrub,
            refreshPriority: 2,
            invalidateOnRefresh: true,
            fastScrollEnd: false,
            onEnter: () => {
              // Scroll timeline takes over para 0 — kill the mount tween
              s.mountTween?.kill()
              s.mountTween = null
            },
            onUpdate: (self) => setVideoTime(self.progress),
          },
        })

        // Overlay darkens subtly as video progresses
        tl.to(overlayRef.current, { opacity: 0.55, ease: 'none', duration: 1 }, 0)

        // ── Character opacity sequence ────────────────────────────────────
        ANIM.slots.forEach(({ enter, exit }, i) => {
          const chars = s.allChars[i]
          if (!chars?.length) return

          if (enter >= 0) {
            // Enter: chars stagger from transparent → opaque (left to right)
            tl.fromTo(
              chars,
              { opacity: 0 },
              {
                opacity:  1,
                ease:     'none',
                duration: ANIM.fadeIn,
                stagger:  { amount: ANIM.staggerIn, from: 'start' },
              },
              enter,
            )
          }

          if (exit >= 0) {
            // Exit: chars stagger from opaque → transparent (right to left)
            tl.fromTo(
              chars,
              { opacity: 1 },
              {
                opacity:  0,
                ease:     'none',
                duration: ANIM.fadeOut,
                stagger:  { amount: ANIM.staggerOut, from: 'end' },
              },
              exit,
            )
          }
        })
      }, section)

      ScrollTrigger.refresh()
    }

    // ── INIT ───────────────────────────────────────────────────────────────
    const init = async () => {
      await document.fonts.ready

      video.pause()
      video.preload = 'auto'

      try {
        const response = await fetch(heroVideo)
        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)
        s.videoUrl = objectUrl
        video.src = objectUrl
        video.load()
      } catch {
        video.src = heroVideo
        video.load()
      }

      // Split all paragraphs into char spans
      s.allChars = textRefs.current.map((el) =>
        el ? splitTextToChars(el) : [],
      )

      // Set initial state
      s.mountCtx?.revert()
      s.mountCtx = gsap.context(() => {
        // All chars start transparent
        s.allChars.forEach((chars) => {
          if (chars.length) gsap.set(chars, { opacity: 0 })
        })

        // Para 0 fades in on page load
        if (s.allChars[0]?.length) {
          s.mountTween = gsap.to(s.allChars[0], {
            opacity:  1,
            ease:     ANIM.mountEase,
            duration: ANIM.mountDuration,
            stagger:  { amount: ANIM.mountStagger, from: 'start' },
            delay:    ANIM.mountDelay,
          })
        }
      }, section)

      // Build scroll timeline once video duration is known
      if (video.readyState >= 1 && video.duration > 0) {
        buildScrollTimeline()
      } else {
        video.addEventListener('loadedmetadata', buildScrollTimeline, { once: true })
      }
    }

    init()

    // ── RESIZE HANDLER ─────────────────────────────────────────────────────
    // Re-split on resize because text may reflow to different line breaks.
    // Restore a sensible opacity state before rebuilding the scroll timeline.
    const onResize = () => {
      clearTimeout(s.resizeTimer)
      s.resizeTimer = window.setTimeout(() => {
        s.allChars = textRefs.current.map((el) =>
          el ? splitTextToChars(el) : [],
        )
        // Para 0 fully visible; others hidden (scrub will correct on next scroll)
        s.allChars.forEach((chars, i) => {
          if (chars.length) gsap.set(chars, { opacity: i === 0 ? 1 : 0 })
        })
        buildScrollTimeline()
        ScrollTrigger.refresh()
      }, 200)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(s.resizeTimer)
      s.mountCtx?.revert()
      s.scrollCtx?.revert()
      if (s.videoUrl) {
        URL.revokeObjectURL(s.videoUrl)
        s.videoUrl = null
      }
      video.removeEventListener('loadedmetadata', buildScrollTimeline)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-label="Hero"
      className="relative w-full overflow-hidden"
      style={{ height: '100svh' }}
    >
      {/* ── Background video — currentTime scrubbed by scroll ────────────── */}
      <video
        ref={videoRef}
        src={heroVideo}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        preload="auto"
        aria-hidden="true"
        autoPlay={false}
      />

      {/* ── Dark overlay — starts at 20%, darkens to 55% as video progresses */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(0,0,0,1)', opacity: 0.20 }}
      />

      {/* ── Radial vignette — keeps text readable at all video frames ──────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.50) 100%)',
        }}
      />

      {/* ── Text paragraphs ──────────────────────────────────────────────────
          All three paragraphs are stacked at the same position.
          Visibility is controlled purely by character opacity — whichever
          paragraph is "active" has its chars at opacity 1, others at 0.

          width uses CSS min() with 100vw to guarantee an exact pixel width
          at all times — no ambiguity from ancestor flex/grid contexts.
          ─────────────────────────────────────────────────────────────────── */}
      {PARAGRAPHS.map((text, idx) => (
        <div
          key={idx}
          ref={(el) => { textRefs.current[idx] = el }}
          aria-hidden={idx !== 0}
          style={{
            ...TEXT_STYLE,
            width:         `min(${TEXT_STYLE.maxWidth ?? '69rem'}, calc(100vw - 3.5rem))`,
            maxWidth:      'none',
            position:      'absolute',
            top:           '50%',
            left:          '50%',
            transform:     'translate(-50%, -50%)',
            textAlign:     'center',
            whiteSpace:    'normal',
            pointerEvents: 'none',
          }}
        >
          {text}
        </div>
      ))}

      {/* ── Scroll hint ──────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60"
      >
        <span
          className="text-white text-[11px] uppercase tracking-[0.2em]"
          style={{ fontFamily: fonts.hn }}
        >
          Scroll
        </span>
        <div className="w-px h-10 bg-white/60 animate-pulse" />
      </div>
    </section>
  )
}
