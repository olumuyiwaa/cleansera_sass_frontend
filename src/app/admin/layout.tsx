"use client";

/**
 * Super Admin layout — same shell as the business portal
 * (AppSidebar + AppHeader + Backdrop), with a SUPER_ADMIN gate.
 * No business onboarding redirect.
 */
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/useAuth";

export default function SuperAdminLayout({
                                           children,
                                         }: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user) {
      router.replace("/");
      return;
    }

    if (user.globalRole !== "SUPER_ADMIN") {
      setDenied(true);
      return;
    }

    setDenied(false);
  }, [loading, isAuthenticated, user, router]);

  const mainContentMargin = isMobileOpen
      ? "ml-0"
      : isExpanded || isHovered
          ? "lg:ml-[290px]"
          : "lg:ml-[90px]";

  if (loading || (!denied && (!user || user.globalRole !== "SUPER_ADMIN"))) {
    return (
        <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
          Loading…
        </div>
    );
  }

  if (denied) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Access denied
          </h1>
          <p className="text-sm text-gray-500">
            This area is restricted to Super Admins.
          </p>
          <Link
              href="/dashboard"
              className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Back to business dashboard
          </Link>
        </div>
    );
  }

  return (
      <div className="min-h-screen xl:flex">
        <AppSidebar />
        <Backdrop />
        <div
            className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
        >
          <AppHeader />
          <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
            {children}
          </div>
        </div>
      </div>
  );
}