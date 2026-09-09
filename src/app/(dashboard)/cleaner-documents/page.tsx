"use client";

import React, { useEffect, useState } from "react";
import {
  listDocuments,
  getUploadUrl,
  createDocument,
  getDownloadUrl,
  deleteDocument,
} from "@/app/api/cleanerDocuments.api";
import { authFetch } from "@/app/api/authFetch";

const DOC_TYPES = ["ID_CARD", "BACKGROUND_CHECK", "CERTIFICATION", "CONTRACT", "INSURANCE", "OTHER"];

export default function CleanerDocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [cleaners, setCleaners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    cleanerId: "",
    title: "",
    type: "OTHER",
    file: null as File | null,
  });

  const load = async () => {
    setLoading(true);
    try {
      const [d, c] = await Promise.all([listDocuments(), authFetch("/cleaners")]);
      if (d.success) setDocs(d.data || []);
      if (c.success) setCleaners(Array.isArray(c.data) ? c.data : c.data?.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.file || !form.cleanerId || !form.title) return;
    setError("");
    try {
      const urlRes = await getUploadUrl(form.cleanerId, form.file.type, form.file.name);
      if (!urlRes.success) throw new Error(urlRes.message);
      const { uploadUrl, storageKey } = urlRes.data;
      await fetch(uploadUrl, {
        method: "PUT",
        body: form.file,
        headers: { "Content-Type": form.file.type },
      });
      const createRes = await createDocument({
        cleanerId: form.cleanerId,
        title: form.title,
        storageKey,
        type: form.type,
        mimeType: form.file.type,
        fileSize: form.file.size,
      });
      if (!createRes.success) throw new Error(createRes.message);
      setForm({ cleanerId: "", title: "", type: "OTHER", file: null });
      load();
    } catch (err: any) {
      setError(err.message || "Upload failed");
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Cleaner Documents</h1>
        <p className="mt-1 text-sm text-gray-500">IDs, background checks, certifications, contracts</p>
      </div>

      <form onSubmit={onUpload} className="grid gap-3 rounded-2xl border p-5 sm:grid-cols-2 lg:grid-cols-5 dark:border-gray-800">
        <select
          required
          value={form.cleanerId}
          onChange={(e) => setForm({ ...form, cleanerId: e.target.value })}
          className="h-11 rounded-lg border px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="">Select cleaner</option>
          {cleaners.map((c) => (
            <option key={c.id} value={c.id}>
              {c.user?.firstName} {c.user?.lastName}
            </option>
          ))}
        </select>
        <input
          required
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="h-11 rounded-lg border px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="h-11 rounded-lg border px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          {DOC_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <input
          type="file"
          required
          onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
          className="h-11 text-sm"
        />
        <button type="submit" className="h-11 rounded-lg bg-brand-500 text-sm font-medium text-white">
          Upload
        </button>
      </form>

      {error && <div className="text-sm text-red-600">{error}</div>}
      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border dark:border-gray-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-white/[0.03]">
              <tr>
                <th className="px-4 py-3">Cleaner</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="border-t dark:border-gray-800">
                  <td className="px-4 py-3">
                    {d.cleaner?.user?.firstName} {d.cleaner?.user?.lastName}
                  </td>
                  <td className="px-4 py-3">{d.title}</td>
                  <td className="px-4 py-3">{d.type}</td>
                  <td className="px-4 py-3">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      type="button"
                      className="text-brand-500 hover:underline"
                      onClick={async () => {
                        const res = await getDownloadUrl(d.id);
                        if (res.success && res.data?.downloadUrl) window.open(res.data.downloadUrl, "_blank");
                      }}
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:underline"
                      onClick={async () => {
                        await deleteDocument(d.id);
                        load();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!docs.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No documents yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
