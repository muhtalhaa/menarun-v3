"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";

interface PixelCelebrationProps {
  isVisible: boolean;
  onComplete: () => void;
}

export function PixelCelebration({ isVisible, onComplete }: PixelCelebrationProps) {
  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!isVisible) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      handleComplete();
      return;
    }

    const timer = setTimeout(handleComplete, 2500);
    return () => clearTimeout(timer);
  }, [isVisible, handleComplete]);

  if (!isVisible) return null;

  function handleSkip() {
    handleComplete();
  }

  return (
    <div
      className="celebration-overlay fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-primary/90"
      onClick={handleSkip}
      role="presentation"
    >
      <div
        className="celebration-content relative flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="celebration-flag relative mb-2">
          <div className="h-10 w-8 border-2 border-tosca-dark bg-bg-primary">
            <div className="h-2.5 w-full bg-tosca" />
            <div className="h-2.5 w-full bg-bg-primary" />
            <div className="h-2.5 w-full bg-tosca" />
            <div className="h-2.5 w-full bg-bg-primary" />
          </div>
          <div className="absolute -bottom-4 left-1/2 h-4 w-0.5 -translate-x-1/2 bg-tosca-dark" />
        </div>

        <div className="celebration-runner">
          <Image
            src="/images/celebration/runner-sprite.png"
            alt=""
            width={48}
            height={48}
            data-pixel="true"
            className="pixel-render"
            aria-hidden
          />
        </div>

        <p className="celebration-text mt-6 text-center font-pixel text-[10px] leading-relaxed text-tosca-dark md:text-xs">
          Mubarak!
          <br />
          Khuddam Zindabad!
        </p>

        <div className="celebration-stars relative mt-4 h-8 w-32">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="celebration-star absolute h-1 w-1"
              style={{
                left: `${15 + i * 12}%`,
                top: "50%",
                backgroundColor: i % 2 === 0 ? "#2A9D8F" : "#E5A100",
              }}
            />
          ))}
        </div>
      </div>

      <p className="mt-8 font-pixelBody text-sm text-text-muted">
        Ketuk untuk lewati
      </p>
    </div>
  );
}
