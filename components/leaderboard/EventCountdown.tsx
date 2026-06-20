"use client";

import { useEffect, useState } from "react";
import { getCountdownParts, type CountdownParts } from "@/lib/countdown";

interface EventCountdownProps {
  endTimeIso: string;
  initialParts: CountdownParts;
}

export function EventCountdown({
  endTimeIso,
  initialParts,
}: EventCountdownProps) {
  const [parts, setParts] = useState(initialParts);

  useEffect(() => {
    const end = new Date(endTimeIso);
    const tick = () => setParts(getCountdownParts(end));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTimeIso]);

  if (parts.isEnded) {
    return (
      <p className="font-pixelBody text-sm text-text-muted md:text-base">
        Event telah berakhir
      </p>
    );
  }

  return (
    <div>
      <p className="font-pixel text-lg leading-tight text-tosca-dark md:text-xl">
        {parts.days}{" "}
        <span className="font-pixelBody text-sm md:text-base">hari</span>
      </p>
      <p className="mt-1 font-sans text-[11px] text-text-secondary md:text-xs">
        {parts.hours} jam {parts.minutes} menit {parts.seconds} detik
      </p>
    </div>
  );
}
