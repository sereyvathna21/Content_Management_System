import Header from "@/app/components/Header";
import Navigation from "@/app/components/Navigation";
import HeroSection from "@/app/components/HeroSection";
import AboutSection from "@/app/components/AboutSection";
import ObjectivesSection from "@/app/components/ObjectivesSection";
import NewsSection from "@/app/components/NewsSection";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      <Navigation />
      <HeroSection />
      <AboutSection />
      <ObjectivesSection />
      <NewsSection />
      <Footer />
    </div>
  );
}
