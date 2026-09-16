"use client";

import { Reveal } from "./Reveal";
import type { WidgetTestimonial } from "@/app/api/widget.api";

type SiteTestimonialsProps = {
  testimonials: WidgetTestimonial[] | null | undefined;
  primaryColor: string;
};

export function SiteTestimonials({ testimonials, primaryColor }: SiteTestimonialsProps) {
  const items = (testimonials || []).filter((t) => t?.quote?.trim());
  if (items.length === 0) return null;

  return (
    <section id="testimonials" className="scroll-mt-24 border-t border-[#E8E4DE] bg-[#F6F2ED] py-16 sm:py-20">
      <div className="site-container">
        <Reveal>
          <div className="max-w-2xl">
            <span className="site-eyebrow">
              <span
                className="site-eyebrow-dot"
                style={{ backgroundColor: primaryColor, boxShadow: `0 0 0 5px ${primaryColor}1f` }}
              />
              What customers say
            </span>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={`${t.name}-${i}`} delay={i * 80}>
              <figure className="h-full rounded-2xl border border-[#E8E4DE] bg-white p-6 shadow-sm">
                <blockquote className="text-sm leading-relaxed text-[#3A413E]">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-4 text-sm font-semibold text-[#171B1A]">{t.name}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
