interface PixelLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function PixelLoader({ size = "md", className = "" }: PixelLoaderProps) {
  return (
    <div
      className={`inline-block animate-pulse border-2 border-tosca bg-bg-toscaTint shadow-pixel-sm ${sizeMap[size]} ${className}`}
      role="status"
      aria-label="Memuat..."
    />
  );
}
