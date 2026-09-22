"use client";

import Link from "next/link";
import {useState } from "react";
import Reveal from "@/components/marketing/Reveal"

const PLANS = [
  {
    name: "Starter",
    price: "$49",
    cadence: "/month",
    blurb: "For a single crew getting off spreadsheets and group chats.",
    features: [
      "Up to 5 active cleaners",
      "Branded booking subdomain",
      "One-time & recurring bookings",
      "Email + SMS notifications",
      "Basic reports",
    ],
  },
  {
    name: "Growth",
    price: "$99",
    cadence: "/month",
    blurb: "For a business juggling multiple crews and steady repeat customers.",
    features: [
      "Up to 20 active cleaners",
      "Everything in Starter",
      "Auto-suggested dispatch",
      "Priority email support",
    ],
    featured: true,
  },
  {
    name: "Pro",
    price: "$199",
    cadence: "/month",
    blurb: "For a growing operation that wants its own domain and full control.",
    features: [
      "Unlimited cleaners",
      "Everything in Growth",
      "Custom domain",
      "Advanced reports & exports",
      "Priority phone support",
    ],
  },
];

const FAQS = [
  {
    question: "Does CleanSera take a cut of my bookings?",
    answer:
        "No. Your plan is a flat monthly subscription based on your cleaner count and features — never a percentage of what your customers pay you.",
  },
  {
    question: "How do customers actually pay me?",
    answer:
        "Either way you like. Connect your own Stripe account and customers can pay online by card or iDEAL, or collect however you already do — cash, bank transfer, your own invoicing — and mark the booking paid. Online payments are processed by Stripe on your connected account, and CleanSera adds no fee on top.",
  },
  {
    question: "What happens if I go over my cleaner limit?",
    answer:
        "We'll let you know before it's a problem — you can upgrade anytime, and nothing gets shut off mid-month.",
  },
  {
    question: "Is there a contract?",
    answer:
        "No. Plans are month-to-month; cancel anytime from your dashboard and it takes effect at the end of your billing period.",
  },
];

