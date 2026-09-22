"use client";

import Link from "next/link";
import Reveal from "@/components/marketing/Reveal"

const PHASES = [
  {
    phase: "Set up",
    number: "01",
    description: "Get your branded presence live and your team ready in minutes.",
    steps: [
      {
        title: "Create your business",
        body: "Name, service area, hours, and branding — your booking site goes live at a CleanSera subdomain immediately, with a custom domain available anytime.",
      },
      {
        title: "Build your service catalog",
        body: "Standard clean, deep clean, move-out — set pricing per service and add-ons like inside-fridge or windows.",
      },
      {
        title: "Invite your cleaners",
        body: "Send invites to the staff already on your payroll. They set a password and their availability, and they're ready to be assigned.",
      },
    ],
  },
  {
    phase: "Take bookings",
    number: "02",
    description: "Customers book on your brand. You stay in control of every assignment.",
    steps: [
      {
        title: "Customer books on your site",
        body: "They pick a service, see a live quote, and choose a time — all inside your branded page, not a shared listing.",
      },
      {
        title: "You confirm and assign",
        body: "Manually pick a cleaner or let CleanSera suggest one based on availability and coverage area. You always make the final call.",
      },
      {
        title: "Set up recurring customers",
        body: "Weekly, biweekly, or monthly — CleanSera regenerates the booking automatically on the right service, address, and time.",
      },
    ],
  },
  {
    phase: "On the day",
    number: "03",
    description: "Visibility and accountability while the work is happening.",
    steps: [
      {
        title: "Cleaner checks in",
        body: "One tap in the cleaner app when they arrive, with location logged so you know the job actually started.",
      },
      {
        title: "Checklist and photos",
        body: "A per-service checklist and before/after photos attach to the booking automatically — your record, not a memory.",
      },
      {
        title: "Customer gets notified",
        body: "Confirmation, reminder, and an en-route text — all sent without you touching a phone.",
      },
    ],
  },
  {
    phase: "After the job",
    number: "04",
    description: "Close the loop on payment, feedback, and performance.",
    steps: [
      {
        title: "Mark it paid",
        body: "Let customers pay online by card or iDEAL through your own Stripe account, or log how they paid — cash, bank transfer, invoice — for your bookkeeping. CleanSera doesn't take a cut.",
      },
      {
        title: "Collect a review",
        body: "An automatic review request goes out, tied to your business and the cleaner who did the work.",
      },
      {
        title: "Check your numbers",
        body: "Jobs completed, cleaner utilization, and customer retention — the view you need to know if the week went well.",
      },
    ],
  },
];

const HIGHLIGHTS = [
  "Your brand stays front and center",
  "You control every assignment",
  "Proof of work on every visit",
  "No marketplace commissions",
];

function ArrowIcon() {
  return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
  );
}

function CheckIcon() {
  return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
  );
}

