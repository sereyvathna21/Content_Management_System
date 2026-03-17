"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import TopNav from "@/components/TopNav";
import { useSearchParams } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export default function ResetPassword() {
  const t = useTranslations("LoginPage.resetPassword");
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({ password: "", confirmPassword: "" });
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setToken(searchParams.get("token"));
    setEmail(searchParams.get("email"));
  }, [searchParams]);

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    return strength;
  };

  const getStrengthLabel = (s: number) => {
    if (s === 0) return "";
    if (s <= 2) return t("strength.weak");
    if (s <= 3) return t("strength.medium");
    if (s <= 4) return t("strength.strong");
    return t("strength.veryStrong");
  };

  const getStrengthColor = (s: number) => {
    if (s === 0) return "bg-gray-300";
    if (s <= 2) return "bg-red-500";
    if (s <= 3) return "bg-yellow-500";
    if (s <= 4) return "bg-primary";
    return "bg-green-600";
  };

  const validateForm = (): boolean => {
    const newErrors = { password: "", confirmPassword: "" };
    if (!formData.password) newErrors.password = t("errors.passwordRequired");
    else if (formData.password.length < 8) newErrors.password = t("errors.passwordMinLength");
    else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) newErrors.password = t("errors.passwordUpperLower");
    else if (!/(?=.*\d)/.test(formData.password)) newErrors.password = t("errors.passwordNumber");
    else if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(formData.password)) newErrors.password = t("errors.passwordSpecial");
    if (!formData.confirmPassword) newErrors.confirmPassword = t("errors.confirmRequired");
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t("errors.confirmMismatch");
    setErrors(newErrors);
    return !newErrors.password && !newErrors.confirmPassword;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "password") setPasswordStrength(calculatePasswordStrength(value));
    if (errors[name as keyof typeof errors]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!token || !email) {
      setGeneralError("Invalid or missing reset link. Please request a new password reset.");
      return;
    }

    setIsSubmitting(true);
    setGeneralError("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/user/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword: formData.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGeneralError(data.message || t("errors.resetError"));
      } else {
        setIsSuccess(true);
      }
    } catch {
      setGeneralError(t("errors.resetError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <section className="min-h-screen flex items-stretch">
        <TopNav />
        <div className="hidden lg:flex lg:w-1/2 bg-cover relative items-center justify-center p-8 md:p-12" style={{ backgroundImage: "url(/login.svg)" }}></div>
        <div className="bg-white lg:w-1/2 w-full flex items-center justify-center z-0 relative border-t border-primary lg:border-l px-6 py-8 sm:px-8 sm:py-10 md:px-12 md:py-14 lg:px-16 lg:py-16">
          <div className="absolute lg:hidden inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url(/login.svg)" }}></div>
          <div className="w-full max-w-md z-20">
            <div className="flex justify-center animate-[fadeInDown_0.6s_ease-out_0.2s_both]">
              <div className="bg-white p-4 rounded-2xl shadow-lg hover:scale-110 transition-transform duration-300">
                <Image src="/images/favicon.svg" alt="Logo" width={96} height={96} className="w-20 h-20 sm:w-24 sm:h-24" />
              </div>
            </div>

            {!isSuccess ? (
              <>
                <h1 className="font-bold lg:text-gray-900 text-white text-center text-xl sm:text-2xl md:text-3xl mb-2 mt-4 animate-[fadeIn_0.8s_ease-out_0.2s_both]">{t("title")}</h1>
                <p className="lg:text-gray-600 text-white/90 text-center text-sm sm:text-base mb-6 sm:mb-8 animate-[fadeIn_0.8s_ease-out_0.4s_both]">{t("subtitle")}</p>

                {generalError && (
                  <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
                    {generalError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 animate-[fadeInUp_0.8s_ease-out_0.5s_both]">
                  <div className="animate-[slideInLeft_0.6s_ease-out_0.6s_both]">
                    <label htmlFor="password" className="block font-medium lg:text-gray-700 text-white text-xs sm:text-sm mb-1.5 sm:mb-2">{t("newPasswordLabel")}</label>
                    <div className="relative">
                      <input
                        className={`block w-full text-gray-900 bg-white border-2 ${errors.password ? "border-red-500" : "border-gray-300"} rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-gray-400 shadow-sm hover:shadow-md text-sm sm:text-base outline-none px-3 py-2.5 sm:px-4 sm:py-3 pr-10 sm:pr-12`}
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={t("newPasswordPlaceholder")}
                        autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary rounded p-1 transition-colors">
                        {showPassword ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div key={level} className={`h-1 flex-1 rounded-full transition-all duration-300 ${level <= passwordStrength ? getStrengthColor(passwordStrength) : "bg-gray-300"}`}></div>
                          ))}
                        </div>
                        <p className={`text-xs font-medium ${passwordStrength <= 2 ? "text-red-500" : passwordStrength <= 3 ? "text-yellow-600" : "text-green-600"}`}>{getStrengthLabel(passwordStrength)}</p>
                      </div>
                    )}
                    {errors.password && <p id="password-error" role="alert" className="mt-1 text-red-500 text-xs sm:text-sm">{errors.password}</p>}
                  </div>

                  <div className="animate-[slideInLeft_0.6s_ease-out_0.7s_both]">
                    <label htmlFor="confirmPassword" className="block font-medium lg:text-gray-700 text-white text-xs sm:text-sm mb-1.5 sm:mb-2">{t("confirmPasswordLabel")}</label>
                    <div className="relative">
                      <input
                        className={`block w-full text-gray-900 bg-white border-2 ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-gray-400 shadow-sm hover:shadow-md text-sm sm:text-base outline-none px-3 py-2.5 sm:px-4 sm:py-3 pr-10 sm:pr-12`}
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder={t("confirmPasswordPlaceholder")}
                        autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary rounded p-1 transition-colors">
                        {showConfirmPassword ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && <p id="confirm-password-error" role="alert" className="mt-1 text-red-500 text-xs sm:text-sm">{errors.confirmPassword}</p>}
                  </div>

                  <div className="bg-primary/5 rounded-lg p-3 animate-[fadeIn_0.6s_ease-out_0.8s_both]">
                    <p className="font-medium lg:text-gray-900 text-white text-xs sm:text-sm mb-2">{t("requirements.title")}</p>
                    <ul className="space-y-1">
                      {[
                        { check: formData.password.length >= 8, label: t("requirements.minLength") },
                        { check: /(?=.*[a-z])(?=.*[A-Z])/.test(formData.password), label: t("requirements.upperLower") },
                        { check: /(?=.*\d)/.test(formData.password), label: t("requirements.number") },
                        { check: /(?=.*[!@#$%^&*(),.?":{}|<>])/.test(formData.password), label: t("requirements.special") },
                      ].map(({ check, label }, i) => (
                        <li key={i} className={`flex items-center gap-2 text-xs ${check ? "text-green-600" : "lg:text-gray-600 text-white/80"}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          {label}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base px-4 py-2.5 sm:px-6 sm:py-3 animate-[slideInUp_0.6s_ease-out_0.9s_both]">
                    {isSubmitting ? t("resetting") : t("resetButton")}
                  </button>
                </form>
              </>
            ) : (
              <div className="animate-[fadeIn_0.8s_ease-out]">
                <div className="flex justify-center mb-6">
                  <div className="bg-green-100 p-4 rounded-full animate-[pulse_2s_ease-in-out_infinite]">
                    <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h1 className="font-bold lg:text-gray-900 text-white text-center text-xl sm:text-2xl md:text-3xl mb-2 mt-4">{t("success.title")}</h1>
                <p className="lg:text-gray-600 text-white/90 text-center text-sm sm:text-base mb-6 sm:mb-8">{t("success.message")}</p>
                <Link href="/Authentication/Login" className="w-full inline-block text-center bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base px-4 py-2.5 sm:px-6 sm:py-3">
                  {t("success.goToSignIn")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
