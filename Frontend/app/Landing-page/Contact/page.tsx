"use client";
import React, { useState, useRef, useEffect } from "react";
import { Phone, Mail, MapPin, Facebook, Send, Copy, CheckCircle2, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import Header from "@/app/components/Home/Header";
import Navigation from "@/app/components/Home/Navigation";
import Footer from "@/app/components/Home/Footer";
import FormAlert from "@/app/components/FormAlert";
import HeroCover from "@/app/components/HeroCover";
import ReCAPTCHA from "react-google-recaptcha";

export default function Contact() {
  const t = useTranslations("ContactPage");

  const getDefaultApiBase = () => {
    if (typeof window === "undefined")
      return (
        (process.env.NEXT_PUBLIC_API_URL as string) || "http://localhost:5001"
      );
    const env = (process.env.NEXT_PUBLIC_API_URL as string) || "";
    if (env) return env;
    return window.location.protocol === "https:"
      ? "https://localhost:7177"
      : "http://localhost:5001";
  };

  const API_BASE = getDefaultApiBase();

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
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | "warning" | null;
    message: string;
  }>({ type: null, message: "" });

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const subjectDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (subjectDropdownRef.current && !subjectDropdownRef.current.contains(event.target as Node)) {
        setIsSubjectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const subjectOptions = [
    { value: "General Inquiry", label: t("form.subjectGeneral") },
    { value: "Technical Support", label: t("form.subjectTechnical") },
    { value: "Feedback", label: t("form.subjectFeedback") },
    { value: "Partnership", label: t("form.subjectPartnership") },
    { value: "Other", label: t("form.subjectOther") }
  ];
  const selectedSubjectOption = subjectOptions.find(o => o.value === formData.subject);

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

    let currentToken = recaptchaToken;
    if (!currentToken) {
      try {
        currentToken = await recaptchaRef.current?.executeAsync() || null;
        if (currentToken) {
          setRecaptchaToken(currentToken);
        }
      } catch (err) {
        setIsSubmitting(false);
        setSubmitStatus({
          type: "error",
          message: "CAPTCHA verification failed. Please try again.",
        });
        return;
      }
    }

    if (!currentToken) {
      setIsSubmitting(false);
      setSubmitStatus({
        type: "error",
        message: t("form.captchaRequired") || "Please complete the CAPTCHA.",
      });
      return;
    }

    // Simulate form submission
    try {
      const payload = { ...formData, recaptchaToken: currentToken };
      const resp = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        setSubmitStatus({
          type: "error",
          message: errText || t("form.errorMessage"),
        });
        setIsSubmitting(false);
        return;
      }

      setSubmitStatus({ type: "success", message: t("form.successMessage") });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setErrors({ name: "", email: "", subject: "", message: "" });
      setTouched({ name: false, email: false, subject: false, message: false });
      setRecaptchaToken(null);
      recaptchaRef.current?.reset();
    } catch {
      setSubmitStatus({ type: "error", message: t("form.errorMessage") });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`.grecaptcha-badge { visibility: hidden !important; }`}</style>
      <Header />
      <Navigation />
      <div aria-hidden="true" className="h-24 sm:h-24 md:h-24 lg:h-28" />
      <div className="min-h-screen bg-white">
        <div className="relative w-full animate-fade-in overflow-hidden">
          <HeroCover
            image="/contact.svg"
            title={t("title")}
            subtitle={t("subtitle")}
          />
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
              <div className="space-y-2">
                <div className="flex items-center justify-between group/item">
                  <a href="tel:+855061701111" className="text-gray-600 hover:text-primary transition-colors">+855 061 701 111</a>
                  <button onClick={() => handleCopy("+855061701111", "phone1")} className="opacity-0 group-hover/item:opacity-100 p-1 text-gray-400 hover:text-primary transition-all" title="Copy to clipboard">
                    {copiedField === "phone1" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between group/item">
                  <a href="tel:+8550967011111" className="text-gray-600 hover:text-primary transition-colors">+855 096 701 1111</a>
                  <button onClick={() => handleCopy("+8550967011111", "phone2")} className="opacity-0 group-hover/item:opacity-100 p-1 text-gray-400 hover:text-primary transition-all" title="Copy to clipboard">
                    {copiedField === "phone2" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
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
              <div className="space-y-2">
                <div className="flex items-center justify-between group/item">
                  <a href="mailto:info@nspc.gov.kh" className="text-gray-600 hover:text-primary transition-colors">info@nspc.gov.kh</a>
                  <button onClick={() => handleCopy("info@nspc.gov.kh", "email1")} className="opacity-0 group-hover/item:opacity-100 p-1 text-gray-400 hover:text-primary transition-all" title="Copy to clipboard">
                    {copiedField === "email1" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between group/item">
                  <a href="mailto:contact@nspc.gov.kh" className="text-gray-600 hover:text-primary transition-colors">contact@nspc.gov.kh</a>
                  <button onClick={() => handleCopy("contact@nspc.gov.kh", "email2")} className="opacity-0 group-hover/item:opacity-100 p-1 text-gray-400 hover:text-primary transition-all" title="Copy to clipboard">
                    {copiedField === "email2" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
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
                    className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
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
                    className={`w-full px-4 py-3 text-base sm:text-lg border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-300 focus:scale-[1.02] ${
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
                    className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
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
                    className={`w-full px-4 py-3 text-base sm:text-lg border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-300 focus:scale-[1.02] ${
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
                    className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
                  >
                    {t("form.subject")} <span className="text-red-600">*</span>
                  </label>
                  <div className="relative" ref={subjectDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsSubjectOpen(!isSubjectOpen)}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, subject: true }));
                        const error = validateField("subject", formData.subject);
                        setErrors((prev) => ({ ...prev, subject: error }));
                      }}
                      className={`w-full px-4 py-3 text-base sm:text-lg border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-300 bg-white text-left flex justify-between items-center focus:scale-[1.02] ${
                        errors.subject && touched.subject
                          ? "border-red-500 focus:ring-red-500 animate-shake"
                          : "border-gray-300"
                      }`}
                    >
                      <span className={formData.subject ? "text-gray-900" : "text-gray-400"}>
                        {selectedSubjectOption ? selectedSubjectOption.label : t("form.subjectPlaceholder")}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isSubjectOpen ? "rotate-180" : ""}`} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className={`absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden transition-all duration-200 origin-top ${
                      isSubjectOpen ? "opacity-100 scale-100 translate-y-0 visible" : "opacity-0 scale-95 -translate-y-2 invisible"
                    }`}>
                      <ul className="py-1">
                        {subjectOptions.map((option) => (
                          <li key={option.value}>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, subject: option.value }));
                                setIsSubjectOpen(false);
                                if (touched.subject) {
                                  const error = validateField("subject", option.value);
                                  setErrors(prev => ({ ...prev, subject: error }));
                                }
                              }}
                              className={`w-full text-left px-4 py-3 text-base sm:text-lg hover:bg-primary/5 hover:text-primary transition-colors ${
                                formData.subject === option.value ? "bg-primary/10 text-primary font-medium" : "text-gray-700"
                              }`}
                            >
                              {option.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
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
                    className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
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
                    className={`w-full px-4 py-3 text-base sm:text-lg border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-300 resize-none focus:scale-[1.02] ${
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

                <ReCAPTCHA
                  ref={recaptchaRef}
                  size="invisible"
                  badge="bottomright"
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                  onChange={(token) => setRecaptchaToken(token)}
                />

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
                <p className="text-[10px] sm:text-xs text-gray-400 text-center mt-4">
                  {t("recaptchaDisclaimer")}{" "}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{t("privacyPolicy")}</a> {" & "} 
                  <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{t("termsOfService")}</a>{" "}
                  {t("apply")}
                </p>
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
                  {t("contactAddressTitle")}
                  <br />
                  {t("contactAddressCity")}
                </p>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {t("officeHours")}
                </div>
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
