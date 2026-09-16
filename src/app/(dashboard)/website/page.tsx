"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import {
  getBranding,
  updateBranding,
  uploadBrandingImage,
  BusinessBranding,
  Testimonial,
  FaqItem,
  SocialLinks,
  ThemeStyle,
} from "@/app/api/businesses.api";

const SECTION_LABELS: Record<"about" | "testimonials" | "gallery" | "faq", string> = {
  about: "About",
  testimonials: "Testimonials",
  gallery: "Gallery",
  faq: "FAQ",
};
const SECTION_KEYS: Array<"about" | "testimonials" | "gallery" | "faq"> = [
  "about",
  "testimonials",
  "gallery",
  "faq",
];
const SOCIAL_PLATFORMS: Array<keyof SocialLinks> = ["facebook", "instagram", "tiktok", "linkedin", "twitter"];

export default function WebsitePage() {
  const [branding, setBranding] = useState<BusinessBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Local editable copies of the free-form list/text fields — saved
  // together via one "Save Website Content" click, same pattern as the
  // existing business-settings page. Image uploads save themselves
  // immediately on selection instead, since there's nothing to "compose"
  // about an image the way there is with a paragraph of text.
  const [themeStyle, setThemeStyle] = useState<ThemeStyle>("MODERN");
  const [aboutTitle, setAboutTitle] = useState("");
  const [aboutBody, setAboutBody] = useState("");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [sections, setSections] = useState<{
    about: boolean;
    testimonials: boolean;
    gallery: boolean;
    faq: boolean;
    order: Array<"about" | "testimonials" | "gallery" | "faq">;
  }>({ about: true, testimonials: true, gallery: true, faq: true, order: SECTION_KEYS });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const b = await getBranding();
      setBranding(b);
      setThemeStyle(b.themeStyle || "MODERN");
      setAboutTitle(b.aboutTitle || "");
      setAboutBody(b.aboutBody || "");
      setTestimonials(b.testimonials || []);
      setFaqItems(b.faqItems || []);
      setSocialLinks(b.socialLinks || {});
      setSections({
        about: b.sectionsEnabled?.about !== false,
        testimonials: b.sectionsEnabled?.testimonials !== false,
        gallery: b.sectionsEnabled?.gallery !== false,
        faq: b.sectionsEnabled?.faq !== false,
        order: b.sectionsEnabled?.order?.length ? b.sectionsEnabled.order : SECTION_KEYS,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load website settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true);
    setError("");
    try {
      const { key } = await uploadBrandingImage("logo", file);
      const updated = await updateBranding({ logoKey: key });
      setBranding(updated);
      setSaved("Logo updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logo upload failed");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleHeroUpload = async (file: File) => {
    setUploadingHero(true);
    setError("");
    try {
      const { key } = await uploadBrandingImage("hero", file);
      const updated = await updateBranding({ heroImageKey: key });
      setBranding(updated);
      setSaved("Hero image updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hero image upload failed");
    } finally {
      setUploadingHero(false);
    }
  };

  const handleGalleryUpload = async (files: FileList) => {
    setUploadingGallery(true);
    setError("");
    try {
      const currentKeys = branding?.galleryImageKeys || [];
      const remaining = Math.max(0, 24 - currentKeys.length);
      const toUpload = Array.from(files).slice(0, remaining);
      const uploaded = await Promise.all(toUpload.map((f) => uploadBrandingImage("gallery", f)));
      const updated = await updateBranding({ galleryImageKeys: [...currentKeys, ...uploaded.map((u) => u.key)] });
      setBranding(updated);
      setSaved("Gallery updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gallery upload failed");
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = async (key: string) => {
    setError("");
    try {
      const updated = await updateBranding({
        galleryImageKeys: (branding?.galleryImageKeys || []).filter((k) => k !== key),
      });
      setBranding(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove image");
    }
  };

  const moveSectionOrder = (key: "about" | "testimonials" | "gallery" | "faq", direction: -1 | 1) => {
    setSections((prev) => {
      const idx = prev.order.indexOf(key);
      const swapWith = idx + direction;
      if (swapWith < 0 || swapWith >= prev.order.length) return prev;
      const order = [...prev.order];
      [order[idx], order[swapWith]] = [order[swapWith], order[idx]];
      return { ...prev, order };
    });
  };

  const saveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await updateBranding({
        themeStyle,
        aboutTitle: aboutTitle || null,
        aboutBody: aboutBody || null,
        testimonials: testimonials.filter((t) => t.name.trim() && t.quote.trim()),
        faqItems: faqItems.filter((f) => f.question.trim() && f.answer.trim()),
        socialLinks,
        sectionsEnabled: sections,
      });
      setBranding(updated);
      setSaved("Website content saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save website content");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-sm text-gray-500 md:p-6">Loading…</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Website</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Everything here feeds your public booking site and widget. Colors, logo shape, and your
          subdomain still live under Business Settings — this page is the content: images, story,
          testimonials, and which sections show up.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}
      {saved && !error && (
        <div className="mb-4 rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-600 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400">
          {saved}
        </div>
      )}

      {/* Logo + Hero image */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.02]">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Images
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              {branding?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={branding.logoUrl} alt="Logo" className="h-16 w-16 rounded-lg border border-gray-200 object-contain dark:border-gray-700" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-gray-300 text-xs text-gray-400 dark:border-gray-700">
                  None
                </div>
              )}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
              />
              <Button variant="outline" type="button" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}>
                {uploadingLogo ? "Uploading…" : "Upload logo"}
              </Button>
            </div>
          </div>
          <div>
            <Label>Hero / about image</Label>
            <div className="flex items-center gap-4">
              {branding?.heroImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={branding.heroImageUrl} alt="Hero" className="h-16 w-24 rounded-lg border border-gray-200 object-cover dark:border-gray-700" />
              ) : (
                <div className="flex h-16 w-24 items-center justify-center rounded-lg border border-dashed border-gray-300 text-xs text-gray-400 dark:border-gray-700">
                  None
                </div>
              )}
              <input
                ref={heroInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleHeroUpload(e.target.files[0])}
              />
              <Button variant="outline" type="button" onClick={() => heroInputRef.current?.click()} disabled={uploadingHero}>
                {uploadingHero ? "Uploading…" : "Upload image"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={saveContent} className="space-y-6">
        {/* Theme style */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.02]">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Theme style
          </h2>
          <div className="max-w-xs">
            <Select
              options={[
                { value: "MODERN", label: "Modern — clean sans-serif" },
                { value: "CLASSIC", label: "Classic — serif headings" },
                { value: "BOLD", label: "Bold — heavy, high-contrast" },
              ]}
              defaultValue={themeStyle}
              onChange={(v) => setThemeStyle(v as ThemeStyle)}
            />
          </div>
        </div>

        {/* About */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.02]">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">About section</h2>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={aboutTitle} onChange={(e) => setAboutTitle(e.target.value)} placeholder="e.g. Locally owned, fully insured" />
            </div>
            <div>
              <Label>Body</Label>
              <TextArea rows={5} value={aboutBody} onChange={setAboutBody} placeholder="Tell customers who you are and why they should book you." />
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.02]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Testimonials</h2>
            <Button variant="outline" type="button" onClick={() => setTestimonials([...testimonials, { name: "", quote: "" }])}>
              Add testimonial
            </Button>
          </div>
          <div className="space-y-4">
            {testimonials.length === 0 && <p className="text-sm text-gray-400">None yet.</p>}
            {testimonials.map((t, i) => (
              <div key={i} className="grid gap-3 rounded-lg border border-gray-100 p-3 sm:grid-cols-[200px_1fr_auto] dark:border-gray-800">
                <Input
                  value={t.name}
                  onChange={(e) => setTestimonials(testimonials.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                  placeholder="Customer name"
                />
                <Input
                  value={t.quote}
                  onChange={(e) => setTestimonials(testimonials.map((x, j) => (j === i ? { ...x, quote: e.target.value } : x)))}
                  placeholder="What they said"
                />
                <button
                  type="button"
                  onClick={() => setTestimonials(testimonials.filter((_, j) => j !== i))}
                  className="text-sm font-medium text-error-500 hover:text-error-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.02]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">FAQ</h2>
            <Button variant="outline" type="button" onClick={() => setFaqItems([...faqItems, { question: "", answer: "" }])}>
              Add question
            </Button>
          </div>
          <div className="space-y-4">
            {faqItems.length === 0 && <p className="text-sm text-gray-400">None yet.</p>}
            {faqItems.map((f, i) => (
              <div key={i} className="space-y-2 rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <Input
                    value={f.question}
                    onChange={(e) => setFaqItems(faqItems.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)))}
                    placeholder="Question"
                  />
                  <button
                    type="button"
                    onClick={() => setFaqItems(faqItems.filter((_, j) => j !== i))}
                    className="whitespace-nowrap text-sm font-medium text-error-500 hover:text-error-600"
                  >
                    Remove
                  </button>
                </div>
                <TextArea
                  rows={2}
                  value={f.answer}
                  onChange={(v) => setFaqItems(faqItems.map((x, j) => (j === i ? { ...x, answer: v } : x)))}
                  placeholder="Answer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Social links */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.02]">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Social links</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {SOCIAL_PLATFORMS.map((platform) => (
              <div key={platform}>
                <Label className="capitalize">{platform}</Label>
                <Input
                  value={socialLinks[platform] || ""}
                  onChange={(e) => setSocialLinks({ ...socialLinks, [platform]: e.target.value || undefined })}
                  placeholder="https://…"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sections visibility + order */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.02]">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Sections</h2>
          <p className="mb-4 text-xs text-gray-400">
            Show, hide, and order the optional sections. A section with no content stays hidden even
            when turned on.
          </p>
          <div className="space-y-2">
            {sections.order.map((key, i) => (
              <div key={key} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-800">
                <label className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={sections[key]}
                    onChange={(e) => setSections({ ...sections, [key]: e.target.checked })}
                  />
                  {SECTION_LABELS[key]}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => moveSectionOrder(key, -1)}
                    className="text-xs font-medium text-gray-500 hover:text-gray-800 disabled:opacity-30 dark:text-gray-400"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={i === sections.order.length - 1}
                    onClick={() => moveSectionOrder(key, 1)}
                    className="text-xs font-medium text-gray-500 hover:text-gray-800 disabled:opacity-30 dark:text-gray-400"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery — after order since it's the longest visually */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.02]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Gallery</h2>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && e.target.files.length > 0 && handleGalleryUpload(e.target.files)}
            />
            <Button variant="outline" type="button" onClick={() => galleryInputRef.current?.click()} disabled={uploadingGallery}>
              {uploadingGallery ? "Uploading…" : "Add photos"}
            </Button>
          </div>
          {(branding?.galleryImageUrls || []).length === 0 ? (
            <p className="text-sm text-gray-400">No photos yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {(branding?.galleryImageKeys || []).map((key, i) => (
                <div key={key} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={branding?.galleryImageUrls?.[i]} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(key)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-xs text-white opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Website Content"}</Button>
        </div>
      </form>
    </div>
  );
}
