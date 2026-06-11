import { ButtonHTMLAttributes, forwardRef } from "react";

type PixelButtonVariant = "primary" | "secondary";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PixelButtonVariant;
  isLoading?: boolean;
}

export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  (
    {
      variant = "primary",
      isLoading = false,
      className = "",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "pixel-focus pixel-transition inline-flex items-center justify-center border-2 font-pixel text-xs uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-50 rounded-pixel";

    const variants: Record<PixelButtonVariant, string> = {
      primary:
        "border-tosca-dark bg-tosca text-text-onTosca shadow-pixel-md hover:translate-x-px hover:translate-y-px hover:bg-tosca-light hover:shadow-[3px_3px_0_#1F7A6F] active:translate-x-0.5 active:translate-y-0.5 active:bg-tosca-dark active:shadow-pixel-sm",
      secondary:
        "border-tosca bg-bg-card text-tosca shadow-[4px_4px_0_#2A9D8F33] hover:translate-x-px hover:translate-y-px hover:shadow-[3px_3px_0_#2A9D8F33] active:translate-x-0.5 active:translate-y-0.5 active:shadow-pixel-sm",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} px-4 py-2 ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? "..." : children}
      </button>
    );
  }
);

PixelButton.displayName = "PixelButton";
