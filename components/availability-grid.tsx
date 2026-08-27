"use client";

import { Clock3 } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatTimeRange } from "@/lib/dates";
import type { Slot } from "@/lib/types";

type AvailabilityGridProps = {
  slots: Slot[];
  selectedStartTime?: string;
  onSelect: (slot: Slot) => void;
};

export function AvailabilityGrid({ slots, selectedStartTime, onSelect }: AvailabilityGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {slots.map((slot) => {
        const selected = selectedStartTime === slot.startTime;

        return (
          <button
            key={`${slot.startTime}-${slot.endTime}`}
            type="button"
            disabled={!slot.isAvailable}
            onClick={() => onSelect(slot)}
            className={cn(
              "grid min-h-24 gap-2 rounded-md border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-fern",
              selected ? "border-fern bg-emerald-50" : "border-slate-200 bg-white hover:border-fern",
              !slot.isAvailable && "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-100",
            )}
          >
            <span className="inline-flex items-center gap-2 text-sm font-bold">
              <Clock3 className="h-4 w-4" aria-hidden="true" />
              {formatTimeRange(slot.startTime, slot.endTime)}
            </span>
            <span className="text-xs text-slate-600">
              {slot.isAvailable ? `เหลือ ${slot.remainingSeats} ที่` : "เต็มแล้ว"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
