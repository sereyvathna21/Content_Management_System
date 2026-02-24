"use client";

import Header from "@/app/components/Header";
import Navigation from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import HeroCover from "@/app/components/HeroCover";
import SocialContentRenderer from "@/app/components/SocialContentRenderer";
import { socialContent } from "@/app/data/socialContent";
import { useState } from "react";
import { useTranslations } from "next-intl";

const topics = [
  socialContent.governance,
  socialContent.assistance,
  socialContent.security,
];

export default function Social() {
  const t = useTranslations("SocialPage");
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    topics[0]?.id ?? "",
  );
  const [prevTopicId, setPrevTopicId] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);

  const selectedTopic = topics.find((t) => t.id === selectedTopicId) ?? null;
  const selectedIndex = topics.findIndex((t) => t.id === selectedTopicId);

  const handleTabChange = (id: string) => {
    if (id === selectedTopicId || animating) return;
    setPrevTopicId(selectedTopicId);
    setAnimating(true);
    setTimeout(() => {
      setSelectedTopicId(id);
      setAnimating(false);
    }, 220);
  };

  const renderContent = () => {
    const topic = topics.find((t) => t.id === selectedTopicId);
    if (!topic) return null;
    return <SocialContentRenderer topic={topic} showHeader={false} />;
  };

  return (
    <>
      <Header />
      <Navigation />
      <div aria-hidden="true" className="h-24 sm:h-24 md:h-24 lg:h-28" />

      <div className="min-h-screen bg-white">
        <div className="relative w-full animate-fade-in overflow-hidden">
          <HeroCover
            image="/social.svg"
            title={t("hero.title")}
            subtitle={t("hero.subtitle")}
          />
        </div>

        <div className="min-h-screen bg-gray-50/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-7xl mx-auto">
              {/* ── Connected Tab Bar ── */}
              <div className="relative flex mt-4 bg-gray-100 rounded-2xl p-1.5 shadow-inner mb-0 mx-auto max-w-4xl w-full">
                {/* Sliding background pill */}
                <div
                  className="absolute top-1.5 bottom-1.5 rounded-xl bg-white shadow-md transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  style={{
                    width: `calc(${100 / topics.length}% - 4px)`,
                    left: `calc(${selectedIndex * (100 / topics.length)}% + 4px)`,
                  }}
                />

                {topics.map((topic) => {
                  const isActive = topic.id === selectedTopicId;
                  // Map topic id to translation key
                  const tabKey =
                    topic.id === "governance"
                      ? "governance"
                      : topic.id === "assistance"
                        ? "assistance"
                        : "security";
                  return (
                    <button
                      key={topic.id}
                      onClick={() => handleTabChange(topic.id)}
                      className={`
                        relative z-10 flex-1 flex items-center justify-center gap-2
                        py-3 px-4 rounded-xl text-sm font-semibold
                        transition-colors duration-300 ease-in-out select-none
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
                        ${
                          isActive
                            ? "text-primary"
                            : "text-gray-500 hover:text-gray-700"
                        }
                      `}
                    >
                      <span>{t(`tabs.${tabKey}`)}</span>
                    </button>
                  );
                })}
              </div>

              {/* Connector line between tab bar and card */}
              <div
                className="relative mx-auto transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] h-0"
                style={{
                  width: `calc(${100 / topics.length}% - 24px)`,
                  marginLeft: `calc(${selectedIndex * (100 / topics.length)}% + 12px)`,
                }}
              >
                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-px h-4 bg-gray-200" />
                <div className="absolute left-1/2 -translate-x-1/2 top-3 w-2 h-2 rounded-full bg-gray-300" />
              </div>

              {/* ── Tab Content Card ── */}
              <div className="mt-5 relative overflow-hidden">
                <div
                  key={selectedTopicId}
                  className={`
                    bg-white rounded-2xl shadow-lg border border-gray-100
                    transition-all
                    ${
                      animating
                        ? "opacity-0 translate-y-2 scale-[0.99]"
                        : "opacity-100 translate-y-0 scale-100"
                    }
                  `}
                  style={{
                    transition: "opacity 220ms ease, transform 220ms ease",
                  }}
                >
                  <div className="p-8 lg:p-12">{renderContent()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
