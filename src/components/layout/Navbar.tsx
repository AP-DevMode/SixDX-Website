// ─── NAVBAR — SixDX ──────────────────────────────────────────────────────────
// Desktop  (≥1200px): logo + glass nav pills + CTA button
// Tablet  (810–1199px): logo (117.5×48) + hamburger → full-screen menu
// Mobile   (≤809px) : logo (97.9×40)  + hamburger → full-screen menu
//
// Open state (tablet + mobile):
//   Full-screen #0a0a0a overlay. GSAP staggers nav links in from below.
//   Close via X button, nav-link click, or Escape key.
//
// Light / Dark theme: dual IntersectionObserver on [data-theme] attributes.
//   Dark wins whenever any dark section overlaps the navbar.
// ─────────────────────────────────────────────────────────────────────────────

import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../../animations/gsap.config'
import PrimaryButton from '../ui/PrimaryButton'
import { fonts, textStyles } from '../../styles/tokens'

// ─── CONTENT — edit freely ────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Differentiators', href: '#differentiators' },
  { label: 'How SixDX Works', href: '#how-it-works' },
  { label: 'Work',            href: '#work' },
  { label: 'Testimonials',    href: '#testimonials' },
] as const

const CTA = { label: 'Get in touch', href: '#contact' }
// ─── END CONTENT ─────────────────────────────────────────────────────────────

const GLASS_ITEM: React.CSSProperties = {
  ...textStyles.bodyMedium,
  backgroundColor:      'var(--nav-bg, rgba(0,0,0,0.16))',
  backdropFilter:       'blur(2rem)',
  WebkitBackdropFilter: 'blur(2rem)',
  paddingLeft:          '1rem',
  paddingRight:         '1rem',
  paddingTop:           '0.25rem',
  paddingBottom:        '0.25rem',
  borderRadius:         '0.125rem',
  color:                'var(--nav-text, #ffffff)',
  whiteSpace:           'nowrap',
  transition:           'background-color 0.3s ease, color 0.3s ease',
  textDecoration:       'none',
  display:              'flex',
  alignItems:           'center',
  justifyContent:       'center',
}

// ─── GOOEY SVG FILTER — referenced by PrimaryButton ──────────────────────────
const GooeyFilterDef = () => (
  <svg
    aria-hidden="true"
    style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
  >
    <defs>
      <filter id="goo-effect">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
        <feColorMatrix
          in="blur"
          type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -18"
          result="goo"
        />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>
)

