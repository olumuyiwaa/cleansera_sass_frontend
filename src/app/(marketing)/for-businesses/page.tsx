"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const COMPARE_ROWS = [
  { label: "Booking site", cleansera: "Your own branded booking experience", marketplace: "Shared listing inside a crowded marketplace" },
  { label: "Who manages your roster", cleansera: "You do, entirely", marketplace: "Platform approves and controls access" },
  { label: "Commission model", cleansera: "Subscription only", marketplace: "A cut on every booking" },
  { label: "Customer payments", cleansera: "Collected however your business already does it", marketplace: "Often routed through the platform" },
  { label: "Customer loyalty", cleansera: "Yours, in your CRM", marketplace: "Platform owns the relationship" },
];

const BENEFITS = [
  {
    title: "Brand-first customer experience",
    body: "Present a premium, polished booking journey with your own brand, service menu, proofs, and follow-up flow.",
  },
  {
    title: "Operational visibility",
    body: "See job schedules, cleaner status, customer communication, and service quality in one place without spreadsheet chase.",
  },
  {
    title: "Cleaner onboarding you control",
    body: "Add and remove cleaners on your terms, with secure access and clear accountability across every job.",
  },
  {
    title: "Recurring revenue without friction",
    body: "Create repeat service plans, rebookings, and reminders that keep your schedule full and predictable.",
  },
];