const TRUST_POINTS = [
  "No marketplace commissions",
  "Month-to-month, cancel anytime",
  "Money stays with you",
  "Upgrade or downgrade freely",
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

function FAQItem({ question, answer, open, onToggle }) {
  return (
      <div className={`faq-item ${open ? "faq-open" : ""}`}>
        <button type="button" className="faq-question" onClick={onToggle} aria-expanded={open}>
          <span>{question}</span>
          <span className="faq-plus" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
        </button>
        <div className="faq-answer" style={{ maxHeight: open ? 280 : 0 }}>
          <p>{answer}</p>
        </div>
      </div>
  );
}

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState(0);

  // FAQPage structured data — reuses the same FAQS array the visible
  // accordion below renders, so the two can never drift out of sync.
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
      <>
        <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
        />
        <style>{`
        .pricing-page { overflow: hidden; background: #ffffff; }
        .page-container { width: min(100% - 32px, 1200px); margin-inline: auto; }
        .reveal {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal-visible { opacity: 1; transform: translateY(0); }

        .pricing-hero {
          position: relative;
          min-height: 420px;
          display: flex;
          align-items: center;
          padding: 90px 0 72px;
          background: radial-gradient(circle at 82% 12%, rgba(92,120,96,0.16), transparent 26%), linear-gradient(180deg, #ffffff 0%, #f7f4f0 100%);
        }
        .pricing-hero::before {
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
          max-width: 780px;
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
          font-size: clamp(40px, 5.4vw, 64px);
          line-height: 0.98;
          letter-spacing: -0.055em;
        }
        .hero-title span { color: #476d53; }
        .hero-copy {
          max-width: 620px;
          margin: 0;
          color: #5f6664;
          font-size: clamp(17px, 2vw, 19px);
          line-height: 1.72;
        }

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

        .plans-section { padding: 90px 0 40px; }
        .section-intro {
          max-width: 640px;
          margin: 0 auto 48px;
          text-align: center;
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
          margin: 0 0 14px;
          color: #171b1a;
          font-size: clamp(30px, 4vw, 44px);
          line-height: 1.08;
          letter-spacing: -0.04em;
        }
        .section-copy {
          color: #5f6664;
          font-size: 16px;
          line-height: 1.7;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
          align-items: stretch;
        }
        .plan-card {
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 32px 28px 28px;
          border-radius: 28px;
          background: #ffffff;
          border: 1px solid #e6ece7;
          box-shadow: 0 14px 48px rgba(16,24,20,0.05);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .plan-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 22px 56px rgba(16,24,20,0.09);
          border-color: rgba(71,109,83,0.18);
        }
        .plan-card-featured {
          background: linear-gradient(160deg, #476d53 0%, #2f4f3d 100%);
          border-color: transparent;
          color: #ffffff;
          box-shadow: 0 24px 70px rgba(47,79,61,0.28);
        }
        .plan-card-featured:hover {
          box-shadow: 0 28px 80px rgba(47,79,61,0.34);
          border-color: transparent;
        }
        .plan-badge {
          position: absolute;
          top: 18px;
          right: 18px;
          padding: 5px 11px;
          border-radius: 999px;
          background: rgba(255,255,255,0.16);
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .plan-name {
          margin: 0 0 8px;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .plan-card:not(.plan-card-featured) .plan-name { color: #171b1a; }
        .plan-blurb {
          margin: 0;
          font-size: 14px;
          line-height: 1.65;
        }
        .plan-card:not(.plan-card-featured) .plan-blurb { color: #5f6664; }
        .plan-card-featured .plan-blurb { color: rgba(255,255,255,0.78); }
        .plan-price-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin: 22px 0 8px;
        }
        .plan-price {
          font-size: 42px;
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .plan-card:not(.plan-card-featured) .plan-price { color: #171b1a; }
        .plan-cadence {
          font-size: 15px;
          font-weight: 600;
        }
        .plan-card:not(.plan-card-featured) .plan-cadence { color: #8a928f; }
        .plan-card-featured .plan-cadence { color: rgba(255,255,255,0.65); }
        .plan-features {
          display: grid;
          gap: 12px;
          margin: 22px 0 28px;
          flex: 1;
          list-style: none;
          padding: 0;
        }
        .plan-feature {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14px;
          line-height: 1.5;
          font-weight: 600;
        }
        .plan-card:not(.plan-card-featured) .plan-feature { color: #47514f; }
        .plan-card-featured .plan-feature { color: rgba(255,255,255,0.92); }
        .plan-check {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }
        .plan-card:not(.plan-card-featured) .plan-check {
          color: #476d53;
          background: #edf5ef;
        }
        .plan-card-featured .plan-check {
          color: #ffffff;
          background: rgba(255,255,255,0.16);
        }
        .plan-cta {
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
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .plan-cta:hover { transform: translateY(-2px); }
        .plan-card:not(.plan-card-featured) .plan-cta {
          color: #ffffff;
          background: #476d53;
        }
        .plan-card:not(.plan-card-featured) .plan-cta:hover { background: #3b5c47; }
        .plan-card-featured .plan-cta {
          color: #2f4f3d;
          background: #ffffff;
        }
        .plan-card-featured .plan-cta:hover { background: #f4f7f5; }

        .guarantee {
          margin-top: 48px;
          padding: 28px 32px;
          border-radius: 22px;
          background: #f7f8f6;
          border: 1px solid #e6ece7;
          text-align: center;
        }
        .guarantee p {
          margin: 0;
          color: #5f6664;
          font-size: 15px;
          line-height: 1.7;
        }
        .guarantee strong { color: #171b1a; }

        .faq-section {
          padding: 90px 0;
          background: #f7f8f6;
        }
        .faq-grid {
          max-width: 820px;
          margin: 0 auto;
          display: grid;
          gap: 12px;
        }
        .faq-item {
          overflow: hidden;
          border-radius: 18px;
          background: #ffffff;
          border: 1px solid #e6ece7;
          box-shadow: 0 8px 28px rgba(16,24,20,0.04);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .faq-open {
          border-color: rgba(71,109,83,0.22);
          box-shadow: 0 14px 38px rgba(71,109,83,0.08);
        }
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
        .final-inner {
          position: relative;
          z-index: 1;
          max-width: 880px;
          margin: 0 auto;
          text-align: center;
        }
        .final-inner h2 {
          margin: 0 0 18px;
          font-size: clamp(36px, 5vw, 54px);
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
          .plans-grid { grid-template-columns: 1fr; max-width: 440px; margin-inline: auto; }
          .plan-card-featured { order: -1; }
        }
        @media (max-width: 780px) {
          .trust-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .page-container { width: min(100% - 28px, 1200px); }
          .pricing-hero { padding: 68px 0 56px; min-height: auto; }
          .hero-title { font-size: clamp(34px, 11vw, 46px); }
          .hero-copy { font-size: 16px; }
          .trust-grid { grid-template-columns: 1fr; }
          .plans-section { padding: 72px 0 24px; }
          .plan-card { padding: 26px 22px 24px; }
          .guarantee { padding: 22px 20px; }
          .faq-section { padding: 72px 0; }
          .faq-question { min-height: 68px; padding: 0 18px; }
          .faq-answer p { padding: 0 18px 20px; }
          .final-cta { padding: 86px 0; }
          .final-actions { display: grid; }
          .final-primary, .final-secondary { width: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .reveal { opacity: 1; transform: none; transition: none; }
        }
      `}</style>

        <div className="pricing-page">
          <main>
            {/* Hero */}
            <section className="pricing-hero">
              <div className="page-container">
                <Reveal>
                  <div className="hero-inner">
                    <div className="eyebrow">
                      <span className="eyebrow-dot" />
                      Pricing
                    </div>
                    <h1 className="hero-title">
                      One flat price. <span>No cut of your bookings.</span>
                    </h1>
                    <p className="hero-copy">
                      CleanSera is a subscription, not a marketplace — we add no fee to what your customers pay you, every time.
                    </p>
                  </div>
                </Reveal>
              </div>
            </section>

            {/* Trust points */}
            <section className="trust-strip">
              <div className="page-container">
                <div className="trust-grid">
                  {TRUST_POINTS.map((item) => (
                      <div key={item} className="trust-item">
                        <CheckIcon />
                        {item}
                      </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Plans */}
            <section className="plans-section">
              <div className="page-container">
                <Reveal>
                  <div className="section-intro">
                    <div className="section-kicker">Choose your plan</div>
                    <h2 className="section-title">Simple tiers that grow with your team</h2>
                    <p className="section-copy">
                      Start lean, scale when you need more cleaners or deeper control. No hidden fees.
                    </p>
                  </div>
                </Reveal>

                <div className="plans-grid">
                  {PLANS.map((plan, index) => (
                      <Reveal key={plan.name} delay={index * 80}>
                        <article className={`plan-card ${plan.featured ? "plan-card-featured" : ""}`}>
                          {plan.featured && <div className="plan-badge">Most popular</div>}
                          <h3 className="plan-name">{plan.name}</h3>
                          <p className="plan-blurb">{plan.blurb}</p>
                          <div className="plan-price-row">
                            <span className="plan-price">{plan.price}</span>
                            <span className="plan-cadence">{plan.cadence}</span>
                          </div>
                          <ul className="plan-features">
                            {plan.features.map((feature) => (
                                <li key={feature} className="plan-feature">
                            <span className="plan-check">
                              <CheckIcon />
                            </span>
                                  {feature}
                                </li>
                            ))}
                          </ul>
                          <Link href="/for-businesses#demo" className="plan-cta">
                            Book a demo
                            <ArrowIcon />
                          </Link>
                        </article>
                      </Reveal>
                  ))}
                </div>

                <Reveal delay={120}>
                  <div className="guarantee">
                    <p>
                      <strong>No commissions. No lock-in.</strong> Every plan is a flat monthly subscription.
                      Cancel anytime — it takes effect at the end of your billing period.
                    </p>
                  </div>
                </Reveal>
              </div>
            </section>

            {/* FAQs */}
            <section className="faq-section">
              <div className="page-container">
                <Reveal>
                  <div className="section-intro">
                    <div className="section-kicker">Questions</div>
                    <h2 className="section-title">Clear answers about pricing and ownership</h2>
                    <p className="section-copy">
                      The things owners usually want to know before they book a demo.
                    </p>
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

            {/* Final CTA */}
            <section className="final-cta">
              <div className="page-container">
                <Reveal>
                  <div className="final-inner">
                    <h2>Ready to run a cleaner operation?</h2>
                    <p>
                      Book a short demo and see how CleanSera fits your team size, booking flow, and growth plans.
                    </p>
                    <div className="final-actions">
                      <Link href="/for-businesses#demo" className="final-primary">
                        Book a demo
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