// ─── ICONS ────────────────────────────────────────────────────────────────────
function HamburgerIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="4" y="10"    width="24" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="4" y="15.25" width="24" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="4" y="20.5"  width="24" height="1.5" rx="0.75" fill="currentColor" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <line x1="8"  y1="8"  x2="24" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="8"  x2="8"  y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function Navbar() {
  const headerRef  = useRef<HTMLElement>(null)
  const menuRef    = useRef<HTMLDivElement>(null)
  const linkRefs   = useRef<(HTMLAnchorElement | null)[]>([])
  const ctaWrapRef = useRef<HTMLDivElement>(null)
  const tlRef      = useRef<gsap.core.Timeline | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // ── Light / dark IntersectionObserver ──────────────────────────────────────
  useLayoutEffect(() => {
    const lightSet = new Set<Element>()
    const darkSet  = new Set<Element>()

    const apply = () => {
      if (darkSet.size > 0) {
        headerRef.current?.classList.remove('theme-light')
      } else if (lightSet.size > 0) {
        headerRef.current?.classList.add('theme-light')
      } else {
        headerRef.current?.classList.remove('theme-light')
      }
    }

    const lightObs = new IntersectionObserver(
      entries => { entries.forEach(e => e.isIntersecting ? lightSet.add(e.target) : lightSet.delete(e.target)); apply() },
      { threshold: 0 },
    )
    const darkObs = new IntersectionObserver(
      entries => { entries.forEach(e => e.isIntersecting ? darkSet.add(e.target) : darkSet.delete(e.target)); apply() },
      { threshold: 0 },
    )

    document.querySelectorAll('[data-theme="light"]').forEach(el => lightObs.observe(el))
    document.querySelectorAll('[data-theme="dark"]').forEach(el => darkObs.observe(el))

    return () => { lightObs.disconnect(); darkObs.disconnect() }
  }, [])

  // ── Escape key closes menu ─────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Open ──────────────────────────────────────────────────────────────────
  const openMenu = () => {
    setMenuOpen(true)
    document.body.style.overflow = 'hidden'

    const menu  = menuRef.current
    const links = linkRefs.current.filter(Boolean)
    const cta   = ctaWrapRef.current
    if (!menu) return

    tlRef.current?.kill()
    gsap.set(menu,         { autoAlpha: 0 })
    gsap.set([links, cta], { y: 28, autoAlpha: 0 })

    tlRef.current = gsap.timeline()
      .to(menu,  { autoAlpha: 1, duration: 0.35, ease: 'power2.out' })
      .to(links, { y: 0, autoAlpha: 1, stagger: 0.09, duration: 0.5,  ease: 'power3.out' }, '-=0.15')
      .to(cta,   { y: 0, autoAlpha: 1,              duration: 0.4,  ease: 'power2.out' }, '-=0.25')
  }

  // ── Close ─────────────────────────────────────────────────────────────────
  const closeMenu = () => {
    const menu  = menuRef.current
    const links = linkRefs.current.filter(Boolean)
    const cta   = ctaWrapRef.current

    tlRef.current?.kill()
    tlRef.current = gsap.timeline({
      onComplete: () => {
        setMenuOpen(false)
        document.body.style.overflow = ''
      },
    })
      .to([links, cta], { y: -10, autoAlpha: 0, stagger: 0.03, duration: 0.18, ease: 'power2.in' })
      .to(menu,         { autoAlpha: 0,                          duration: 0.25, ease: 'power2.in' }, '-=0.08')
  }

  return (
    <>
      <style>{`
        /* ── Theme CSS variables ─────────────────────────────────────────── */
        header.sixdx-nav {
          --nav-bg:       rgba(0,0,0,0.16);
          --nav-text:     #ffffff;
          --nav-bg-hover: rgba(0,0,0,0.30);
          --cta-bg:       #ffffff;
          --cta-text:     #000000;
        }
        header.sixdx-nav.theme-light {
          --nav-bg:       rgba(255,255,255,0.16);
          --nav-text:     #1c0b05;
          --nav-bg-hover: rgba(255,255,255,0.30);
          --cta-bg:       #cc4d22;
          --cta-text:     #ffffff;
        }

        /* ── Logo — Figma-exact sizes per breakpoint ─────────────────────── */
        .sixdx-logo      { height: 3.5rem; width: 8.625rem; }  /* desktop */
        .sixdx-logo-link { margin-right: 6rem; flex-shrink: 0; display: flex; align-items: center; }

        /* ── Responsive show / hide ──────────────────────────────────────── */
        .nav-pills     { display: flex; }
        .nav-hamburger { display: none; }

        /* Tablet: 810–1199px */
        @media (max-width: 1199px) {
          .nav-pills       { display: none; }
          .nav-hamburger   { display: flex; margin-left: auto; }
          .sixdx-logo-link { margin-right: 0; }
          .sixdx-logo      { height: 48px; width: 117.496px; }
          header.sixdx-nav { max-width: none; }
        }

        /* Mobile: ≤809px — smaller logo, tighter side padding (12px) */
        @media (max-width: 809px) {
          .sixdx-logo       { height: 40px; width: 97.913px; }
          header.sixdx-nav  { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
          .sixdx-menu-bar   { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
          .sixdx-menu-links { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
          .sixdx-menu-cta   { padding-left: 0.75rem !important; padding-right: 0.75rem !important; }
        }
      `}</style>

      <GooeyFilterDef />

      {/* ════════════════════════════════════════════════════════════════════════
          HEADER BAR
      ════════════════════════════════════════════════════════════════════════ */}
      <header
        ref={headerRef}
        className="sixdx-nav"
        aria-label="Site navigation"
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          right:         0,
          zIndex:        50,
          display:       'flex',
          alignItems:    'center',
          width:         '100%',
          maxWidth:      '90rem',
          margin:        '0 auto',
          paddingLeft:   '1.75rem',
          paddingRight:  '1.75rem',
          paddingTop:    '1rem',
          paddingBottom: '1rem',
        }}
      >
        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <a href="/" aria-label="SixDX home" className="sixdx-logo-link">
          <div
            className="sixdx-logo"
            aria-label="SixDX"
            style={{
              backgroundColor:    'var(--nav-text, #ffffff)',
              WebkitMaskImage:    'url(/logo.svg)',
              maskImage:          'url(/logo.svg)',
              WebkitMaskSize:     'contain',
              maskSize:           'contain',
              WebkitMaskPosition: 'center',
              WebkitMaskRepeat:   'no-repeat',
              maskRepeat:         'no-repeat',
              transition:         'background-color 0.3s ease',
            }}
          />
        </a>

        {/* ── Desktop: glass pills + CTA ────────────────────────────────────── */}
        <nav
          className="nav-pills"
          aria-label="Primary navigation"
          style={{ alignItems: 'stretch', flex: 1, gap: '0.125rem' }}
        >
          {NAV_ITEMS.map(item => (
            <a
              key={item.href}
              href={item.href}
              style={{ ...GLASS_ITEM, flex: '1 0 0' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--nav-bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--nav-bg)')}
            >
              {item.label}
            </a>
          ))}
          <PrimaryButton label={CTA.label} href={CTA.href} variant="white" themeAware expanded />
        </nav>

        {/* ── Tablet / mobile: hamburger ───────────────────────────────────── */}
        <button
          className="nav-hamburger"
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          onClick={openMenu}
          style={{
            background:     'none',
            border:         'none',
            cursor:         'pointer',
            padding:        0,
            color:          'var(--nav-text, #ffffff)',
            alignItems:     'center',
            justifyContent: 'center',
          }}
        >
          <HamburgerIcon />
        </button>
      </header>

      {/* ════════════════════════════════════════════════════════════════════════
          FULL-SCREEN MENU OVERLAY (tablet + mobile)
          Always in the DOM — GSAP controls visibility via autoAlpha.
      ════════════════════════════════════════════════════════════════════════ */}
      <div
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!menuOpen}
        style={{
          position:      'fixed',
          inset:         0,
          zIndex:        200,
          background:    '#0a0a0a',
          display:       'flex',
          flexDirection: 'column',
          visibility:    'hidden',
          opacity:       0,
        }}
      >
        {/* Header bar: logo + close */}
        <div
          className="sixdx-menu-bar"
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        '1rem 1.75rem',
            flexShrink:     0,
          }}
        >
          <a href="/" aria-label="SixDX home" onClick={closeMenu} style={{ display: 'flex' }}>
            <div
              aria-label="SixDX"
              style={{
                height:             '3rem',
                width:              '7.3rem',
                backgroundColor:    '#ffffff',
                WebkitMaskImage:    'url(/logo.svg)',
                maskImage:          'url(/logo.svg)',
                WebkitMaskSize:     'contain',
                maskSize:           'contain',
                WebkitMaskPosition: 'center',
                WebkitMaskRepeat:   'no-repeat',
                maskRepeat:         'no-repeat',
              }}
            />
          </a>

          <button
            aria-label="Close navigation menu"
            onClick={closeMenu}
            style={{
              background:     'none',
              border:         'none',
              cursor:         'pointer',
              padding:        0,
              color:          '#ffffff',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Nav links — vertically centered, large Marund */}
        <nav
          className="sixdx-menu-links"
          aria-label="Mobile navigation"
          style={{
            flex:           1,
            display:        'flex',
            flexDirection:  'column',
            justifyContent: 'center',
            padding:        '2rem 1.75rem',
            gap:            '0.25rem',
          }}
        >
          {NAV_ITEMS.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              ref={el => { linkRefs.current[i] = el }}
              onClick={closeMenu}
              style={{
                fontFamily:     fonts.marund,
                fontSize:       'clamp(2rem, 6vw, 3rem)',
                lineHeight:     1.05,
                letterSpacing:  '-0.03em',
                color:          '#ffffff',
                textDecoration: 'none',
                display:        'block',
                padding:        '0.35rem 0',
                transition:     'opacity 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.45')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTA at bottom */}
        <div
          ref={ctaWrapRef}
          className="sixdx-menu-cta"
          style={{
            padding:    '1.75rem',
            flexShrink: 0,
            borderTop:  '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <PrimaryButton label={CTA.label} href={CTA.href} variant="brand" onClick={closeMenu} />
        </div>
      </div>
    </>
  )
}
