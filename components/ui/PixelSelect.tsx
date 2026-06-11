import { SelectHTMLAttributes, forwardRef } from "react";

interface PixelSelectOption {
  value: string;
  label: string;
}

interface PixelSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: PixelSelectOption[];
  placeholder?: string;
}

export const PixelSelect = forwardRef<HTMLSelectElement, PixelSelectProps>(
  (
    { label, error, options, placeholder, className = "", id, ...props },
    ref
  ) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={selectId}
            className="font-pixelBody text-lg text-text-secondary"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`pixel-focus rounded-pixel border-2 border-tosca-muted bg-bg-card px-3 py-2 font-sans text-text-primary focus:border-tosca focus:shadow-pixel-glow ${error ? "border-semantic-danger" : ""} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="font-sans text-sm text-semantic-danger">{error}</p>
        )}
      </div>
    );
  }
);

PixelSelect.displayName = "PixelSelect";
