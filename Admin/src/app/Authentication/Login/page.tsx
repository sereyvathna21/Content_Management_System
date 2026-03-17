"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import TopNav from "@/components/TopNav";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
  const t = useTranslations("LoginPage.signIn");
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "", general: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const newErrors = { email: "", password: "", general: "" };
    if (!formData.email.trim()) newErrors.email = t("errors.emailRequired");
    else if (!validateEmail(formData.email)) newErrors.email = t("errors.emailInvalid");
    if (!formData.password) newErrors.password = t("errors.passwordRequired");
    else if (formData.password.length < 8) newErrors.password = t("errors.passwordMinLength");
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, general: "" }));

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors((prev) => ({ ...prev, general: "Invalid email or password." }));
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setErrors((prev) => ({ ...prev, general: "An error occurred. Please try again." }));
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

            <h1 className="font-bold lg:text-gray-900 text-white text-center text-xl sm:text-2xl md:text-3xl mb-2 mt-4 animate-[fadeIn_0.8s_ease-out_0.2s_both]">
              {t("title")}
            </h1>
            <p className="lg:text-gray-600 text-white/90 text-center text-sm sm:text-base mb-6 sm:mb-8 animate-[fadeIn_0.8s_ease-out_0.4s_both]">
              {t("subtitle")}
            </p>

            <form noValidate className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              {errors.general && (
                <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 text-sm animate-[fadeIn_0.3s_ease-out]">
                  {errors.general}
                </div>
              )}

              <div className="animate-[slideInLeft_0.6s_ease-out_0.6s_both]">
                <label htmlFor="email" className="block font-medium lg:text-gray-700 text-white text-xs sm:text-sm mb-1.5 sm:mb-2">
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
                  className={`block w-full text-gray-900 bg-white border-2 ${errors.email ? "border-red-500" : "border-gray-300"} rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-gray-400 shadow-sm hover:shadow-md text-sm sm:text-base outline-none px-3 py-2.5 sm:px-4 sm:py-3`}
                />
                {errors.email && (
                  <p id="email-error" role="alert" className="mt-1 text-red-500 text-xs sm:text-sm">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="animate-[slideInLeft_0.6s_ease-out_0.7s_both]">
                <label htmlFor="password" className="block font-medium lg:text-gray-700 text-white text-xs sm:text-sm mb-1.5 sm:mb-2">
                  {t("passwordLabel")}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t("passwordPlaceholder")}
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className={`block w-full text-gray-900 bg-white border-2 ${errors.password ? "border-red-500" : "border-gray-300"} rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-gray-400 shadow-sm hover:shadow-md text-sm sm:text-base outline-none px-3 py-2.5 sm:px-4 sm:py-3`}
                />
                {errors.password && (
                  <p id="password-error" role="alert" className="mt-1 text-red-500 text-xs sm:text-sm">
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
                  <label htmlFor="remember-me" className="ml-2 block lg:text-gray-700 text-white">
                    {t("rememberMe")}
                  </label>
                </div>
                <Link
                  href="/Authentication/Forgetpassword"
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

              <p className="text-center text-xs sm:text-sm lg:text-gray-600 text-white/90 animate-[fadeIn_0.6s_ease-out_1s_both]">
                {t("noAccount")}{" "}
                <Link
                  href="/Authentication/Register"
                  className="font-semibold text-white lg:text-primary hover:text-primary/80 transition-colors"
                >
                  {t("registerLink")}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
