import api from "./axios";
import { authFetch } from "./authFetch";

// ─── Types ────────────────────────────────────────────────────

export type TicketStatus   = "OPEN" | "IN_PROGRESS" | "WAITING_ON_USER" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TicketCategory =
  | "ACCOUNT_ACCESS"
  | "CREDENTIALS"
  | "SHIFTS_SCHEDULING"
  | "PAYMENTS_BILLING"
  | "TECHNICAL"
  | "OTHER";

export interface SubmitTicketPayload {
  name:     string;
  email:    string;
  subject:  string;
  // The web form uses short keys; the backend maps them to enum values
  category: "account" | "credentials" | "shifts" | "payments" | "technical" | "other";
  message:  string;
}

export interface SubmitTicketResult {
  ticketNumber: string;
  id:           string;
  status:       TicketStatus;
}

export interface TicketListItem {
  id:           string;
  ticketNumber: string;
  subject:      string;
  status:       TicketStatus;
  priority:     TicketPriority;
  category:     TicketCategory;
  guestName:    string | null;
  guestEmail:   string | null;
  createdAt:    string;
  updatedAt:    string;
  resolvedAt:   string | null;
  user?:        { id: string; email: string } | null;
  assignedTo?:  { id: string } | null;
  _count:       { replies: number };
}

export interface TicketReply {
  id:          string;
  body:        string;
  isInternal:  boolean;
  createdAt:   string;
  authorEmail: string | null;
  author?:     {
    adminProfile?: { firstName: string; lastName: string } | null;
    cleanerProfile?: { firstName: string; lastName: string } | null;
  } | null;
  attachments: TicketAttachment[];
}

export interface TicketAttachment {
  id:          string;
  fileName:    string;
  mimeType:    string;
  sizeBytes:   number;
  downloadUrl?: string;
}

export interface TicketDetail extends TicketListItem {
  description?: string;
  resolution?:  string | null;
  tags:         string[];
  ipAddress?:   string | null;
  replies:      TicketReply[];
  attachments:  TicketAttachment[];
}

export interface TicketStats {
  byStatus:            { status: TicketStatus; count: number }[];
  byPriority:          { priority: TicketPriority; count: number }[];
  byCategory:          { category: TicketCategory; count: number }[];
  avgResolutionHours:  number | null;
  recentOpen:          TicketListItem[];
}

// ─── API ──────────────────────────────────────────────────────

export const supportApi = {

  submit: async (payload: SubmitTicketPayload): Promise<SubmitTicketResult> => {
    const res = await api.post<{ data: SubmitTicketResult }>("/support", payload);
    return res.data.data;        // Now properly typed
  },

  trackTicket: async (ticketNumber: string, email: string): Promise<TicketDetail> => {
    const res = await api.get<{ data: TicketDetail }>(
        `/support/track?ticket=${encodeURIComponent(ticketNumber)}&email=${encodeURIComponent(email)}`
    );
    return res.data.data;
  },

  // ── Auth: list tickets ────────────────────────────────────
  listTickets: async (params?: {
    page?:         number;
    limit?:        number;
    status?:       TicketStatus;
    priority?:     TicketPriority;
    category?:     TicketCategory;
    assignedToId?: string;
    search?:       string;
    from?:         string;
    to?:           string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page)         query.set("page",         String(params.page));
    if (params?.limit)        query.set("limit",        String(params.limit));
    if (params?.status)       query.set("status",       params.status);
    if (params?.priority)     query.set("priority",     params.priority);
    if (params?.category)     query.set("category",     params.category);
    if (params?.assignedToId) query.set("assignedToId", params.assignedToId);
    if (params?.search)       query.set("search",       params.search);
    if (params?.from)         query.set("from",         params.from);
    if (params?.to)           query.set("to",           params.to);

    return authFetch(`/support?${query.toString()}`, { method: "GET" });
  },

  // ── Auth: get single ticket ───────────────────────────────
  getTicket: async (id: string) =>
    authFetch(`/support/${id}`, { method: "GET" }),

  // ── Auth: add reply ───────────────────────────────────────
  addReply: async (
    ticketId: string,
    body: string,
    isInternal = false,
    attachments?: File[]
  ) => {
    const form = new FormData();
    form.append("body",       body);
    form.append("isInternal", String(isInternal));
    if (attachments?.length) {
      attachments.forEach((f) => form.append("attachments", f));
    }

    // Use axios directly for multipart
    const res = await api.post(`/support/${ticketId}/replies`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // ── Admin: update status ──────────────────────────────────
  updateStatus: async (
    ticketId:   string,
    status:     TicketStatus,
    resolution?: string
  ) => authFetch(`/support/${ticketId}/status`, {
    method: "PATCH",
    body:   JSON.stringify({ status, resolution }),
  }),

  // ── Admin: assign ticket ──────────────────────────────────
  assign: async (ticketId: string, assignedToId: string) =>
    authFetch(`/support/${ticketId}/assign`, {
      method: "PATCH",
      body:   JSON.stringify({ assignedToId }),
    }),

  // ── Admin: update priority ────────────────────────────────
  updatePriority: async (ticketId: string, priority: TicketPriority) =>
    authFetch(`/support/${ticketId}/priority`, {
      method: "PATCH",
      body:   JSON.stringify({ priority }),
    }),

  // ── Admin: stats dashboard ────────────────────────────────
  getStats: async (): Promise<TicketStats> => {
    const res = await authFetch("/support/admin/stats", { method: "GET" });
    return res.data;
  },

  // ── Admin: delete ticket ──────────────────────────────────
  deleteTicket: async (ticketId: string) =>
    authFetch(`/support/${ticketId}`, { method: "DELETE" }),
};