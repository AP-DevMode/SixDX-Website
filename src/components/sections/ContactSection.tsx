// ─── CONTACT SECTION — SixDX ─────────────────────────────────────────────────
// Figma node : 323:203  "Contact"
// Layout     : full-bleed image bg + 50% dark overlay, 28px sides, 100px top/bottom
// Two cols   : left = contact info (flex:1) | right = form (619px fixed)
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState, type CSSProperties, type FormEvent, type ChangeEvent } from 'react'
import { colors, textStyles } from '../../styles/tokens'
import PrimaryButton from '../ui/PrimaryButton'

// ── Background image ──────────────────────────────────────────────────────────
// Swap the filename here to change the contact section image.
const BG_IMG = '/images/contact-bg.png'

// ── Background overlay ────────────────────────────────────────────────────────
// Change the last number (0–1) to control image darkness.
// 0 = image fully visible,  1 = completely black.
const BG_OVERLAY = 'rgba(0,0,0,0.66)'

// ── Section-local aliases ─────────────────────────────────────────────────────
const T = {
  inputBg: colors.white08,
  inputBd: colors.white08,
  dimText: colors.white70,
  divider: colors.white25,
  overlay: BG_OVERLAY,
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// ── CONTENT — edit here
// ═══════════════════════════════════════════════════════════════════════════════
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

const INDUSTRIES = [
  'Oil & Gas', 'Steel & Metal', 'Manufacturing',
  'Construction', 'Mining', 'Power & Energy', 'Chemical', 'Other',
]

const PRODUCTION_TYPES = [
  'SOP-based modules',
  'Incident reconstruction',
  'Plant familiarisation walkthrough',
  'Emergency response training',
  'Other',
]

// ═══════════════════════════════════════════════════════════════════════════════
// ── HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
interface FormState {
  name          : string
  email         : string
  phone         : string
  company       : string
  industry      : string
  productionType: string
  message       : string
}

// Shared input box style (Figma: backdrop-blur 6px, 8% white bg, 1px border, r:2)
const inputBase: CSSProperties = {
  ...textStyles.body,
  width              : '100%',
  background         : T.inputBg,
  border             : `1px solid ${T.inputBd}`,
  borderRadius       : 2,
  backdropFilter     : 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  color              : colors.white,
  padding            : '0 8px',
  boxSizing          : 'border-box' as const,
  outline            : 'none',
  height             : 48,
}

// Chevron SVG used inside both dropdowns
function Chevron() {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      aria-hidden="true"
      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', flexShrink: 0 }}
    >
      <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function ContactSection() {
  const [form, setForm] = useState<FormState>({
    name: '', email: '', phone: '', company: '',
    industry: '', productionType: '', message: '',
  })
  // Hidden native submit button — PrimaryButton triggers it via ref
  const submitRef = useRef<HTMLButtonElement>(null)

  const set = (field: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // TODO: wire to backend / email service
    console.log('[ContactSection] submit', form)
  }

  const labelStyle: CSSProperties = {
    ...textStyles.body,
    color  : colors.white,
    display: 'block',
  }

  return (
    <section
      aria-label="Contact — Tell us about your project"
      data-theme="dark"
      style={{
        position          : 'relative',
        padding           : '100px 28px',
        display           : 'flex',
        justifyContent    : 'space-between',
        alignItems        : 'flex-start',
        boxSizing         : 'border-box',
        overflow          : 'hidden',
        width             : '100%',
        // ── Background image — CSS approach (no <img> tag needed) ──────────
        // To swap: change BG_IMG at the top of this file.
        backgroundImage   : `linear-gradient(${T.overlay}, ${T.overlay}), url("${BG_IMG}")`,
        backgroundSize    : 'cover',
        backgroundPosition: 'center',
        backgroundRepeat  : 'no-repeat',
      }}
    >

      {/* ════════════════════════════════════════════════════════════════════
          LEFT COLUMN — heading + office locations
          flex:1, stretched to match form height via justify-content:space-between
      ════════════════════════════════════════════════════════════════════ */}
      <div style={{
        maxWidth      : '42.75rem',
        flex          : '1 0 0',
        display       : 'flex',
        flexDirection : 'column',
        justifyContent: 'space-between',
        alignSelf     : 'stretch',
        position      : 'relative',
        minWidth      : 0,
        gap           : 60,
      }}>

        {/* Heading — h2 token */}
        <h2 style={{
          ...textStyles.h2,
          color: colors.white,
        }}>
          Tell us about your project
        </h2>

        {/* Office blocks — side by side, gap 28px */}
        <div style={{ display: 'flex', gap: 28, width: '100%' }}>
          {OFFICES.map(office => (
            <div key={office.region} style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

              {/* Region name — h4 token */}
              <p style={{
                ...textStyles.h4,
                lineHeight: 1,
                color     : colors.white,
                whiteSpace: 'nowrap',
              }}>
                {office.region}
              </p>

              {/* Hairline divider */}
              <div style={{ width: '100%', height: 1, background: T.divider, flexShrink: 0 }} />

              {/* Contact details — label token at white70 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ ...textStyles.label, lineHeight: 1.28, color: T.dimText }}>
                  {office.company}<br />{office.address}
                </p>
                <p style={{ ...textStyles.label, lineHeight: 1.28, color: T.dimText }}>
                  {office.email}
                </p>
                <p style={{ ...textStyles.label, lineHeight: 1.28, color: T.dimText }}>
                  {office.phone}
                </p>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          RIGHT COLUMN — contact form (619px fixed, matches Figma)
      ════════════════════════════════════════════════════════════════════ */}
      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          width         : '38.75rem',   // ← change this value to resize the form column
          maxWidth      : '100%',       // never overflow on small screens
          flexShrink    : 0,
          display       : 'flex',
          flexDirection : 'column',
          gap           : 24,
          position      : 'relative',
        }}
      >

        {/* ── Fields ──────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Text inputs — Name, Email, Phone, Company */}
          {([
            { label: 'Name*',          field: 'name'    as const, type: 'text'  },
            { label: 'Email*',         field: 'email'   as const, type: 'email' },
            { label: 'Phone Number*',  field: 'phone'   as const, type: 'tel'   },
            { label: 'Company Name*',  field: 'company' as const, type: 'text'  },
          ] as const).map(({ label, field, type }) => (
            <label key={field} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={labelStyle}>{label}</span>
              <input
                type={type}
                value={form[field]}
                onChange={set(field)}
                required
                autoComplete="off"
                style={inputBase}
              />
            </label>
          ))}

          {/* Industry dropdown */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={labelStyle}>Industry*</span>
            <div style={{ position: 'relative' }}>
              <select
                required
                value={form.industry}
                onChange={set('industry')}
                style={{
                  ...inputBase,
                  appearance        : 'none',
                  WebkitAppearance  : 'none',
                  paddingRight      : 36,
                  cursor            : 'pointer',
                  color             : form.industry ? colors.white : colors.white30,
                }}
              >
                <option value="" disabled hidden>Select</option>
                {INDUSTRIES.map(o => (
                  <option key={o} value={o} style={{ color: '#000', background: '#fff' }}>{o}</option>
                ))}
              </select>
              <Chevron />
            </div>
          </label>

          {/* Production type dropdown */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={labelStyle}>Production type of interest*</span>
            <div style={{ position: 'relative' }}>
              <select
                required
                value={form.productionType}
                onChange={set('productionType')}
                style={{
                  ...inputBase,
                  appearance        : 'none',
                  WebkitAppearance  : 'none',
                  paddingRight      : 36,
                  cursor            : 'pointer',
                  color             : form.productionType ? colors.white : colors.white30,
                }}
              >
                <option value="" disabled hidden>Select</option>
                {PRODUCTION_TYPES.map(o => (
                  <option key={o} value={o} style={{ color: '#000', background: '#fff' }}>{o}</option>
                ))}
              </select>
              <Chevron />
            </div>
          </label>

          {/* Message textarea */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={labelStyle}>Message</span>
            <textarea
              value={form.message}
              onChange={set('message')}
              rows={5}
              style={{ ...inputBase, height: 100, resize: 'none', padding: 8 }}
            />
          </label>

        </div>

        {/* ── Submit ──────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>

          {/*
            Hidden native submit button — required so the browser still runs
            HTML5 validation (required fields, email format, etc.).
            PrimaryButton below calls submitRef.current?.click() on press.
          */}
          <button ref={submitRef} type="submit" style={{ display: 'none' }} aria-hidden="true" />

          {/* Shared PrimaryButton — same component as Navbar CTA */}
          <PrimaryButton
            label="Get in touch"
            href="#"
            variant="white"
            onClick={() => submitRef.current?.click()}
          />

          {/* Subtext — body token */}
          <p style={{
            ...textStyles.body,
            color: T.dimText,
          }}>
            We review every brief personally. You will hear from us within 48 hours.
          </p>

        </div>
      </form>

    </section>
  )
}
