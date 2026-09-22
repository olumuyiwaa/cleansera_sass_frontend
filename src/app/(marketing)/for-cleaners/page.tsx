"use client";

import Link from "next/link";
import Reveal from "@/components/marketing/Reveal"

const APP_POINTS = [
  {
    title: "Today's jobs, in order",
    body: "Your route for the day, with addresses, service notes, and start times — no group chat digging.",
    icon: "01",
  },
  {
    title: "Check in, check out",
    body: "One tap when you arrive, one tap when you're done. Your business sees it in real time.",
    icon: "02",
  },
  {
    title: "Photos that protect you",
    body: "Snap before/after photos on every job — proof of the work you did, attached automatically.",
    icon: "03",
  },
  {
    title: "Message your dispatcher",
    body: "Running late, need an address confirmed, job's more than expected — one thread, no phone tag.",
    icon: "04",
  },
];

const DAY_FLOW = [
  {
    step: "01",
    title: "Open your day",
    body: "See the full route, start times, and any notes the business left for each stop.",
  },
  {
    step: "02",
    title: "Arrive and check in",
    body: "One tap logs your arrival with location so the office knows the job has started.",
  },
  {
    step: "03",
    title: "Work the checklist",
    body: "Service-specific checklists and photo capture keep quality consistent and documented.",
  },
  {
    step: "04",
    title: "Finish and move on",
    body: "Check out, send any notes, and head to the next stop with a clear next address.",
  },
];

