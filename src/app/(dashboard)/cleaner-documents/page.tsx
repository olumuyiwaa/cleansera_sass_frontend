"use client";

export default function CleanerDocumentsPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Cleaner Documents</h1>
      <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Not wired up yet — cleansera_sass doesn&apos;t have a cleaner-level document
          model (background checks, certifications) yet, only job-level photos
          tied to a booking (<code>JobPhoto</code>). Add a <code>CleanerDocument</code>{" "}
          model + a small storage.api.ts client to bring this online.
        </p>
      </div>
    </div>
  );
}
