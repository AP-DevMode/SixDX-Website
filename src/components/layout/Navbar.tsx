import { useLayoutEffect, useRef } from 'react'
import PrimaryButton from '../ui/PrimaryButton'
import { textStyles } from '../../styles/tokens'

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

// Navbar uses bodyMedium token — weight 500, -1% tracking, 14px
const FONT: React.CSSProperties = textStyles.bodyMedium

const GLASS_ITEM: React.CSSProperties = {
  ...FONT,
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

// GooeyButton is now the shared PrimaryButton component (ui/PrimaryButton.tsx).
// GooeyFilterDef stays here so the SVG filter is written to the DOM before
// any PrimaryButton on the page tries to reference it via url(#goo-effect).

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  const headerRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const lightSet = new Set<Element>()
    const darkSet  = new Set<Element>()

    const apply = () => {
      // Dark wins whenever any dark section is visible — prevents the footer's
      // light theme from bleeding in while the contact section is in view.
      if (darkSet.size > 0) {
        headerRef.current?.classList.remove('theme-light')
      } else if (lightSet.size > 0) {
        headerRef.current?.classList.add('theme-light')
      } else {
        headerRef.current?.classList.remove('theme-light')
      }
    }

    const lightObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => e.isIntersecting ? lightSet.add(e.target) : lightSet.delete(e.target))
        apply()
      },
      { threshold: 0 }
    )

    const darkObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => e.isIntersecting ? darkSet.add(e.target) : darkSet.delete(e.target))
        apply()
      },
      { threshold: 0 }
    )

    document.querySelectorAll('[data-theme="light"]').forEach(el => lightObserver.observe(el))
    document.querySelectorAll('[data-theme="dark"]').forEach(el => darkObserver.observe(el))

    return () => {
      lightObserver.disconnect()
      darkObserver.disconnect()
    }
  }, [])

  return (
    <>
      <style>{`
        /* ── Dark mode (default) — Figma: Property 1=Dark ─────────────────── */
        header {
          --nav-bg:       rgba(0,0,0,0.16);
          --nav-text:     #ffffff;
          --nav-bg-hover: rgba(0,0,0,0.30);
          --cta-bg:       #ffffff;
          --cta-text:     #000000;
        }
        /* ── Light mode — Figma: Property 1=light ─────────────────────────── */
        header.theme-light {
          --nav-bg:       rgba(255,255,255,0.16);
          --nav-text:     #1c0b05;
          --nav-bg-hover: rgba(255,255,255,0.30);
          --cta-bg:       #cc4d22;
          --cta-text:     #ffffff;
        }
      `}</style>
      
      {/* SVG filter — rendered once, referenced by all GooeyButtons on page */}
      <GooeyFilterDef />

      <header
        ref={headerRef}
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
          paddingLeft:  '1.75rem',
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
          <div
            aria-label="SixDX"
            style={{
              height: '3.5rem',
              width: '8.625rem',
              backgroundColor: 'var(--nav-text, #ffffff)',
              WebkitMaskImage: 'url(/logo.svg)',
              maskImage: 'url(/logo.svg)',
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskPosition: 'center',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              transition: 'background-color 0.3s ease',
            }}
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
                (e.currentTarget.style.backgroundColor = 'var(--nav-bg-hover, rgba(0,0,0,0.30))')
              }
              onMouseLeave={e =>
                (e.currentTarget.style.backgroundColor = 'var(--nav-bg, rgba(0,0,0,0.16))')
              }
            >
              {item.label}
            </a>
          ))}

          <PrimaryButton label={CTA.label} href={CTA.href} variant="white" themeAware expanded />
        </nav>
      </header>
    </>
  )
}