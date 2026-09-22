"use client";

import Link from "next/link";
import Reveal from "@/components/marketing/Reveal"


const SECTIONS = [
  {
    title: "What we collect",
    body: "Account details for business owners, staff, and their invited cleaners (name, email, phone); booking and scheduling data entered by a business (customer names, addresses, job details); and basic usage data needed to run the service.",
  },
  {
    title: "What we don't do",
    body: "CleanSera does not process payments between a business and its customers, so we don't collect or store customer payment card details. We don't sell personal data, and we don't share a business's customer or staff data with any other business on the platform.",
  },
  {
    title: "How we use it",
    body: "To run the booking, scheduling, and dispatch features a business signs up for; to send the notifications a business or its customers opt into; and to bill a business's own CleanSera subscription.",
  },
  {
    title: "Who can see what",
    body: "A business's staff, customers, and booking data are only visible to that business's own account holders — CleanSera staff can access it for support purposes, and it is never visible to any other business on the platform.",
  },
  {
    title: "Data retention",
    body: "We retain account and booking data for as long as a business's subscription is active, plus a reasonable period afterward for legal and bookkeeping purposes, after which it's deleted on request.",
  },
  {
    title: "Your choices",
    body: "Business owners can export or delete their business's data by contacting support. Cleaners and customers should contact the business they work with or booked through, since CleanSera manages that data on the business's behalf.",
  },
];

function ArrowIcon() {
  return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
  );
}

