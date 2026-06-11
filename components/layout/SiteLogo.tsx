import Image from "next/image";
import Link from "next/link";

interface SiteLogoProps {
  height?: number;
  className?: string;
}

export function SiteLogo({ height = 32, className = "" }: SiteLogoProps) {
  const width = Math.round(height * 2.5);

  return (
    <Link href="/" className={`inline-block pixel-transition ${className}`}>
      <Image
        src="/images/logo.png"
        alt="menaRun"
        width={width}
        height={height}
        data-pixel="true"
        className="pixel-render"
        priority
      />
    </Link>
  );
}
