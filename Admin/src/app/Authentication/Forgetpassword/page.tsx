"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import TopNav from "@/components/TopNav";

export default function ForgotPassword() {
  const t = useTranslations("LoginPage.forgotPassword");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError(t("errors.emailRequired"));
      return;
    }

    if (!validateEmail(email)) {
      setError(t("errors.emailInvalid"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Add your password reset logic here
      console.log("Reset password for:", email);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSuccess(true);
    } catch (error) {
      console.error("Password reset error:", error);
      setError(t("errors.sendError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    if (!validateEmail(email)) {
      setError(t("errors.emailInvalid"));
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/user/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSuccess(true);
        alert("Password reset OTP sent to your email.");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to send OTP.");
      }
    } catch (error) {
      setError("An error occurred while sending OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError("");
    }
  };

  return (
    <div>
      <section className="min-h-screen flex items-stretch">
        <TopNav />
        <div
          className="hidden lg:flex lg:w-1/2 bg-cover relative items-center justify-center p-8 md:p-12"
          style={{ backgroundImage: "url(/login.svg)" }}
        ></div>
        <div className="bg-white lg:w-1/2 w-full flex items-center justify-center z-0 relative border-t border-primary lg:border-l px-6 py-8 sm:px-8 sm:py-10 md:px-12 md:py-14 lg:px-16 lg:py-16">
          <div
            className="absolute lg:hidden inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/login.svg)" }}
          ></div>
          <div className="w-full max-w-md z-20">
            <div className="flex justify-center animate-[fadeInDown_0.6s_ease-out_0.2s_both]">
              <div className="bg-white p-4 rounded-2xl shadow-lg hover:scale-110 transition-transform duration-300">
                <Image
                  src="/images/favicon.svg"
                  alt="Logo"
                  width={96}
                  height={96}
                  className="w-20 h-20 sm:w-24 sm:h-24"
                />
              </div>
            </div>

            {!isSuccess ? (
              <>
                <h1 className="font-bold lg:text-gray-900 text-white text-center text-xl sm:text-2xl md:text-3xl mb-2 mt-4 animate-[fadeIn_0.8s_ease-out_0.2s_both]">
                  {t("title")}
                </h1>
                <p className="lg:text-gray-600 text-white/90 text-center text-sm sm:text-base mb-6 sm:mb-8 animate-[fadeIn_0.8s_ease-out_0.4s_both]">
                  {t("subtitle")}
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-5 animate-[fadeInUp_0.8s_ease-out_0.5s_both]"
                >
                  <div className="animate-[slideInLeft_0.6s_ease-out_0.6s_both]">
                    <label
                      htmlFor="email"
                      className="block font-medium lg:text-gray-700 text-white text-xs sm:text-sm mb-1.5 sm:mb-2"
                    >
                      {t("emailLabel")}
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={email}
                      onChange={handleChange}
                      placeholder={t("emailPlaceholder")}
                      autoComplete="email"
                      aria-invalid={!!error}
                      aria-describedby={error ? "email-error" : undefined}
                      className={`block w-full text-gray-900 bg-white border-2 ${
                        error ? "border-red-500" : "border-gray-300"
                      } rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-gray-400 shadow-sm hover:shadow-md text-sm sm:text-base outline-none px-3 py-2.5 sm:px-4 sm:py-3`}
                    />
                    {error && (
                      <p
                        id="email-error"
                        role="alert"
                        className="mt-1 text-red-500 text-xs sm:text-sm"
                      >
                        {error}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base px-4 py-2.5 sm:px-6 sm:py-3 animate-[slideInUp_0.6s_ease-out_0.7s_both]"
                  >
                    {isSubmitting ? t("sending") : t("sendButton")}
                  </button>

                  <div className="text-center animate-[fadeIn_0.6s_ease-out_0.8s_both]">
                    <Link
                      href="/Authentication/Login"
                      className="inline-flex items-center gap-2 text-white lg:text-primary hover:text-primary/80 transition-colors font-medium text-xs sm:text-sm"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      {t("backToSignIn")}
                    </Link>
                  </div>
                </form>
              </>
            ) : (
              <div className="animate-[fadeIn_0.8s_ease-out]">
                <div className="flex justify-center mb-6">
                  <div className="bg-primary/10 p-4 rounded-full animate-[pulse_2s_ease-in-out_infinite]">
                    <svg
                      className="w-16 h-16 text-primary"
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

                <h1 className="font-bold lg:text-gray-900 text-white text-center text-xl sm:text-2xl md:text-3xl mb-2 mt-4">
                  {t("success.title")}
                </h1>
                <p className="lg:text-gray-600 text-white/90 text-center text-sm sm:text-base mb-6 sm:mb-8">
                  {t("success.message")}{" "}
                  <span className="font-semibold lg:text-gray-900 text-white">
                    {email}
                  </span>
                </p>

                <div className="space-y-4 sm:space-y-5">
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setEmail("");
                    }}
                    className="w-full bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base px-4 py-2.5 sm:px-6 sm:py-3"
                  >
                    {t("success.tryAnotherEmail")}
                  </button>

                  <Link
                    href="/Authentication/Login"
                    className="w-full inline-block text-center bg-white lg:text-primary text-primary border-2 border-primary font-semibold rounded-xl hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base px-4 py-2.5 sm:px-6 sm:py-3"
                  >
                    {t("success.backToSignIn")}
                  </Link>
                </div>

                <p className="lg:text-gray-500 text-white/70 text-center text-xs sm:text-sm mt-4 sm:mt-6">
                  {t("success.didntReceive")}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
