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
