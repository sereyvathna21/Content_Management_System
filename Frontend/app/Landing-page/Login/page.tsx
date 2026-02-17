"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import TopNav from "@/app/components/TopNav";

export default function Login() {
  const t = useTranslations("LoginPage.signIn");
  const tc = useTranslations("Common");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors = {
      email: "",
      password: "",
    };

    if (!formData.email.trim()) {
      newErrors.email = t("errors.emailRequired");
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t("errors.emailInvalid");
    }

    if (!formData.password) {
      newErrors.password = t("errors.passwordRequired");
    } else if (formData.password.length < 8) {
      newErrors.password = t("errors.passwordMinLength");
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
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
      // Add your login logic here
      console.log("Login data:", formData);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Handle successful login
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <section className="min-h-screen flex items-stretch">
        <TopNav />
        <div
          className="hidden lg:flex lg:w-1/2 bg-cover relative items-center justify-center p-8 md:p-12"
          style={{
            backgroundImage: "url(/login.svg)",
          }}
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
                  src="/favicon.svg"
                  alt="Logo"
                  width={96}
                  height={96}
                  className="w-20 h-20 sm:w-24 sm:h-24"
                />
              </div>
            </div>

            <h1 className="font-bold lg:text-gray-900 text-white text-center text-xl sm:text-2xl md:text-3xl mb-2 animate-[fadeIn_0.8s_ease-out_0.2s_both]">
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
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("emailPlaceholder")}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`block w-full text-gray-900 bg-white border-2 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-gray-400 shadow-sm hover:shadow-md text-sm sm:text-base outline-none px-3 py-2.5 sm:px-4 sm:py-3`}
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

              <div className="animate-[slideInLeft_0.6s_ease-out_0.7s_both]">
                <label
                  htmlFor="password"
                  className="block font-medium lg:text-gray-700 text-white text-xs sm:text-sm mb-1.5 sm:mb-2"
                >
                  {t("passwordLabel")}
                </label>
                <div className="relative">
                  <input
                    className={`block w-full text-gray-900 bg-white border-2 ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-gray-400 shadow-sm hover:shadow-md text-sm sm:text-base outline-none px-3 py-2.5 sm:px-4 sm:py-3 pr-10 sm:pr-12`}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t("passwordPlaceholder")}
                    autoComplete="current-password"
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

              <div className="flex items-center justify-between text-xs sm:text-sm animate-[fadeIn_0.6s_ease-out_0.8s_both]">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 border-primary rounded text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block lg:text-gray-700 text-white"
                  >
                    {t("rememberMe")}
                  </label>
                </div>
                <Link
                  href="/Landing-page/Login/Forgetpassword"
                  className="font-medium text-white lg:text-primary hover:text-primary/80 transition-colors"
                >
                  {t("forgotPassword")}
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base px-4 py-2.5 sm:px-6 sm:py-3 animate-[slideInUp_0.6s_ease-out_0.9s_both]"
              >
                {isSubmitting ? t("signingIn") : t("signInButton")}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
