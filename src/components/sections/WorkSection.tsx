// ─── WORK SECTION — SixDX ─────────────────────────────────────────────────────
// Figma node: 323:118  /  "Work"
//
// To add / remove / edit projects — change the PROJECTS array only.
// To change card appearance — pass props to <WorkCard> or edit WorkCard.tsx.
//
// TODO: replace Figma CDN image URLs with /public/images/work-*.webp before launch.
// ─────────────────────────────────────────────────────────────────────────────

import type { CSSProperties } from 'react'
import WorkCard from '../ui/WorkCard'
import type { WorkCardProps } from '../ui/WorkCard'
import { colors, textStyles } from '../../styles/tokens'

// ── Content ───────────────────────────────────────────────────────────────────

const HEADING  = 'The Work'
const SUBTITLE = 'Three environments. Three industries. Each built from client site documentation.'

// Figma asset URLs — valid ~7 days. Swap for local paths before go-live.
const IMG_1 = 'https://www.figma.com/api/mcp/asset/19c3d883-e7a4-4766-9070-5d954f341dd8'
const IMG_2 = 'https://www.figma.com/api/mcp/asset/84817b4a-a983-467c-9bb0-113cb789f591'
const IMG_3 = 'https://www.figma.com/api/mcp/asset/ef33cbb5-746b-46b6-8b80-b2ffad200306'

// Each row is an array of WorkCardProps. Add/remove rows or cards freely.
const PROJECTS: WorkCardProps[][] = [
  [
    { image: IMG_1, title: 'Integrated Mill Furnace Floor', tag: 'Steel'     },
    { image: IMG_2, title: 'Shutdown Procedure',            tag: 'Oil & Gas' },
    { image: IMG_3, title: 'Hall Isolation',                tag: 'Oil & Gas' },
  ],
  [
    { image: IMG_1, title: 'Integrated Mill Furnace Floor', tag: 'Steel'     },
    { image: IMG_2, title: 'Shutdown Procedure',            tag: 'Oil & Gas' },
    { image: IMG_3, title: 'Hall Isolation',                tag: 'Oil & Gas' },
  ],
]

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  section: {
    background:    colors.white,
    padding:       '100px 28px',
    display:       'flex',
    flexDirection: 'column',
    gap:           60,
    width:         '100%',
    boxSizing:     'border-box',
  } satisfies CSSProperties,

  header: {
    display:        'flex',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
    width:          '100%',
  } satisfies CSSProperties,

  heading: {
    ...textStyles.h2,
    color:      colors.ink,
    whiteSpace: 'nowrap',
  } satisfies CSSProperties,

  subtitle: {
    ...textStyles.h3,
    color:     colors.ink,
    width:     443,
    flexShrink: 0,
  } satisfies CSSProperties,

  grid: {
    display:       'flex',
    flexDirection: 'column',
    gap:           12,
    width:         '100%',
  } satisfies CSSProperties,

  row: {
    display: 'flex',
    gap:     12,
    width:   '100%',
  } satisfies CSSProperties,
}


// ── Section ───────────────────────────────────────────────────────────────────

export default function WorkSection() {
  return (
    <section aria-label="The Work" data-theme="light" style={s.section}>

      <div style={s.header}>
        <h2 style={s.heading}>{HEADING}</h2>
        <p style={s.subtitle}>{SUBTITLE}</p>
      </div>

      <div style={s.grid}>
        {PROJECTS.map((row, ri) => (
          <div key={ri} style={s.row}>
            {row.map((cardProps, ci) => (
              <WorkCard key={`${ri}-${ci}`} {...cardProps} />
            ))}
          </div>
        ))}
      </div>

    </section>
  )
}
