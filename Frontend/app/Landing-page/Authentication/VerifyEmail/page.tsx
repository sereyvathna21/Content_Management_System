"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TopNav from "@/app/components/Home/TopNav";

type Status = "verifying" | "success" | "error";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const userId = searchParams.get("userId");
    const token = searchParams.get("token");

    if (!userId || !token) {
      setStatus("error");
      setMessage("Invalid verification link. Please register again.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5001"}/api/auth/verify-email` +
            `?userId=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}`,
        );
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message ?? "Email verified successfully.");
        } else {
          setStatus("error");
          setMessage(
            data.message ?? "Verification failed. The link may have expired.",
          );
        }
      } catch {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    verify();
  }, [searchParams]);

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

            {status === "verifying" && (
              <div className="animate-[fadeIn_0.8s_ease-out_0.2s_both]">
                <div className="flex justify-center mb-4">
                  <svg
                    className="animate-spin h-12 w-12 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                </div>
                <h1 className="font-bold lg:text-gray-900 text-white text-2xl sm:text-3xl mb-2">
                  Verifying your email...
                </h1>
                <p className="lg:text-gray-600 text-white/90 text-sm sm:text-base">
                  Please wait a moment.
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="animate-[fadeIn_0.8s_ease-out_0.2s_both]">
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
                  {message}
                </p>
                <Link
                  href="/Landing-page/Authentication/Login"
                  className="inline-block bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl px-8 py-3"
                >
                  Sign In
                </Link>
              </div>
            )}

            {status === "error" && (
              <div className="animate-[fadeIn_0.8s_ease-out_0.2s_both]">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                </div>
                <h1 className="font-bold lg:text-gray-900 text-white text-2xl sm:text-3xl mb-2">
                  Verification Failed
                </h1>
                <p className="lg:text-gray-600 text-white/90 text-sm sm:text-base mb-6">
                  {message}
                </p>
                <Link
                  href="/Landing-page/Authentication/Register"
                  className="inline-block bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl px-8 py-3"
                >
                  Register Again
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