const HIGHLIGHTS = [
  "No public marketplace",
  "Invite-only access",
  "Clear daily routes",
  "Proof on every job",
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

export default function ForCleaners() {
  return (
      <>
        <style>{`
        .cleaner-page { overflow: hidden; background: #ffffff; }
        .page-container { width: min(100% - 32px, 1200px); margin-inline: auto; }
        .reveal {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal-visible { opacity: 1; transform: translateY(0); }

        .cleaner-hero {
          position: relative;
          min-height: 760px;
          display: flex;
          align-items: center;
          padding: 90px 0 84px;
          background: radial-gradient(circle at 82% 12%, rgba(92,120,96,0.16), transparent 26%), linear-gradient(180deg, #ffffff 0%, #f7f4f0 100%);
        }
        .cleaner-hero::before {
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
          grid-template-columns: minmax(0, 1fr) minmax(420px, 0.94fr);
          gap: 72px;
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
          max-width: 720px;
          margin: 22px 0;
          color: #171b1a;
          font-size: clamp(42px, 5.6vw, 68px);
          line-height: 0.98;
          letter-spacing: -0.055em;
        }
        .hero-title span { color: #476d53; }
        .hero-copy {
          max-width: 560px;
          margin: 0 0 20px;
          color: #5f6664;
          font-size: clamp(17px, 2vw, 19px);
          line-height: 1.72;
        }
        .hero-note {
          max-width: 520px;
          margin: 0;
          padding: 14px 16px;
          border-radius: 14px;
          background: #f7f8f6;
          border: 1px solid #e6ece7;
          color: #5f6664;
          font-size: 13px;
          line-height: 1.65;
          font-weight: 600;
        }

        .hero-visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 600px;
        }
        .hero-visual::before {
          content: "";
          position: absolute;
          width: 540px;
          height: 540px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(71,109,83,0.18), rgba(71,109,83,0.03) 54%, transparent 74%);
          animation: pulseSoft 6.8s ease-in-out infinite;
        }
        @keyframes pulseSoft {
          0%, 100% { opacity: 0.75; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .hero-image-wrap {
          position: relative;
          width: min(100%, 480px);
          height: 560px;
          overflow: hidden;
          border: 10px solid #ffffff;
          border-radius: 32px;
          background: #edf5ef;
          box-shadow: 0 38px 90px rgba(35,52,45,0.18), 0 0 0 1px rgba(71,109,83,0.08);
        }
        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .hero-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 50%, rgba(15,23,20,0.42) 100%);
        }

        .floating-card {
          position: absolute;
          z-index: 2;
          min-width: 210px;
          padding: 14px 16px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.85);
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(18px);
          box-shadow: 0 18px 48px rgba(16,24,20,0.15);
          animation: floatCard 5.8s ease-in-out infinite;
        }
        .floating-card-top { top: 42px; left: -28px; }
        .floating-card-bottom { right: -32px; bottom: 70px; animation-delay: -2.4s; }
        .floating-label {
          margin-bottom: 4px;
          color: #769181;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .floating-title { color: #171b1a; font-size: 14px; font-weight: 800; }
        .floating-copy { margin-top: 3px; color: #5f6664; font-size: 12px; line-height: 1.45; }

        .trust-strip {
          padding: 20px 0;
          border-top: 1px solid #edf1ee;
          border-bottom: 1px solid #edf1ee;
          background: #ffffff;
        }
        .trust-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .trust-item {
          min-height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 0 12px;
          border-radius: 14px;
          background: #f8f9f7;
          border: 1px solid #edf1ee;
          color: #47514f;
          font-size: 12px;
          font-weight: 800;
          text-align: center;
        }
        .trust-item svg { color: #476d53; flex-shrink: 0; }

        .section { padding: 110px 0; }
        .section-soft { background: #f7f8f6; }
        .section-green {
          background: radial-gradient(circle at 12% 10%, rgba(71,109,83,0.08), transparent 26%), linear-gradient(180deg, #f5faf5 0%, #ffffff 100%);
        }
        .section-heading {
          max-width: 780px;
          margin: 0 auto 52px;
          text-align: center;
        }
        .section-heading-left {
          max-width: 640px;
          margin: 0 0 40px;
          text-align: left;
        }
        .section-kicker {
          margin-bottom: 12px;
          color: #476d53;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .section-title {
          margin: 0 0 16px;
          color: #171b1a;
          font-size: clamp(32px, 4.3vw, 50px);
          line-height: 1.06;
          letter-spacing: -0.045em;
        }
        .section-copy {
          color: #5f6664;
          font-size: 16px;
          line-height: 1.75;
        }

        .points-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }
        .point-card {
          min-height: 220px;
          padding: 28px;
          border-radius: 24px;
          background: #ffffff;
          border: 1px solid #e6ece7;
          box-shadow: 0 12px 40px rgba(16,24,20,0.05);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .point-card:hover {
          transform: translateY(-5px);
          border-color: rgba(71,109,83,0.2);
          box-shadow: 0 20px 52px rgba(16,24,20,0.08);
        }
        .point-icon {
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
        .point-card h3 {
          margin: 0 0 10px;
          color: #171b1a;
          font-size: 19px;
          font-weight: 800;
        }
        .point-card p {
          margin: 0;
          color: #5f6664;
          font-size: 14px;
          line-height: 1.7;
        }

        .story-layout {
          display: grid;
          grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
          gap: 64px;
          align-items: center;
        }
        .story-image-wrap {
          position: relative;
          min-height: 520px;
        }
        .story-image {
          position: absolute;
          inset: 0 48px 0 0;
          width: calc(100% - 48px);
          height: 100%;
          object-fit: cover;
          border-radius: 28px;
          box-shadow: 0 28px 70px rgba(16,24,20,0.15);
        }
        .story-card {
          position: absolute;
          right: 0;
          bottom: 28px;
          width: min(300px, 82%);
          padding: 22px;
          border-radius: 20px;
          background: #476d53;
          color: #ffffff;
          box-shadow: 0 22px 54px rgba(71,109,83,0.28);
        }
        .story-card h3 {
          margin: 0 0 8px;
          font-size: 17px;
          font-weight: 800;
        }
        .story-card p {
          margin: 0;
          color: rgba(255,255,255,0.78);
          font-size: 13px;
          line-height: 1.6;
        }

        .flow-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        .flow-item {
          display: grid;
          grid-template-columns: 52px 1fr;
          gap: 16px;
          padding: 20px;
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid #e6ece7;
          box-shadow: 0 10px 36px rgba(16,24,20,0.04);
        }
        @media (max-width: 780px) {
          .flow-list {
            grid-template-columns: 1fr;
          }
        }
        .flow-number {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          background: #edf5ef;
          color: #476d53;
          font-size: 13px;
          font-weight: 900;
        }
        .flow-item h3 {
          margin: 2px 0 8px;
          color: #171b1a;
          font-size: 17px;
          font-weight: 800;
        }
        .flow-item p {
          margin: 0;
          color: #5f6664;
          font-size: 14px;
          line-height: 1.65;
        }

        .invite-card {
          padding: 42px;
          border-radius: 30px;
          color: #ffffff;
          background: radial-gradient(circle at 85% 15%, rgba(255,255,255,0.16), transparent 28%), linear-gradient(145deg, #476d53 0%, #2f4f3d 100%);
          box-shadow: 0 24px 70px rgba(47,79,61,0.28);
        }
        .invite-card .section-kicker { color: rgba(255,255,255,0.7); }
        .invite-card h2 {
          margin: 0 0 14px;
          color: #ffffff;
          font-size: clamp(28px, 3.8vw, 40px);
          line-height: 1.12;
          letter-spacing: -0.03em;
          max-width: 640px;
        }
        .invite-card p {
          margin: 0;
          color: rgba(255,255,255,0.8);
          font-size: 16px;
          line-height: 1.75;
          max-width: 640px;
        }

        .final-cta {
          position: relative;
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
          font-size: clamp(34px, 4.8vw, 52px);
          line-height: 1.04;
          letter-spacing: -0.045em;
        }
        .final-inner p {
          max-width: 620px;
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
          padding: 0 22px;
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

        @media (max-width: 1080px) {
          .hero-layout, .story-layout { grid-template-columns: 1fr; }
          .cleaner-hero { min-height: auto; }
          .hero-visual { width: min(100%, 700px); margin-inline: auto; min-height: 520px; }
          .story-image-wrap { min-height: 460px; }
        }
        @media (max-width: 780px) {
          .section { padding: 84px 0; }
          .points-grid { grid-template-columns: 1fr; }
          .trust-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .page-container { width: min(100% - 28px, 1200px); }
          .cleaner-hero { padding: 68px 0 60px; }
          .hero-title { font-size: clamp(36px, 12vw, 48px); }
          .hero-copy { font-size: 16px; }
          .hero-image-wrap {
            width: calc(100% - 12px);
            height: 460px;
            border-width: 7px;
          }
          .floating-card {
            min-width: 170px;
            max-width: 210px;
            padding: 12px;
          }
          .floating-card-top { top: 24px; left: 0; }
          .floating-card-bottom { right: 0; bottom: 36px; }
          .trust-grid { grid-template-columns: 1fr; }
          .story-image { inset: 0 28px 0 0; width: calc(100% - 28px); }
          .story-card { width: 86%; bottom: 18px; }
          .invite-card { padding: 28px 22px; }
          .final-cta { padding: 86px 0; }
          .final-actions { display: grid; }
          .final-primary, .final-secondary { width: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; }
          .hero-visual::before, .floating-card { animation: none; }
        }
      `}</style>

        <div className="cleaner-page">
          <main>
            {/* Hero */}
            <section className="cleaner-hero">
              <div className="page-container">
                <div className="hero-layout">
                  <Reveal>
                    <div>
                      <div className="eyebrow">
                        <span className="eyebrow-dot" />
                        For cleaners
                      </div>
                      <h1 className="hero-title">
                        Your jobs, your route, your <span>day — in one app.</span>
                      </h1>
                      <p className="hero-copy">
                        If the business you work for uses CleanSera, this is where your schedule lives: today’s jobs, checklists, service notes, and a direct line to your dispatcher when something changes.
                      </p>
                      <p className="hero-note">
                        CleanSera is invite-only through your employer — there is no public signup or open job marketplace here.
                      </p>
                    </div>
                  </Reveal>

                  <Reveal delay={120}>
                    <div className="hero-visual">
                      <div className="hero-image-wrap">
                        <img
                            className="hero-image"
                            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=88"
                            alt="Professional cleaner preparing for a service visit"
                        />
                        <div className="hero-image-overlay" />
                      </div>

                      <div className="floating-card floating-card-top">
                        <div className="floating-label">Today</div>
                        <div className="floating-title">3 stops on your route</div>
                        <div className="floating-copy">Addresses, notes, and start times in order.</div>
                      </div>

                      <div className="floating-card floating-card-bottom">
                        <div className="floating-label">On the job</div>
                        <div className="floating-title">Check in · Photos · Check out</div>
                        <div className="floating-copy">One tap keeps the office updated in real time.</div>
                      </div>
                    </div>
                  </Reveal>
                </div>
              </div>
            </section>

            {/* Highlights */}
            <section className="trust-strip">
              <div className="page-container">
                <div className="trust-grid">
                  {HIGHLIGHTS.map((item) => (
                      <div key={item} className="trust-item">
                        <CheckIcon />
                        {item}
                      </div>
                  ))}
                </div>
              </div>
            </section>

            {/* App points */}
            <section className="section section-soft">
              <div className="page-container">
                <Reveal>
                  <div className="section-heading">
                    <div className="section-kicker">Built around the day</div>
                    <h2 className="section-title">Built around a working day, not a dashboard.</h2>
                    <p className="section-copy">
                      Everything you need for the shift is organized so you can focus on the work — not hunting for details.
                    </p>
                  </div>
                </Reveal>

                <div className="points-grid">
                  {APP_POINTS.map((point, index) => (
                      <Reveal key={point.title} delay={index * 70}>
                        <article className="point-card">
                          <div className="point-icon">{point.icon}</div>
                          <h3>{point.title}</h3>
                          <p>{point.body}</p>
                        </article>
                      </Reveal>
                  ))}
                </div>
              </div>
            </section>

            {/* Day flow + image */}
            <section className="section section-green">
              <div className="page-container">
                <div className="story-layout">
                  <Reveal>
                    <div className="story-image-wrap">
                      <img
                          className="story-image"
                          src="https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=88"
                          alt="Cleaner following a structured service checklist on site"
                      />
                      <div className="story-card">
                        <h3>Clear work. Clear record.</h3>
                        <p>Checklists and photos protect the quality of your work and keep the office aligned.</p>
                      </div>
                    </div>
                  </Reveal>

                  <Reveal delay={100}>
                    <div>
                      <div className="section-heading-left">
                        <div className="section-kicker">How a day flows</div>
                        <h2 className="section-title">From first stop to last check-out</h2>
                        <p className="section-copy">
                          A simple rhythm so you always know what’s next and the business always knows where things stand.
                        </p>
                      </div>

                      <div className="flow-list">
                        {DAY_FLOW.map((item) => (
                            <div key={item.step} className="flow-item">
                              <div className="flow-number">{item.step}</div>
                              <div>
                                <h3>{item.title}</h3>
                                <p>{item.body}</p>
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                </div>
              </div>
            </section>

            {/* Invite card */}
            <section className="section">
              <div className="page-container">
                <Reveal>
                  <div className="invite-card">
                    <div className="section-kicker">Already have an invite?</div>
                    <h2>Your employer sends the access link.</h2>
                    <p>
                      Your employer sends a link by text or email so you can set your password and get into the app. If you’re expecting one and haven’t seen it, check with your business directly — CleanSera cannot resend an invite on their behalf.
                    </p>
                  </div>
                </Reveal>
              </div>
            </section>

            {/* Final CTA */}
            <section className="final-cta">
              <div className="page-container">
                <Reveal>
                  <div className="final-inner">
                    <h2>Run a clearer day with CleanSera.</h2>
                    <p>
                      Routes, check-ins, photos, and messaging — all in one place when the business you work for runs on CleanSera.
                    </p>
                    <div className="final-actions">
                      <Link href="/for-businesses" className="final-primary">
                        For business owners
                        <ArrowIcon />
                      </Link>
                      <Link href="/how-it-works" className="final-secondary">
                        See how it works
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