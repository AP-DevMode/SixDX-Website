// ─── WORK CARD — SixDX ────────────────────────────────────────────────────────
// Standalone project card. Background can be an image OR a video — never both.
//
// Image card:
//   <WorkCard image="/img/mill.webp" title="Integrated Mill Furnace Floor" tag="Steel" />
//
// Video card:
//   <WorkCard
//     video="/vid/mill.mp4"
//     videoPoster="/img/mill-poster.webp"   ← shown until video plays
//     title="Integrated Mill Furnace Floor"
//     tag="Steel"
//   />
//
// All other props (height, radius, overlay, href, tagBg, tagColor…) work the
// same on both variants.
// ─────────────────────────────────────────────────────────────────────────────

import type { CSSProperties } from 'react'
import { colors, textStyles } from '../../styles/tokens'

// ── Internal defaults ─────────────────────────────────────────────────────────
const CARD_RADIUS  = 2
const CARD_PADDING = 12
const CARD_HEIGHT  = 508

// ── Props ─────────────────────────────────────────────────────────────────────

// Discriminated union — supply EITHER image OR video (not both).
type BackgroundMedia =
  | {
      /** Static image URL/path */
      image: string
      /** Accessible alt text (falls back to title) */
      imageAlt?: string
      video?: never
      videoPoster?: never
    }
  | {
      /** Video file URL/path — autoplays muted, loops, pauses when off-screen */
      video: string
      /** Poster frame shown before the video loads  (highly recommended) */
      videoPoster?: string
      image?: never
      imageAlt?: never
    }

export type WorkCardProps = BackgroundMedia & {
  /** Bottom-left project title */
  title: string
  /** Industry / category pill shown top-left (hidden when omitted) */
  tag?: string
  /** Pill background colour  (default: white) */
  tagBg?: string
  /** Pill text colour  (default: black) */
  tagColor?: string
  /** Card height in px  (default: 508) */
  height?: number
  /** Corner radius in px  (default: 2) */
  radius?: number
  /** CSS gradient layered between the media and the text labels.
   *  Useful for legibility on light backgrounds.
   *  e.g. "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" */
  overlay?: string
  /** Makes the whole card an <a> element */
  href?: string
  /** Link target  (default: '_self') */
  target?: string
  /** Extra inline styles on the card root */
  style?: CSSProperties
  /** Extra class names on the card root */
  className?: string
  onClick?: () => void
}

// ── Shared media styles ───────────────────────────────────────────────────────

function mediaStyle(radius: number): CSSProperties {
  return {
    position:      'absolute',
    inset:         0,
    width:         '100%',
    height:        '100%',
    objectFit:     'cover',
    borderRadius:  radius,
    pointerEvents: 'none',
    userSelect:    'none',
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function WorkCard({
  title,
  tag,
  tagBg    = '#FFFFFF',
  tagColor = '#000000',
  height   = CARD_HEIGHT,
  radius   = CARD_RADIUS,
  overlay,
  href,
  target   = '_self',
  style,
  className,
  onClick,
  ...media
}: WorkCardProps) {

  const root: CSSProperties = {
    position:       'relative',
    overflow:       'hidden',
    borderRadius:   radius,
    height,
    display:        'flex',
    flexDirection:  'column',
    justifyContent: 'space-between',
    padding:        CARD_PADDING,
    boxSizing:      'border-box',
    cursor:         href || onClick ? 'pointer' : 'default',
    textDecoration: 'none',
    color:          'inherit',
    flex:           '1 0 0',
    minWidth:       0,
    ...style,
  }

  const overlayStyle: CSSProperties = {
    position:      'absolute',
    inset:         0,
    borderRadius:  radius,
    pointerEvents: 'none',
    background:    overlay,
  }

  const tagStyle: CSSProperties = {
    display:      'inline-flex',
    alignItems:   'center',
    alignSelf:    'flex-start',
    flexShrink:   0,
    position:     'relative',
    background:   tagBg,
    padding:      '4px 16px',
    borderRadius: 1,
  }

  const tagTextStyle: CSSProperties = {
    ...textStyles.bodyMedium,
    color:     tagColor,
    whiteSpace: 'nowrap',
  }

  const titleStyle: CSSProperties = {
    ...textStyles.h4,
    lineHeight: 1,
    color:      colors.ink,
    position:   'relative',
  }

  const inner = (
    <>
      {/* ── Background media (image OR video) ────────────────────────────── */}
      {'video' in media && media.video ? (
        <video
          src={media.video}
          poster={media.videoPoster}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          style={mediaStyle(radius)}
        />
      ) : (
        <img
          src={(media as { image: string }).image}
          alt={(media as { imageAlt?: string; title?: string }).imageAlt ?? title}
          style={mediaStyle(radius)}
        />
      )}

      {/* ── Optional overlay gradient ─────────────────────────────────────── */}
      {overlay && <div aria-hidden="true" style={overlayStyle} />}

      {/* ── Industry tag — top left ───────────────────────────────────────── */}
      {tag && (
        <div style={tagStyle}>
          <p style={tagTextStyle}>{tag}</p>
        </div>
      )}

      {/* ── Project title — bottom left ───────────────────────────────────── */}
      <p style={titleStyle}>{title}</p>
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        target={target}
        style={root}
        className={className}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      >
        {inner}
      </a>
    )
  }

  return (
    <div
      style={root}
      className={className}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {inner}
    </div>
  )
}