const PLAN_HIGHLIGHTS = [
  { name: "Starter", detail: "For lean teams launching a cleaner operating rhythm with a branded booking site." },
  { name: "Growth", detail: "Built for scaling businesses with recurring jobs, bigger rosters, and more visibility." },
  { name: "Pro", detail: "For established teams that want deeper automation, custom workflows, and premium support." },
];

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.12 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
      <div
          ref={ref}
          className={`reveal ${visible ? "reveal-visible" : ""} ${className}`.trim()}
          style={{ transitionDelay: `${delay}ms` }}
      >
        {children}
      </div>
  );
}

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export default function ForBusinesses() {
  const [demoName, setDemoName] = useState("");
  const [demoEmail, setDemoEmail] = useState("");
  const [demoStatus, setDemoStatus] = useState("idle"); // idle | loading | success | error
  const [demoError, setDemoError] = useState("");

  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    if (demoStatus === "loading") return;
    setDemoStatus("loading");
    setDemoError("");
    try {
      const res = await fetch(`${API_BASE_URL}/demo-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: demoName, email: demoEmail, source: "for-businesses" }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Something went wrong — please try again.");
      }
      setDemoStatus("success");
    } catch (err) {
      setDemoStatus("error");
      setDemoError(err.message || "Something went wrong — please try again.");
    }
  };

  return (
      <>
        <style>{`
        .business-page { overflow: hidden; background: #ffffff; }
        .page-container { width: min(100% - 32px, 1200px); margin-inline: auto; }
        .reveal {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal-visible { opacity: 1; transform: translateY(0); }
        .business-hero {
          position: relative;
          min-height: 760px;
          display: flex;
          align-items: center;
          padding: 90px 0 82px;
          background: radial-gradient(circle at 82% 12%, rgba(92,120,96,0.16), transparent 26%), linear-gradient(180deg, #ffffff 0%, #f7f4f0 100%);
        }
        .business-hero::before {
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
          gap: 78px;
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
          max-width: 760px;
          margin: 24px 0;
          color: #171b1a;
          font-size: clamp(46px, 6vw, 74px);
          line-height: 0.98;
          letter-spacing: -0.055em;
        }
        .hero-title span { color: #476d53; }
        .hero-copy {
          max-width: 700px;
          margin: 0 0 32px;
          color: #5f6664;
          font-size: clamp(17px, 2vw, 20px);
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
          transition: transform 0.2s ease, box-shadow 0.2s ease;
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
        .hero-points {
          display: flex;
          flex-wrap: wrap;
          gap: 14px 18px;
          margin-top: 28px;
        }
        .hero-point {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #5f6664;
          font-size: 13px;
          font-weight: 700;
        }
        .hero-point-icon {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: #edf5ef;
          color: #476d53;
        }
        .hero-visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 610px;
        }
        .hero-visual::before {
          content: "";
          position: absolute;
          width: 560px;
          height: 560px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(71,109,83,0.18), rgba(71,109,83,0.03) 54%, transparent 74%);
          animation: pulseSoft 6.8s ease-in-out infinite;
        }
        @keyframes pulseSoft {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .hero-image-box {
          position: relative;
          width: min(100%, 500px);
          min-height: 570px;
          padding: 18px 18px 16px;
          border: 10px solid #ffffff;
          border-radius: 32px;
          background: linear-gradient(135deg, #edf5ef 0%, #f5f0e7 100%);
          box-shadow: 0 38px 90px rgba(35,52,45,0.18), 0 0 0 1px rgba(71,109,83,0.08);
        }
        .dashboard-card {
          border-radius: 22px;
          background: rgba(255,255,255,0.82);
          border: 1px solid rgba(255,255,255,0.7);
          backdrop-filter: blur(18px);
          box-shadow: 0 18px 46px rgba(16,24,20,0.1);
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 18px 14px;
          border-bottom: 1px solid rgba(23,27,26,0.08);
        }
        .dashboard-header h3 {
          margin: 0;
          color: #171b1a;
          font-size: 18px;
          line-height: 1.2;
        }
        .live-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          background: #476d53;
          color: #ffffff;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .dashboard-body { padding: 16px 16px 18px; }
        .job-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
          border: 1px solid #edf1ee;
          border-radius: 16px;
          background: rgba(255,255,255,0.75);
          margin-bottom: 10px;
        }
        .job-row:last-child { margin-bottom: 0; }
        .job-name { color: #171b1a; font-weight: 700; }
        .job-time { color: #5f6664; font-size: 12px; }
        .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          background: #edf5ef;
          color: #476d53;
          font-size: 11px;
          font-weight: 800;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-top: 14px;
        }
        .mini-stat {
          padding: 14px 12px;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid #edf1ee;
        }
        .mini-stat .label {
          display: block;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #5f6664;
        }
        .mini-stat .value {
          display: block;
          margin-top: 8px;
          color: #171b1a;
          font-size: 28px;
          line-height: 1;
          font-weight: 800;
        }
        .floating-card {
          position: absolute;
          z-index: 2;
          min-width: 220px;
          padding: 16px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.85);
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(18px);
          box-shadow: 0 18px 48px rgba(16,24,20,0.15);
          animation: floatCard 5.8s ease-in-out infinite;
        }
        .floating-card-top { top: 52px; left: -32px; }
        .floating-card-bottom { right: -48px; bottom: 70px; animation-delay: -2.5s; }
        .floating-label { margin-bottom: 6px; color: #769181; font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
        .floating-title { color: #171b1a; font-size: 15px; font-weight: 800; }
        .floating-copy { margin-top: 4px; color: #5f6664; font-size: 12px; line-height: 1.5; }
        .section { padding: 110px 0; }
        .section-soft { background: #f7f8f6; }
        .section-green { background: radial-gradient(circle at 12% 10%, rgba(71,109,83,0.08), transparent 26%), linear-gradient(180deg, #f5faf5 0%, #ffffff 100%); }
        .section-heading { max-width: 820px; margin: 0 auto 56px; text-align: center; }
        .section-kicker { margin-bottom: 12px; color: #476d53; font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
        .section-title {
          margin: 0 0 18px;
          color: #171b1a;
          font-size: clamp(34px, 4.5vw, 56px);
          line-height: 1.06;
          letter-spacing: -0.045em;
        }
        .section-copy { color: #5f6664; font-size: 17px; line-height: 1.75; }
        .benefits-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; }
        .benefit-card {
          min-height: 250px;
          padding: 24px;
          border-radius: 22px;
          background: #ffffff;
          border: 1px solid #e6ece7;
          box-shadow: 0 12px 40px rgba(16,24,20,0.04);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .benefit-card:hover { transform: translateY(-6px); border-color: rgba(71,109,83,0.22); box-shadow: 0 22px 56px rgba(16,24,20,0.08); }
        .benefit-icon {
          width: 52px;
          height: 52px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          background: #edf5ef;
          color: #476d53;
          margin-bottom: 20px;
        }
        .benefit-card h3 { margin: 0 0 12px; color: #171b1a; font-size: 19px; }
        .benefit-card p { margin: 0; color: #5f6664; font-size: 14px; line-height: 1.72; }
        .comparison-wrap { overflow: hidden; border-radius: 28px; background: #ffffff; border: 1px solid #e6ece7; box-shadow: 0 12px 40px rgba(16,24,20,0.04); }
        .comparison-header, .comparison-row {
          display: grid;
          grid-template-columns: 1.15fr 1fr 1fr;
          gap: 0;
        }
        .comparison-header {
          background: #f7f8f6;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .comparison-header > div, .comparison-row > div {
          padding: 18px 16px;
          border-bottom: 1px solid #edf1ee;
        }
        .comparison-row:nth-child(odd) { background: rgba(247,248,246,0.7); }
        .comparison-row > div:nth-child(2) { color: #476d53; font-weight: 700; }
        .comparison-row > div:nth-child(3) { color: #5f6664; }
        .control-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr); gap: 24px; align-items: center; }
        .control-card {
          padding: 26px;
          border-radius: 28px;
          background: #ffffff;
          border: 1px solid #e6ece7;
          box-shadow: 0 18px 60px rgba(16,24,20,0.07);
        }
        .roster-list { display: grid; gap: 12px; margin: 18px 0 0; padding: 0; list-style: none; }
        .roster-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid #edf1ee;
        }
        .roster-item:last-child { border-bottom: none; padding-bottom: 0; }
        .roster-name { color: #171b1a; }
        .roster-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
        }
        .roster-active { background: #edf5ef; color: #476d53; }
        .roster-off { background: #f4f4f4; color: #5f6664; }
        .plan-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
        .plan-card {
          padding: 28px;
          border-radius: 24px;
          background: #ffffff;
          border: 1px solid #e6ece7;
          box-shadow: 0 12px 40px rgba(16,24,20,0.04);
        }
        .plan-card h3 { margin: 0; color: #171b1a; font-size: 24px; }
        .plan-card p { margin: 16px 0 0; color: #5f6664; font-size: 14px; line-height: 1.7; }
        .demo-section {
          padding: 110px 0;
          color: #ffffff;
          background: linear-gradient(135deg, #476d53 0%, #2f4f3d 100%);
        }
        .demo-inner {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
          gap: 24px;
          align-items: center;
        }
        .demo-title { margin: 0 0 10px; color: #ffffff; font-size: clamp(34px, 4vw, 52px); }
        .demo-copy { margin: 0; color: rgba(255,255,255,0.8); font-size: 17px; line-height: 1.7; }
        .demo-form {
          display: flex;
          gap: 12px;
          align-items: center;
          justify-content: flex-end;
        }
        .demo-input {
          width: 100%;
          flex: 1 1 0;
          min-width: 0;
          min-height: 52px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.06);
          color: #ffffff;
          padding: 0 18px;
          outline: none;
        }
        .demo-input::placeholder { color: rgba(255,255,255,0.7); }
        .demo-success {
          min-height: 52px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          text-align: right;
          color: #ffffff;
          font-weight: 600;
          font-size: 15px;
        }
        .demo-error {
          margin: 10px 0 0;
          text-align: right;
          color: #ffd7d7;
          font-size: 13px;
        }
        .demo-button:disabled { opacity: 0.7; cursor: default; }
        .demo-button {
          flex: 0 0 auto;
          min-height: 52px;
          padding: 0 22px;
          border-radius: 999px;
          border: 0;
          background: #ffffff;
          color: #2f4f3d;
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
        }
        @media (max-width: 1080px) {
          .hero-layout, .control-grid, .demo-inner { grid-template-columns: 1fr; }
          .account-panel { order: 2; }
          .business-hero { min-height: auto; }
          .hero-visual { width: min(100%, 700px); margin-inline: auto; }
          .benefits-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 780px) {
          .section { padding: 84px 0; }
          .benefits-grid, .plan-grid { grid-template-columns: 1fr; }
          .comparison-header, .comparison-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .page-container { width: min(100% - 28px, 1200px); }
          .business-hero { padding: 68px 0 66px; }
          .hero-title { font-size: clamp(42px, 14vw, 58px); }
          .hero-copy { font-size: 16px; }
          .hero-actions, .demo-form { display: grid; }
          .primary-button, .secondary-button, .demo-button { width: 100%; }
          .hero-points { display: grid; gap: 12px; }
          .hero-visual { min-height: 520px; }
          .hero-image-box { width: calc(100% - 16px); min-height: 430px; padding: 12px; border-width: 7px; }
          .floating-card { min-width: 180px; max-width: 225px; padding: 13px; }
          .floating-card-top { top: 22px; left: 0; }
          .floating-card-bottom { right: 0; bottom: 26px; }
          .dashboard-header { padding: 14px; }
          .dashboard-body { padding: 12px; }
          .stats-grid { grid-template-columns: 1fr; }
          .plan-card, .benefit-card, .control-card { padding: 22px 18px; }
          .demo-section { padding: 80px 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; }
          .hero-visual::before, .floating-card { animation: none; }
        }
      `}</style>

        <div className="business-page">
          <main>
            <section className="business-hero">
              <div className="page-container">
                <div className="hero-layout">
                  <Reveal>
                    <div>
                      <div className="eyebrow">
                        <span className="eyebrow-dot" />
                        For cleaning businesses
                      </div>
                      <h1 className="hero-title">
                        Software that keeps your <span>business in control.</span>
                      </h1>
                      <p className="hero-copy">
                        CleanSera helps you run a cleaner, smarter service business with your own branded booking flow, cleaner roster, recurring scheduling system, and premium customer journey — without the noise of a marketplace.
                      </p>
                      <div className="hero-actions">
                        <Link href="/for-businesses#demo" className="primary-button">
                          Book a demo
                          <ArrowIcon />
                        </Link>
                        <Link href="/pricing" className="secondary-button">
                          View pricing
                          <ArrowIcon />
                        </Link>
                      </div>
                      <div className="hero-points">
                        {[
                          "Brand-first customer experience",
                          "Cleaner roster under your control",
                          "Recurring scheduling built in",
                        ].map((item) => (
                            <span key={item} className="hero-point">
                          <span className="hero-point-icon"><CheckIcon /></span>
                              {item}
                        </span>
                        ))}
                      </div>
                    </div>
                  </Reveal>

                  <Reveal delay={120}>
                    <div className="hero-visual">
                      <div className="hero-image-box">
                        <div className="dashboard-card">
                          <div className="dashboard-header">
                            <h3>Today’s flow</h3>
                            <span className="live-pill">Live</span>
                          </div>
                          <div className="dashboard-body">
                            {[
                              { name: "Northside Home", time: "9:30 AM", status: "Confirmed" },
                              { name: "Westfield Apts", time: "11:00 AM", status: "Assigned" },
                              { name: "Oak Terrace", time: "2:15 PM", status: "Reviewing" },
                            ].map((job) => (
                                <div key={job.name} className="job-row">
                                  <div>
                                    <div className="job-name">{job.name}</div>
                                    <div className="job-time">{job.time}</div>
                                  </div>
                                  <span className="status-badge">{job.status}</span>
                                </div>
                            ))}

                            <div className="stats-grid">
                              <div className="mini-stat">
                                <span className="label">Revenue</span>
                                <span className="value">$14.8k</span>
                              </div>
                              <div className="mini-stat">
                                <span className="label">Retention</span>
                                <span className="value">89%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="floating-card floating-card-top">
                        <div className="floating-label">Your brand</div>
                        <div className="floating-title">Premium booking experience</div>
                        <div className="floating-copy">Customers book through a polished flow that feels like your business, not a marketplace.</div>
                      </div>

                      <div className="floating-card floating-card-bottom">
                        <div className="floating-label">Control</div>
                        <div className="floating-title">Operational clarity</div>
                        <div className="floating-copy">Everything under your roof, from roster to recurring jobs and customer communication.</div>
                      </div>
                    </div>
                  </Reveal>
                </div>
              </div>
            </section>

            <section className="section section-soft">
              <div className="page-container">
                <Reveal>
                  <div className="section-heading">
                    <div className="section-kicker">Why teams choose CleanSera</div>
                    <h2 className="section-title">A premium operating layer for businesses that want more control and less chaos.</h2>
                    <p className="section-copy">The strongest service businesses do not need more noise. They need a cleaner operating system that feels polished, visible, and under their control.</p>
                  </div>
                </Reveal>

                <div className="benefits-grid">
                  {BENEFITS.map((benefit, index) => (
                      <Reveal key={benefit.title} delay={index * 75}>
                        <article className="benefit-card">
                          <div className="benefit-icon"><CheckIcon /></div>
                          <h3>{benefit.title}</h3>
                          <p>{benefit.body}</p>
                        </article>
                      </Reveal>
                  ))}
                </div>
              </div>
            </section>

            <section className="section section-green">
              <div className="page-container">
                <Reveal>
                  <div className="section-heading">
                    <div className="section-kicker">Comparison</div>
                    <h2 className="section-title">CleanSera vs. a marketplace app</h2>
                  </div>
                </Reveal>

                <div className="comparison-wrap">
                  <div className="comparison-header">
                    <div> </div>
                    <div>CleanSera</div>
                    <div>Typical marketplace</div>
                  </div>
                  {COMPARE_ROWS.map((row, index) => (
                      <div key={row.label} className="comparison-row" style={{ background: index % 2 === 0 ? "#f9fbf9" : "#ffffff" }}>
                        <div>{row.label}</div>
                        <div>{row.cleansera}</div>
                        <div>{row.marketplace}</div>
                      </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="section">
              <div className="page-container control-grid">
                <Reveal>
                  <div>
                    <div className="section-kicker">Control</div>
                    <h2 className="section-title">You onboard. You offboard. Full stop.</h2>
                    <p className="section-copy">
                      Every cleaner on your roster is invited by you and can be removed by you. That means your customer relationships, team quality, and service standards stay under your control — with the right tools working behind the scenes.
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={90}>
                  <div className="control-card">
                    <div className="section-kicker" style={{ marginBottom: 0 }}>Your roster</div>
                    <ul className="roster-list">
                      {[
                        { name: "Amara O.", status: "Active" },
                        { name: "Femi A.", status: "Active" },
                        { name: "Grace T.", status: "Offboarded" },
                      ].map((cleaner) => (
                          <li key={cleaner.name} className="roster-item">
                            <span className="roster-name">{cleaner.name}</span>
                            <span className={`roster-status ${cleaner.status === "Active" ? "roster-active" : "roster-off"}`}>
                          {cleaner.status}
                        </span>
                          </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </div>
            </section>

            <section className="section section-soft">
              <div className="page-container">
                <Reveal>
                  <div className="section-heading">
                    <div className="section-kicker">Plans</div>
                    <h2 className="section-title">Plans that grow with your roster</h2>
                  </div>
                </Reveal>

                <div className="plan-grid">
                  {PLAN_HIGHLIGHTS.map((plan, index) => (
                      <Reveal key={plan.name} delay={index * 70}>
                        <div className="plan-card">
                          <h3>{plan.name}</h3>
                          <p>{plan.detail}</p>
                        </div>
                      </Reveal>
                  ))}
                </div>
              </div>
            </section>

            <section className="demo-section">
              <div className="page-container">
                <div className="demo-inner" id="demo">
                  <Reveal>
                    <div>
                      <div className="section-kicker" style={{ color: "rgba(255,255,255,0.7)" }}>See it in action</div>
                      <h2 className="demo-title">See CleanSera running your business</h2>
                      <p className="demo-copy">
                        A 20-minute walkthrough with your services, your roster, and your service area — no generic deck, no pressure.
                      </p>
                    </div>
                  </Reveal>

                  <Reveal delay={80}>
                    {demoStatus === "success" ? (
                        <div className="demo-success">Thanks — we'll be in touch shortly to set up your walkthrough.</div>
                    ) : (
                        <form className="demo-form" onSubmit={handleDemoSubmit}>
                          <input
                              className="demo-input"
                              type="text"
                              placeholder="Your name"
                              aria-label="Your name"
                              value={demoName}
                              onChange={(e) => setDemoName(e.target.value)}
                              required
                          />
                          <input
                              className="demo-input"
                              type="email"
                              placeholder="you@yourbusiness.com"
                              aria-label="Email address"
                              value={demoEmail}
                              onChange={(e) => setDemoEmail(e.target.value)}
                              required
                          />
                          <button type="submit" className="demo-button" disabled={demoStatus === "loading"}>
                            {demoStatus === "loading" ? "Booking…" : "Book"}
                          </button>
                        </form>
                    )}
                    {demoStatus === "error" && <p className="demo-error">{demoError}</p>}
                  </Reveal>
                </div>
              </div>
            </section>
          </main>
        </div>
      </>
  );
}