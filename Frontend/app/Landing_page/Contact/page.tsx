"use client";
import React, { useState } from "react";
import { Phone, Mail, MapPin, Facebook, Send } from "lucide-react";
import Header from "@/app/components/Header";
import Navigation from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";

export default function Contact() {
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
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2)
          return "Name must be at least 2 characters";
        if (value.trim().length > 100)
          return "Name must be less than 100 characters";
        return "";

      case "email":
        if (!value.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value))
          return "Please enter a valid email address";
        return "";

      case "subject":
        if (!value.trim()) return "Subject is required";
        if (value.trim().length < 5)
          return "Subject must be at least 5 characters";
        if (value.trim().length > 200)
          return "Subject must be less than 200 characters";
        return "";

      case "message":
        if (!value.trim()) return "Message is required";
        if (value.trim().length < 10)
          return "Message must be at least 10 characters";
        if (value.trim().length > 1000)
          return "Message must be less than 1000 characters";
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
        message: "Please fill the form before submitting.",
      });
      return;
    }

    // Simulate form submission
    setTimeout(() => {
      setSubmitStatus({
        type: "success",
        message: "Thank you for your message! We'll get back to you soon.",
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-32 md:pt-40">
        {/* Header Section */}
        <div className="bg-primary text-white py-16 animate-fade-in">
          <div className="container mx-auto px-4">
            <h1 className="text-fluid-4xl md:text-fluid-5xl font-bold text-center mb-4 animate-slide-down">
              Get in Touch
            </h1>
            <p className="text-fluid-xl text-center text-white/80 max-w-2xl mx-auto animate-slide-up">
              We'd love to hear from you. Send us a message and we'll respond as
              soon as possible.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Contact Information Cards */}
            <div
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="ml-4 text-fluid-xl font-semibold">Phone</h3>
              </div>
              <p className="text-gray-600">+855 23 xxx xxx</p>
              <p className="text-gray-600">+855 12 xxx xxx</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="ml-4 text-fluid-xl font-semibold">Email</h3>
              </div>
              <p className="text-gray-600">info@nspc.gov.kh</p>
              <p className="text-gray-600">contact@nspc.gov.kh</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Facebook className="w-6 h-6 text-primary" />
                </div>
                <h3 className="ml-4 text-fluid-xl font-semibold">
                  Social Media
                </h3>
              </div>
              <a
                href="https://www.facebook.com/CAMNSPC/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                facebook.com/NSPC
              </a>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Feedback Form */}
            <div
              className="bg-white p-8 rounded-lg shadow-md animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <h2 className="text-fluid-3xl font-bold mb-6 text-gray-800">
                Send a Messages
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-fluid-sm font-medium text-gray-700 mb-2"
                  >
                    Full Name <span className="text-red-600">*</span>
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
                    placeholder="John Doe"
                  />
                  <div className="h-6 mt-1">
                    {errors.name && touched.name && (
                      <p className="text-fluid-sm text-red-600 animate-fade-in">
                        {errors.name}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-fluid-sm font-medium text-gray-700 mb-2"
                  >
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${
                      errors.email && touched.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="john@example.com"
                  />
                  <div className="h-6 mt-1">
                    {errors.email && touched.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-fluid-sm font-medium text-gray-700 mb-2"
                  >
                    Subject <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${
                      errors.subject && touched.subject
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="How can we help you?"
                  />
                  <div className="h-6 mt-1">
                    {errors.subject && touched.subject && (
                      <p className="text-sm text-red-600">{errors.subject}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-fluid-sm font-medium text-gray-700 mb-2"
                  >
                    Message <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={5}
                    maxLength={1000}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none ${
                      errors.message && touched.message
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Tell us more about your inquiry..."
                  />
                  <div className="flex justify-between items-start mt-1 min-h-[1.5rem]">
                    <div className="flex-1">
                      {errors.message && touched.message && (
                        <p className="text-sm text-red-600">{errors.message}</p>
                      )}
                    </div>
                    <p
                      className={`text-sm ${formData.message.length > 950 ? "text-orange-600 font-semibold" : "text-gray-500"}`}
                    >
                      {formData.message.length}/1000
                    </p>
                  </div>
                </div>

                {submitStatus.type && (
                  <div
                    className={`p-4 rounded-lg flex items-center gap-3 animate-slide-down ${
                      submitStatus.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {submitStatus.type === "success" ? (
                      <svg
                        className="w-6 h-6 text-green-600 flex-shrink-0"
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
                    ) : (
                      <svg
                        className="w-6 h-6 text-red-600 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                    <span>{submitStatus.message}</span>
                  </div>
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map and Address Section */}
            <div
              className="space-y-6 animate-fade-in-up"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="ml-4 text-fluid-2xl font-bold text-gray-800">
                    Our Location
                  </h2>
                </div>
                <p className="text-gray-600 mb-4">
                  National Social Protection Council (NSPC)
                  <br />
                  Phnom Penh, Cambodia
                </p>
                <p className="text-fluid-sm text-gray-500">
                  Office Hours: Monday - Friday, 8:00 AM - 5:00 PM
                </p>
              </div>

              {/* Embedded Map */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden h-96">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.653950427408!2d104.91803867607724!3d11.57664658862509!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310951434d493e03%3A0xb1a605e9a569ec8b!2sMinistry%20of%20Economy%20and%20Finance%20of%20Cambodia!5e0!3m2!1sen!2skh!4v1769659057617!5m2!1sen!2skh"
                  width="100%"
                  height="100%"
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
