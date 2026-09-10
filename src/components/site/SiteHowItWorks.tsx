"use client";

import { Reveal } from "./Reveal";

const STEPS = [
  {
    step: "01",
    title: "Choose a service",
    body: "Pick the clean that fits — standard, deep, move-out, or add-ons for extras like the fridge or oven.",
  },
  {
    step: "02",
    title: "Pick a time",
    body: "See real availability and lock in a slot that works around your day.",
  },
  {
    step: "03",
    title: "We confirm & arrive",
    body: "You get a clear confirmation. Our team shows up prepared and on time.",
  },
  {
    step: "04",
    title: "Enjoy a spotless space",
    body: "We follow a checklist so nothing is missed — and you can book again anytime.",
  },
];

type SiteHowItWorksProps = {
  primaryColor: string;
};

export function SiteHowItWorks({ primaryColor }: SiteHowItWorksProps) {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-t border-[#E8E4DE] bg-[#F6F2ED] py-16 sm:py-20"
    >
      <div className="site-container">
        <Reveal>
          <div className="max-w-2xl">
            <span className="site-eyebrow">
              <span
                className="site-eyebrow-dot"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: `0 0 0 5px ${primaryColor}1f`,
                }}
              />
              Simple process
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#171B1A] sm:text-4xl">
              How booking works
            </h2>
            <p className="mt-3 text-base text-[#5F6664] sm:text-lg">
              From first click to a finished clean — no phone tag required.
            </p>
          </div>
        </Reveal>

        <ol className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* dashed route line on large screens */}
          <div
            className="pointer-events-none absolute left-[12%] right-[12%] top-[28px] hidden h-px lg:block"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, ${primaryColor}55 0 8px, transparent 8px 16px)`,
            }}
            aria-hidden
          />

          {STEPS.map((item, i) => (
            <Reveal key={item.step} delay={i * 80}>
              <li className="relative">
                <span
                  className="relative z-[1] inline-flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-extrabold tracking-wide text-white shadow-md"
                  style={{ backgroundColor: primaryColor }}
                >
                  {item.step}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-[#171B1A]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5F6664]">
                  {item.body}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
