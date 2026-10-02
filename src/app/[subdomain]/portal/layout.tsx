import type { ReactNode } from "react";

/**
 * Customer portal shares the [subdomain] route tree with the public storefront,
 * but should feel like the business dashboard (TailAdmin tokens) — not the
 * cream marketing site shell from the parent layout.
 */
export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 font-normal text-gray-900 antialiased dark:bg-gray-900 dark:text-white/90">
      {children}
    </div>
  );
}
