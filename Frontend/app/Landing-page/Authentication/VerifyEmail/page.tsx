"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import TopNav from "@/app/components/Home/TopNav";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001";
const RESEND_COOLDOWN = 60;

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [verified, setVerified] = useState(false);
  const [locked, setLocked] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const next = [...otp];
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (res.ok) {
        setVerified(true);
      } else {
        setError(data.message ?? "Invalid code. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        if (data.locked) {
          setLocked(true);
        } else {
          inputRefs.current[0]?.focus();
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendMsg("");
    setError("");
    try {
      await fetch(`${BACKEND}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendMsg("A new code has been sent to your email.");
      setOtp(["", "", "", "", "", ""]);
      setLocked(false);
      setError("");
      setCooldown(RESEND_COOLDOWN);
      inputRefs.current[0]?.focus();
    } catch {
      setResendMsg("Failed to resend. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div>
      <section className="min-h-screen flex items-stretch">
        <TopNav />
        <div
          className="hidden lg:flex lg:w-1/2 bg-cover relative items-center justify-center p-8 md:p-12"
          style={{ backgroundImage: "url(/login.svg)" }}
        />
        <div className="bg-white lg:w-1/2 w-full flex items-center justify-center z-0 relative border-t border-primary lg:border-l px-6 py-8 sm:px-8 sm:py-10 md:px-12 md:py-14 lg:px-16 lg:py-16">
          <div
            className="absolute lg:hidden inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/login.svg)" }}
          />
          <div className="w-full max-w-md z-20 text-center">
            <div className="flex justify-center mb-6 animate-[fadeInDown_0.6s_ease-out_0.2s_both]">
              <div className="bg-white p-4 rounded-2xl shadow-lg">
                <Image
                  src="/favicon.svg"
                  alt="Logo"
                  width={96}
                  height={96}
                  className="w-20 h-20 sm:w-24 sm:h-24"
                />
              </div>
            </div>

            {verified ? (
              <div className="animate-[fadeIn_0.8s_ease-out_both]">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <h1 className="font-bold lg:text-gray-900 text-white text-2xl sm:text-3xl mb-2">
                  Email Verified!
                </h1>
                <p className="lg:text-gray-600 text-white/90 text-sm sm:text-base mb-6">
                  Your account is now active. You can sign in.
                </p>
                <Link
                  href="/Landing-page/Authentication/Login"
                  className="inline-block bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl px-8 py-3"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="animate-[fadeIn_0.8s_ease-out_0.2s_both]">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <h1 className="font-bold lg:text-gray-900 text-white text-2xl sm:text-3xl mb-2">
                  Check Your Email
                </h1>
                <p className="lg:text-gray-600 text-white/90 text-sm sm:text-base mb-1">
                  We sent a 6-digit code to
                </p>
                <p className="font-semibold lg:text-gray-900 text-white text-sm sm:text-base mb-6 break-all">
                  {email}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* OTP inputs */}
                  <div
                    className="flex justify-center gap-2 sm:gap-3"
                    onPaste={handlePaste}
                  >
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          inputRefs.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        disabled={locked}
                        className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-bold text-gray-900 bg-white border-2 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${
                          error
                            ? "border-red-400"
                            : digit
                              ? "border-primary"
                              : "border-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  {resendMsg && (
                    <p className="text-green-600 text-sm">{resendMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || locked}
                    className="w-full bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed py-3 text-sm sm:text-base"
                  >
                    {isSubmitting ? "Verifying..." : "Verify Email"}
                  </button>

                  <p className="lg:text-gray-600 text-white/90 text-sm">
                    Didn&apos;t receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isResending || cooldown > 0}
                      className="font-semibold text-white lg:text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                    >
                      {isResending
                        ? "Sending..."
                        : cooldown > 0
                          ? `Resend in ${cooldown}s`
                          : "Resend Code"}
                    </button>
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
