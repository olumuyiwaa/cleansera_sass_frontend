"use client";

// components/support/ContactForm.tsx
// Drop-in replacement for the inline ContactForm in the support page.
// Wires the existing form to POST /support/tickets.

import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

async function submitContactMessage(payload: {
  name: string;
  email: string;
  subject?: string;
  category?: string;
  message: string;
}): Promise<{ received: boolean; reference: string }> {
  const res = await fetch(`${API_BASE_URL}/support`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await res.json();
  if (!res.ok || !result.success) {
    throw new Error(result.message || "Failed to send message");
  }
  return result.data;
}

type FormState = {
  name:     string;
  email:    string;
  category: string;
  message:  string;
};

const inputStyle: React.CSSProperties = {
  width:        "100%",
  padding:      "11px 14px",
  border:       "1.5px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  fontFamily:   "var(--font-body)",
  fontSize:     "14px",
  color:        "var(--navy-900)",
  background:   "var(--white)",
  outline:      "none",
  transition:   "border-color .2s, box-shadow .2s",
  boxSizing:    "border-box",
};

const labelStyle: React.CSSProperties = {
  display:       "block",
  fontSize:      "12px",
  fontWeight:    600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color:         "var(--navy-600)",
  marginBottom:  "6px",
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name:     "",
    email:    "",
    category: "",
    message:  "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [ticketRef, setTicketRef] = useState<string | null>(null);

  const handle = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setError(null);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    try {
      setLoading(true);

      const result = await submitContactMessage({
        name:     form.name.trim(),
        email:    form.email.trim(),
        subject:  `${form.category.charAt(0).toUpperCase() + form.category.slice(1)}: ${form.message.slice(0, 60)}${form.message.length > 60 ? "…" : ""}`,
        category: form.category,
        message:  form.message.trim(),
      });

      setTicketRef(result.reference);
      setSubmitted(true);
    } catch (err: any) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors?.length) {
        setError(apiErrors.map((e: any) => e.msg).join(" · "));
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to submit ticket. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{
        textAlign:    "center",
        padding:      "48px 24px",
        background:   "var(--gold-50)",
        borderRadius: "var(--radius-lg)",
        border:       "1.5px solid var(--gold-200)",
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
        <h3 style={{ margin: "0 0 8px", fontFamily: "var(--font-display)", fontSize: "22px", color: "var(--navy-900)" }}>
          Message received
        </h3>
        <p style={{ margin: "0 0 16px", color: "#4a5568", fontSize: "14px", lineHeight: 1.6 }}>
          We'll get back to you at <strong>{form.email}</strong> within 24 hours.
        </p>
        {ticketRef && (
          <p style={{ margin: 0, color: "#4a5568", fontSize: "14px" }}>
            Ticket reference:{" "}
            <code style={{
              fontFamily:   "var(--font-mono)",
              background:   "var(--gold-100)",
              padding:      "2px 8px",
              borderRadius: "4px",
              fontWeight:   600,
              color:        "var(--navy-800)",
            }}>
              {ticketRef}
            </code>
          </p>
        )}
        <button
          type="button"
          onClick={() => { setSubmitted(false); setForm({ name: "", email: "", category: "", message: "" }); setTicketRef(null); }}
          style={{
            marginTop:    "20px",
            padding:      "9px 20px",
            background:   "var(--navy-800)",
            color:        "var(--gold-300)",
            border:       "none",
            borderRadius: "var(--radius-sm)",
            fontFamily:   "var(--font-body)",
            fontSize:     "13px",
            fontWeight:   600,
            cursor:       "pointer",
          }}
        >
          Submit another ticket
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

      {/* Name + Email */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <label style={labelStyle}>Full name</label>
          <input
            name="name"
            value={form.name}
            onChange={handle}
            required
            placeholder="Sarah Adams"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Email address</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handle}
            required
            placeholder="you@example.com"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label style={labelStyle}>Category</label>
        <select
          name="category"
          value={form.category}
          onChange={handle}
          required
          style={{
            ...inputStyle,
            appearance:              "none",
            backgroundImage:         "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23253968' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",
            backgroundRepeat:        "no-repeat",
            backgroundPosition:      "right 12px center",
            paddingRight:            "36px",
            cursor:                  "pointer",
          } as React.CSSProperties}
        >
          <option value="">Select a category…</option>
          <option value="account">Account & Access</option>
          <option value="credentials">Credentials & Compliance</option>
          <option value="shifts">Shifts & Scheduling</option>
          <option value="payments">Payments & Billing</option>
          <option value="technical">Technical Issue</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label style={labelStyle}>Message</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handle}
          required
          minLength={20}
          rows={5}
          placeholder="Describe your issue in as much detail as possible…"
          style={{ ...inputStyle, resize: "vertical", minHeight: "120px", lineHeight: 1.6 }}
        />
        <p style={{ marginTop: "4px", fontSize: "11px", color: "#718096" }}>
          Minimum 20 characters · {form.message.length} typed
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding:      "12px 16px",
          background:   "#fef2f2",
          border:       "1px solid #fecaca",
          borderRadius: "var(--radius-sm)",
          fontSize:     "13px",
          color:        "#dc2626",
        }}>
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        style={{
          padding:       "13px 28px",
          background:    loading ? "var(--navy-300)" : "var(--navy-800)",
          color:         "var(--gold-300)",
          border:        "none",
          borderRadius:  "var(--radius-sm)",
          fontFamily:    "var(--font-body)",
          fontSize:      "14px",
          fontWeight:    600,
          letterSpacing: "0.04em",
          cursor:        loading ? "not-allowed" : "pointer",
          transition:    "background .2s",
          alignSelf:     "flex-start",
          display:       "flex",
          alignItems:    "center",
          gap:           "8px",
        }}
      >
        {loading ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              style={{ animation: "spin 1s linear infinite" }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity=".25"/>
              <path fill="currentColor" opacity=".75" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Sending…
          </>
        ) : (
          "Send message →"
        )}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}