export default function HowItWorks() {
  return (
      <>
        <style>{`
        .workflow-page { overflow: hidden; background: #ffffff; }
        .page-container { width: min(100% - 32px, 1200px); margin-inline: auto; }
        .reveal {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal-visible { opacity: 1; transform: translateY(0); }

        .workflow-hero {
          position: relative;
          min-height: 520px;
          display: flex;
          align-items: center;
          padding: 90px 0 80px;
          background: radial-gradient(circle at 82% 12%, rgba(92,120,96,0.16), transparent 26%), linear-gradient(180deg, #ffffff 0%, #f7f4f0 100%);
        }
        .workflow-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(92,120,96,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(92,120,96,0.04) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: linear-gradient(to bottom, black, transparent 82%);
          pointer-events: none;
        }
        .hero-layout {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
          gap: 64px;
          align-items: center;
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
          font-size: clamp(42px, 5.5vw, 64px);
          line-height: 0.98;
          letter-spacing: -0.055em;
        }
        .hero-title span { color: #476d53; }
        .hero-copy {
          max-width: 540px;
          margin: 0 0 28px;
          color: #5f6664;
          font-size: clamp(17px, 2vw, 19px);
          line-height: 1.72;
        }
        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .primary-button, .secondary-button {
          min-height: 52px;
          padding: 0 22px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          text-decoration: none;
          font-size: 15px;
          font-weight: 800;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .primary-button {
          color: #ffffff;
          background: #476d53;
          border: 1px solid #476d53;
          box-shadow: 0 14px 30px rgba(71,109,83,0.24);
        }
        .primary-button:hover { transform: translateY(-2px); }
        .secondary-button {
          color: #2d352f;
          background: #ffffff;
          border: 1px solid #d8dfe1;
          box-shadow: 0 8px 22px rgba(23,27,26,0.06);
        }
        .secondary-button:hover { transform: translateY(-2px); border-color: rgba(71,109,83,0.42); }

        .hero-visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 420px;
        }
        .hero-visual::before {
          content: "";
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(71,109,83,0.16), rgba(71,109,83,0.03) 54%, transparent 74%);
          animation: pulseSoft 6.8s ease-in-out infinite;
        }
        @keyframes pulseSoft {
          0%, 100% { opacity: 0.75; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .phase-preview {
          position: relative;
          width: min(100%, 420px);
          padding: 22px;
          border-radius: 28px;
          background: #ffffff;
          border: 1px solid #e6ece7;
          box-shadow: 0 32px 80px rgba(35,52,45,0.14);
        }
        .phase-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .phase-preview-label {
          color: #5f6664;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .phase-preview-badge {
          padding: 5px 10px;
          border-radius: 999px;
          background: #edf5ef;
          color: #476d53;
          font-size: 11px;
          font-weight: 800;
        }
        .phase-preview-list { display: grid; gap: 10px; }
        .phase-preview-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 16px;
          background: #f7f8f6;
          border: 1px solid #e6ece7;
        }
        .phase-preview-num {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: #edf5ef;
          color: #476d53;
          font-size: 12px;
          font-weight: 900;
          flex-shrink: 0;
        }
        .phase-preview-text {
          color: #171b1a;
          font-size: 14px;
          font-weight: 700;
        }

        .highlights-strip {
          padding: 22px 0;
          border-top: 1px solid #edf1ee;
          border-bottom: 1px solid #edf1ee;
          background: #ffffff;
        }
        .highlights-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .highlight-item {
          min-height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 0 14px;
          border-radius: 14px;
          background: #f8f9f7;
          border: 1px solid #edf1ee;
          color: #47514f;
          font-size: 13px;
          font-weight: 800;
          text-align: center;
        }
        .highlight-item svg { color: #476d53; flex-shrink: 0; }

        .workflow-section { padding: 100px 0 40px; }
        .section-intro {
          max-width: 720px;
          margin: 0 auto 56px;
          text-align: center;
        }
        .section-kicker {
          margin-bottom: 14px;
          color: #476d53;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .section-title {
          margin: 0 0 16px;
          color: #171b1a;
          font-size: clamp(32px, 4.2vw, 48px);
          line-height: 1.06;
          letter-spacing: -0.045em;
        }
        .section-copy {
          color: #5f6664;
          font-size: 17px;
          line-height: 1.75;
        }

        .phases-grid {
          display: grid;
          gap: 28px;
        }
        .phase-card {
          overflow: hidden;
          border-radius: 28px;
          background: #ffffff;
          border: 1px solid #e6ece7;
          box-shadow: 0 14px 48px rgba(16,24,20,0.05);
        }
        .phase-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          padding: 28px 32px 22px;
          background: linear-gradient(135deg, #f8faf8 0%, #f3f7f4 100%);
          border-bottom: 1px solid #e6ece7;
        }
        .phase-header-left { flex: 1; }
        .phase-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .phase-number {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: #476d53;
          color: #ffffff;
          font-size: 13px;
          font-weight: 900;
        }
        .phase-label {
          color: #476d53;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .phase-name {
          margin: 0 0 8px;
          color: #171b1a;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }
        .phase-desc {
          margin: 0;
          color: #5f6664;
          font-size: 15px;
          line-height: 1.6;
          max-width: 520px;
        }
        .step-list {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0;
        }
        .step-item {
          position: relative;
          padding: 28px 26px 30px;
          border-right: 1px solid #eef2ef;
        }
        .step-item:last-child { border-right: 0; }
        .step-number {
          width: 42px;
          height: 42px;
          margin-bottom: 18px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: #edf5ef;
          color: #476d53;
          font-size: 13px;
          font-weight: 900;
        }
        .step-item h3 {
          margin: 0 0 10px;
          color: #171b1a;
          font-size: 17px;
          font-weight: 800;
        }
        .step-item p {
          margin: 0;
          color: #5f6664;
          font-size: 14px;
          line-height: 1.7;
        }

        .mid-cta {
          margin: 80px 0 0;
          padding: 48px 42px;
          border-radius: 28px;
          background: radial-gradient(circle at 85% 15%, rgba(255,255,255,0.16), transparent 28%), linear-gradient(145deg, #476d53 0%, #2f4f3d 100%);
          color: #ffffff;
          box-shadow: 0 24px 70px rgba(47,79,61,0.28);
        }
        .mid-cta-inner {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 32px;
          align-items: center;
        }
        .mid-cta h2 {
          margin: 0 0 12px;
          font-size: clamp(26px, 3.2vw, 36px);
          line-height: 1.15;
          letter-spacing: -0.03em;
        }
        .mid-cta p {
          margin: 0;
          color: rgba(255,255,255,0.8);
          font-size: 16px;
          line-height: 1.7;
          max-width: 480px;
        }
        .mid-cta-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: flex-end;
        }
        .mid-primary, .mid-secondary {
          min-height: 50px;
          padding: 0 20px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 800;
          transition: transform 0.2s ease;
        }
        .mid-primary { color: #2f4f3d; background: #ffffff; }
        .mid-secondary {
          color: #ffffff;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.22);
        }
        .mid-primary:hover, .mid-secondary:hover { transform: translateY(-2px); }

        .final-cta {
          position: relative;
          margin-top: 100px;
          padding: 110px 0;
          overflow: hidden;
          color: #ffffff;
          background: radial-gradient(circle at 15% 20%, rgba(255,255,255,0.18), transparent 26%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.12), transparent 26%), linear-gradient(135deg, #476d53 0%, #2f4f3d 100%);
        }
        .final-inner {
          position: relative;
          z-index: 1;
          max-width: 880px;
          margin: 0 auto;
          text-align: center;
        }
        .final-inner h2 {
          margin: 0 0 18px;
          font-size: clamp(36px, 5vw, 56px);
          line-height: 1.03;
          letter-spacing: -0.045em;
        }
        .final-inner p {
          max-width: 640px;
          margin: 0 auto 34px;
          color: rgba(255,255,255,0.8);
          font-size: 17px;
          line-height: 1.75;
        }
        .final-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
        }
        .final-primary, .final-secondary {
          min-height: 54px;
          padding: 0 23px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          text-decoration: none;
          font-size: 15px;
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
          .hero-layout, .mid-cta-inner { grid-template-columns: 1fr; }
          .hero-visual { min-height: 360px; }
          .mid-cta-actions { justify-content: flex-start; }
          .step-list { grid-template-columns: 1fr; }
          .step-item {
            border-right: 0;
            border-bottom: 1px solid #eef2ef;
          }
          .step-item:last-child { border-bottom: 0; }
        }
        @media (max-width: 780px) {
          .highlights-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .page-container { width: min(100% - 28px, 1200px); }
          .workflow-hero { padding: 68px 0 60px; min-height: auto; }
          .hero-title { font-size: clamp(36px, 12vw, 48px); }
          .hero-copy { font-size: 16px; }
          .hero-actions, .final-actions, .mid-cta-actions { display: grid; }
          .primary-button, .secondary-button, .final-primary, .final-secondary, .mid-primary, .mid-secondary { width: 100%; }
          .highlights-grid { grid-template-columns: 1fr; }
          .phase-header { padding: 22px 20px 18px; flex-direction: column; gap: 12px; }
          .phase-name { font-size: 22px; }
          .step-item { padding: 22px 20px; }
          .mid-cta { padding: 32px 24px; margin-top: 56px; }
          .final-cta { margin-top: 72px; padding: 86px 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; }
          .hero-visual::before { animation: none; }
        }
      `}</style>

        <div className="workflow-page">
          <main>
            {/* Hero */}
            <section className="workflow-hero">
              <div className="page-container">
                <div className="hero-layout">
                  <Reveal>
                    <div>
                      <div className="eyebrow">
                        <span className="eyebrow-dot" />
                        How it works
                      </div>
                      <h1 className="hero-title">
                        How a job moves through <span>CleanSera</span>
                      </h1>
                      <p className="hero-copy">
                        From setting up your business to getting paid — the full path, phase by phase, designed so ownership stays with you.
                      </p>
                      <div className="hero-actions">
                        <Link href="/for-businesses#demo" className="primary-button">
                          Book a demo
                          <ArrowIcon />
                        </Link>
                        <Link href="/pricing" className="secondary-button">
                          View pricing
                        </Link>
                      </div>
                    </div>
                  </Reveal>

                  <Reveal delay={120}>
                    <div className="hero-visual">
                      <div className="phase-preview">
                        <div className="phase-preview-header">
                          <span className="phase-preview-label">The full cycle</span>
                          <span className="phase-preview-badge">4 phases</span>
                        </div>
                        <div className="phase-preview-list">
                          {PHASES.map((p) => (
                              <div key={p.phase} className="phase-preview-item">
                                <div className="phase-preview-num">{p.number}</div>
                                <div className="phase-preview-text">{p.phase}</div>
                              </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                </div>
              </div>
            </section>

            {/* Highlights */}
            <section className="highlights-strip">
              <div className="page-container">
                <div className="highlights-grid">
                  {HIGHLIGHTS.map((item) => (
                      <div key={item} className="highlight-item">
                        <CheckIcon />
                        {item}
                      </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Phases */}
            <section className="workflow-section">
              <div className="page-container">
                <Reveal>
                  <div className="section-intro">
                    <div className="section-kicker">The operating path</div>
                    <h2 className="section-title">Four clear phases from setup to settled jobs</h2>
                    <p className="section-copy">
                      Every stage is built to keep your brand, your team, and your customer relationships under your control.
                    </p>
                  </div>
                </Reveal>

                <div className="phases-grid">
                  {PHASES.map((group, groupIndex) => (
                      <Reveal key={group.phase} delay={groupIndex * 70}>
                        <article className="phase-card">
                          <div className="phase-header">
                            <div className="phase-header-left">
                              <div className="phase-badge">
                                <div className="phase-number">{group.number}</div>
                                <span className="phase-label">Phase</span>
                              </div>
                              <h3 className="phase-name">{group.phase}</h3>
                              <p className="phase-desc">{group.description}</p>
                            </div>
                          </div>
                          <div className="step-list">
                            {group.steps.map((step, index) => (
                                <div key={step.title} className="step-item">
                                  <div className="step-number">{index + 1}</div>
                                  <h3>{step.title}</h3>
                                  <p>{step.body}</p>
                                </div>
                            ))}
                          </div>
                        </article>
                      </Reveal>
                  ))}
                </div>

                <Reveal delay={100}>
                  <div className="mid-cta">
                    <div className="mid-cta-inner">
                      <div>
                        <h2>Ready to see it in your business?</h2>
                        <p>
                          Walk through the full flow with a real demo and see how CleanSera fits the way you already operate.
                        </p>
                      </div>
                      <div className="mid-cta-actions">
                        <Link href="/for-businesses#demo" className="mid-primary">
                          Schedule a demo
                          <ArrowIcon />
                        </Link>
                        <Link href="/pricing" className="mid-secondary">
                          Explore pricing
                        </Link>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </section>

            {/* Final CTA */}
            <section className="final-cta">
              <div className="page-container">
                <Reveal>
                  <div className="final-inner">
                    <h2>Run a cleaner, more controlled operation.</h2>
                    <p>
                      From first booking to final review, CleanSera keeps every step visible, branded, and under your ownership.
                    </p>
                    <div className="final-actions">
                      <Link href="/for-businesses#demo" className="final-primary">
                        Book a demo
                        <ArrowIcon />
                      </Link>
                      <Link href="/about" className="final-secondary">
                        About CleanSera
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