"use client";

import Link from "next/link";
import Reveal from "@/components/marketing/Reveal"

const TRUST_STATS = [
    { value: "2.5k+", label: "properties cared for" },
    { value: "98%", label: "customer satisfaction" },
    { value: "24/7", label: "booking visibility" },
];

const FEATURE_CARDS = [
    {
        title: "Own your booking flow",
        body: "Your brand-first customer experience, from first click to confirmation, with no marketplace noise and no lost bookings.",
        icon: "01",
    },
    {
        title: "Smart team dispatch",
        body: "Assign by skill, route, availability, or recurring service patterns without spreadsheet chaos.",
        icon: "02",
    },
    {
        title: "Recurring care plans",
        body: "Turn one-time cleanings into repeat revenue with automated reminders, schedules, and checklists.",
        icon: "03",
    },
    {
        title: "Proof & accountability",
        body: "Attach before-and-after job records, team notes, and completion checklists to every visit.",
        icon: "04",
    },
];

const PROCESS = [
    {
        step: "01",
        title: "Set up your business",
        body: "Launch your own branded profile, service menu, service area, and availability in a few simple steps.",
    },
    {
        step: "02",
        title: "Onboard your team",
        body: "Invite the cleaners you trust, assign routes, and keep everyone aligned in one place.",
    },
    {
        step: "03",
        title: "Automate the booking cycle",
        body: "Customers book online, get smooth confirmations, and your team gets the schedule before the day starts.",
    },
    {
        step: "04",
        title: "Track performance",
        body: "Review completion, revenue, recurring jobs, and customer feedback without chasing updates manually.",
    },
];

const BENEFITS = [
    "No commission-based marketplace friction",
    "A polished customer experience that looks premium",
    "Simple scheduling for recurring and one-off jobs",
    "Better visibility and accountability across your team",
];

const EXPERIENCE_POINTS = [
    "Brand-first customer booking experience",
    "Team scheduling and route visibility",
    "Recurring service planning and renewals",
    "Proof of work and visit accountability",
    "Real-time operations board",
    "Clear performance and revenue tracking",
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

function HeartIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 20.5s-7.5-4.35-9.36-8.43A5.06 5.06 0 0 1 12 5.06a5.06 5.06 0 0 1 9.36 7.01C19.5 16.15 12 20.5 12 20.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function BuildingIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 20V5.5A1.5 1.5 0 0 1 5.5 4H10v16H4Zm10 0V7h4.5A1.5 1.5 0 0 1 20 8.5V20h-6ZM10 4h4v16h-4M8 9h2M14 9h2M8 12h2M14 12h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function PhoneIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="7" y="2.5" width="10" height="19" rx="2.7" stroke="currentColor" strokeWidth="1.7" />
            <path d="M10.5 6.5h3M11.5 18.5h1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
    );
}

function ReviewIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M8 4h8M8 2h8v4H8V2Zm-2 2H5a2 2 0 0 0-2 2v13h18V8a2 2 0 0 0-2-2h-1" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="m8 13 2.1 2.1L16 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function Home() {
    return (
        <>
            <style>{`
        .home-page { overflow: hidden; background: #ffffff; }
        .page-container { width: min(100% - 32px, 1200px); margin-inline: auto; }
        .reveal {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal-visible { opacity: 1; transform: translateY(0); }
        .home-hero {
          position: relative;
          min-height: 760px;
          display: flex;
          align-items: center;
          padding: 90px 0 84px;
          background: radial-gradient(circle at 82% 12%, rgba(92,120,96,0.16), transparent 26%), linear-gradient(180deg, #ffffff 0%, #f7f4f0 100%);
        }
        .home-hero::before {
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
          padding: 0 13px;
          min-height: 34px;
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
          margin: 22px 0;
          color: #171b1a;
          font-size: clamp(42px, 5.6vw, 68px);
          line-height: 0.98;
          letter-spacing: -0.055em;
        }
        .hero-title span { color: #476d53; }
        .hero-copy {
          max-width: 620px;
          margin: 0 0 32px;
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
        .hero-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 34px;
        }
        .hero-stat {
          min-width: 140px;
          flex: 1;
          padding: 14px 16px;
          border-radius: 16px;
          background: #f7f3ee;
          border: 1px solid #e8e4de;
        }
        .hero-stat-label {
          display: block;
          color: #5f6664;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .hero-stat-value {
          display: block;
          margin-top: 4px;
          color: #171b1a;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.03em;
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
          0%, 100% { opacity: 0.75; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .ops-board {
          position: relative;
          width: min(100%, 480px);
          padding: 18px;
          border-radius: 28px;
          background: #ffffff;
          border: 1px solid #e6ece7;
          box-shadow: 0 38px 90px rgba(35,52,45,0.16), 0 0 0 1px rgba(71,109,83,0.06);
        }
        .ops-board-inner {
          padding: 20px;
          border-radius: 22px;
          background: linear-gradient(135deg, #edf5ef 0%, #f3f0ea 40%, #faf7f1 100%);
        }
        .ops-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 16px;
          border-bottom: 1px solid #e0e7e2;
        }
        .ops-label {
          color: #5f6664;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .ops-title {
          margin-top: 6px;
          color: #171b1a;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }
        .ops-live {
          padding: 5px 10px;
          border-radius: 999px;
          background: #476d53;
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
        }
        .ops-jobs {
          margin-top: 18px;
          padding: 14px;
          border-radius: 18px;
          background: rgba(255,255,255,0.85);
          border: 1px solid #e6ece7;
        }
        .ops-jobs-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .ops-team-badge {
          padding: 4px 8px;
          border-radius: 999px;
          background: #edf5ef;
          color: #476d53;
          font-size: 10px;
          font-weight: 800;
        }
        .ops-job {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 14px;
          background: #faf9f6;
          border: 1px solid #e8e4de;
        }
        .ops-job:last-child { margin-bottom: 0; }
        .ops-job-name { color: #171b1a; font-size: 14px; font-weight: 700; }
        .ops-job-time { color: #5f6664; font-size: 12px; margin-top: 2px; }
        .ops-job-status {
          padding: 4px 9px;
          border-radius: 999px;
          background: #edf5ef;
          color: #476d53;
          font-size: 11px;
          font-weight: 800;
        }
        .ops-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
        }
        .ops-metric-dark {
          padding: 16px;
          border-radius: 16px;
          background: #476d53;
          color: #ffffff;
        }
        .ops-metric-light {
          padding: 16px;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid #e6ece7;
        }
        .ops-metric-label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .ops-metric-dark .ops-metric-label { color: rgba(255,255,255,0.75); }
        .ops-metric-light .ops-metric-label { color: #5f6664; }
        .ops-metric-value {
          margin-top: 6px;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }
        .ops-metric-light .ops-metric-value { color: #171b1a; }
        .ops-metric-sub {
          margin-top: 4px;
          font-size: 11px;
        }
        .ops-metric-dark .ops-metric-sub { color: rgba(255,255,255,0.7); }
        .ops-metric-light .ops-metric-sub { color: #5f6664; }
        .floating-card {
          position: absolute;
          z-index: 2;
          min-width: 200px;
          padding: 14px 16px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.85);
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(18px);
          box-shadow: 0 18px 48px rgba(16,24,20,0.15);
          animation: floatCard 5.8s ease-in-out infinite;
        }
        .floating-card-top { top: 36px; left: -28px; }
        .floating-card-bottom { right: -36px; bottom: 80px; animation-delay: -2.5s; }
        .floating-label { margin-bottom: 4px; color: #769181; font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
        .floating-title { color: #171b1a; font-size: 14px; font-weight: 800; }
        .floating-copy { margin-top: 3px; color: #5f6664; font-size: 12px; line-height: 1.45; }
        .trust-strip { padding: 22px 0; border-top: 1px solid #edf1ee; border-bottom: 1px solid #edf1ee; background: #ffffff; }
        .trust-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .trust-item {
          min-height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 0 15px;
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
        .section-green { background: radial-gradient(circle at 12% 10%, rgba(71,109,83,0.08), transparent 26%), linear-gradient(180deg, #f5faf5 0%, #ffffff 100%); }
        .section-heading { max-width: 820px; margin: 0 auto 56px; text-align: center; }
        .section-heading-left { max-width: 720px; margin: 0 0 48px; text-align: left; }
        .section-kicker { margin-bottom: 14px; color: #476d53; font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
        .section-title {
          margin: 0 0 18px;
          color: #171b1a;
          font-size: clamp(34px, 4.5vw, 52px);
          line-height: 1.06;
          letter-spacing: -0.045em;
        }
        .section-copy { color: #5f6664; font-size: 17px; line-height: 1.75; }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }
        .feature-card {
          min-height: 260px;
          padding: 26px;
          border-radius: 22px;
          background: #ffffff;
          border: 1px solid #e6ece7;
          box-shadow: 0 12px 40px rgba(16,24,20,0.05);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .feature-card:hover {
          transform: translateY(-6px);
          border-color: rgba(71,109,83,0.22);
          box-shadow: 0 22px 56px rgba(16,24,20,0.09);
        }
        .feature-icon {
          width: 48px;
          height: 48px;
          margin-bottom: 22px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          color: #476d53;
          background: #edf5ef;
          font-size: 13px;
          font-weight: 900;
        }
        .feature-card h3 { margin: 0 0 12px; color: #171b1a; font-size: 18px; font-weight: 800; }
        .feature-card p { margin: 0; color: #5f6664; font-size: 14px; line-height: 1.7; }
        .testimonial-card {
          padding: 42px;
          border-radius: 30px;
          background: linear-gradient(135deg, #f8f4ee 0%, #f1f7f3 100%);
          border: 1px solid #e6ece7;
          box-shadow: 0 24px 70px rgba(35,60,49,0.08);
        }
        .testimonial-layout {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 40px;
          align-items: center;
        }
        .testimonial-quote {
          margin: 16px 0 0;
          color: #171b1a;
          font-size: clamp(24px, 3vw, 32px);
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.03em;
        }
        .testimonial-person {
          padding: 22px;
          border-radius: 20px;
          background: rgba(255,255,255,0.9);
          border: 1px solid #e6ece7;
          box-shadow: 0 12px 36px rgba(16,24,20,0.06);
        }
        .hero-image-wrap {
          position: relative;
          width: min(100%, 480px);
          aspect-ratio: 4 / 5;
          border-radius: 28px;
          overflow: hidden;
          border: 1px solid #e6ece7;
          box-shadow: 0 38px 90px rgba(35, 52, 45, 0.16), 0 0 0 1px rgba(71, 109, 83, 0.06);
          z-index: 1;
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
          background: linear-gradient(
            180deg,
            rgba(23, 27, 26, 0.08) 0%,
            rgba(23, 27, 26, 0.35) 100%
          );
          pointer-events: none;
        }
        .person-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .person-avatar {
          width: 48px;
          height: 48px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: #edf5ef;
          color: #476d53;
          font-size: 14px;
          font-weight: 800;
        }
        .person-name { color: #171b1a; font-size: 15px; font-weight: 800; }
        .person-role { color: #5f6664; font-size: 13px; margin-top: 2px; }
        .person-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 18px;
        }
        .person-metric {
          padding: 12px;
          border-radius: 14px;
          background: #f7f8f6;
        }
        .person-metric-label {
          color: #5f6664;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .person-metric-value {
          margin-top: 4px;
          color: #171b1a;
          font-size: 20px;
          font-weight: 800;
        }
        .how-layout {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 64px;
          align-items: start;
        }
        .benefit-list { display: grid; gap: 12px; margin-top: 28px; }
        .benefit-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 18px;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid #e6ece7;
          box-shadow: 0 8px 28px rgba(16,24,20,0.04);
        }
        .benefit-check {
          width: 24px;
          height: 24px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          color: #476d53;
          background: #edf5ef;
        }
        .benefit-item p { margin: 0; color: #47514f; font-size: 15px; font-weight: 700; line-height: 1.5; }
        .process-list { display: grid; gap: 14px; }
        .process-item {
          display: grid;
          grid-template-columns: 54px 1fr;
          gap: 16px;
          padding: 20px;
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid #e6ece7;
          box-shadow: 0 10px 36px rgba(16,24,20,0.05);
        }
        .process-number {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          background: #edf5ef;
          color: #476d53;
          font-size: 13px;
          font-weight: 900;
        }
        .process-item h3 { margin: 2px 0 8px; color: #171b1a; font-size: 17px; font-weight: 800; }
        .process-item p { margin: 0; color: #5f6664; font-size: 14px; line-height: 1.65; }
        .experience-card {
          padding: 42px;
          border-radius: 30px;
          color: #ffffff;
          background: radial-gradient(circle at 85% 15%, rgba(255,255,255,0.18), transparent 25%), linear-gradient(145deg, #476d53 0%, #2f4f3d 100%);
          box-shadow: 0 24px 70px rgba(47,79,61,0.3);
        }
        .experience-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-top: 30px; }
        .experience-item {
          min-height: 74px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 17px;
          border-radius: 16px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.9);
          font-size: 13px;
          line-height: 1.55;
          font-weight: 700;
        }
        .experience-check {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,0.15);
          flex-shrink: 0;
        }
        .final-cta {
          position: relative;
          padding: 110px 0;
          overflow: hidden;
          color: #ffffff;
          background: radial-gradient(circle at 15% 20%, rgba(255,255,255,0.18), transparent 26%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.12), transparent 26%), linear-gradient(135deg, #476d53 0%, #2f4f3d 100%);
        }
        .final-inner { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; text-align: center; }
        .final-inner h2 { margin: 0 0 18px; font-size: clamp(38px, 5vw, 58px); line-height: 1.03; letter-spacing: -0.045em; }
        .final-inner p { max-width: 720px; margin: 0 auto 34px; color: rgba(255,255,255,0.8); font-size: 17px; line-height: 1.75; }
        .final-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
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
        .final-secondary { color: #ffffff; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.24); }
        .final-primary:hover, .final-secondary:hover { transform: translateY(-2px); }
        @media (max-width: 1080px) {
          .hero-layout, .how-layout, .testimonial-layout { grid-template-columns: 1fr; }
          .home-hero { min-height: auto; }
          .hero-visual { width: min(100%, 700px); margin-inline: auto; }
          .features-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 780px) {
          .section { padding: 84px 0; }
          .trust-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .experience-grid { grid-template-columns: 1fr; }
          .person-metrics { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .page-container { width: min(100% - 28px, 1200px); }
          .home-hero { padding: 68px 0 66px; }
          .hero-title { font-size: clamp(36px, 12vw, 48px); }
          .hero-copy { font-size: 16px; }
          .hero-actions, .final-actions { display: grid; }
          .primary-button, .secondary-button, .final-primary, .final-secondary { width: 100%; }
          .hero-visual { min-height: 520px; }
          .ops-board { width: calc(100% - 8px); }
          .floating-card { min-width: 160px; max-width: 200px; padding: 12px; }
          .floating-card-top { top: 20px; left: 0; }
          .floating-card-bottom { right: 0; bottom: 40px; }
          .trust-grid, .features-grid { grid-template-columns: 1fr; }
          .testimonial-card, .experience-card { padding: 28px 24px; border-radius: 24px; }
          .final-cta { padding: 86px 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; }
          .hero-visual::before, .floating-card { animation: none; }
        }
      `}</style>

            <div className="home-page">
                <main>
                    {/* Hero */}
                    <section className="home-hero">
                        <div className="page-container">
                            <div className="hero-layout">
                                <Reveal>
                                    <div>
                                        <div className="eyebrow">
                                            <span className="eyebrow-dot" />
                                            Trusted by modern cleaning teams
                                        </div>
                                        <h1 className="hero-title">
                                            The care operations platform for businesses that value <span>craftsmanship.</span>
                                        </h1>
                                        <p className="hero-copy">
                                            CleanSera helps service businesses manage bookings, dispatch, recurring care plans, and proof of work — all through a premium, branded experience that feels as polished as the work itself.
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
                                        <div className="hero-stats">
                                            {TRUST_STATS.map((metric) => (
                                                <div key={metric.label} className="hero-stat">
                                                    <span className="hero-stat-label">{metric.label}</span>
                                                    <span className="hero-stat-value">{metric.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Reveal>

                                <Reveal delay={120}>
                                    <div className="hero-visual">
                                        <div className="hero-image-wrap">
                                            <img
                                                className="hero-image"
                                                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=88"
                                                alt="Professional cleaning team working together in a commercial space"
                                            />
                                            <div className="hero-image-overlay" />
                                        </div>

                                        <div className="floating-card floating-card-top">
                                            <div className="floating-label">Today</div>
                                            <div className="floating-title">Live operations</div>
                                            <div className="floating-copy">Real-time visibility across every visit.</div>
                                        </div>

                                        <div className="floating-card floating-card-bottom">
                                            <div className="floating-label">Outcome</div>
                                            <div className="floating-title">More control, less chaos</div>
                                            <div className="floating-copy">One system for bookings, team, and proof.</div>
                                        </div>
                                    </div>
                                </Reveal>
                            </div>
                        </div>
                    </section>

                    {/* Trust strip */}
                    <section className="trust-strip">
                        <div className="page-container">
                            <div className="trust-grid">
                                <div className="trust-item"><HeartIcon /> Service-first mindset</div>
                                <div className="trust-item"><BuildingIcon /> Business ownership</div>
                                <div className="trust-item"><ReviewIcon /> Proof of work</div>
                                <div className="trust-item"><PhoneIcon /> Premium customer flow</div>
                            </div>
                        </div>
                    </section>

                    {/* Why teams choose */}
                    <section className="section section-green">
                        <div className="page-container">
                            <Reveal>
                                <div className="section-heading-left">
                                    <div className="section-kicker">Why teams choose CleanSera</div>
                                    <h2 className="section-title">Built for the realities of a growing cleaning business.</h2>
                                    <p className="section-copy">
                                        More than checklists and scheduling, CleanSera gives service teams a more intentional operating rhythm — one that makes every visit feel more organized, visible, and premium.
                                    </p>
                                </div>
                            </Reveal>

                            <div className="features-grid">
                                {FEATURE_CARDS.map((feature, index) => (
                                    <Reveal key={feature.title} delay={index * 80}>
                                        <article className="feature-card">
                                            <div className="feature-icon">{feature.icon}</div>
                                            <h3>{feature.title}</h3>
                                            <p>{feature.body}</p>
                                        </article>
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Testimonial */}
                    <section className="section">
                        <div className="page-container">
                            <Reveal>
                                <div className="testimonial-card">
                                    <div className="testimonial-layout">
                                        <div>
                                            <div className="section-kicker">What clients say</div>
                                            <blockquote className="testimonial-quote">
                                                “The experience feels premium from the first booking to the final checklist. We stopped chasing updates and started scaling with confidence.”
                                            </blockquote>
                                        </div>
                                        <div className="testimonial-person">
                                            <div className="person-row">
                                                <div className="person-avatar">AM</div>
                                                <div>
                                                    <div className="person-name">Amina Martins</div>
                                                    <div className="person-role">Founder, Bloom & Boards</div>
                                                </div>
                                            </div>
                                            <div className="person-metrics">
                                                <div className="person-metric">
                                                    <div className="person-metric-label">Bookings</div>
                                                    <div className="person-metric-value">+42%</div>
                                                </div>
                                                <div className="person-metric">
                                                    <div className="person-metric-label">Repeat</div>
                                                    <div className="person-metric-value">71%</div>
                                                </div>
                                                <div className="person-metric">
                                                    <div className="person-metric-label">Satisfaction</div>
                                                    <div className="person-metric-value">4.9/5</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </section>

                    {/* How it works */}
                    <section className="section section-soft">
                        <div className="page-container">
                            <div className="how-layout">
                                <Reveal>
                                    <div>
                                        <div className="section-kicker">How it works</div>
                                        <h2 className="section-title">A cleaner operating system for modern service teams.</h2>
                                        <div className="benefit-list">
                                            {BENEFITS.map((benefit) => (
                                                <div key={benefit} className="benefit-item">
                                                    <span className="benefit-check"><CheckIcon /></span>
                                                    <p>{benefit}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Reveal>

                                <Reveal delay={90}>
                                    <div className="process-list">
                                        {PROCESS.map((item) => (
                                            <div key={item.step} className="process-item">
                                                <div className="process-number">{item.step}</div>
                                                <div>
                                                    <h3>{item.title}</h3>
                                                    <p>{item.body}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Reveal>
                            </div>
                        </div>
                    </section>

                    {/* Experience / capabilities highlight */}
                    <section className="section">
                        <div className="page-container">
                            <Reveal>
                                <div className="experience-card">
                                    <div className="section-kicker" style={{ color: "rgba(255,255,255,0.7)" }}>
                                        Everything in one place
                                    </div>
                                    <h2 className="section-title" style={{ color: "#FFFFFF", maxWidth: 820 }}>
                                        The operating rhythm your service business has been missing.
                                    </h2>
                                    <p className="section-copy" style={{ color: "rgba(255,255,255,0.8)", maxWidth: 820 }}>
                                        From branded bookings to team dispatch and proof of work, CleanSera keeps every part of the service cycle visible and under your control.
                                    </p>
                                    <div className="experience-grid">
                                        {EXPERIENCE_POINTS.map((item) => (
                                            <div key={item} className="experience-item">
                                                <span className="experience-check"><CheckIcon /></span>
                                                {item}
                                            </div>
                                        ))}
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
                                    <h2>Turn your service business into a polished, repeatable booking machine.</h2>
                                    <p>
                                        Join CleanSera to create a better customer experience, stronger team coordination, and a service brand that feels premium from the first booking to the final job.
                                    </p>
                                    <div className="final-actions">
                                        <Link href="/for-businesses#demo" className="final-primary">
                                            Schedule a demo
                                            <ArrowIcon />
                                        </Link>
                                        <Link href="/pricing" className="final-secondary">
                                            Explore pricing
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