"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import TopNav from "@/app/components/TopNav";
import { useSearchParams } from "next/navigation";

export default function ResetPassword() {
  const t = useTranslations("LoginPage.resetPassword");

  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    const resetToken = searchParams.get("token");
    setToken(resetToken);
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

  const getStrengthLabel = (strength: number): string => {
    if (strength === 0) return "";
    if (strength <= 2) return t("strength.weak");
    if (strength <= 3) return t("strength.medium");
    if (strength <= 4) return t("strength.strong");
    return t("strength.veryStrong");
  };

  const getStrengthColor = (strength: number): string => {
    if (strength === 0) return "bg-gray-300";
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-yellow-500";
    if (strength <= 4) return "bg-primary";
    return "bg-green-600";
  };

  const validateForm = (): boolean => {
    const newErrors = {
      password: "",
      confirmPassword: "",
    };

    if (!formData.password) {
      newErrors.password = t("errors.passwordRequired");
    } else if (formData.password.length < 8) {
      newErrors.password = t("errors.passwordMinLength");
    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = t("errors.passwordUpperLower");
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = t("errors.passwordNumber");
    } else if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(formData.password)) {
      newErrors.password = t("errors.passwordSpecial");
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("errors.confirmRequired");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("errors.confirmMismatch");
    }

    setErrors(newErrors);
    return !newErrors.password && !newErrors.confirmPassword;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Add your password reset logic here
      console.log("Reset password with token:", token);
      console.log("New password:", formData.password);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSuccess(true);
    } catch (error) {
      console.error("Password reset error:", error);
      setErrors({
        password: "",
        confirmPassword: t("errors.resetError"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <section className="min-h-screen flex items-stretch">
        <TopNav />
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
                <Image
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
                  {t("title")}
                </h1>
                <p
                  className="lg:text-gray-600 text-white/90 text-center text-fluid-base animate-[fadeIn_0.8s_ease-out_0.4s_both]"
                  style={{ marginBottom: "clamp(1.5rem, 4vw, 2rem)" }}
                >
                  {t("subtitle")}
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
                      htmlFor="password"
                      className="block font-medium lg:text-gray-700 text-white text-fluid-sm"
                      style={{ marginBottom: "clamp(0.375rem, 1.5vw, 0.5rem)" }}
                    >
                      {t("newPasswordLabel")}
                    </label>
                    <div className="relative">
                      <input
                        className={`block w-full text-gray-900 bg-white border-2 ${
                          errors.password ? "border-red-500" : "border-gray-300"
                        } rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-gray-400 shadow-sm hover:shadow-md text-fluid-base outline-none`}
                        style={{
                          padding:
                            "clamp(0.75rem, 2vw, 0.875rem) clamp(0.875rem, 2.5vw, 1rem)",
                          paddingRight: "clamp(2.5rem, 6vw, 3rem)",
                        }}
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={t("newPasswordPlaceholder")}
                        autoComplete="new-password"
                        aria-invalid={!!errors.password}
                        aria-describedby={
                          errors.password ? "password-error" : undefined
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary rounded p-1 transition-colors"
                        aria-label={
                          showPassword ? t("hidePassword") : t("showPassword")
                        }
                      >
                        {showPassword ? (
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
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                level <= passwordStrength
                                  ? getStrengthColor(passwordStrength)
                                  : "bg-gray-300"
                              }`}
                            ></div>
                          ))}
                        </div>
                        <p
                          className={`text-fluid-xs font-medium ${
                            passwordStrength <= 2
                              ? "text-red-500"
                              : passwordStrength <= 3
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          {getStrengthLabel(passwordStrength)}
                        </p>
                      </div>
                    )}

                    {errors.password && (
                      <p
                        id="password-error"
                        role="alert"
                        className="mt-1 text-red-500 text-fluid-sm"
                      >
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="animate-[slideInLeft_0.6s_ease-out_0.7s_both]">
                    <label
                      htmlFor="confirmPassword"
                      className="block font-medium lg:text-gray-700 text-white text-fluid-sm"
                      style={{ marginBottom: "clamp(0.375rem, 1.5vw, 0.5rem)" }}
                    >
                      {t("confirmPasswordLabel")}
                    </label>
                    <div className="relative">
                      <input
                        className={`block w-full text-gray-900 bg-white border-2 ${
                          errors.confirmPassword
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-gray-400 shadow-sm hover:shadow-md text-fluid-base outline-none`}
                        style={{
                          padding:
                            "clamp(0.75rem, 2vw, 0.875rem) clamp(0.875rem, 2.5vw, 1rem)",
                          paddingRight: "clamp(2.5rem, 6vw, 3rem)",
                        }}
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder={t("confirmPasswordPlaceholder")}
                        autoComplete="new-password"
                        aria-invalid={!!errors.confirmPassword}
                        aria-describedby={
                          errors.confirmPassword
                            ? "confirm-password-error"
                            : undefined
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary rounded p-1 transition-colors"
                        aria-label={
                          showConfirmPassword
                            ? t("hidePassword")
                            : t("showPassword")
                        }
                      >
                        {showConfirmPassword ? (
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
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p
                        id="confirm-password-error"
                        role="alert"
                        className="mt-1 text-red-500 text-fluid-sm"
                      >
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-primary/5 rounded-lg p-3 animate-[fadeIn_0.6s_ease-out_0.8s_both]">
                    <p className="font-medium lg:text-gray-900 text-white text-fluid-sm mb-2">
                      {t("requirements.title")}
                    </p>
                    <ul
                      className="space-y-1"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "clamp(0.25rem, 1vw, 0.375rem)",
                      }}
                    >
                      <li
                        className={`flex items-center gap-2 text-fluid-xs ${
                          formData.password.length >= 8
                            ? "text-green-600"
                            : "lg:text-gray-600 text-white/80"
                        }`}
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {t("requirements.minLength")}
                      </li>
                      <li
                        className={`flex items-center gap-2 text-fluid-xs ${
                          /(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)
                            ? "text-green-600"
                            : "lg:text-gray-600 text-white/80"
                        }`}
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {t("requirements.upperLower")}
                      </li>
                      <li
                        className={`flex items-center gap-2 text-fluid-xs ${
                          /(?=.*\d)/.test(formData.password)
                            ? "text-green-600"
                            : "lg:text-gray-600 text-white/80"
                        }`}
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {t("requirements.number")}
                      </li>
                      <li
                        className={`flex items-center gap-2 text-fluid-xs ${
                          /(?=.*[!@#$%^&*(),.?":{}|<>])/.test(formData.password)
                            ? "text-green-600"
                            : "lg:text-gray-600 text-white/80"
                        }`}
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {t("requirements.special")}
                      </li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-fluid-base animate-[slideInUp_0.6s_ease-out_0.9s_both]"
                    style={{ padding: "clamp(0.75rem, 2.5vw, 0.875rem)" }}
                  >
                    {isSubmitting ? t("resetting") : t("resetButton")}
                  </button>
                </form>
              </>
            ) : (
              <div className="animate-[fadeIn_0.8s_ease-out]">
                <div className="flex justify-center mb-6">
                  <div className="bg-green-100 p-4 rounded-full animate-[pulse_2s_ease-in-out_infinite]">
                    <svg
                      className="w-16 h-16 text-green-600"
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

                <h1
                  className="font-bold lg:text-gray-900 text-white text-center text-fluid-3xl"
                  style={{ marginBottom: "clamp(0.5rem, 2vw, 0.5rem)" }}
                >
                  {t("success.title")}
                </h1>
                <p
                  className="lg:text-gray-600 text-white/90 text-center text-fluid-base"
                  style={{ marginBottom: "clamp(1.5rem, 4vw, 2rem)" }}
                >
                  {t("success.message")}
                </p>

                <Link
                  href="/Landing-page/Login"
                  className="w-full inline-block text-center bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-fluid-base"
                  style={{ padding: "clamp(0.75rem, 2.5vw, 0.875rem)" }}
                >
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
