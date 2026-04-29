// ─── NAVBAR — SixDX ──────────────────────────────────────────────────────────
// Gooey CTA: exact mechanic from gooey-search-main/App.jsx ported to GSAP.
// The filter wraps BOTH the pill button + arrow circle as siblings.
// On hover: pill shifts left + widens; circle slides in from right.
// Their overlap triggers the gooey merge via feGaussianBlur + feColorMatrix.
// ─────────────────────────────────────────────────────────────────────────────

import { useLayoutEffect, useRef } from 'react'
// note: no useState needed — all animation is GSAP-driven
import { gsap } from '../../animations/gsap.config'

// ─── CONTENT — edit freely ────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Differentiators', href: '#differentiators' },
  { label: 'How SixDX Works', href: '#how-it-works' },
  { label: 'Work',            href: '#work' },
  { label: 'Testimonials',    href: '#testimonials' },
] as const

const CTA = { label: 'Get in touch', href: '#contact' }
// ─── END CONTENT ─────────────────────────────────────────────────────────────

// ─── SPACING (all rem) ───────────────────────────────────────────────────────
// 28px → 1.75rem  header H-padding
// 16px → 1rem     header V-padding
// 96px → 6rem     logo → nav gap
// 16px → 1rem     glass item H-padding
//  4px → 0.25rem  glass item V-padding
//  2px → 0.125rem gap + border-radius
// ─────────────────────────────────────────────────────────────────────────────

const FONT: React.CSSProperties = {
  fontFamily:    'HelveticaNeue, "Helvetica Neue", Helvetica, Arial, sans-serif',
  fontSize:      '0.875rem',   /* 14px */
  fontWeight:    500,          /* Medium */
  lineHeight:    1.4,          /* 140% */
  letterSpacing: '-0.01em',   /* -1% */
}

const GLASS_ITEM: React.CSSProperties = {
  ...FONT,
  backgroundColor:      'rgba(28, 11, 5, 0.16)',
  backdropFilter:       'blur(2rem)',
  WebkitBackdropFilter: 'blur(2rem)',
  paddingLeft:          '1rem',
  paddingRight:         '1rem',
  paddingTop:           '0.25rem',
  paddingBottom:        '0.25rem',
  borderRadius:         '0.125rem',
  color:                '#ffffff',
  whiteSpace:           'nowrap',
  textDecoration:       'none',
  display:              'flex',
  alignItems:           'center',
  justifyContent:       'center',
}

// ─── GOOEY SVG FILTER ────────────────────────────────────────────────────────
// From gooey-search-main/src/components/GooeyFilter.jsx.
// stdDeviation lowered to 4 → sharper edges, less inter-element bleed.
// feColorMatrix alpha multiplier 22 / offset -18 → hard threshold.
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

