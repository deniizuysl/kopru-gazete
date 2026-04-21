import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base(size: number, extraClass?: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: extraClass,
  };
}

export function ChatIcon({ size = 14, className, ...rest }: IconProps) {
  return (
    <svg {...base(size, className)} {...rest}>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
    </svg>
  );
}

export function EyeIcon({ size = 14, className, ...rest }: IconProps) {
  return (
    <svg {...base(size, className)} {...rest}>
      <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function ClockIcon({ size = 14, className, ...rest }: IconProps) {
  return (
    <svg {...base(size, className)} {...rest}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function PenIcon({ size = 14, className, ...rest }: IconProps) {
  return (
    <svg {...base(size, className)} {...rest}>
      <path d="M3 21l3-1 11-11-2-2L4 18l-1 3z" />
      <path d="M14 6l4 4" />
    </svg>
  );
}

export function CameraIcon({ size = 14, className, ...rest }: IconProps) {
  return (
    <svg {...base(size, className)} {...rest}>
      <path d="M3 8h3l2-3h8l2 3h3v11H3z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

export function PlusIcon({ size = 14, className, ...rest }: IconProps) {
  return (
    <svg {...base(size, className)} {...rest}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function ArrowLeftIcon({ size = 14, className, ...rest }: IconProps) {
  return (
    <svg {...base(size, className)} {...rest}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 14, className, ...rest }: IconProps) {
  return (
    <svg {...base(size, className)} {...rest}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function SearchIcon({ size = 14, className, ...rest }: IconProps) {
  return (
    <svg {...base(size, className)} {...rest}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function NewspaperIcon({ size = 14, className, ...rest }: IconProps) {
  return (
    <svg {...base(size, className)} {...rest}>
      <path d="M4 5h13a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M19 8h2v8a3 3 0 0 1-3 3" />
      <path d="M7 9h8M7 13h8M7 17h5" />
    </svg>
  );
}

export function SunIcon({ size = 14, className, ...rest }: IconProps) {
  return (
    <svg {...base(size, className)} {...rest}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
    </svg>
  );
}

export function CloudIcon({ size = 14, className, ...rest }: IconProps) {
  return (
    <svg {...base(size, className)} {...rest}>
      <path d="M7 18h10a4 4 0 0 0 .7-7.9 6 6 0 0 0-11.6 1.3A3.5 3.5 0 0 0 7 18z" />
    </svg>
  );
}

export function CloudSunIcon({ size = 14, className, ...rest }: IconProps) {
  return (
    <svg {...base(size, className)} {...rest}>
      <circle cx="8" cy="8" r="3" />
      <path d="M8 2v1.5M8 13.5V15M2 8h1.5M13.5 8H15M3.5 3.5l1 1M12.5 12.5l1 1M3.5 12.5l1-1M13 4l-1 1" />
      <path d="M11 19h8a3 3 0 0 0 .5-6 5 5 0 0 0-9.5 1A2.8 2.8 0 0 0 11 19z" />
    </svg>
  );
}

export function RainIcon({ size = 14, className, ...rest }: IconProps) {
  return (
    <svg {...base(size, className)} {...rest}>
      <path d="M7 14h10a4 4 0 0 0 .7-7.9 6 6 0 0 0-11.6 1.3A3.5 3.5 0 0 0 7 14z" />
      <path d="M9 18l-1 3M13 18l-1 3M17 18l-1 3" />
    </svg>
  );
}

export function SnowIcon({ size = 14, className, ...rest }: IconProps) {
  return (
    <svg {...base(size, className)} {...rest}>
      <path d="M7 14h10a4 4 0 0 0 .7-7.9 6 6 0 0 0-11.6 1.3A3.5 3.5 0 0 0 7 14z" />
      <path d="M9 19l.01 0M13 20l.01 0M17 19l.01 0M9 22l.01 0M13 17l.01 0M17 22l.01 0" />
    </svg>
  );
}

export function ThunderIcon({ size = 14, className, ...rest }: IconProps) {
  return (
    <svg {...base(size, className)} {...rest}>
      <path d="M7 14h10a4 4 0 0 0 .7-7.9 6 6 0 0 0-11.6 1.3A3.5 3.5 0 0 0 7 14z" />
      <path d="M12 16l-2 4h3l-1 3" />
    </svg>
  );
}

export function FogIcon({ size = 14, className, ...rest }: IconProps) {
  return (
    <svg {...base(size, className)} {...rest}>
      <path d="M4 10h14M6 14h12M5 18h14M8 6h8" />
    </svg>
  );
}

export function KopruIcon({
  size = 24,
  className,
  ...rest
}: IconProps) {
  return (
    <svg
      width={size * 2.66}
      height={size}
      viewBox="0 0 64 24"
      fill="none"
      className={className}
      aria-hidden
      {...rest}
    >
      <path
        d="M2 20 L62 20 M8 20 L8 14 M20 20 L20 10 M32 20 L32 6 M44 20 L44 10 M56 20 L56 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M2 20 Q32 2 62 20"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
