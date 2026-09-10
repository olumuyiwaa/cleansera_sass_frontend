"use client";

import type { Slot } from "@/app/api/widget.api";
import type { BookingFormState } from "./types";

type Props = {
  state: BookingFormState;
  update: (patch: Partial<BookingFormState>) => void;
  slots: Slot[];
  slotsLoading: boolean;
  slotsError: string | null;
  primaryColor?: string;
};

export function StepSchedule({
  state,
  update,
  slots,
  slotsLoading,
  slotsError,
  primaryColor = "#3F6B52",
}: Props) {
  // Build next 14 days for the date picker
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    return d;
  });

  const selectDate = (d: Date) => {
    const iso = d.toISOString().slice(0, 10);
    update({ selectedDate: iso, scheduledStart: null });
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-gray-900">Pick a date & time</h2>
        <p className="mt-1 text-sm text-gray-500">
          Only times with available cleaners are shown.
        </p>
      </header>

      {/* Date strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {days.map((d) => {
          const iso = d.toISOString().slice(0, 10);
          const active = state.selectedDate === iso;
          const isToday = iso === new Date().toISOString().slice(0, 10);
          return (
            <button
              key={iso}
              type="button"
              onClick={() => selectDate(d)}
              className={`
                flex flex-col items-center min-w-[64px] rounded-xl border px-3 py-2.5 transition
                ${active ? "text-white border-transparent shadow-sm" : "border-gray-200 text-gray-700 hover:border-gray-300"}
              `}
              style={{ backgroundColor: active ? primaryColor : undefined }}
            >
              <span className="text-[10px] uppercase font-medium opacity-80">
                {d.toLocaleDateString(undefined, { weekday: "short" })}
              </span>
              <span className="text-lg font-semibold leading-tight">
                {d.getDate()}
              </span>
              <span className="text-[10px] opacity-80">
                {isToday
                  ? "Today"
                  : d.toLocaleDateString(undefined, { month: "short" })}
              </span>
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      {!state.selectedDate && (
        <p className="text-sm text-gray-500">Select a date to see available times.</p>
      )}

      {state.selectedDate && slotsLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-8 justify-center">
          <Spinner /> Loading available times…
        </div>
      )}

      {state.selectedDate && !slotsLoading && slotsError && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{slotsError}</p>
      )}

      {state.selectedDate && !slotsLoading && !slotsError && slots.length === 0 && (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-6 text-center">
          No available times on this day. Please try another date.
        </p>
      )}

      {state.selectedDate && !slotsLoading && slots.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slots.map((slot) => {
            const active = state.scheduledStart === slot.start;
            const label = new Date(slot.start).toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            });
            return (
              <button
                key={slot.start}
                type="button"
                onClick={() => update({ scheduledStart: slot.start })}
                className={`
                  rounded-lg border px-2 py-2.5 text-sm font-medium transition
                  ${active ? "text-white border-transparent" : "border-gray-200 text-gray-800 hover:border-gray-300"}
                `}
                style={{ backgroundColor: active ? primaryColor : undefined }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
