"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPassword() {
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
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
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
      setError("Something went wrong. Please try again.");
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
        <div
          className="hidden lg:flex lg:w-1/2 bg-cover relative items-center justify-center"
          style={{
            backgroundImage: "url(/login.svg)",
            padding: "clamp(2rem, 5vw, 3rem)",
          }}
        ></div>
        <div
          className="bg-white lg:w-1/2 w-full flex items-center justify-center z-0 relative border-t border-primary lg:border-l"
          style={{
            padding: "clamp(1.5rem, 5vw, 4rem) clamp(1.5rem, 5vw, 4rem)",
          }}
        >
          <div
            className="absolute lg:hidden inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/login.svg)" }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          <div className="w-full max-w-md z-20">
            <div className="flex justify-center animate-[fadeInDown_0.6s_ease-out]">
              <div className="bg-white p-4 rounded-2xl shadow-lg hover:scale-110 transition-transform duration-300">
                <img
                  src="/favicon.svg"
                  alt="Logo"
                  width={96}
                  height={96}
                  style={{
                    width: "clamp(5rem, 10vw, 6rem)",
                    height: "clamp(5rem, 10vw, 6rem)",
                  }}
                />
              </div>
            </div>

            {!isSuccess ? (
              <>
                <h1
                  className="font-bold lg:text-gray-900 text-white text-center text-fluid-3xl animate-[fadeIn_0.8s_ease-out_0.2s_both]"
                  style={{ marginBottom: "clamp(0.5rem, 2vw, 0.5rem)" }}
                >
                  Forgot Password?
                </h1>
                <p
                  className="lg:text-gray-600 text-white/90 text-center text-fluid-base animate-[fadeIn_0.8s_ease-out_0.4s_both]"
                  style={{ marginBottom: "clamp(1.5rem, 4vw, 2rem)" }}
                >
                  No worries! Enter your email and we'll send you reset
                  instructions
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="animate-[fadeInUp_0.8s_ease-out_0.5s_both]"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "clamp(1rem, 3vw, 1.25rem)",
                  }}
                >
                  <div className="animate-[slideInLeft_0.6s_ease-out_0.6s_both]">
                    <label
                      htmlFor="email"
                      className="block font-medium lg:text-gray-700 text-white text-fluid-sm"
                      style={{ marginBottom: "clamp(0.375rem, 1.5vw, 0.5rem)" }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      autoComplete="email"
                      aria-invalid={!!error}
                      aria-describedby={error ? "email-error" : undefined}
                      className={`block w-full text-gray-900 bg-white border-2 ${
                        error ? "border-red-500" : "border-gray-300"
                      } rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-gray-400 shadow-sm hover:shadow-md text-fluid-base outline-none`}
                      style={{
                        padding:
                          "clamp(0.75rem, 2vw, 0.875rem) clamp(0.875rem, 2.5vw, 1rem)",
                      }}
                    />
                    {error && (
                      <p
                        id="email-error"
                        role="alert"
                        className="mt-1 text-red-500 text-fluid-sm"
                      >
                        {error}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-fluid-base animate-[slideInUp_0.6s_ease-out_0.7s_both]"
                    style={{ padding: "clamp(0.75rem, 2.5vw, 0.875rem)" }}
                  >
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                  </button>

                  <div className="text-center animate-[fadeIn_0.6s_ease-out_0.8s_both]">
                    <Link
                      href="/Landing-page/Login"
                      className="inline-flex items-center gap-2 text-white lg:text-primary hover:text-primary/80 transition-colors font-medium text-fluid-sm"
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
                      Back to Sign In
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

                <h1
                  className="font-bold lg:text-gray-900 text-white text-center text-fluid-3xl"
                  style={{ marginBottom: "clamp(0.5rem, 2vw, 0.5rem)" }}
                >
                  Check Your Email
                </h1>
                <p
                  className="lg:text-gray-600 text-white/90 text-center text-fluid-base"
                  style={{ marginBottom: "clamp(1.5rem, 4vw, 2rem)" }}
                >
                  We've sent password reset instructions to{" "}
                  <span className="font-semibold lg:text-gray-900 text-white">
                    {email}
                  </span>
                </p>

                <div
                  className="space-y-4"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "clamp(0.75rem, 2vw, 1rem)",
                  }}
                >
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setEmail("");
                    }}
                    className="w-full bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-fluid-base"
                    style={{ padding: "clamp(0.75rem, 2.5vw, 0.875rem)" }}
                  >
                    Try Another Email
                  </button>

                  <Link
                    href="/Landing-page/Login"
                    className="w-full inline-block text-center bg-white text-white lg:text-primary border-2 border-primary font-semibold rounded-xl hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-sm hover:shadow-md text-fluid-base"
                    style={{ padding: "clamp(0.75rem, 2.5vw, 0.875rem)" }}
                  >
                    Back to Sign In
                  </Link>
                </div>

                <p
                  className="lg:text-gray-500 text-white/70 text-center text-fluid-sm"
                  style={{ marginTop: "clamp(1rem, 3vw, 1.5rem)" }}
                >
                  Didn't receive the email? Check your spam folder or try
                  another email
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
