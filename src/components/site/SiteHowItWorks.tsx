"use client";

import { Reveal } from "./Reveal";
import BeforeAfterSlider from "./BeforeAfterSlider";

const STEPS = [
  {
    step: "01",
    title: "Instant online quote",
    body: "Choose your service and share a few details about your space to see the available options.",
  },
  {
    step: "02",
    title: "Professional cleaning specialists",
    body: "Your local team arrives prepared with the tools and products needed for the service.",
  },
  {
    step: "03",
    title: "Quality-checked service",
    body: "Your booking is completed with care, and you can arrange another visit whenever you need one.",
  },
];

type SiteHowItWorksProps = {
  primaryColor: string;
};

export function SiteHowItWorks({ primaryColor }: SiteHowItWorksProps) {
  return (
    <section
      id="how-it-works"
      className="site-section-cream scroll-mt-24 border-t border-[#e7e3d9] py-20 sm:py-24"
    >
      <div className="site-container grid items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:gap-20">
        <Reveal>
          <div className="site-process-image">
            <BeforeAfterSlider
              beforeSrc="/images/before-room.jpg"
              afterSrc="/images/after-room.jpg"
              beforeAlt="Living room before cleaning"
              afterAlt="Living room after cleaning"
            />
          </div>
        </Reveal>

        <div>
          <Reveal>
            <div className="max-w-xl">
              <span className="site-eyebrow">
                <span className="site-eyebrow-dot" style={{ backgroundColor: primaryColor }} />
                Our cleaning process
              </span>
              <h2 className="site-section-title mt-5">A better clean, from the first click.</h2>
              <p className="mt-4 text-base leading-relaxed text-[#616963] sm:text-lg">
                Booking a clean should be simple. Choose what you need, pick a time,
                and let your cleaning team take it from there.
              </p>
            </div>
          </Reveal>
          <ol className="site-process-steps mt-8">
            {STEPS.map((item, i) => (
              <Reveal key={item.step} delay={i * 70}>
                <li className="site-process-step">
                  <span className="site-process-number">{item.step}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-[#102c24]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#616963]">{item.body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
