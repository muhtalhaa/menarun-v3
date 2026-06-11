import { HTMLAttributes } from "react";

interface PixelCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PixelCard({ children, className = "", ...props }: PixelCardProps) {
  return (
    <div
      className={`rounded-pixel border-2 border-tosca-muted bg-bg-card shadow-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
