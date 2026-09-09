import { authFetch } from "@/app/api/authFetch";

export async function listCoupons() {
  return authFetch(`/businesses/pricing/coupons`);
}

export async function createCoupon(body: {
  code: string;
  type: "PERCENT" | "AMOUNT";
  value: number;
  appliesToServiceId?: string;
  expiresAt?: string;
  maxRedemptions?: number;
  perCustomerLimit?: number;
}) {
  return authFetch(`/businesses/pricing/coupons`, { method: "POST", body: JSON.stringify(body) });
}

export async function updateCoupon(id: string, body: Record<string, unknown>) {
  return authFetch(`/businesses/pricing/coupons/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function deleteCoupon(id: string) {
  return authFetch(`/businesses/pricing/coupons/${id}`, { method: "DELETE" });
}
