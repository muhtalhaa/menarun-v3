import { InputHTMLAttributes, forwardRef } from "react";

interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="font-pixelBody text-lg text-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`pixel-focus rounded-pixel border-2 border-tosca-muted bg-bg-card px-3 py-2 font-sans text-text-primary placeholder:font-pixelBody placeholder:text-lg placeholder:text-text-muted focus:border-tosca focus:shadow-pixel-glow ${error ? "border-semantic-danger" : ""} ${className}`}
          {...props}
        />
        {error && (
          <p className="font-sans text-sm text-semantic-danger">{error}</p>
        )}
      </div>
    );
  }
);

PixelInput.displayName = "PixelInput";
