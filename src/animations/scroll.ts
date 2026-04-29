// ─── LENIS + SCROLLTRIGGER SYNC ──────────────────────────────────────────────
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap.config'

// ─── SCROLL CONFIG — edit timing here ────────────────────────────────────────
const SCROLL_CONFIG = {
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical' as const,
  smoothWheel: true,
  touchMultiplier: 2,
}
// ─────────────────────────────────────────────────────────────────────────────

let lenisInstance: Lenis | null = null

export function initScroll(): Lenis {
  lenisInstance = new Lenis(SCROLL_CONFIG)

  lenisInstance.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => {
    lenisInstance?.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  return lenisInstance
}

export function destroyScroll(): void {
  lenisInstance?.destroy()
  lenisInstance = null
}

export { lenisInstance }
