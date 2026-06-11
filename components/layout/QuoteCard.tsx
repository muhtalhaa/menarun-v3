import { PixelCard } from "@/components/ui/PixelCard";

export function QuoteCard() {
  return (
    <PixelCard className="border-tosca-muted bg-bg-toscaTint/50 p-5 text-center">
      <blockquote className="font-pixelBody text-lg leading-relaxed text-text-primary md:text-xl">
        &ldquo;A Nation Cannot Be Reformed Without Reformation of its Youth&rdquo;
      </blockquote>
      <p className="mt-3 font-sans text-sm text-text-secondary">
        — Hadhrat Mirza Basyiruddin Mahmud Ahmad ra.
      </p>
      <p className="mt-1 font-pixel text-[8px] text-tosca-dark md:text-[10px]">
        Khalifatul Masih II
      </p>
    </PixelCard>
  );
}
