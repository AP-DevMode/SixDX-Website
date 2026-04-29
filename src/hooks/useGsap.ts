// ─── GSAP CONTEXT HOOK — clean animation lifecycle in React ──────────────────
import { useEffect, useRef } from 'react'
import type { DependencyList } from 'react'
import { gsap } from '../animations/gsap.config'

type AnimationFn = (container: HTMLElement) => void

export function useGsap(
  animationFn: AnimationFn,
  dependencies: DependencyList = []
) {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const ctx = gsap.context(() => {
      animationFn(el)
    }, el)

    return () => ctx.revert() // Clean kill — no memory leaks
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return containerRef
}
