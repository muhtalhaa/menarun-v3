import Image from "next/image";
import Link from "next/link";

interface SiteLogoProps {
  height?: number;
  className?: string;
}

export function SiteLogo({ height = 32, className = "" }: SiteLogoProps) {
  return (
    <Link href="/" className={`inline-block pixel-transition ${className}`}>
      <Image
        src="/images/logo.png"
        alt="menaRun"
        width={height}
        height={height}
        data-pixel="true"
        className="pixel-render w-auto"
        style={{ height: `${height}px` }}
        priority
      />
    </Link>
  );
}
