import type { Metadata } from "next";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Sign up — Level Up Chemistry",
};

export default function SignupPage() {
  return <SignupForm />;
}
