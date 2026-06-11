"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface MajlisSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function MajlisSelect({
  options,
  value,
  onChange,
  error,
}: MajlisSelectProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        if (value) setQuery(value);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  function selectOption(opt: string) {
    onChange(opt);
    setQuery(opt);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1">
      <label
        htmlFor="majlis"
        className="font-pixelBody text-lg text-text-secondary"
      >
        Majlis
      </label>
      <div className="relative">
        <input
          id="majlis"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (!e.target.value) onChange("");
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Cari majlis..."
          autoComplete="off"
          className={`pixel-focus w-full rounded-pixel border-2 border-tosca-muted bg-bg-card px-3 py-2 pr-10 font-sans text-text-primary placeholder:font-pixelBody placeholder:text-lg placeholder:text-text-muted focus:border-tosca focus:shadow-pixel-glow ${error ? "border-semantic-danger" : ""}`}
        />
        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
      </div>

      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-20 mt-[4.5rem] max-h-48 w-full overflow-y-auto rounded-pixel border-2 border-tosca-muted bg-bg-card shadow-card">
          {filtered.slice(0, 50).map((opt) => (
            <li key={opt}>
              <button
                type="button"
                onClick={() => selectOption(opt)}
                className="pixel-focus w-full px-3 py-2 text-left font-sans text-sm text-text-primary hover:bg-bg-toscaTint"
              >
                {opt}
              </button>
            </li>
          ))}
          {filtered.length > 50 && (
            <li className="px-3 py-2 font-sans text-xs text-text-muted">
              +{filtered.length - 50} hasil lainnya — ketik lebih spesifik
            </li>
          )}
        </ul>
      )}

      {isOpen && query && filtered.length === 0 && (
        <p className="font-sans text-sm text-text-muted">
          Majlis tidak ditemukan
        </p>
      )}

      {error && (
        <p className="font-sans text-sm text-semantic-danger">{error}</p>
      )}
    </div>
  );
}
