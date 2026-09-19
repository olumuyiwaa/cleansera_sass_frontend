import type { ReactNode } from "react";
import "@/components/site/site.css";

/**
 * Shared layout for the unified business customer experience:
 *   /[subdomain]         → public storefront
 *   /[subdomain]/portal  → customer self-service portal
 *
 * Keeps the same branding surface (fonts, base colors) for both.
 */
export default function BusinessLayout({ children }: { children: ReactNode }) {
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
