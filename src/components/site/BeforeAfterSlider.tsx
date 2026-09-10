"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Drag-to-reveal before/after panel.
 * Ported from cleansera_sass_website — SVG room illustration, no stock photos.
 */
function RoomIllustration({ state }: { state: "before" | "after" }) {
  const messy = state === "before";
  return (
    <svg
      viewBox="0 0 400 300"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <rect width="400" height="300" fill={messy ? "#F1EFE9" : "#F1F6F3"} />
      <rect
        x="0"
        y="220"
        width="400"
        height="80"
        fill={messy ? "#E2DED3" : "#E4EEE7"}
      />
      {/* window */}
      <rect
        x="270"
        y="40"
        width="90"
        height="70"
        rx="4"
        fill="#FBFBF8"
        stroke="#C9C3B3"
        strokeWidth="3"
      />
      <line x1="315" y1="40" x2="315" y2="110" stroke="#C9C3B3" strokeWidth="3" />
      {/* rug */}
      <ellipse
        cx="150"
        cy="250"
        rx="110"
        ry="20"
        fill={messy ? "#C9C3B3" : "#C7DDCE"}
        opacity="0.6"
      />
      {/* couch */}
      <rect
        x="40"
        y="170"
        width="150"
        height="60"
        rx="10"
        fill={messy ? "#9C9483" : "#4C8267"}
      />
      <rect
        x="40"
        y="150"
        width="150"
        height="30"
        rx="10"
        fill={messy ? "#9C9483" : "#4C8267"}
      />
      {messy ? (
        <>
          <rect
            x="60"
            y="185"
            width="26"
            height="18"
            rx="3"
            fill="#D98E2B"
            transform="rotate(-8 60 185)"
          />
          <rect
            x="140"
            y="190"
            width="24"
            height="20"
            rx="3"
            fill="#79715F"
            transform="rotate(10 140 190)"
          />
          <circle cx="230" cy="240" r="10" fill="#B87420" />
          <rect x="210" y="255" width="40" height="8" rx="4" fill="#9C9483" />
          <rect
            x="20"
            y="240"
            width="30"
            height="10"
            rx="3"
            fill="#9C9483"
            transform="rotate(-15 20 240)"
          />
          <rect
            x="250"
            y="220"
            width="20"
            height="14"
            rx="2"
            fill="#5C5546"
            transform="rotate(20 250 220)"
          />
        </>
      ) : (
        <>
          <rect x="55" y="180" width="30" height="22" rx="4" fill="#EFC066" />
          <rect x="140" y="180" width="30" height="22" rx="4" fill="#A0C5AC" />
          <rect x="215" y="245" width="50" height="6" rx="3" fill="#C7DDCE" />
        </>
      )}
      {/* floor lamp */}
      <line
        x1="330"
        y1="140"
        x2="330"
        y2="230"
        stroke={messy ? "#9C9483" : "#325342"}
        strokeWidth="3"
      />
      <path
        d={
          messy
            ? "M310 140 L350 140 L340 120 L320 120 Z"
            : "M312 138 L348 138 L338 118 L322 118 Z"
        }
        fill={messy ? "#9C9483" : "#325342"}
      />
    </svg>
  );
}

export function BeforeAfterSlider() {
  const [pct, setPct] = useState(55);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const raw = ((clientX - rect.left) / rect.width) * 100;
    setPct(Math.min(96, Math.max(4, raw)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging.current) updateFromClientX(e.clientX);
  };
  const stopDragging = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={trackRef}
      className="relative aspect-[3/3] w-full select-none overflow-hidden rounded-[20px] border border-[#E2DED3] shadow-[0_24px_60px_rgba(22,35,28,0.12)]"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDragging}
      onPointerLeave={stopDragging}
      role="img"
      aria-label="Before and after cleaning comparison"
    >
      <div className="absolute inset-0">
        <RoomIllustration state="after" />
      </div>
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <div
          style={{
            width: trackRef.current?.offsetWidth || 400,
            height: "100%",
          }}
        >
          <RoomIllustration state="before" />
        </div>
      </div>

      <span className="absolute left-3 top-3 rounded-md bg-[#171B1A]/80 px-2 py-1 text-xs font-medium text-[#FBFBF8]">
        Before
      </span>
      <span className="absolute right-3 top-3 rounded-md bg-[#325342]/85 px-2 py-1 text-xs font-medium text-[#FBFBF8]">
        After
      </span>

      <div
        className="absolute top-0 bottom-0 w-0.5 bg-[#FBFBF8]"
        style={{ left: `${pct}%` }}
      >
        <div className="absolute top-1/2 left-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#FBFBF8] shadow-md cursor-ew-resize">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M5 3 1 8l4 5M11 3l4 5-4 5"
              stroke="#16231C"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
