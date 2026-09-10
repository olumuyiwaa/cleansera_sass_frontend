type SiteFooterProps = {
  subdomain: string;
  businessName: string;
  primaryColor: string;
  onBook?: () => void;
};

export function SiteFooter({
  subdomain,
  businessName,
  primaryColor,
  onBook,
}: SiteFooterProps) {
  const initial = businessName.trim().charAt(0).toUpperCase() || "C";
  const bookHref = `/book-now/${subdomain}`;

  function handleBook(e: React.MouseEvent) {
    if (onBook) {
      e.preventDefault();
      onBook();
    }
  }

  return (
    <footer id="contact" className="border-t border-[#E2DED3] bg-[#FAF9F6]">
      <div className="site-container py-14">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className="grid h-8 w-8 place-items-center rounded-lg text-sm font-semibold text-[#FBFBF8]"
                style={{ backgroundColor: primaryColor }}
              >
                {initial}
              </span>
              <span className="text-base font-semibold text-[#171B1A]">
                {businessName}
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-[#79715F]">
              Professional cleaning you can book online — local, reliable, and
              built around your schedule.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <a
              href={bookHref}
              onClick={handleBook}
              className="inline-flex min-h-[44px] items-center justify-center rounded-[12px] px-5 text-sm font-semibold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Book a cleaning
            </a>
            <a
              href="#services"
              className="text-sm font-medium text-[#5C5546] hover:text-[#171B1A]"
            >
              View services
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse items-start justify-between gap-3 border-t border-[#E2DED3] pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-[#9C9483]">
            © {new Date().getFullYear()} {businessName}. All rights reserved.
          </p>
          <p className="text-xs text-[#9C9483]">
            Powered by{" "}
            <span className="font-medium text-[#5C5546]">CleanSera</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
