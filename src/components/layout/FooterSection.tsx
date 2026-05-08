// ─── FOOTER SECTION — SixDX ──────────────────────────────────────────────────
// Figma node : 408:246  "Footer"
// Layout     : vertical flex, space-between, padding 100px 28px 14px
// Gradient   : #fff → #faece8 → #f3d4c9 → #e49f88 → #d05b34 → #1c0b05
//
// Sections:
//   Upper  — tagline + CTA button + nav pills
//   Middle — two office columns (left) + newsletter card (right)
//   Bottom — policy links (left) + copyright (right)
//
// Newsletter card behaviour:
//   Default  : looping muted video plays in background
//   On click : video fades + signup form slides in
//   On close : form slides out + video resumes
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState, type FormEvent, type ChangeEvent } from 'react'
import { fonts, colors, textStyles } from '../../styles/tokens'
import PrimaryButton from '../ui/PrimaryButton'

// ── Video ─────────────────────────────────────────────────────────────────────
// To swap: change the filename here. Video must be in /public/video/
const NEWSLETTER_VIDEO = '/video/newsletter-video.mp4'

// ── Footer gradient ───────────────────────────────────────────────────────────
// Extracted from Figma. Edit the color stops here to adjust the gradient.
const FOOTER_GRADIENT = `linear-gradient(
  to bottom,
  #ffffff    8.6%,
  #faece8   14.9%,
  #f3d4c9   20.7%,
  #e49f88   28.7%,
  #d05b34   38.2%,
  #1c0b05   68.0%
)`

// ═══════════════════════════════════════════════════════════════════════════════
// ── CONTENT — edit here
// ═══════════════════════════════════════════════════════════════════════════════

const TAGLINE = 'Photorealistic. Technically accurate. Built for the environments where precision matters.'

const NAV_PILLS = [
  { label: 'Home',       href: '#' },
  { label: 'About Us',   href: '#' },
  { label: 'Our Work',   href: '#' },
  { label: 'Contact Us', href: '#' },
]

const OFFICES = [
  {
    region : 'India',
    company: 'Six D Engineering Solutions Pvt Ltd',
    address: 'A-167, Ground Floor, Sector - 63, Noida, Uttar Pradesh, 201 301, India',
    email  : 'info@sixdengineering.com',
    phone  : '+91 84481 79046',
  },
  {
    region : 'UAE',
    company: 'Six D Engineering Solutions FZC',
    address: 'B 49-130, Sharjah Research Technology & Innovation Park (SRTIP), Sharjah, United Arab Emirates',
    email  : 'info@sixdengineering.com',
    phone  : '+971 58 522 9400, +971 58556 6837',
  },
]

const POLICY_LINKS = [
  { label: 'Privacy Policy',     href: '#' },
  { label: 'Terms & Conditions', href: '#' },
]

const COPYRIGHT = '© 2026 SixD. All rights reserved'

// ═══════════════════════════════════════════════════════════════════════════════
// ── NEWSLETTER CARD
// ═══════════════════════════════════════════════════════════════════════════════

interface NewsletterState {
  email: string
}

