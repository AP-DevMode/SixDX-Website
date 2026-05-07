// ─── COUNT-UP — SixDX ────────────────────────────────────────────────────────
// Animates a number from 0 → target value exactly once.
//
// Trigger: IMPERATIVE only — the parent calls countUpRef.current.start().
// This decouples the counter from IntersectionObserver timing and lets the
// parent (e.g. StackSection's GSAP onComplete) fire it at precisely the right
// moment — after the card's entrance animation has finished.
//
// Usage:
//   const ref = useRef<CountUpHandle>(null)
//   <CountUp ref={ref} value={68} suffix="%" />
//   ref.current?.start()   ← call this whenever you're ready
//
// Props:
//   value      — target number                                (required)
//   suffix     — text appended after, e.g. '%'               (default '')
//   prefix     — text prepended before, e.g. '$'             (default '')
//   duration   — tween duration in seconds                   (default 1.6)
//   delay      — seconds to wait after start() is called     (default 0)
//   decimals   — decimal places shown while counting         (default 0)
//   ease       — any GSAP ease string                        (default 'power2.out')
//   className  — forwarded to the <span>
//   style      — forwarded to the <span>
// ─────────────────────────────────────────────────────────────────────────────

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { CSSProperties } from 'react'
import { gsap } from '../../animations/gsap.config'

export interface CountUpHandle {
  /** Kick off the count-up animation. Safe to call multiple times — only runs once. */
  start: () => void
}

export interface CountUpProps {
  value:      number
  suffix?:    string
  prefix?:    string
  duration?:  number
  delay?:     number
  decimals?:  number
  ease?:      string
  className?: string
  style?:     CSSProperties
}

const CountUp = forwardRef<CountUpHandle, CountUpProps>(function CountUp(
  {
    value,
    suffix   = '',
    prefix   = '',
    duration = 1.6,
    delay    = 0,
    decimals = 0,
    ease     = 'power2.out',
    className,
    style,
  },
  ref,
) {
  const spanRef     = useRef<HTMLSpanElement>(null)
  const hasStarted  = useRef(false)
  const tweenRef    = useRef<gsap.core.Tween | null>(null)

  // ── Expose start() to parent via ref ─────────────────────────────────────
  useImperativeHandle(ref, () => ({
    start() {
      if (hasStarted.current) return
      hasStarted.current = true

      const el = spanRef.current
      if (!el) return

      // Reduced-motion: snap immediately, no tween
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const display = decimals > 0 ? value.toFixed(decimals) : String(value)
        el.textContent = `${prefix}${display}${suffix}`
        return
      }

      const counter = { val: 0 }

      tweenRef.current = gsap.to(counter, {
        val:      value,
        duration,
        delay,
        ease,
        onUpdate() {
          const display = decimals > 0
            ? counter.val.toFixed(decimals)
            : String(Math.round(counter.val))
          el.textContent = `${prefix}${display}${suffix}`
        },
        onComplete() {
          // Snap to exact value — avoids floating-point drift at the end
          const display = decimals > 0 ? value.toFixed(decimals) : String(value)
          el.textContent = `${prefix}${display}${suffix}`
        },
      })
    },
  }))

  // Set the static "zero" label on mount so the slot isn't blank
  useEffect(() => {
    if (spanRef.current) {
      spanRef.current.textContent = `${prefix}0${suffix}`
    }
    return () => { tweenRef.current?.kill() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <span ref={spanRef} className={className} style={style} />
})

export default CountUp
