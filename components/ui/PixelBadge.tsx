type PixelBadgeVariant = "default" | "success" | "warning" | "danger";

interface PixelBadgeProps {
  children: React.ReactNode;
  variant?: PixelBadgeVariant;
  className?: string;
}

const variantStyles: Record<PixelBadgeVariant, string> = {
  default: "bg-bg-toscaTint text-tosca-dark border-tosca-muted",
  success: "bg-bg-toscaTint text-tosca-dark border-tosca",
  warning: "bg-semantic-warning/10 text-semantic-warning border-semantic-warning/30",
  danger: "bg-semantic-danger/10 text-semantic-danger border-semantic-danger/30",
};

export function PixelBadge({
  children,
  variant = "default",
  className = "",
}: PixelBadgeProps) {
  return (
    <span
      className={`inline-block rounded-pixel border-2 px-2 py-0.5 font-pixel text-[10px] uppercase ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
