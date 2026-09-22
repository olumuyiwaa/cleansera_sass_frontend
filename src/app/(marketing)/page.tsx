/**
 * STUB — replace with content from cleansera_sass_website/src/app/page.js
 *
 * 1. Copy page.js → this file (overwrite)
 * 2. Keep "use client"
 * 3. import Reveal from "@/components/marketing/Reveal"
 * 4. Delete the local Reveal function in the copied file
 * 5. import { APP_URL } from "@/lib/marketing/siteConfig" for any product CTAs
 *
 * Until then this placeholder keeps the route group valid.
 */
import Link from "next/link";
import { APP_URL } from "@/lib/marketing/siteConfig";

export default function MarketingHomePage() {
    return (
        <div className="container-page py-24">
            <p className="text-sm font-bold uppercase tracking-widest text-sage-700">CleanSera</p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
                Software for cleaning businesses that own their brand
            </h1>
            <p className="mt-6 max-w-xl text-lg text-stone-600">
                Replace this stub by copying the homepage from the marketing website repo into this file.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
                <Link
                    href="/for-businesses#demo"
                    className="rounded-md bg-ink px-5 py-3 text-sm font-semibold text-paper"
                >
                    Book a demo
                </Link>
                <a
                    href={`${APP_URL}/auth/sign-in`}
                    className="rounded-md border border-stone-200 bg-paper px-5 py-3 text-sm font-semibold text-ink"
                >
                    Sign in
                </a>
            </div>
        </div>
    );
}