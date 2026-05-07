// ─── PRIMARY BUTTON — SixDX ──────────────────────────────────────────────────
// Gooey pill + arrow button — the site's primary call-to-action component.
//
// On hover: the arrow square slides out from behind the pill via GSAP.
// The gooey SVG filter (id="goo-effect") merges the pill and arrow into a
// single liquid shape. Navbar renders GooeyFilterDef which writes that filter;
// ensure Navbar is in the tree before any PrimaryButton.
//
// Variants:
//   white      — white pill, black text + arrow  (default — used in Navbar)
//   brand      — #CC4D22 pill, white text + arrow (used in sections)
//
// Extra prop:
//   themeAware — when true, reads colors from CSS custom properties
//                (--cta-bg, --cta-text) instead of hardcoded values.
//                Use this in Navbar so the button reacts to theme-light class.
// ─────────────────────────────────────────────────────────────────────────────

import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../../animations/gsap.config'
import { textStyles } from '../../styles/tokens'

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────

// bodyMedium = HN 14px / -1% tracking / 500 weight / lh 1.4
const FONT: React.CSSProperties = textStyles.bodyMedium

// ─── VARIANT PALETTE ─────────────────────────────────────────────────────────
// Edit these to change button colours across the entire site.

const VARIANTS = {
  white: {
    pillBg:    '#ffffff',
    pillText:  '#000000',
    arrowBg:   '#ffffff',
    arrowFill: '#000000',   // Arrow Dark (dark fill on white square)
  },
  brand: {
    pillBg:    '#CC4D22',
    pillText:  '#ffffff',
    arrowBg:   '#CC4D22',
    arrowFill: '#ffffff',   // Arrow Light (white fill on brand square)
  },
} as const

// ─── ANIMATION CONFIG ─────────────────────────────────────────────────────────
// All timing lives here — change once, applies everywhere.

const ANIM = {
  enterDuration:  0.75,
  enterEase:      'power3.out',
  iconFadeDelay:  0.50,
  iconFadeDur:    0.20,
  leaveDuration:  0.55,
  leaveEase:      'power3.inOut',
  leaveDelay:     0.05,
  leaveIconDur:   0.15,
}

// ─── ARROW PATH ──────────────────────────────────────────────────────────────
// Sourced from /public/Svg's/Arrow Light.svg & Arrow Dark.svg
// Both files share the same path — only the fill color differs.
const ARROW_PATH = 'M9.71877 3.63733L13.4851 7.40367C14.0892 8.00777 13.6614 9.04081 12.807 9.04081H2.959C2.42914 9.04081 1.99981 9.47034 2 10.0002C2 10.5299 2.42933 10.959 2.959 10.959H12.807C13.6614 10.959 14.0892 11.9922 13.4851 12.5963L9.71877 16.3627C9.3443 16.7371 9.3443 17.3445 9.71877 17.719L9.71896 17.7192C10.0934 18.0936 10.7008 18.0936 11.0752 17.7192L18.1163 10.6781C18.4907 10.3037 18.4907 9.69632 18.1163 9.32185L11.0752 2.28085C10.7008 1.90638 10.0934 1.90638 9.71896 2.28085L9.71877 2.28104C9.3443 2.65551 9.3443 3.26287 9.71877 3.63733Z'

// ─── PROPS ────────────────────────────────────────────────────────────────────

