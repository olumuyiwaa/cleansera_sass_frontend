"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/app/api/auth.api";

// ─── Password strength helper ────────────────────────────────
function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  hints: string[];
} {
  const hints: string[] = [];
  if (password.length < 8) hints.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) hints.push("One uppercase letter");
  if (!/[0-9]/.test(password)) hints.push("One number");
  if (!/[^A-Za-z0-9]/.test(password)) hints.push("One special character (optional)");

  const score = 4 - Math.min(hints.filter(h => !h.includes("optional")).length, 4);

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];

  return { score, label: labels[score] || "", color: colors[score] || "", hints };
}

// ─── Inline error banner ─────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        {message}
      </div>
  );
}

// ─── Extract error message ───────────────────────────────────
function extractErrorMessage(err: unknown): string {
  if (!err || typeof err !== "object") return "Registration failed. Please try again.";

  const e = err as any;
  if (e.response?.data?.errors?.length) {
    return e.response.data.errors.map((v: any) => v.msg).join(" · ");
  }
  if (e.response?.data?.message) return e.response.data.message;
  if (e.message) return e.message;

  return "Registration failed. Please try again.";
}

export default function SignUpForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    subdomain: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const strength = getPasswordStrength(formData.password);
  const passwordIsValid = strength.score >= 3;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setError(null);
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isChecked) {
      setError("Please accept the Terms & Conditions to continue.");
      return;
    }

    if (!passwordIsValid) {
      setError("Password must be at least 8 characters and include an uppercase letter and a number.");
      return;
    }

    try {
      setLoading(true);

      const envelope = await authApi.register(formData);

      if (!envelope.success) {
        setError(envelope.message || "Registration failed.");
        return;
      }

      const { accessToken, refreshToken } = envelope.data;
      if (!accessToken) {
        setError("Unexpected response from server. Please try again.");
        return;
      }

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div>
            <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                Sign Up
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter your basic information to sign up!
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* Name row */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <Label>
                      First Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                        required
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <Label>
                      Last Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                        required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                  />
                </div>

                {/* Business name + subdomain */}
                <div>
                  <Label>
                    Business Name<span className="text-error-500">*</span>
                  </Label>
                  <Input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="Acme Cleaning Co."
                      required
                  />
                </div>
                <div>
                  <Label>
                    Subdomain<span className="text-error-500">*</span>
                  </Label>
                  <div className="flex items-center">
                    <Input
                        type="text"
                        name="subdomain"
                        value={formData.subdomain}
                        onChange={(e) =>
                            handleChange({
                              ...e,
                              target: { ...e.target, value: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") },
                            } as React.ChangeEvent<HTMLInputElement>)
                        }
                        placeholder="acme-cleaning"
                        required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Your booking page will live at {formData.subdomain || "your-business"}.cleansera.com
                  </p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Optional"
                  />
                </div>

                {/* Password */}
                <div>
                  <Label>
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        placeholder="Min 8 chars, 1 uppercase, 1 number"
                        required
                    />
                    <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                    {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                  </div>

                  {formData.password.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                              <div
                                  key={i}
                                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                      i <= strength.score ? strength.color : "bg-gray-200 dark:bg-gray-700"
                                  }`}
                              />
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          {strength.label && (
                              <span
                                  className={`text-xs font-medium ${
                                      strength.score <= 1
                                          ? "text-red-600 dark:text-red-400"
                                          : strength.score === 2
                                              ? "text-orange-500"
                                              : strength.score === 3
                                                  ? "text-yellow-600 dark:text-yellow-400"
                                                  : "text-green-600 dark:text-green-400"
                                  }`}
                              >
                          {strength.label}
                        </span>
                          )}
                          {(passwordFocused || strength.score < 3) &&
                              strength.hints.filter((h) => !h.includes("optional")).length > 0 && (
                                  <span className="text-xs text-gray-400 dark:text-gray-500">
                            Missing:{" "}
                                    {strength.hints
                                        .filter((h) => !h.includes("optional"))
                                        .join(", ")}
                          </span>
                              )}
                        </div>
                      </div>
                  )}
                </div>

                {/* T&C checkbox */}
                <div className="flex items-start gap-3">
                  <Checkbox
                      className="mt-0.5 w-5 h-5 flex-shrink-0"
                      checked={isChecked}
                      onChange={setIsChecked}
                  />
                  <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    By creating an account you agree to the{" "}
                    <Link href="/terms" target="_blank" className="text-gray-800 underline dark:text-white/90 hover:text-brand-500">
                      Terms and Conditions
                    </Link>{" "}
                    and our{" "}
                    <Link href="/privacy" target="_blank" className="text-gray-800 underline dark:text-white hover:text-brand-500">
                      Privacy Policy
                    </Link>
                  </p>
                </div>

                {error && <ErrorBanner message={error} />}

                <div>
                  <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                        <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Creating Account...
                    </span>
                    ) : (
                        "Sign Up"
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account?{" "}
                <Link href="/" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}