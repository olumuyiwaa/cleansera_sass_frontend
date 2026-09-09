import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HealCare",
  description: "Signup Page Healtcare Dashboard",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
