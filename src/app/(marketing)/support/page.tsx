"use client";

import Link from "next/link";
import { useState } from "react";
import Reveal from "@/components/marketing/Reveal"
const CATEGORIES = [
  {
    title: "For business owners",
    body: "Account setup, billing, staff management, dispatch — reach your account team directly from your dashboard for the fastest response.",
    icon: "01",
  },
  {
    title: "For cleaners",
    body: "App issues or an invite that hasn't arrived? Check with your employer first — CleanSera accounts are managed by the business you work for.",
    icon: "02",
  },
  {
    title: "For customers",
    body: "Questions about a booking belong with the business you booked — CleanSera powers their site but doesn't manage their bookings directly.",
    icon: "03",
  },
];

const QUICK_LINKS = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "For businesses", href: "/for-businesses" },
  { label: "For cleaners", href: "/for-cleaners" },
];

function ArrowIcon() {
  return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
  );
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export default function Support() {
  const [supportForm, setSupportForm] = useState({ name: "", email: "", message: "" });
  const [supportStatus, setSupportStatus] = useState("idle"); // idle | loading | success | error
  const [supportError, setSupportError] = useState("");

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (supportStatus === "loading") return;
    setSupportStatus("loading");
    setSupportError("");
    try {
      const res = await fetch(`${API_BASE_URL}/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: supportForm.name,
          email: supportForm.email,
          message: supportForm.message,
          source: "website-support",
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Something went wrong — please try again.");
      }
      setSupportStatus("success");
    } catch (err) {
      setSupportStatus("error");
      setSupportError(err.message || "Something went wrong — please try again.");
    }
  };

  return (
      <>
        <style>{`
        .support-page { overflow: hidden; background: #ffffff; }
        .page-container { width: min(100% - 32px, 1200px); margin-inline: auto; }
        .reveal {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal-visible { opacity: 1; transform: translateY(0); }

        .support-hero {
          position: relative;
          min-height: 420px;
          display: flex;
          align-items: center;
          padding: 90px 0 72px;
          background: radial-gradient(circle at 82% 12%, rgba(92,120,96,0.16), transparent 26%), linear-gradient(180deg, #ffffff 0%, #f7f4f0 100%);
        }
        .support-hero::before {
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
          margin: 22px 0 18px;
          color: #171b1a;
          font-size: clamp(40px, 5.4vw, 60px);
          line-height: 0.98;
          letter-spacing: -0.055em;
        }
        .hero-copy {
          max-width: 560px;
          margin: 0;
          color: #5f6664;
          font-size: clamp(17px, 2vw, 19px);
          line-height: 1.72;
        }

        .section { padding: 90px 0; }
        .section-soft { background: #f7f8f6; }
        .section-kicker {
          margin-bottom: 12px;
          color: #476d53;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .section-title {
          margin: 0 0 14px;
          color: #171b1a;
          font-size: clamp(28px, 3.8vw, 40px);
          line-height: 1.08;
          letter-spacing: -0.04em;
        }
        .section-copy {
          color: #5f6664;
          font-size: 16px;
          line-height: 1.7;
        }
        .section-intro {
          max-width: 640px;
          margin: 0 auto 44px;
          text-align: center;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }
        .category-card {
          min-height: 240px;
          padding: 28px;
          border-radius: 24px;
          background: #ffffff;
          border: 1px solid #e6ece7;
          box-shadow: 0 12px 40px rgba(16,24,20,0.05);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .category-card:hover {
          transform: translateY(-5px);
          border-color: rgba(71,109,83,0.2);
          box-shadow: 0 20px 52px rgba(16,24,20,0.08);
        }
        .category-icon {
          width: 48px;
          height: 48px;
          margin-bottom: 20px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: #edf5ef;
          color: #476d53;
          font-size: 13px;
          font-weight: 900;
        }
        .category-card h3 {
          margin: 0 0 12px;
          color: #171b1a;
          font-size: 18px;
          font-weight: 800;
        }
        .category-card p {
          margin: 0;
          color: #5f6664;
          font-size: 14px;
          line-height: 1.7;
        }

        .contact-layout {
          display: grid;
          grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
          gap: 56px;
          align-items: start;
        }
        .contact-aside h2 {
          margin: 0 0 14px;
          color: #171b1a;
          font-size: clamp(28px, 3.6vw, 38px);
          line-height: 1.1;
          letter-spacing: -0.035em;
        }
        .contact-aside p {
          margin: 0 0 28px;
          color: #5f6664;
          font-size: 16px;
          line-height: 1.7;
        }
        .quick-links {
          display: grid;
          gap: 10px;
        }
        .quick-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 14px;
          background: #ffffff;
          border: 1px solid #e6ece7;
          color: #171b1a;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .quick-link:hover {
          border-color: rgba(71,109,83,0.28);
          transform: translateX(3px);
        }
        .quick-link svg { color: #476d53; flex-shrink: 0; }

        .form-card {
          padding: 32px;
          border-radius: 28px;
          background: #ffffff;
          border: 1px solid #e6ece7;
          box-shadow: 0 16px 50px rgba(16,24,20,0.06);
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .form-field { display: grid; gap: 7px; }
        .form-field.full { grid-column: 1 / -1; }
        .form-label {
          color: #47514f;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.04em;
        }
        .form-input,
        .form-textarea {
          width: 100%;
          border-radius: 14px;
          border: 1px solid #d8dfe1;
          background: #fafbfa;
          color: #171b1a;
          font: inherit;
          font-size: 14px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .form-input {
          min-height: 48px;
          padding: 0 14px;
        }
        .form-textarea {
          min-height: 200px;
          padding: 14px;
          resize: vertical;
        }
        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: rgba(71,109,83,0.45);
          box-shadow: 0 0 0 4px rgba(71,109,83,0.1);
          background: #ffffff;
        }
        .form-input::placeholder,
        .form-textarea::placeholder {
          color: #8a928f;
        }
        .form-submit {
          margin-top: 8px;
          min-height: 50px;
          padding: 0 22px;
          border-radius: 14px;
          border: 0;
          background: #476d53;
          color: #ffffff;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .form-submit:hover {
          transform: translateY(-2px);
          background: #3b5c47;
        }
        .form-submit:disabled {
          opacity: 0.7;
          cursor: default;
          transform: none;
        }
        .form-error {
          margin: 4px 0 0;
          color: #b3261e;
          font-size: 13px;
        }
        .form-success h3 {
          margin: 0 0 8px;
          color: #171b1a;
          font-size: 20px;
        }
        .form-success p {
          margin: 0;
          color: #47514f;
          font-size: 15px;
          line-height: 1.6;
        }

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
          font-size: clamp(32px, 4.6vw, 48px);
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

        @media (max-width: 980px) {
          .categories-grid { grid-template-columns: 1fr; }
          .contact-layout { grid-template-columns: 1fr; gap: 36px; }
        }
        @media (max-width: 640px) {
          .page-container { width: min(100% - 28px, 1200px); }
          .support-hero { padding: 68px 0 56px; min-height: auto; }
          .hero-title { font-size: clamp(34px, 11vw, 46px); }
          .hero-copy { font-size: 16px; }
          .section { padding: 72px 0; }
          .category-card, .form-card { padding: 24px 20px; }
          .form-grid { grid-template-columns: 1fr; }
          .final-cta { padding: 80px 0; }
          .final-actions { display: grid; }
          .final-primary, .final-secondary { width: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; }
        }
      `}</style>

        <div className="support-page">
          <main>
            {/* Hero */}
            <section className="support-hero">
              <div className="page-container">
                <Reveal>
                  <div className="hero-inner">
                    <div className="eyebrow">
                      <span className="eyebrow-dot" />
                      Support
                    </div>
                    <h1 className="hero-title">How can we help?</h1>
                    <p className="hero-copy">
                      Most questions land in one of three places — find yours below, or send us a message and we’ll route it.
                    </p>
                  </div>
                </Reveal>
              </div>
            </section>

            {/* Categories */}
            <section className="section">
              <div className="page-container">
                <Reveal>
                  <div className="section-intro">
                    <div className="section-kicker">Who are you?</div>
                    <h2 className="section-title">Start with the right path</h2>
                    <p className="section-copy">
                      Support is faster when it goes to the right place. Pick the path that matches your role.
                    </p>
                  </div>
                </Reveal>

                <div className="categories-grid">
                  {CATEGORIES.map((item, index) => (
                      <Reveal key={item.title} delay={index * 70}>
                        <article className="category-card">
                          <div className="category-icon">{item.icon}</div>
                          <h3>{item.title}</h3>
                          <p>{item.body}</p>
                        </article>
                      </Reveal>
                  ))}
                </div>
              </div>
            </section>

            {/* Contact form */}
            <section className="section section-soft">
              <div className="page-container">
                <div className="contact-layout">
                  <Reveal>
                    <div className="contact-aside">
                      <div className="section-kicker">Still need help?</div>
                      <h2>Send us a message</h2>
                      <p>
                        Tell us what’s going on and we’ll route it to the right team. For the fastest response on account issues, business owners should also check the in-dashboard support channel.
                      </p>

                      <div className="quick-links">
                        {QUICK_LINKS.map((link) => (
                            <Link key={link.href} href={link.href} className="quick-link">
                              {link.label}
                              <ArrowIcon />
                            </Link>
                        ))}
                      </div>
                    </div>
                  </Reveal>

                  <Reveal delay={100}>
                    {supportStatus === "success" ? (
                        <div className="form-card form-success">
                          <h3>Message sent</h3>
                          <p>Thanks — we've received your message and will get back to you shortly.</p>
                        </div>
                    ) : (
                        <form className="form-card" onSubmit={handleSupportSubmit}>
                          <div className="form-grid">
                            <div className="form-field">
                              <label className="form-label" htmlFor="support-name">
                                Name
                              </label>
                              <input
                                  id="support-name"
                                  type="text"
                                  className="form-input"
                                  placeholder="Your name"
                                  value={supportForm.name}
                                  onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                                  required
                              />
                            </div>
                            <div className="form-field">
                              <label className="form-label" htmlFor="support-email">
                                Email
                              </label>
                              <input
                                  id="support-email"
                                  type="email"
                                  className="form-input"
                                  placeholder="you@example.com"
                                  value={supportForm.email}
                                  onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                                  required
                              />
                            </div>
                            <div className="form-field full">
                              <label className="form-label" htmlFor="support-message">
                                What’s going on?
                              </label>
                              <textarea
                                  id="support-message"
                                  className="form-textarea"
                                  placeholder="Share a few details so we can help faster…"
                                  value={supportForm.message}
                                  onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                                  required
                              />
                            </div>
                          </div>
                          {supportStatus === "error" && <p className="form-error">{supportError}</p>}
                          <button type="submit" className="form-submit" disabled={supportStatus === "loading"}>
                            {supportStatus === "loading" ? "Sending…" : "Send message"}
                            <ArrowIcon />
                          </button>
                        </form>
                    )}
                  </Reveal>
                </div>
              </div>
            </section>

            {/* Final CTA */}
            <section className="final-cta">
              <div className="page-container">
                <Reveal>
                  <div className="final-inner">
                    <h2>Looking for product answers instead?</h2>
                    <p>
                      Explore how CleanSera works for owners and teams, or jump straight into pricing.
                    </p>
                    <div className="final-actions">
                      <Link href="/how-it-works" className="final-primary">
                        See how it works
                        <ArrowIcon />
                      </Link>
                      <Link href="/pricing" className="final-secondary">
                        View pricing
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