/**
 * Inline stroke icons at a fixed 16px grid, inheriting currentColor.
 *
 * These replace the unicode glyph placeholders (⌂ ↳ ↰ ≡) previously used in
 * the sidebar, which rendered inconsistently across platforms and could not
 * be optically aligned or weighted with the surrounding type.
 */

type IconProps = { size?: number };

function Svg({ size = 16, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 6.6 8 2.5l5.5 4.1V13a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V6.6Z" />
      <path d="M6.25 13.5v-4h3.5v4" />
    </Svg>
  );
}

/** Onboarding: an arrow entering a boundary. */
export function ArrivalIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9.5 2.5H13a.5.5 0 0 1 .5.5v10a.5.5 0 0 1-.5.5H9.5" />
      <path d="M2.5 8h6.5" />
      <path d="M6.75 5.5 9.25 8l-2.5 2.5" />
    </Svg>
  );
}

/** Offboarding: an arrow leaving a boundary. */
export function DepartureIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6.5 2.5H3a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5h3.5" />
      <path d="M13.5 8H7" />
      <path d="M11.25 5.5 13.75 8l-2.5 2.5" />
    </Svg>
  );
}

export function RosterIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 4.25h7.5M6 8h7.5M6 11.75h7.5" />
      <path d="M2.75 4.25h.5M2.75 8h.5M2.75 11.75h.5" />
    </Svg>
  );
}

export function SearchIcon({ size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="7" cy="7" r="4.25" />
      <path d="m10.25 10.25 3 3" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m6 3.5 5 4.5-5 4.5" />
    </svg>
  );
}

export function FlagIcon({ size = 9 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M8 1.5l6.5 11.5H1.5L8 1.5Zm0 4.2a.85.85 0 0 0-.85.95l.3 2.6a.55.55 0 0 0 1.1 0l.3-2.6A.85.85 0 0 0 8 5.7Zm0 5a.8.8 0 1 0 0 1.6.8.8 0 0 0 0-1.6Z" />
    </svg>
  );
}
