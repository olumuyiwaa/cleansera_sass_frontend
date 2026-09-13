"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getOnboardingStatus } from "@/app/api/businesses.api";

// Dashboard routes a business still needs while mid-setup — these must stay
// reachable even when onboarding is incomplete, or the redirect below would
// trap the owner on /onboarding with no way to actually finish it.
const ONBOARDING_EXEMPT_PATHS = ["/onboarding", "/business-settings", "/services", "/profile"];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const isExempt = ONBOARDING_EXEMPT_PATHS.some((p) => pathname?.startsWith(p));

    (async () => {
      try {
        const status = await getOnboardingStatus();
        if (cancelled) return;
        if (!status.isComplete && !isExempt) {
          router.replace("/onboarding");
          return;
        }
      } catch {
        // If the check itself fails (e.g. network hiccup), don't block the
        // dashboard on it — better to let a fully-set-up business keep
        // working than to hard-lock everyone out on a transient error.
      } finally {
        if (!cancelled) setCheckingOnboarding(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Re-check on every route change so finishing a step elsewhere and
    // navigating back doesn't leave a stale "incomplete" redirect looping.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  if (checkingOnboarding) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">Loading…</div>;
  }

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  );
}
