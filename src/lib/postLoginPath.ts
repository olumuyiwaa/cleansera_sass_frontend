import type { CurrentUser } from "@/app/api/auth.api";

/**
 * Destination after a successful sign-in, based on platform role.
 * Super Admins land on the platform portal; everyone else on the
 * business dashboard.
 */
export function postLoginPath(user: CurrentUser | null | undefined): string {
  if (user?.globalRole === "SUPER_ADMIN") {
    return "/admin";
  }
  return "/dashboard";
}
