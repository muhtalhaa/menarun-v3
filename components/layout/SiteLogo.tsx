import Image from "next/image";
import Link from "next/link";

const LOGO_ASPECT_RATIO = 1575 / 999;

interface SiteLogoProps {
  height?: number;
  className?: string;
}

export function SiteLogo({ height = 32, className = "" }: SiteLogoProps) {
  const width = Math.round(height * LOGO_ASPECT_RATIO);

  return (
    <Link href="/" className={`inline-block pixel-transition ${className}`}>
      <Image
        src="/images/logo.png"
        alt="menaRun"
        width={width}
        height={height}
        data-pixel="true"
        className="pixel-render"
        style={{ height: `${height}px`, width: `${width}px` }}
        priority
      />
    </Link>
  );
}
