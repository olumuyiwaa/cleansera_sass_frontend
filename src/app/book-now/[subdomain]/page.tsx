"use client";

import { use } from "react";
import { BookingWidgetForm } from "@/components/widget/BookingWidgetForm";

/**
 * Standalone / embeddable booking page.
 * Same form as the site modal — full page for iframe embeds & direct links.
 */
export default function BookingWidgetPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = use(params);

  return (
    <div className="min-h-screen bg-white">
      <BookingWidgetForm subdomain={subdomain} />
    </div>
  );
}
