"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PixelSelect } from "@/components/ui/PixelSelect";
import type { EventFilterOption } from "@/types/event.types";

interface EventFilterProps {
  events: EventFilterOption[];
  selectedEventId: string;
}

export function EventFilter({ events, selectedEventId }: EventFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(eventId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (eventId) {
      params.set("eventId", eventId);
    } else {
      params.delete("eventId");
    }
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const options = events.map((e) => {
    const labels: string[] = [];
    if (e.isCurrent) labels.push("Terkini");
    if (e.isActive) labels.push("Aktif");
    else labels.push("Nonaktif");

    return {
      value: e.id,
      label: `${e.nama} (${labels.join(" · ")})`,
    };
  });

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="event-filter"
        className="font-pixelBody text-lg text-text-secondary"
      >
        Filter Event
      </label>
      <PixelSelect
        id="event-filter"
        options={options}
        value={selectedEventId}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
}
