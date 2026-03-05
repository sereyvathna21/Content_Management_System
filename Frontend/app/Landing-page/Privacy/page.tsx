"use client";
import Header from "@/app/components/Home/Header";
import Navigation from "@/app/components/Home/Navigation";
import Footer from "@/app/components/Home/Footer";
import HeroCover from "@/app/components/HeroCover";
import { useLocale, useMessages } from "next-intl";

const LAST_UPDATED = "March 3, 2026";
const CONTACT_EMAIL = "info@nspc.gov.kh";
const CONTACT_ADDRESS =
  "National Social Protection Council, Phnom Penh, Kingdom of Cambodia";

interface Section {
  title: string;
  content: React.ReactNode;
}

export default function PrivacyPolicy() {
  const locale = useLocale();
  const messages = useMessages();
  const legal = (messages?.Legal?.Privacy as any) || {};
  const heroTitle =
    legal?.hero?.title || (locale === "kh" ? "គោលការណ៍ឯកជន" : "Privacy Policy");
  const heroSubtitle =
    legal?.hero?.subtitle ||
    (locale === "kh"
      ? "របៀបដែលយើងប្រមូល ប្រើ និងការពារព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នក"
      : "How we collect, use, and protect your personal information");
  const sections = (legal?.sections || []) as Array<{
    title: string;
    content: string;
  }>;
  return (
    <>
      <Header />
      <Navigation />
      <div aria-hidden="true" className="h-24 sm:h-24 md:h-24 lg:h-28" />
      <div className="min-h-screen bg-white">
        <div className="relative w-full animate-fade-in overflow-hidden">
          <HeroCover
            image="/news.svg"
            title={heroTitle}
            subtitle={heroSubtitle}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-10 sm:py-14 lg:py-16">
          <p className="text-sm text-gray-500 mb-8 border-b border-gray-200 pb-4">
            Last Updated: {LAST_UPDATED}
          </p>

          <div className="prose prose-gray max-w-none space-y-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                  {section.title}
                </h2>
                <div
                  className="text-gray-600 leading-relaxed text-sm sm:text-base"
                  dangerouslySetInnerHTML={{ __html: String(section.content) }}
                />
              </section>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
