"use client";

import React, { useEffect, useState } from "react";
import { listReviews, deleteReview } from "@/app/api/reviews.api";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await listReviews();
      if (!res.success) throw new Error(res.message);
      setReviews(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Reviews</h1>
        <p className="mt-1 text-sm text-gray-500">Customer feedback from completed jobs</p>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border p-5 dark:border-gray-800">
              <div className="text-amber-500">{stars(r.rating || 0)}</div>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{r.comment || "No comment"}</p>
              <p className="mt-3 text-xs text-gray-500">
                {r.customer ? `${r.customer.firstName} ${r.customer.lastName}` : "Customer"} ·{" "}
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
              <button
                type="button"
                className="mt-3 text-xs text-red-600 hover:underline"
                onClick={async () => {
                  await deleteReview(r.id);
                  load();
                }}
              >
                Remove
              </button>
            </div>
          ))}
          {!reviews.length && <p className="text-sm text-gray-500">No reviews yet</p>}
        </div>
      )}
    </div>
  );
}
