"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import TopNav from "@/app/components/Home/TopNav";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: string;
}

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "weak", color: "bg-red-500" };
  if (score === 2) return { score, label: "medium", color: "bg-yellow-500" };
  if (score === 3) return { score, label: "strong", color: "bg-blue-500" };
  return { score, label: "veryStrong", color: "bg-green-500" };
}

export default function Register() {
  const t = useTranslations("LoginPage.register");

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registered, setRegistered] = useState(false);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: "",
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = t("errors.fullNameRequired");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("errors.emailRequired");
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t("errors.emailInvalid");
    }

    if (!formData.password) {
      newErrors.password = t("errors.passwordRequired");
    } else if (formData.password.length < 8) {
      newErrors.password = t("errors.passwordMinLength");
    } else if (
      !/[A-Z]/.test(formData.password) ||
      !/[a-z]/.test(formData.password)
    ) {
      newErrors.password = t("errors.passwordUpperLower");
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = t("errors.passwordNumber");
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
      newErrors.password = t("errors.passwordSpecial");
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("errors.confirmRequired");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("errors.confirmMismatch");
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = t("errors.agreeToTermsRequired");
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((e) => !e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      // Replace with: await api.post('/auth/register', formData)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setRegistered(true);
    } catch (error) {
      console.error("Register error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const strength = getPasswordStrength(formData.password);

  const inputClass = (hasError: boolean) =>
    `block w-full text-gray-900 bg-white border-2 ${
      hasError ? "border-red-500" : "border-gray-300"
    } rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-gray-400 shadow-sm hover:shadow-md text-sm sm:text-base outline-none px-3 py-2.5 sm:px-4 sm:py-3`;

  const EyeIcon = ({ open }: { open: boolean }) =>
    open ? (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
        />
      </svg>
    ) : (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    );

  return (
    <div>
      <section className="min-h-screen flex items-stretch">
        <TopNav />
        {/* Left panel — decorative background */}
        <div
          className="hidden lg:flex lg:w-1/2 bg-cover relative items-center justify-center p-8 md:p-12"
          style={{ backgroundImage: "url(/login.svg)" }}
        />

        {/* Right panel — form */}
        <div className="bg-white lg:w-1/2 w-full flex items-center justify-center z-0 relative border-t border-primary lg:border-l px-6 py-8 sm:px-8 sm:py-10 md:px-12 md:py-14 lg:px-16 lg:py-16">
          {/* Mobile background */}
          <div
            className="absolute lg:hidden inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/login.svg)" }}
          />

          <div className="w-full max-w-md z-20">
            {/* Logo */}
            <div className="flex justify-center animate-[fadeInDown_0.6s_ease-out_0.2s_both]">
              <div className="bg-white p-4 rounded-2xl shadow-lg hover:scale-110 transition-transform duration-300">
                <Image
                  src="/favicon.svg"
                  alt="Logo"
                  width={96}
                  height={96}
                  className="w-20 h-20 sm:w-24 sm:h-24"
                />
              </div>
            </div>

            {registered ? (
              /* ── Success state ── */
              <div className="text-center mt-6 animate-[fadeIn_0.6s_ease-out_both]">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 rounded-full p-4">
                    <svg
                      className="h-12 w-12 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="font-bold text-white lg:text-gray-900 text-xl sm:text-2xl mb-2">
                  {t("success.title")}
                </h2>
                <p className="text-white/90 lg:text-gray-600 text-sm sm:text-base mb-6">
                  {t("success.message")}
                </p>
                <Link
                  href="/Landing-page/Authentication"
                  className="inline-block w-full bg-primary text-white font-semibold rounded-xl text-center hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base px-4 py-2.5 sm:px-6 sm:py-3"
                >
                  {t("success.goToSignIn")}
                </Link>
              </div>
            ) : (
              /* ── Registration form ── */
              <>
                <h1 className="font-bold lg:text-gray-900 text-white text-center text-xl sm:text-2xl md:text-3xl mb-2 mt-4 animate-[fadeIn_0.8s_ease-out_0.2s_both]">
                  {t("title")}
                </h1>
                <p className="lg:text-gray-600 text-white/90 text-center text-sm sm:text-base mb-6 sm:mb-8 animate-[fadeIn_0.8s_ease-out_0.4s_both]">
                  {t("subtitle")}
                </p>

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-4 sm:space-y-5 animate-[fadeInUp_0.8s_ease-out_0.5s_both]"
                >
                  {/* Full Name */}
                  <div className="animate-[slideInLeft_0.6s_ease-out_0.55s_both]">
                    <label
                      htmlFor="fullName"
                      className="block font-medium lg:text-gray-700 text-white text-xs sm:text-sm mb-1.5 sm:mb-2"
                    >
                      {t("fullNameLabel")}
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder={t("fullNamePlaceholder")}
                      autoComplete="name"
                      aria-invalid={!!errors.fullName}
                      aria-describedby={
                        errors.fullName ? "fullName-error" : undefined
                      }
                      className={inputClass(!!errors.fullName)}
                    />
                    {errors.fullName && (
                      <p
                        id="fullName-error"
                        role="alert"
                        className="mt-1 text-red-500 text-xs sm:text-sm"
                      >
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="animate-[slideInLeft_0.6s_ease-out_0.6s_both]">
                    <label
                      htmlFor="email"
                      className="block font-medium lg:text-gray-700 text-white text-xs sm:text-sm mb-1.5 sm:mb-2"
                    >
                      {t("emailLabel")}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t("emailPlaceholder")}
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      aria-describedby={
                        errors.email ? "email-error" : undefined
                      }
                      className={inputClass(!!errors.email)}
                    />
                    {errors.email && (
                      <p
                        id="email-error"
                        role="alert"
                        className="mt-1 text-red-500 text-xs sm:text-sm"
                      >
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="animate-[slideInLeft_0.6s_ease-out_0.65s_both]">
                    <label
                      htmlFor="password"
                      className="block font-medium lg:text-gray-700 text-white text-xs sm:text-sm mb-1.5 sm:mb-2"
                    >
                      {t("passwordLabel")}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={t("passwordPlaceholder")}
                        autoComplete="new-password"
                        aria-invalid={!!errors.password}
                        aria-describedby={
                          errors.password ? "password-error" : undefined
                        }
                        className={`${inputClass(!!errors.password)} pr-10 sm:pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary rounded p-1 transition-colors"
                        aria-label={
                          showPassword ? t("hidePassword") : t("showPassword")
                        }
                      >
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>

                    {/* Password strength bar */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                                strength.score >= step
                                  ? strength.color
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          {t(`strength.${strength.label}`)}
                        </p>
                      </div>
                    )}

                    {errors.password && (
                      <p
                        id="password-error"
                        role="alert"
                        className="mt-1 text-red-500 text-xs sm:text-sm"
                      >
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="animate-[slideInLeft_0.6s_ease-out_0.7s_both]">
                    <label
                      htmlFor="confirmPassword"
                      className="block font-medium lg:text-gray-700 text-white text-xs sm:text-sm mb-1.5 sm:mb-2"
                    >
                      {t("confirmPasswordLabel")}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder={t("confirmPasswordPlaceholder")}
                        autoComplete="new-password"
                        aria-invalid={!!errors.confirmPassword}
                        aria-describedby={
                          errors.confirmPassword
                            ? "confirmPassword-error"
                            : undefined
                        }
                        className={`${inputClass(!!errors.confirmPassword)} pr-10 sm:pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary rounded p-1 transition-colors"
                        aria-label={
                          showConfirmPassword
                            ? t("hidePassword")
                            : t("showPassword")
                        }
                      >
                        <EyeIcon open={showConfirmPassword} />
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p
                        id="confirmPassword-error"
                        role="alert"
                        className="mt-1 text-red-500 text-xs sm:text-sm"
                      >
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Terms & Conditions */}
                  <div className="animate-[fadeIn_0.6s_ease-out_0.75s_both]">
                    <div className="flex items-start gap-2">
                      <input
                        id="agreeToTerms"
                        name="agreeToTerms"
                        type="checkbox"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        className="mt-0.5 h-4 w-4 border-primary rounded text-primary focus:ring-primary flex-shrink-0"
                      />
                      <label
                        htmlFor="agreeToTerms"
                        className="text-xs sm:text-sm lg:text-gray-700 text-white"
                      >
                        {t("agreeToTerms.prefix")}{" "}
                        <Link
                          href="/Landing-page/Terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-white lg:text-primary hover:text-primary/80 underline transition-colors"
                        >
                          {t("agreeToTerms.terms")}
                        </Link>{" "}
                        {t("agreeToTerms.and")}{" "}
                        <Link
                          href="/Landing-page/Privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-white lg:text-primary hover:text-primary/80 underline transition-colors"
                        >
                          {t("agreeToTerms.privacy")}
                        </Link>
                      </label>
                    </div>
                    {errors.agreeToTerms && (
                      <p
                        role="alert"
                        className="mt-1 text-red-500 text-xs sm:text-sm"
                      >
                        {errors.agreeToTerms}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base px-4 py-2.5 sm:px-6 sm:py-3 animate-[slideInUp_0.6s_ease-out_0.85s_both]"
                  >
                    {isSubmitting ? t("registering") : t("registerButton")}
                  </button>

                  {/* Sign in link */}
                  <p className="text-center text-xs sm:text-sm lg:text-gray-600 text-white/90 animate-[fadeIn_0.6s_ease-out_0.9s_both]">
                    {t("alreadyHaveAccount")}{" "}
                    <Link
                      href="/Landing-page/Authentication/Login"
                      className="font-semibold text-white lg:text-primary hover:text-primary/80 transition-colors"
                    >
                      {t("signInLink")}
                    </Link>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
