// ─── GSAP SETUP — register plugins once at app init ────────────────────────
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ─── CUSTOM EASES ────────────────────────────────────────────────────────────
// Edit curve values here — they propagate everywhere
gsap.config({ nullTargetWarn: false })

export { gsap, ScrollTrigger }
