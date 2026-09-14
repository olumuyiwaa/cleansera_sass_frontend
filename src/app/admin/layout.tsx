"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/auth/useAuth";

const NAV = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/businesses", label: "Businesses", exact: false },
  { href: "/admin/subscriptions", label: "Subscriptions", exact: false },
  { href: "/admin/users", label: "Users", exact: false },
  { href: "/admin/tickets", label: "Support tickets", exact: false },
];

export default function SuperAdminLayout({
                                           children,
                                         }: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user) {
      // Sign-in lives at the (full-width-pages)/(auth) route group root.
      // Change to "/signin" (or your public path) if different.
      router.replace("/");
      return;
    }

    if (user.globalRole !== "SUPER_ADMIN") {
      setDenied(true);
      return;
    }

    setDenied(false);
  }, [loading, isAuthenticated, user, router]);

  if (loading) {
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

  // Avoid flashing admin UI for non-admins while the effect runs.
  if (!user || user.globalRole !== "SUPER_ADMIN") {
    return (
        <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
          Loading…
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
            <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
              Super Admin
            </span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              CleanSera Platform
            </span>
            </div>
            <Link
                href="/dashboard"
                className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Business dashboard →
            </Link>
          </div>
          <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 md:px-6">
            {NAV.map((item) => {
              const active = item.exact
                  ? pathname === item.href
                  : Boolean(pathname?.startsWith(item.href));
              return (
                  <Link
                      key={item.href}
                      href={item.href}
                      className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                          active
                              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                              : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      }`}
                  >
                    {item.label}
                  </Link>
              );
            })}
          </nav>
        </header>
        <main className="mx-auto max-w-7xl p-4 md:p-6">{children}</main>
      </div>
  );
}