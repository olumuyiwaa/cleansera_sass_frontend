"use client";

import { Reveal } from "./Reveal";

type SiteAboutProps = {
  title: string | null;
  body: string | null;
  heroImageUrl: string | null;
  primaryColor: string;
};

export function SiteAbout({ title, body, heroImageUrl, primaryColor }: SiteAboutProps) {
  // Nothing configured — skip entirely rather than render an empty shell.
  // A business toggling this section on before writing anything can't
  // accidentally publish a blank block.
  if (!title && !body) return null;

  return (
    <section id="about" className="site-section-light scroll-mt-24 border-t border-[#e7e3d9] py-20 sm:py-24">
      <div className="site-container grid gap-10 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <div>
            <span className="site-eyebrow">
              <span
                className="site-eyebrow-dot"
                style={{ backgroundColor: primaryColor, boxShadow: `0 0 0 5px ${primaryColor}1f` }}
              />
                About the service
            </span>
            {title && (
              <h2 className="site-section-title mt-5">{title}</h2>
            )}
            {body && (
              <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-[#616963] sm:text-lg">{body}</p>
            )}
          </div>
        </Reveal>
        {heroImageUrl && (
          <Reveal delay={80}>
            {/* eslint-disable-next-line @next/next/no-img-element -- remote business-uploaded asset, arbitrary host */}
            <img
              src={heroImageUrl}
              alt=""
              className="aspect-[4/3] w-full rounded-2xl border border-[#E8E4DE] object-cover shadow-sm"
            />
          </Reveal>
        )}
      </div>
    </section>
  );
}
