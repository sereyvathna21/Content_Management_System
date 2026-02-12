"use client";
import React, { useState } from "react";
import { Phone, Mail, MapPin, Facebook, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import Header from "@/app/components/Header";
import Navigation from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import FormAlert from "@/app/components/FormAlert";

export default function Contact() {
  const t = useTranslations("ContactPage");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    subject: false,
    message: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | "warning" | null;
    message: string;
  }>({ type: null, message: "" });

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "name":
        if (!value.trim()) return t("form.nameRequired");
        if (value.trim().length < 2) return t("form.nameMinLength");
        if (value.trim().length > 100) return t("form.nameMaxLength");
        return "";

      case "email":
        if (!value.trim()) return t("form.emailRequired");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return t("form.emailInvalid");
        return "";

      case "subject":
        if (!value.trim()) return t("form.subjectRequired");
        if (value.trim().length < 5) return t("form.subjectMinLength");
        if (value.trim().length > 200) return t("form.subjectMaxLength");
        return "";

      case "message":
        if (!value.trim()) return t("form.messageRequired");
        if (value.trim().length < 10) return t("form.messageMinLength");
        if (value.trim().length > 1000) return t("form.messageMaxLength");
        return "";

      default:
        return "";
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate field if it has been touched
    if (touched[name as keyof typeof touched]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      subject: true,
      message: true,
    });

    // Validate all fields
    const newErrors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      subject: validateField("subject", formData.subject),
      message: validateField("message", formData.message),
    };

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some((error) => error !== "");

    if (hasErrors) {
      setIsSubmitting(false);
      setSubmitStatus({
        type: "error",
        message: t("form.errorMessage"),
      });
      return;
    }

    // Simulate form submission
    setTimeout(() => {
      setSubmitStatus({
        type: "success",
        message: t("form.successMessage"),
      });
      setIsSubmitting(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setErrors({ name: "", email: "", subject: "", message: "" });
      setTouched({ name: false, email: false, subject: false, message: false });
    }, 1000);
  };

  return (
    <>
      <Header />
      <Navigation />
      <div className="min-h-screen bg-white pt-24 sm:pt-32 md:pt-36 lg:pt-44">
        {/* Header Section */}
        <div className="bg-primary text-white py-6 sm:py-8 md:py-10 lg:py-12 animate-fade-in">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-2 sm:mb-2 md:mb-3 animate-slide-down">
              {t("title")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-center text-white/80 max-w-2xl mx-auto animate-slide-up">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-7 lg:py-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 mb-4 sm:mb-6 md:mb-7 lg:mb-8">
            {/* Contact Information Cards */}
            <div
              className="bg-white p-3 sm:p-4 md:p-5 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-center mb-2 sm:mb-3">
                <div className="bg-primary/10 p-2 sm:p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="ml-3 sm:ml-4 text-base sm:text-lg md:text-xl font-semibold">
                  {t("phone")}
                </h3>
              </div>
              <p className="text-gray-600">+855 061 701 111</p>
              <p className="text-gray-600">+855 096 701 1111</p>
            </div>

            <div
              className="bg-white p-3 sm:p-4 md:p-5 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center mb-2 sm:mb-3">
                <div className="bg-primary/10 p-2 sm:p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="ml-3 sm:ml-4 text-base sm:text-lg md:text-xl font-semibold">
                  {t("email")}
                </h3>
              </div>
              <p className="text-gray-600">info@nspc.gov.kh</p>
              <p className="text-gray-600">contact@nspc.gov.kh</p>
            </div>

            <div
              className="bg-white p-3 sm:p-4 md:p-5 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="flex items-center mb-2 sm:mb-3">
                <div className="bg-primary/10 p-2 sm:p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <Facebook className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="ml-3 sm:ml-4 text-base sm:text-lg md:text-xl font-semibold">
                  {t("socialMedia")}
                </h3>
              </div>
              <a
                href="https://www.facebook.com/CAMNSPC/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline hover:text-primary/80 transition-colors duration-200"
              >
                facebook.com/NSPC
              </a>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            {/* Feedback Form */}
            <div
              className="bg-white p-3 sm:p-5 md:p-6 rounded-lg shadow-md animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-5 text-gray-800">
                {t("sendFeedback")}
              </h2>
              <form
                onSubmit={handleSubmit}
                className="space-y-3 sm:space-y-3.5 md:space-y-4"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("form.name")} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-300 focus:scale-[1.02] ${
                      errors.name && touched.name
                        ? "border-red-500 focus:ring-red-500 animate-shake"
                        : "border-gray-300"
                    }`}
                    placeholder={t("form.namePlaceholder")}
                  />
                  <div className="h-6 mt-1">
                    {errors.name && touched.name && (
                      <p className="text-xs sm:text-sm text-red-600 animate-fade-in">
                        {errors.name}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("form.email")} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-300 focus:scale-[1.02] ${
                      errors.email && touched.email
                        ? "border-red-500 focus:ring-red-500 animate-shake"
                        : "border-gray-300"
                    }`}
                    placeholder={t("form.emailPlaceholder")}
                  />
                  <div className="h-6 mt-1">
                    {errors.email && touched.email && (
                      <p className="text-sm text-red-600 animate-fade-in">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("form.subject")} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-300 focus:scale-[1.02] ${
                      errors.subject && touched.subject
                        ? "border-red-500 focus:ring-red-500 animate-shake"
                        : "border-gray-300"
                    }`}
                    placeholder={t("form.subjectPlaceholder")}
                  />
                  <div className="h-6 mt-1">
                    {errors.subject && touched.subject && (
                      <p className="text-sm text-red-600 animate-fade-in">
                        {errors.subject}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("form.message")} <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={5}
                    maxLength={1000}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-300 resize-none focus:scale-[1.02] ${
                      errors.message && touched.message
                        ? "border-red-500 focus:ring-red-500 animate-shake"
                        : "border-gray-300"
                    }`}
                    placeholder={t("form.messagePlaceholder")}
                  />
                  <div className="flex justify-between items-start mt-1 min-h-[1.5rem]">
                    <div className="flex-1">
                      {errors.message && touched.message && (
                        <p className="text-sm text-red-600 animate-fade-in">
                          {errors.message}
                        </p>
                      )}
                    </div>
                    <p
                      className={`text-sm ${formData.message.length > 950 ? "text-orange-600 font-semibold" : "text-gray-500"}`}
                    >
                      {formData.message.length}/1000
                    </p>
                  </div>
                </div>

                {formData.message.length > 950 && (
                  <FormAlert
                    type="warning"
                    message={`You are approaching the message limit (${formData.message.length}/1000).`}
                    onClose={() => {}}
                    autoCloseMs={null}
                  />
                )}

                {submitStatus.type && (
                  <FormAlert
                    type={submitStatus.type}
                    message={submitStatus.message}
                    onClose={() => setSubmitStatus({ type: null, message: "" })}
                    autoCloseMs={6000}
                  />
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-300 disabled:bg-primary/30 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {t("form.submitting")}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {t("form.submit")}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map and Address Section */}
            <div
              className="space-y-3 sm:space-y-4 md:space-y-5 animate-fade-in-up"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="bg-white p-3 sm:p-5 md:p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-center mb-2 sm:mb-3">
                  <div className="bg-primary/10 p-2 sm:p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <h2 className="ml-3 sm:ml-4 text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
                    {t("location")}
                  </h2>
                </div>
                <p className="text-gray-600 mb-2 sm:mb-3">
                  Ministry of Economy and Finance of Cambodia
                  <br />
                  Phnom Penh, Cambodia
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Office Hours: Monday - Friday, 8:00 AM - 5:00 PM
                </p>
              </div>
              {/* Embedded Map */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden h-64 sm:h-80 md:h-96 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.653950427408!2d104.91803867607724!3d11.57664658862509!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310951434d493e03%3A0xb1a605e9a569ec8b!2sMinistry%20of%20Economy%20and%20Finance%20of%20Cambodia!5e0!3m2!1sen!2skh!4v1769659057617!5m2!1sen!2skh"
                  className="w-full h-full object-cover"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="NSPC Location Map"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
