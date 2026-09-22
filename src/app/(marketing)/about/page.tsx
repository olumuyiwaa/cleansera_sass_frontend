"use client";

import Link from "next/link";
import Reveal from "@/components/marketing/Reveal"

const VALUES = [
  {
    title: "Ownership",
    body: "We believe a service business owns its customer relationships, staff roster, and reputation — not an app marketplace.",
    icon: "O",
  },
  {
    title: "Clarity",
    body: "Operations should feel simple for the owner, the cleaner, and the customer. Friction has no place in a dependable service workflow.",
    icon: "C",
  },
  {
    title: "Trust",
    body: "Every booking, every checklist, every proof-of-work moment should make a business easier to run and easier to trust.",
    icon: "T",
  },
];

const STORY_STEPS = [
  {
    number: "01",
    title: "Built by operators, not just developers",
    body: "The team behind CleanSera has spent years in the operational realities of service businesses and understands how chaos grows when systems are fragmented.",
  },
  {
    number: "02",
    title: "The problem was obvious",
    body: "Owners were juggling bookings, team communication, scheduling, and customer follow-ups across disconnected tools that never felt like they were made for the work itself.",
  },
  {
    number: "03",
    title: "A better operating rhythm was needed",
    body: "Customers wanted a premium experience, cleaners needed clarity, and business owners needed visibility without needing a spreadsheet and five tabs open.",
  },
  {
    number: "04",
    title: "CleanSera became the answer",
    body: "We built a platform that makes operations feel calmer, clearer, and more trustworthy — from the first quote to the final completed visit.",
  },
];

const EXPERIENCE_POINTS = [
  "Operations management for service businesses",
  "Team scheduling and route visibility",
  "Customer booking and pre-visit coordination",
  "Recurring service planning and renewal cycles",
  "Proof of work and service accountability",
  "The pressure of scaling without sacrificing quality",
];

const FACILITY_TYPES = [
  "Home service companies",
  "Multi-location cleaning operations",
  "Recurring maintenance businesses",
  "Boutique hospitality teams",
  "Commercial cleaning operations",
  "Premium service brands",
];

const TEAM_TYPES = [
  "Cleaning specialists",
  "Team leads and supervisors",
  "Field staff and technicians",
  "Recurring service professionals",
  "On-call and backup coverage teams",
  "Customer-first service operators",
];