function NewsletterCard() {
  const [open, setOpen]     = useState(false)
  const [form, setForm]     = useState<NewsletterState>({ email: '' })
  const [submitted, setSubmitted] = useState(false)
  const videoRef            = useRef<HTMLVideoElement>(null)

  const handleOpen = () => {
    setOpen(true)
    setSubmitted(false)
  }

  const handleClose = () => {
    setOpen(false)
    setForm({ email: '' })
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ email: e.target.value })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // TODO: wire to newsletter service (Mailchimp, ConvertKit, etc.)
    console.log('[Newsletter] subscribe', form.email)
    setSubmitted(true)
  }

  return (
    // Card: 329×186 in Figma, border-radius 12, white bg, overflow hidden
    <div
      onClick={!open ? handleOpen : undefined}
      style={{
        width        : 329,
        height       : 186,
        flexShrink   : 0,
        borderRadius : 12,
        overflow     : 'hidden',
        position     : 'relative',
        cursor       : open ? 'default' : 'pointer',
        background   : colors.white,
      }}
    >
      {/* ── Video layer ─────────────────────────────────────────────────────
          Plays looped + muted. Fades out when form is open.
      ─────────────────────────────────────────────────────────────────────── */}
      <video
        ref={videoRef}
        src={NEWSLETTER_VIDEO}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        style={{
          position  : 'absolute',
          inset     : 0,
          width     : '100%',
          height    : '100%',
          objectFit : 'cover',
          transition: 'opacity 0.4s ease',
          opacity   : open ? 0 : 1,
        }}
      />

      {/* ── Card label (visible when video is playing) ──────────────────── */}
      <div
        aria-hidden={open}
        style={{
          position  : 'absolute',
          inset     : 0,
          padding   : 12,
          display   : 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          // Gradient so text stays readable over any video frame
          background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)',
          transition: 'opacity 0.3s ease',
          opacity   : open ? 0 : 1,
          pointerEvents: 'none',
        }}
      >
        <p style={{
          ...textStyles.h4,
          color     : colors.white,
          lineHeight: 1.2,
        }}>
          Sign Up to Our<br />Newsletter
        </p>
        <p style={{
          ...textStyles.label,
          color    : colors.white70,
          marginTop: 4,
        }}>
          Tap to subscribe →
        </p>
      </div>

      {/* ── Signup form (slides in on click) ────────────────────────────── */}
      <div
        style={{
          position  : 'absolute',
          inset     : 0,
          padding   : 16,
          background: colors.white,
          display   : 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
          opacity   : open ? 1 : 0,
          transform : open ? 'translateY(0)' : 'translateY(12px)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label="Close newsletter form"
          style={{
            position  : 'absolute',
            top       : 10,
            right     : 12,
            background: 'none',
            border    : 'none',
            cursor    : 'pointer',
            padding   : 4,
            color     : colors.ink,
            lineHeight: 1,
            fontSize  : 18,
          }}
        >
          ✕
        </button>

        {submitted ? (
          // ── Success state ──
          <div style={{ textAlign: 'center' }}>
            <p style={{ ...textStyles.h4, color: colors.brand1, marginBottom: 6 }}>
              You're in!
            </p>
            <p style={{ ...textStyles.body, color: colors.ink60 }}>
              We'll be in touch with the latest from SixDX.
            </p>
          </div>
        ) : (
          // ── Input state ──
          <>
            <p style={{
              ...textStyles.h4,
              color       : colors.ink,
              lineHeight  : 1.2,
              marginBottom: 12,
            }}>
              Sign Up to Our<br />Newsletter
            </p>
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                style={{
                  ...textStyles.body,
                  width        : '100%',
                  padding      : '8px 10px',
                  border       : `1px solid ${colors.ink10}`,
                  borderRadius : 4,
                  background   : colors.ink05,
                  color        : colors.ink,
                  outline      : 'none',
                  boxSizing    : 'border-box',
                }}
              />
              <button
                type="submit"
                style={{
                  ...textStyles.bodyMedium,
                  width       : '100%',
                  padding     : '8px 0',
                  background  : colors.brand1,
                  color       : colors.white,
                  border      : 'none',
                  borderRadius: 4,
                  cursor      : 'pointer',
                }}
              >
                Subscribe
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function FooterSection() {
  return (
    // ── Outer shell — no background here so the gradient isn't stretched by
    // the Motor section's GSAP spacer (which inflates the element to ~660svh).
    // Each visual block owns its own background instead.
    <footer
      aria-label="Footer"
      data-theme="light"
      style={{
        display      : 'flex',
        flexDirection: 'column',
        width        : '100%',
        position     : 'relative',
        boxSizing    : 'border-box',
      }}
    >

      {/* ══════════════════════════════════════════════════════════════════════
          GRADIENT BLOCK — carries the Figma gradient on a fixed-height div
          so the colour stops work correctly regardless of what comes after.
          Contains: CTA_Container (tagline + button + pills)
                  + Main Container (offices + newsletter)
          Padding matches original footer: 100px top, 28px sides, 60px bottom.
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{
        background   : FOOTER_GRADIENT,
        padding      : '100px 28px 60px',
        display      : 'flex',
        flexDirection: 'column',
        gap          : 200,          // Figma: gap between CTA_Container and Bottom_container
        boxSizing    : 'border-box',
        width        : '100%',
      }}>

        {/* ── CTA_CONTAINER — Figma 408:247 ────────────────────────────────── */}
        <div style={{
          display      : 'flex',
          flexDirection: 'column',
          gap          : 40,
          position     : 'relative',
          zIndex       : 1,
        }}>

          {/* CTA block: tagline + button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <h2 style={{
              ...textStyles.h1,
              color   : colors.ink,
              maxWidth: '52rem',
            }}>
              {TAGLINE}
            </h2>
            <div>
              <PrimaryButton label="Get in touch" href="#contact" variant="brand" />
            </div>
          </div>

          {/* Menu Container — nav pills */}
          <div style={{ display: 'flex', gap: 2, width: '100%' }}>
            {NAV_PILLS.map(pill => (
              <a
                key={pill.label}
                href={pill.href}
                style={{
                  ...textStyles.body,
                  flex          : 1,
                  color         : colors.white,
                  background    : colors.ink10,
                  borderRadius  : 2,
                  padding       : '4px 16px',
                  textDecoration: 'none',
                  textAlign     : 'center',
                  transition    : 'background 0.2s ease',
                  boxSizing     : 'border-box',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = colors.ink05)}
                onMouseLeave={e => (e.currentTarget.style.background = colors.ink10)}
              >
                {pill.label}
              </a>
            ))}
          </div>

        </div>

        {/* ── MAIN CONTAINER — offices (left) + newsletter card (right) ─────── */}
        <div style={{
          display       : 'flex',
          justifyContent: 'space-between',
          alignItems    : 'flex-start',
          width         : '100%',
          gap           : 4,
          position      : 'relative',
          zIndex        : 1,
        }}>

          {/* Office info columns */}
          <div style={{ display: 'flex', gap: 28, width: 560, flexShrink: 0 }}>
            {OFFICES.map(office => (
              <div
                key={office.region}
                style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}
              >
                <p style={{ ...textStyles.h4, color: colors.white, lineHeight: 1, whiteSpace: 'nowrap' }}>
                  {office.region}
                </p>
                <div style={{ width: '100%', height: 1, background: colors.white08, flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <p style={{ ...textStyles.label, lineHeight: 1.28, color: colors.white50 }}>
                    {office.company}<br />{office.address}
                  </p>
                  <p style={{ ...textStyles.label, lineHeight: 1.28, color: colors.ink60 }}>
                    {office.email}
                  </p>
                  <p style={{ ...textStyles.label, lineHeight: 1.28, color: colors.ink60 }}>
                    {office.phone}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <NewsletterCard />
        </div>

      </div>{/* end GRADIENT BLOCK */}

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER BOTTOM — policies (left) + copyright (right)
          Uses the darkest gradient stop (#1c0b05) as a flat background so it
          reads as a seamless continuation of the footer palette.
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{
        background    : '#1c0b05',
        padding       : '0 28px 14px',
        display       : 'flex',
        justifyContent: 'space-between',
        alignItems    : 'center',
        gap           : 8,
        boxSizing     : 'border-box',
        width         : '100%',
      }}>

        <div style={{ display: 'flex', gap: 24 }}>
          {POLICY_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              style={{
                fontFamily    : fonts.hn,
                fontSize      : '0.625rem',
                letterSpacing : '0em',
                lineHeight    : 1.4,
                fontWeight    : 'normal',
                color         : 'rgba(255,255,255,0.5)',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <p style={{
          fontFamily   : fonts.hn,
          fontSize     : '0.625rem',
          letterSpacing: '0em',
          lineHeight   : 1.4,
          fontWeight   : 'normal',
          color        : 'rgba(28,11,5,0.50)',
          margin       : 0,
        }}>
          {COPYRIGHT}
        </p>

      </div>

    </footer>
  )
}
