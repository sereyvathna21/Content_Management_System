import Header from "@/app/components/Home/Header";
import Navigation from "@/app/components/Home/Navigation";
import HeroSection from "@/app/components/Home/HeroSection";
import AboutSection from "@/app/components/Home/AboutSection";
import ObjectivesSection from "@/app/components/Home/ObjectivesSection";
import NewsSection from "@/app/components/Home/NewsSection";
import Footer from "@/app/components/Home/Footer";
import GoalsSection from "@/app/components/Home/GoalsSection";
import VisionSection from "@/app/components/Home/VisionSection";
import PartnerSection from "@/app/components/Home/PartnerSection";
import { useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("SEO.pages.home");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function Home() {
  const locale = useLocale();
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Navigation />
      <HeroSection />
      <AboutSection />
      <VisionSection />
      <GoalsSection />
      <ObjectivesSection />
      <NewsSection locale={locale} />
      <PartnerSection />
      <Footer />
    </div>
  );
}
