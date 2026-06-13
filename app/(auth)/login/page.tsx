import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log in — Level Up Chemistry",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; message?: string }>;
}) {
  const { callbackUrl, message } = await searchParams;
  return <LoginForm callbackUrl={callbackUrl ?? "/"} message={message} />;
}
