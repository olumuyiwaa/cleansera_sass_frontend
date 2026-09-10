import type { ReactNode } from "react";
import "@/components/site/site.css";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div
      id="top"
      className="min-h-screen bg-[#F6F2ED] text-[#171B1A] antialiased"
      style={{
        fontFamily:
          '"Manrope", "Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
      }}
    >
      {children}
    </div>
  );
}
