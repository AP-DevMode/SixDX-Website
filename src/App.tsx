// ─── APP ROOT — SixDX ────────────────────────────────────────────────────────
import { useEffect } from 'react'
import { initScroll, destroyScroll } from './animations/scroll'
import Navbar from './components/layout/Navbar'
import Hero   from './components/sections/Hero'

export default function App() {
  // ── Lenis smooth scroll init ───────────────────────────────────────────
  useEffect(() => {
    initScroll()
    return () => destroyScroll()
  }, [])

  return (
    <main className="relative bg-[#0a0a0a]">
      <Navbar />
      <Hero />

      {/* ── Placeholder for upcoming sections ──────────────────────────── */}
      <div
        className="flex items-center justify-center text-white/20 text-sm tracking-widest uppercase"
        style={{
          height: '100vh',
          fontFamily: 'HelveticaNeue, "Helvetica Neue", Helvetica, sans-serif',
        }}
      >
        Next sections coming soon…
      </div>
    </main>
  )
}
