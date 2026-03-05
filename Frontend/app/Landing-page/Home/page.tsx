import Header from "@/app/components/Header";
import Navigation from "@/app/components/Navigation";
import HeroSection from "@/app/components/HeroSection";
import AboutSection from "@/app/components/AboutSection";
import ObjectivesSection from "@/app/components/ObjectivesSection";
import NewsSection from "@/app/components/NewsSection";
import Footer from "@/app/components/Footer";
import GoalsSection from "@/app/components/GoalsSection";
import VisionSection from "@/app/components/VisionSection";
import PartnerSection from "@/app/components/PartnerSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Navigation />
      <HeroSection />
      <AboutSection />
      <VisionSection />
      <GoalsSection />
      <ObjectivesSection />
      <NewsSection />
      <PartnerSection />
      <Footer />
    </div>
  );
}