export default function Privacy() {
  return (
      <>
        <style>{`
        .legal-page { overflow: hidden; background: #ffffff; }
        .page-container { width: min(100% - 32px, 1200px); margin-inline: auto; }
        .reveal {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal-visible { opacity: 1; transform: translateY(0); }

        .legal-hero {
          position: relative;
          min-height: 360px;
          display: flex;
          align-items: center;
          padding: 90px 0 64px;
          background: radial-gradient(circle at 82% 12%, rgba(92,120,96,0.16), transparent 26%), linear-gradient(180deg, #ffffff 0%, #f7f4f0 100%);
        }
        .legal-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(92,120,96,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(92,120,96,0.04) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: linear-gradient(to bottom, black, transparent 82%);
          pointer-events: none;
        }
        .hero-inner {
          position: relative;
          z-index: 1;
          max-width: 720px;
        }
        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          min-height: 34px;
          padding: 0 13px;
          border-radius: 999px;
          background: #edf5ef;
          border: 1px solid rgba(92,120,96,0.16);
          color: #476d53;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .eyebrow-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #476d53;
          box-shadow: 0 0 0 5px rgba(71,109,83,0.12);
        }
        .hero-title {
          margin: 22px 0 14px;
          color: #171b1a;
          font-size: clamp(40px, 5.2vw, 58px);
          line-height: 0.98;
          letter-spacing: -0.055em;
        }
        .hero-meta {
          margin: 0;
          color: #5f6664;
          font-size: 14px;
          font-weight: 600;
        }

        .legal-content {
          padding: 72px 0 40px;
        }
        .sections-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }
        .section-card {
          padding: 28px;
          border-radius: 24px;
          background: #ffffff;
          border: 1px solid #e6ece7;
          box-shadow: 0 12px 40px rgba(16,24,20,0.04);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .section-card:hover {
          transform: translateY(-4px);
          border-color: rgba(71,109,83,0.18);
          box-shadow: 0 18px 48px rgba(16,24,20,0.07);
        }
        .section-number {
          width: 40px;
          height: 40px;
          margin-bottom: 18px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #edf5ef;
          color: #476d53;
          font-size: 12px;
          font-weight: 900;
        }
        .section-card h2 {
          margin: 0 0 12px;
          color: #171b1a;
          font-size: 18px;
          font-weight: 800;
        }
        .section-card p {
          margin: 0;
          color: #5f6664;
          font-size: 14px;
          line-height: 1.75;
        }

        .legal-note {
          margin-top: 40px;
          padding: 22px 24px;
          border-radius: 18px;
          background: #f7f8f6;
          border: 1px solid #e6ece7;
          color: #5f6664;
          font-size: 14px;
          line-height: 1.7;
        }
        .legal-note a {
          color: #476d53;
          font-weight: 800;
          text-decoration: none;
        }
        .legal-note a:hover { text-decoration: underline; text-underline-offset: 3px; }

        .final-cta {
          position: relative;
          padding: 100px 0;
          overflow: hidden;
          color: #ffffff;
          background: radial-gradient(circle at 15% 20%, rgba(255,255,255,0.18), transparent 26%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.12), transparent 26%), linear-gradient(135deg, #476d53 0%, #2f4f3d 100%);
        }
        .final-inner {
          position: relative;
          z-index: 1;
          max-width: 820px;
          margin: 0 auto;
          text-align: center;
        }
        .final-inner h2 {
          margin: 0 0 16px;
          font-size: clamp(30px, 4.4vw, 46px);
          line-height: 1.05;
          letter-spacing: -0.04em;
        }
        .final-inner p {
          max-width: 560px;
          margin: 0 auto 30px;
          color: rgba(255,255,255,0.8);
          font-size: 16px;
          line-height: 1.75;
        }
        .final-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
        }
        .final-primary, .final-secondary {
          min-height: 52px;
          padding: 0 22px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 900;
          transition: transform 0.2s ease;
        }
        .final-primary { color: #2f4f3d; background: #ffffff; }
        .final-secondary {
          color: #ffffff;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.24);
        }
        .final-primary:hover, .final-secondary:hover { transform: translateY(-2px); }

        @media (max-width: 780px) {
          .sections-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .page-container { width: min(100% - 28px, 1200px); }
          .legal-hero { padding: 68px 0 52px; min-height: auto; }
          .hero-title { font-size: clamp(34px, 11vw, 46px); }
          .legal-content { padding: 56px 0 28px; }
          .section-card { padding: 24px 20px; }
          .final-cta { padding: 80px 0; }
          .final-actions { display: grid; }
          .final-primary, .final-secondary { width: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; }
        }
      `}</style>

        <div className="legal-page">
          <main>
            <section className="legal-hero">
              <div className="page-container">
                <Reveal>
                  <div className="hero-inner">
                    <div className="eyebrow">
                      <span className="eyebrow-dot" />
                      Legal
                    </div>
                    <h1 className="hero-title">Privacy policy</h1>
                    <p className="hero-meta">Last updated September 2026</p>
                  </div>
                </Reveal>
              </div>
            </section>

            <section className="legal-content">
              <div className="page-container">
                <div className="sections-grid">
                  {SECTIONS.map((section, index) => (
                      <Reveal key={section.title} delay={index * 50}>
                        <article className="section-card">
                          <div className="section-number">{String(index + 1).padStart(2, "0")}</div>
                          <h2>{section.title}</h2>
                          <p>{section.body}</p>
                        </article>
                      </Reveal>
                  ))}
                </div>

                <Reveal delay={100}>
                  <div className="legal-note">
                    Questions about this policy? Reach us through the{" "}
                    <Link href="/support">support page</Link>.
                  </div>
                </Reveal>
              </div>
            </section>

            <section className="final-cta">
              <div className="page-container">
                <Reveal>
                  <div className="final-inner">
                    <h2>Need help with your account?</h2>
                    <p>
                      Our support team can help with data requests, account questions, and general platform guidance.
                    </p>
                    <div className="final-actions">
                      <Link href="/support" className="final-primary">
                        Contact support
                        <ArrowIcon />
                      </Link>
                      <Link href="/terms" className="final-secondary">
                        Terms of service
                        <ArrowIcon />
                      </Link>
                    </div>
                  </div>
                </Reveal>
              </div>
            </section>
          </main>
        </div>
      </>
  );
}