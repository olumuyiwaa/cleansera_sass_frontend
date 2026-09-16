"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";
import type { WidgetFaqItem } from "@/app/api/widget.api";

type SiteFaqProps = {
  items: WidgetFaqItem[] | null | undefined;
  primaryColor: string;
};

export function SiteFaq({ items, primaryColor }: SiteFaqProps) {
  const faqs = (items || []).filter((f) => f?.question?.trim() && f?.answer?.trim());
  const [open, setOpen] = useState(0);

  if (faqs.length === 0) return null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <section id="faq" className="scroll-mt-24 border-t border-[#E8E4DE] bg-[#F6F2ED] py-16 sm:py-20">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- static JSON we build ourselves, not user HTML
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="site-container">
        <Reveal>
          <div className="max-w-2xl">
            <span className="site-eyebrow">
              <span
                className="site-eyebrow-dot"
                style={{ backgroundColor: primaryColor, boxShadow: `0 0 0 5px ${primaryColor}1f` }}
              />
              Questions
            </span>
          </div>
        </Reveal>
        <div className="mt-10 max-w-3xl divide-y divide-[#E8E4DE] rounded-2xl border border-[#E8E4DE] bg-white">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-[#171B1A] sm:text-base">{faq.question}</span>
                  <span
                    className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-sm font-bold"
                    style={{ backgroundColor: `${primaryColor}1f`, color: primaryColor }}
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <p className="px-6 pb-5 text-sm leading-relaxed text-[#5F6664]">{faq.answer}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
