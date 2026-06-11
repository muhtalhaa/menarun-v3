"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { PixelButton } from "./PixelButton";

interface PixelModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function PixelModal({ isOpen, onClose, title, children }: PixelModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md rounded-pixel border-2 border-tosca-muted bg-bg-card p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="pixel-focus absolute right-3 top-3 text-text-muted hover:text-tosca"
          aria-label="Tutup"
        >
          <X size={20} />
        </button>

        {title && (
          <h2 className="mb-4 pr-8 font-pixel text-xs text-tosca-dark">{title}</h2>
        )}

        {children}

        <div className="mt-6 flex justify-end">
          <PixelButton variant="secondary" onClick={onClose}>
            Tutup
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
