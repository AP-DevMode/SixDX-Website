// ─── HERO SECTION — SixDX ────────────────────────────────────────────────────
// Full-screen video hero. The video's currentTime is driven by GSAP ScrollTrigger
// scrub — as the user scrolls down the video plays frame-by-frame (Apple-style).
// The section is pinned for the duration of the scrub.
//
// Figma ref: node 323:49 "Hero" in SixDX Landing Page
// Font:      Marund (display), 60px / -2.4px tracking, centered, white
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../animations/gsap.config'
import heroVideo from '../../assets/video/cosmos.mp4'

// ─── CONTENT ─────────────────────────────────────────────────────────────────
const HEADLINE =
  'Every critical asset in your facility carries intelligence no manual captures and no schematic fully represents. Until now, it had nowhere to go.'
// ─── END CONTENT ─────────────────────────────────────────────────────────────

// ─── ANIMATION CONFIG ────────────────────────────────────────────────────────
const VIDEO_SCROLL = {
  // How many viewport-heights the section stays pinned while video scrubs
  pinDuration: '+=250%',
  // GSAP scrub value — higher = more lag/smoothing (0 = instant)
  scrub: 1,
}

const TEXT_REVEAL = {
  duration:  1.1,
  ease:      'power3.out',
  delay:     0.5, // after page loads
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Hero() {
  const sectionRef  = useRef<HTMLElement>(null)
  const videoRef    = useRef<HTMLVideoElement>(null)
  const overlayRef  = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const section  = sectionRef.current
    const video    = videoRef.current
    const headline = headlineRef.current
    if (!section || !video || !headline) return

    // ── Wait for video metadata to know its duration ──────────────────────
    const setupScrollScrub = () => {
      // Keep video paused — we control it manually
      video.pause()

      const ctx = gsap.context(() => {

        // ── 1. Video scrub scroll trigger ──────────────────────────────────
        // The video's currentTime maps to scroll progress within the pinned section.
        // This is identical to Apple's technique for product reveals.
        ScrollTrigger.create({
          trigger: section,
          start:   'top top',
          end:     VIDEO_SCROLL.pinDuration,
          pin:     true,         // keep section fixed in viewport
          scrub:   VIDEO_SCROLL.scrub,
          onUpdate(self) {
            if (!video.duration) return
            // Map scroll progress [0..1] → video time [0..duration]
            video.currentTime = video.duration * self.progress
          },
        })

        // ── 2. Overlay opacity — fades darker as video plays ───────────────
        gsap.to(overlayRef.current, {
          opacity:      0.55,
          ease:         'none',
          scrollTrigger: {
            trigger: section,
            start:   'top top',
            end:     VIDEO_SCROLL.pinDuration,
            scrub:   VIDEO_SCROLL.scrub,
          },
        })

        // ── 3. Headline entrance (runs once on load, not on scroll) ────────
        gsap.from(headline, {
          y:        30,
          opacity:  0,
          duration: TEXT_REVEAL.duration,
          ease:     TEXT_REVEAL.ease,
          delay:    TEXT_REVEAL.delay,
        })

      }, section)

      return () => ctx.revert()
    }

    // If metadata already loaded (e.g., cached video), set up immediately
    if (video.readyState >= 1) {
      const cleanup = setupScrollScrub()
      return cleanup
    }

    // Otherwise wait for loadedmetadata
    video.addEventListener('loadedmetadata', setupScrollScrub, { once: true })
    return () => {
      video.removeEventListener('loadedmetadata', setupScrollScrub)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-label="Hero"
      className="relative w-full overflow-hidden"
      style={{ height: '100svh' }}
    >
      {/* ── Background Video ─────────────────────────────────────────────── */}
      <video
        ref={videoRef}
        src={heroVideo}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        preload="auto"
        aria-hidden="true"
        // Prevent any default playback — scroll drives it
        autoPlay={false}
      />

      {/* ── Dark gradient overlay — matches Figma rgba(0,0,0,0.20) ─────── */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.20), rgba(0,0,0,0.20))',
          opacity: 0.20,
        }}
      />

      {/* ── Vignette — keeps text readable at all video frames ──────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.45) 100%)',
        }}
      />

      {/* ── Headline + layout container ──────────────────────────────────── */}
      <div
        className="absolute inset-0 flex items-center justify-between px-[28px] py-[50px]"
        aria-hidden="false"
      >
        {/* Headline — Figma: Marund, 60px, tracking -2.4px, centred, white */}
        <p
          ref={headlineRef}
          className="will-animate text-white text-center mx-auto"
          style={{
            fontFamily:    'Marund, sans-serif',
            fontSize:      'clamp(2rem, 4.2vw, 3.75rem)',
            letterSpacing: '-0.04em',
            lineHeight:    1.05,
            maxWidth:      '69rem', /* ~996px at 1440 */
            fontStyle:     'normal',
            fontWeight:    'normal',
          }}
        >
          {HEADLINE}
        </p>
      </div>

      {/* ── Scroll hint ──────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60"
      >
        <span
          className="text-white text-[11px] uppercase tracking-[0.2em]"
          style={{ fontFamily: 'HelveticaNeue, "Helvetica Neue", Helvetica, sans-serif' }}
        >
          Scroll
        </span>
        <div className="w-px h-10 bg-white/60 animate-pulse" />
      </div>
    </section>
  )
}
