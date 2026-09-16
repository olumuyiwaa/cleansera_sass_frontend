"use client";

import { Reveal } from "./Reveal";

type SiteGalleryProps = {
  imageUrls: string[] | null | undefined;
  primaryColor: string;
};

export function SiteGallery({ imageUrls, primaryColor }: SiteGalleryProps) {
  const images = (imageUrls || []).filter(Boolean);
  if (images.length === 0) return null;

  return (
    <section id="gallery" className="scroll-mt-24 border-t border-[#E8E4DE] bg-white py-16 sm:py-20">
      <div className="site-container">
        <Reveal>
          <div className="max-w-2xl">
            <span className="site-eyebrow">
              <span
                className="site-eyebrow-dot"
                style={{ backgroundColor: primaryColor, boxShadow: `0 0 0 5px ${primaryColor}1f` }}
              />
              Our work
            </span>
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((url, i) => (
            <Reveal key={url} delay={Math.min(i, 8) * 40}>
              {/* eslint-disable-next-line @next/next/no-img-element -- remote business-uploaded asset, arbitrary host */}
              <img
                src={url}
                alt=""
                className="aspect-square w-full rounded-xl border border-[#E8E4DE] object-cover"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