export interface PrimaryButtonProps {
  label:       string
  href:        string
  /** Visual variant — 'white' (default) | 'brand' */
  variant?:    keyof typeof VARIANTS
  /**
   * When true, pill and arrow colours are driven by CSS custom properties
   * (--cta-bg, --cta-text) instead of the hardcoded variant palette.
   * Used in Navbar so the button responds to the .theme-light class switch.
   */
  themeAware?: boolean
  /**
   * When true, the arrow is always visible (hovered state by default).
   * Hover/leave animations are disabled — the arrow stays expanded.
   */
  expanded?:   boolean
  target?:     string
  rel?:        string
  /** Optional click handler — used when the button triggers a form submit */
  onClick?:    () => void
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function PrimaryButton({
  label,
  href,
  variant      = 'white',
  themeAware   = false,
  expanded     = false,
  target,
  rel,
  onClick,
}: PrimaryButtonProps) {
  const arrowRef = useRef<HTMLDivElement>(null)
  const iconRef  = useRef<SVGSVGElement>(null)

  const v = VARIANTS[variant]

  // Theme-aware colours fall through to CSS variables (Navbar usage).
  // Explicit variant colours are used everywhere else (section usage).
  const pillBg     = themeAware ? 'var(--cta-bg, #ffffff)'    : v.pillBg
  const pillText   = themeAware ? 'var(--cta-text, #000000)'  : v.pillText
  const arrowBg   = themeAware ? 'var(--cta-bg, #ffffff)'   : v.arrowBg
  // themeAware: fill follows --cta-text so icon flips with the pill text colour
  const iconFill  = themeAware ? v.arrowFill : v.arrowFill

  // ── Set initial position before first paint ─────────────────────────────
  // expanded=true  → arrow visible from the start (hovered state)
  // expanded=false → arrow hidden, slides in on hover (default)
  useLayoutEffect(() => {
    const w = arrowRef.current?.offsetWidth ?? 42
    gsap.set(arrowRef.current, { x: expanded ? 0  : -w })
    gsap.set(iconRef.current,  { opacity: expanded ? 1 : 0 })
  }, [expanded])

  // When expanded, arrow is always visible — skip hover/leave animations
  const onEnter = () => {
    if (expanded) return
    gsap.to(arrowRef.current, {
      x:        0,
      duration: ANIM.enterDuration,
      ease:     ANIM.enterEase,
    })
    gsap.to(iconRef.current, {
      opacity:  1,
      duration: ANIM.iconFadeDur,
      delay:    ANIM.iconFadeDelay,
      ease:     'none',
    })
  }

  const onLeave = () => {
    if (expanded) return
    const w = arrowRef.current?.offsetWidth ?? 42
    gsap.to(iconRef.current, {
      opacity:  0,
      duration: ANIM.leaveIconDur,
      ease:     'none',
    })
    gsap.to(arrowRef.current, {
      x:        -w,
      duration: ANIM.leaveDuration,
      ease:     ANIM.leaveEase,
      delay:    ANIM.leaveDelay,
    })
  }

  return (
    // Filter wrapper: 7px taller than the button (blur eats 3.5px per side)
    // so visual height = content height after the gooey filter shrinks it.
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        filter:        'url(#goo-effect)',
        display:       'flex',
        alignItems:    'stretch',
        alignSelf:     'center',
        height:        '41.59px',
        marginTop:     '-3.5px',
        marginBottom:  '-3.5px',
        marginLeft:    '0.125rem',
        cursor:        'pointer',
        flexShrink:    0,
        overflow:      'visible',
      }}
    >
      {/* ── Pill — renders above arrow (zIndex:1) so text stays readable ── */}
      <a
        href={href}
        target={target}
        rel={rel}
        onClick={onClick ? (e) => { e.preventDefault(); onClick() } : undefined}
        style={{
          ...FONT,
          position:        'relative',
          zIndex:          1,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          paddingLeft:     'calc(1rem + 3.5px)',
          paddingRight:    'calc(1rem + 3.5px)',
          paddingTop:      '0.25rem',
          paddingBottom:   '0.25rem',
          borderRadius:    '0.125rem',
          backgroundColor: pillBg,
          color:           pillText,
          transition:      'background-color 0.3s ease, color 0.3s ease',
          whiteSpace:      'nowrap',
          textDecoration:  'none',
        }}
      >
        {label}
      </a>

      {/* ── Arrow square — slides out from behind pill on hover ─────────── */}
      <div
        ref={arrowRef}
        style={{
          marginLeft:      '0.125rem',
          aspectRatio:     '1 / 1',
          borderRadius:    '0.125rem',
          backgroundColor: arrowBg,
          transition:      'background-color 0.3s ease',
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
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d={ARROW_PATH}
            style={{
              fill:       themeAware ? 'var(--cta-text, #000000)' : iconFill,
              transition: 'fill 0.3s ease',
            }}
          />
        </svg>
      </div>
    </div>
  )
}