// ─── GOOEY BUTTON ────────────────────────────────────────────────────────────
// Both pill + arrow must be inside the SAME filter for the gooey merge to work.
// Problem: the filter's blur (stdDeviation=4) eats ~3.5px from each edge,
// shrinking the visual height by ~7px total.
// Fix: make the filter wrapper 7px taller than the nav (34.59px vs 27.59px)
// then center it. The filter eats 3.5px off each side → visual = 27.59px ✓
//
// Pill renders above arrow (zIndex:1) so its text is never obscured by the
// arrow's white box when the arrow is translated behind the pill.
// Icon starts at opacity:0 (before paint) so the black SVG never bleeds through.
// ─────────────────────────────────────────────────────────────────────────────
function GooeyButton({ label, href }: { label: string; href: string }) {
  const arrowRef = useRef<HTMLDivElement>(null)
  const iconRef  = useRef<SVGSVGElement>(null)

  useLayoutEffect(() => {
    const w = arrowRef.current?.offsetWidth ?? 34
    gsap.set(arrowRef.current, { x: -w })      /* hide fully behind pill */
    gsap.set(iconRef.current,  { opacity: 0 }) /* icon hidden until arrow emerges */
  }, [])

  const onEnter = () => {
    console.log('ENTER — arrowRef:', arrowRef.current, 'x will go to 0')
    gsap.to(arrowRef.current, { x: 0,      duration: 0.75, ease: 'power3.out' })
    gsap.to(iconRef.current,  { opacity: 1, duration: 0.2,  delay: 0.5, ease: 'none' })
  }

  const onLeave = () => {
    const w = arrowRef.current?.offsetWidth ?? 34
    console.log('LEAVE — arrowRef:', arrowRef.current, 'x will go to', -w)
    gsap.to(iconRef.current,  { opacity: 0, duration: 0.15, ease: 'none' })
    gsap.to(arrowRef.current, { x: -w,     duration: 0.55, ease: 'power3.inOut', delay: 0.05 })
  }

  return (
    // filter wrapper: 7px taller than nav (34.59px) so after blur eats 3.5px/side
    // the visual result = 27.59px, matching glass nav items.
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        filter:     'url(#goo-effect)',
        display:    'flex',
        alignItems: 'stretch',
        alignSelf:  'center',
        height:     '34.59px',
        marginLeft: '0.125rem',
        cursor:     'pointer',
        flexShrink: 0,
        overflow:   'visible',
      }}
    >
      {/* ── Pill — zIndex:1 so it paints above the arrow's white box ─── */}
      <a
        href={href}
        style={{
          ...FONT,
          position:        'relative',
          zIndex:          1,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          paddingLeft:     '1rem',
          paddingRight:    '1rem',
          paddingTop:      '0.25rem',
          paddingBottom:   '0.25rem',
          borderRadius:    '0.125rem',
          backgroundColor: '#ffffff',
          color:           '#000000',
          whiteSpace:      'nowrap',
          textDecoration:  'none',
        }}
      >
        {label}
      </a>

      {/* ── Arrow — slides from behind pill on hover ──────────────────── */}
      <div
        ref={arrowRef}
        style={{
          marginLeft:      '0.125rem',
          aspectRatio:     '1 / 1',
          borderRadius:    '0.125rem',
          backgroundColor: '#ffffff',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          flexShrink:      0,
        }}
      >
        <svg
          ref={iconRef}
          width="1.25rem"
          height="1.25rem"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3.75 10H16.25M10.625 4.375L16.25 10L10.625 15.625"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  return (
    <>
      {/* SVG filter — rendered once, referenced by all GooeyButtons on page */}
      <GooeyFilterDef />

      <header
        aria-label="Site navigation"
        style={{
          position:     'fixed',
          top:          0,
          left:         0,
          right:        0,
          zIndex:       50,
          display:      'flex',
          alignItems:   'center',
          width:        '100%',
          maxWidth:     '90rem',     /* 1440px */
          margin:       '0 auto',
          paddingLeft:  '1.75rem',   /* 28px */
          paddingRight: '1.75rem',
          paddingTop:   '1rem',      /* 16px */
          paddingBottom:'1rem',
        }}
      >
        {/* ── Logo ───────────────────────────────────────────────────────── */}
        <a
          href="/"
          aria-label="SixDX home"
          style={{
            flexShrink:  0,
            display:     'flex',
            alignItems:  'center',
            marginRight: '6rem',     /* 96px */
          }}
        >
          <img
            src="/logo.svg"
            alt="SixDX"
            draggable={false}
            style={{ height: '3.5rem', width: 'auto' }}
          />
        </a>

        {/* ── Nav + CTA ──────────────────────────────────────────────────── */}
        <nav
          aria-label="Primary navigation"
          style={{
            display:    'flex',
            alignItems: 'stretch',   /* all children same height */
            flex:       1,
            gap:        '0.125rem',  /* 2px */
          }}
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{ ...GLASS_ITEM, flex: '1 0 0' }}
              onMouseEnter={e =>
                (e.currentTarget.style.backgroundColor = 'rgba(28, 11, 5, 0.30)')
              }
              onMouseLeave={e =>
                (e.currentTarget.style.backgroundColor = 'rgba(28, 11, 5, 0.16)')
              }
            >
              {item.label}
            </a>
          ))}

          <GooeyButton label={CTA.label} href={CTA.href} />
        </nav>
      </header>
    </>
  )
}
