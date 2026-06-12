import Link from "next/link";

const LOGO_ASPECT_RATIO = 1575 / 999;

interface SiteLogoProps {
  height?: number;
  className?: string;
}

export function SiteLogo({ height = 32, className = "" }: SiteLogoProps) {
  const width = Math.round(height * LOGO_ASPECT_RATIO);

  return (
    <Link
      href="/"
      className={`inline-flex shrink-0 items-center pixel-transition ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo.png"
        alt="menaRun"
        width={width}
        height={height}
        data-pixel="true"
        className="pixel-render block max-w-none"
        style={{ height: `${height}px`, width: `${width}px` }}
      />
    </Link>
  );
}