const FAQS = [
  {
    question: "Who is CleanSera built for?",
    answer: "CleanSera is built for service businesses that want more control over their booking flow, operations, customer experience, and team coordination without relying on a generic marketplace model.",
  },
  {
    question: "Why did CleanSera start?",
    answer: "The founding idea was simple: businesses should own their customer relationships, their team operations, and their process — not surrender them to a platform built for someone else’s agenda.",
  },
  {
    question: "Does CleanSera support recurring services?",
    answer: "Yes. The platform is designed to support recurring jobs, team schedules, service reminders, and predictable revenue cycles for growing service businesses.",
  },
  {
    question: "Can customers book directly through a branded experience?",
    answer: "Yes. CleanSera helps businesses create a polished customer experience that feels premium and professional from first click through confirmation.",
  },
  {
    question: "Is this just another marketplace?",
    answer: "No. CleanSera is designed to give the service business ownership over its operations, customer journey, and staff relationships rather than turning the business into a listing inside someone else’s ecosystem.",
  },
  {
    question: "Does CleanSera help with accountability?",
    answer: "Yes. Features like proof-of-work visibility, structured checklists, and coordination tools help owners keep quality and consistency visible across each visit.",
  },
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

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3 5 6v5.5c0 4.72 3.05 8.51 7 10.5 3.95-1.99 7-5.78 7-10.5V6l-7-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m8.8 12 2.3 2.3 4.1-4.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.8 18.5c.6-3.2 2.9-5 5.5-5s4.9 1.8 5.5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M14.8 15.8c2.2.7 4.2 2.5 4.8 5.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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

function FAQItem({ question, answer, open, onToggle }) {
  return (
    <div className={`faq-item ${open ? "faq-open" : ""}`}>
      <button type="button" className="faq-question" onClick={onToggle} aria-expanded={open}>
        <span>{question}</span>
        <span className="faq-plus" aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <div className="faq-answer" style={{ maxHeight: open ? 320 : 0 }}>
        <p>{answer}</p>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      <style>{`
        .about-page { overflow: hidden; background: #ffffff; }
        .page-container { width: min(100% - 32px, 1200px); margin-inline: auto; }
        .reveal {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal-visible { opacity: 1; transform: translateY(0); }
        .about-hero {
          position: relative;
          min-height: 760px;
          display: flex;
          align-items: center;
          padding: 90px 0 84px;
          background: radial-gradient(circle at 82% 12%, rgba(92,120,96,0.16), transparent 26%), linear-gradient(180deg, #ffffff 0%, #f7f4f0 100%);
        }
        .about-hero::before {
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
          font-size: clamp(46px, 6vw, 76px);
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
        .hero-points {
          display: flex;
          flex-wrap: wrap;
          gap: 16px 22px;
          margin-top: 30px;
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
          width: 24px;
          height: 24px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          color: #476d53;
          background: #edf5ef;
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
        .hero-image-wrap {
          position: relative;
          width: min(100%, 500px);
          height: 580px;
          overflow: hidden;
          border: 10px solid #ffffff;
          border-radius: 34px;
          background: #edf5ef;
          box-shadow: 0 38px 90px rgba(35,52,45,0.18), 0 0 0 1px rgba(71,109,83,0.08);
        }
        .hero-image { width: 100%; height: 100%; object-fit: cover; display: block; }
        .hero-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 56%, rgba(15,23,20,0.48) 100%), linear-gradient(135deg, rgba(71,109,83,0.08), transparent 42%);
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
        .floating-card-top { top: 48px; left: -32px; }
        .floating-card-bottom { right: -48px; bottom: 70px; animation-delay: -2.5s; }
        .floating-label { margin-bottom: 6px; color: #769181; font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
        .floating-title { color: #171b1a; font-size: 15px; font-weight: 800; }
        .floating-copy { margin-top: 4px; color: #5f6664; font-size: 12px; line-height: 1.5; }
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
        .section-kicker { margin-bottom: 14px; color: #476d53; font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
        .section-title {
          margin: 0 0 18px;
          color: #171b1a;
          font-size: clamp(34px, 4.5vw, 56px);
          line-height: 1.06;
          letter-spacing: -0.045em;
        }.section-title-2 {
          margin: 0 0 18px;
          color: #171b1a;
          font-size: clamp(28px, 4.0vw, 50px);
          line-height: 1.00;
          letter-spacing: -0.045em;
        }
        .section-copy { color: #5f6664; font-size: 17px; line-height: 1.75; }
        .story-layout { display: grid; grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr); gap: 72px; align-items: center; }
        .story-image-wrap { position: relative; min-height: 590px; }
        .story-image {
          position: absolute;
          inset: 0 64px 0 0;
          width: calc(100% - 64px);
          height: 100%;
          object-fit: cover;
          border-radius: 30px;
          box-shadow: 0 28px 70px rgba(16,24,20,0.16);
        }
        .story-card {
          position: absolute;
          right: 0;
          bottom: 34px;
          width: min(340px, 84%);
          padding: 24px;
          border-radius: 22px;
          background: #476d53;
          color: #ffffff;
          box-shadow: 0 22px 54px rgba(71,109,83,0.3);
        }
        .story-card h3 { margin: 0 0 8px; font-size: 18px; }
        .story-card p { margin: 0; color: rgba(255,255,255,0.78); font-size: 13px; line-height: 1.65; }
        .story-steps { display: grid; gap: 18px; margin-top: 30px; }
        .story-step { display: grid; grid-template-columns: 54px 1fr; gap: 16px; align-items: start; }
        .story-number {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          background: #edf5ef;
          color: #476d53;
          font-size: 12px;
          font-weight: 900;
        }
        .story-step h3 { margin: 1px 0 8px; color: #171b1a; font-size: 17px; }
        .story-step p { margin: 0; color: #5f6664; font-size: 14px; line-height: 1.60; }
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
        .values-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
        .value-card {
          min-height: 260px;
          padding: 28px;
          border-radius: 22px;
          background: #ffffff;
          border: 1px solid #e6ece7;
          box-shadow: 0 12px 40px rgba(16,24,20,0.05);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .value-card:hover { transform: translateY(-6px); border-color: rgba(71,109,83,0.22); box-shadow: 0 22px 56px rgba(16,24,20,0.09); }
        .value-icon {
          width: 56px;
          height: 56px;
          margin-bottom: 24px;
          display: grid;
          place-items: center;
          border-radius: 17px;
          color: #476d53;
          background: #edf5ef;
          font-weight: 900;
        }
        .value-card h3 { margin: 0 0 12px; color: #171b1a; font-size: 18px; }
        .value-card p { margin: 0; color: #5f6664; font-size: 14px; line-height: 1.72; }
        .two-sided-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
        .side-card {
          padding: 38px;
          border-radius: 28px;
          border: 1px solid #e6ece7;
          box-shadow: 0 18px 60px rgba(16,24,20,0.06);
        }
        .side-card-light { background: #ffffff; }
        .side-card-dark { color: #ffffff; background: linear-gradient(145deg, #476d53 0%, #2f4f3d 100%); border-color: transparent; }
        .side-icon {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          margin-bottom: 24px;
          border-radius: 17px;
        }
        .side-card-light .side-icon { color: #476d53; background: #edf5ef; }
        .side-card-dark .side-icon { color: #ffffff; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.14); }
        .side-card h3 { margin: 0 0 14px; font-size: 30px; line-height: 1.12; letter-spacing: -0.03em; }
        .side-card-light h3 { color: #171b1a; }
        .side-card p { margin: 0 0 24px; font-size: 15px; line-height: 1.75; }
        .side-card-light p { color: #5f6664; }
        .side-card-dark p { color: rgba(255,255,255,0.78); }
        .side-list { display: grid; gap: 12px; list-style: none; margin: 0; padding: 0; }
        .side-list-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13.5px;
          line-height: 1.55;
          font-weight: 700;
        }
        .side-card-light .side-list-item { color: #47514f; }
        .side-card-dark .side-list-item { color: rgba(255,255,255,0.92); }
        .side-check {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }
        .side-card-light .side-check { color: #476d53; background: #edf5ef; }
        .side-card-dark .side-check { color: #ffffff; background: rgba(255,255,255,0.12); }
        .mission-section {
          position: relative;
          padding: 120px 0;
          overflow: hidden;
          color: #ffffff;
          background: radial-gradient(circle at 15% 18%, rgba(255,255,255,0.18), transparent 26%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.1), transparent 26%), linear-gradient(135deg, #476d53 0%, #325141 100%);
        }
        .mission-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 54px 54px;
        }
        .mission-inner { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; text-align: center; }
        .mission-inner h2 { margin: 0 0 20px; font-size: clamp(40px, 5.4vw, 64px); line-height: 1.03; letter-spacing: -0.045em; }
        .mission-inner p { max-width: 760px; margin: 0 auto; color: rgba(255,255,255,0.8); font-size: 18px; line-height: 1.8; }
        .promise-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 64px; align-items: center; }
        .promise-image-wrap { position: relative; min-height: 560px; }
        .promise-image { width: 100%; height: 100%; object-fit: cover; border-radius: 30px; box-shadow: 0 28px 70px rgba(16,24,20,0.15); }
        .promise-list { display: grid; gap: 14px; margin-top: 28px; }
        .promise-item { display: flex; align-items: flex-start; gap: 11px; color: #47514f; font-size: 14px; line-height: 1.64; font-weight: 700; }
        .promise-check {
          width: 23px;
          height: 23px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          color: #476d53;
          background: #edf5ef;
        }
        .faq-grid { max-width: 920px; margin: 0 auto; display: grid; gap: 12px; }
        .faq-item {
          overflow: hidden;
          border-radius: 18px;
          background: #ffffff;
          border: 1px solid #e6ece7;
          box-shadow: 0 8px 28px rgba(16,24,20,0.04);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .faq-open { border-color: rgba(71,109,83,0.22); box-shadow: 0 14px 38px rgba(71,109,83,0.08); }
        .faq-question {
          width: 100%;
          min-height: 72px;
          padding: 0 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          background: transparent;
          border: 0;
          color: #171b1a;
          text-align: left;
          font: inherit;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
        }
        .faq-plus {
          width: 30px;
          height: 30px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: #edf5ef;
          color: #476d53;
          font-size: 19px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .faq-answer { overflow: hidden; transition: max-height 0.32s ease; }
        .faq-answer p {
          margin: 0;
          padding: 0 22px 22px;
          color: #5f6664;
          font-size: 14px;
          line-height: 1.75;
        }
        .final-cta {
          position: relative;
          padding: 110px 0;
          overflow: hidden;
          color: #ffffff;
          background: radial-gradient(circle at 15% 20%, rgba(255,255,255,0.18), transparent 26%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.12), transparent 26%), linear-gradient(135deg, #476d53 0%, #2f4f3d 100%);
        }
        .final-inner { position: relative; z-index: 1; max-width: 900px; margin: 0 auto; text-align: center; }
        .final-inner h2 { margin: 0 0 18px; font-size: clamp(38px, 5vw, 62px); line-height: 1.03; letter-spacing: -0.045em; }
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
          .hero-layout, .story-layout, .promise-layout { grid-template-columns: 1fr; }
          .about-hero { min-height: auto; }
          .hero-visual { width: min(100%, 700px); margin-inline: auto; }
          .values-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 780px) {
          .section { padding: 84px 0; }
          .trust-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .experience-grid, .two-sided-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .page-container { width: min(100% - 28px, 1200px); }
          .about-hero { padding: 68px 0 66px; }
          .hero-title { font-size: clamp(42px, 14vw, 58px); }
          .hero-copy { font-size: 16px; }
          .hero-actions, .final-actions { display: grid; }
          .primary-button, .secondary-button, .final-primary, .final-secondary { width: 100%; }
          .hero-points { display: grid; gap: 12px; }
          .hero-visual { min-height: 520px; }
          .hero-image-wrap { width: calc(100% - 16px); height: 480px; border-width: 7px; }
          .floating-card { min-width: 180px; max-width: 225px; padding: 13px; }
          .floating-card-top { top: 24px; left: 0; }
          .floating-card-bottom { right: 0; bottom: 30px; }
          .trust-grid, .values-grid { grid-template-columns: 1fr; }
          .story-image-wrap, .promise-image-wrap { min-height: 480px; }
          .story-image { inset: 0 28px 0 0; width: calc(100% - 28px); }
          .story-card { width: 87%; right: 0; bottom: 20px; }
          .experience-card, .side-card { padding: 28px 24px; border-radius: 24px; }
          .faq-question { min-height: 68px; padding: 0 18px; }
          .faq-answer p { padding: 0 18px 20px; }
          .mission-section, .final-cta { padding: 86px 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; }
          .hero-visual::before, .floating-card { animation: none; }
        }
      `}</style>

      <div className="about-page">
        <main>
          <section className="about-hero">
            <div className="page-container">
              <div className="hero-layout">
                <Reveal>
                  <div>
                    <div className="eyebrow">
                      <span className="eyebrow-dot" />
                      About CleanSera
                    </div>
                    <h1 className="hero-title">
                      We build for the business, <span>not around it.</span>
                    </h1>
                    <p className="hero-copy">
                      CleanSera started from a simple idea: the best service businesses deserve software that feels premium, clear, and built for their real operating needs — not a generic marketplace that takes ownership away from them.
                    </p>
                    <div className="hero-actions">
                      <Link href="/how-it-works" className="primary-button">
                        See how it works
                        <ArrowIcon />
                      </Link>
                      <Link href="/for-businesses#demo" className="secondary-button">
                        Book a demo
                        <ArrowIcon />
                      </Link>
                    </div>
                    <div className="hero-points">
                      {[
                        "Built for real service teams",
                        "Premium customer experience",
                        "Designed to keep ownership with the business",
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
                    <div className="hero-image-wrap">
                      <img
                        className="hero-image"
                        src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=88"
                        alt="Professional cleaning team preparing to service a property"
                      />
                      <div className="hero-image-overlay" />
                    </div>

                    <div className="floating-card floating-card-top">
                      <div className="floating-label">Our approach</div>
                      <div className="floating-title">Business-first operations</div>
                      <div className="floating-copy">Clear systems, stronger relationships, and better service experiences.</div>
                    </div>

                    <div className="floating-card floating-card-bottom">
                      <div className="floating-label">The principle</div>
                      <div className="floating-title">A platform that supports your brand</div>
                      <div className="floating-copy">Not a marketplace that takes center stage from the business itself.</div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

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

          <section className="section section-green">
            <div className="page-container">
              <div className="story-layout">
                <Reveal>
                  <div className="story-image-wrap">
                    <img
                      className="story-image"
                      src="https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=88"
                      alt="Service business leaders reviewing operations and customer experience"
                    />
                    <div className="story-card">
                      <h3>We built the system we wished service businesses had.</h3>
                      <p>A calmer way to run scheduling, service quality, and customer communication without lost context.</p>
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={110}>
                  <div>
                    <div className="section-kicker">Our story</div>
                    <h3 className="section-title-2">The problem was not that businesses needed more software — they needed a better operating model.</h3>
                    <p className="section-copy">
                      Most business tools were designed around someone else’s platform logic, not the actual demands of running a service operation. That meant owners were forced to choose between generic software and losing ownership over their own process.
                    </p>

                    <div className="story-steps">
                      {STORY_STEPS.map((step) => (
                        <div key={step.number} className="story-step">
                          <div className="story-number">{step.number}</div>
                          <div>
                            <h3>{step.title}</h3>
                            <p>{step.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="page-container">
              <Reveal>
                <div className="experience-card">
                  <div className="section-kicker" style={{ color: "rgba(255,255,255,0.7)" }}>Experience behind the platform</div>
                  <h2 className="section-title" style={{ color: "#FFFFFF", maxWidth: 820 }}>
                    We understand the rhythm of service work, team coordination, and customer expectations.
                  </h2>
                  <p className="section-copy" style={{ color: "rgba(255,255,255,0.8)", maxWidth: 820 }}>
                    CleanSera was designed by people who know the pressure of building a premium service brand while still keeping operations visible, dependable, and easy to scale.
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

          <section className="mission-section">
            <div className="page-container">
              <Reveal>
                <div className="mission-inner">
                  <div className="section-kicker" style={{ color: "rgba(255,255,255,0.72)" }}>Our mission</div>
                  <h2>Make premium service operations simpler, clearer, and more scalable.</h2>
                  <p>
                    We exist to help service businesses own the entire customer journey while giving team members the clarity and structure they need to deliver polished work with consistency.
                  </p>
                </div>
              </Reveal>
            </div>
          </section>

          <section className="section section-soft">
            <div className="page-container">
              <Reveal>
                <div className="section-heading">
                  <div className="section-kicker">Who we serve</div>
                  <h2 className="section-title">Designed for the businesses and teams behind the service experience.</h2>
                  <p className="section-copy">Our platform supports both sides of the service relationship — the business that owns the brand and the people who deliver the work.</p>
                </div>
              </Reveal>

              <div className="two-sided-grid">
                <Reveal>
                  <article className="side-card side-card-light">
                    <div className="side-icon"><PeopleIcon /></div>
                    <h3>Business owners</h3>
                    <p>Service businesses need a system that supports their brand, improves customer clarity, and keeps operations visible without becoming another rigid platform.</p>
                    <ul className="side-list">
                      {TEAM_TYPES.map((item) => (
                        <li key={item} className="side-list-item">
                          <span className="side-check"><CheckIcon /></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>

                <Reveal delay={100}>
                  <article className="side-card side-card-dark">
                    <div className="side-icon"><BuildingIcon /></div>
                    <h3>Service teams</h3>
                    <p>Teams need smooth scheduling, clear communication, and enough structure to work confidently while customers still receive a premium experience.</p>
                    <ul className="side-list">
                      {FACILITY_TYPES.map((item) => (
                        <li key={item} className="side-list-item">
                          <span className="side-check"><CheckIcon /></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              </div>
            </div>
          </section>

          <section className="section section-green">
            <div className="page-container">
              <Reveal>
                <div className="section-heading">
                  <div className="section-kicker">What we stand for</div>
                  <h2 className="section-title">Principles that guide every decision we make.</h2>
                  <p className="section-copy">CleanSera is built around ownership, clarity, trust, and better experiences from first interaction through final delivery.</p>
                </div>
              </Reveal>

              <div className="values-grid">
                {VALUES.map((value, index) => (
                  <Reveal key={value.title} delay={index * 75}>
                    <article className="value-card">
                      <div className="value-icon">{value.icon}</div>
                      <h3>{value.title}</h3>
                      <p>{value.body}</p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section className="section">
            <div className="page-container">
              <div className="promise-layout">
                <Reveal>
                  <div className="story-image-wrap">
                    <img
                        className="story-image"
                      src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=88"
                      alt="Customer-focused cleaning service in action"
                    />
                  </div>
                </Reveal>

                <Reveal delay={110}>
                  <div>
                    <div className="section-kicker">Our promise</div>
                    <h2 className="section-title">Ownership over your process. Clarity for every touchpoint.</h2>
                    <p className="section-copy">
                      We do not believe a service business should be forced into a generic marketplace framework. Instead, we believe the business should keep control of its brand, customers, procedures, and team standards while using a system designed to support that identity.
                    </p>

                    <div className="promise-list">
                      {[
                        "The customer journey remains branded and intentional",
                        "The business retains ownership over relationships and operations",
                        "The team gets better coordination, visibility, and workflow consistency",
                        "The customer experience feels premium from first click to final confirmation",
                        "The operational model stays flexible as the business grows",
                      ].map((item) => (
                        <div key={item} className="promise-item">
                          <span className="promise-check"><CheckIcon /></span>
                          {item}
                        </div>
                      ))}
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
                  <div className="section-kicker">Frequently asked questions</div>
                  <h2 className="section-title">Learn more about the people, principle, and purpose behind CleanSera.</h2>
                  <p className="section-copy">A closer look at why CleanSera exists and how it serves the kinds of businesses that want more structure without sacrificing brand control.</p>
                </div>
              </Reveal>

              <Reveal delay={80}>
                <div className="faq-grid">
                  {FAQS.map((item, index) => (
                    <FAQItem
                      key={item.question}
                      question={item.question}
                      answer={item.answer}
                      open={openFaq === index}
                      onToggle={() => setOpenFaq(openFaq === index ? -1 : index)}
                    />
                  ))}
                </div>
              </Reveal>
            </div>
          </section>

          <section className="final-cta">
            <div className="page-container">
              <Reveal>
                <div className="final-inner">
                  <h2>Build a more premium service business.</h2>
                  <p>
                    Join CleanSera to create a better customer experience, stronger team coordination, and a service brand that feels polished from the first booking to the final job.
                  </p>
                  <div className="final-actions">
                    <Link href="/for-businesses#demo" className="final-primary">
                      Book a demo
                      <ArrowIcon />
                    </Link>
                    <Link href="/support" className="final-secondary">
                      Visit support
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
