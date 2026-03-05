"use client";

import Header from "@/app/components/Home/Header";
import Navigation from "@/app/components/Home/Navigation";
import Footer from "@/app/components/Home/Footer";
import HeroCover from "@/app/components/HeroCover";
import SocialContentRenderer from "@/app/components/Resource/SocialContentRenderer";
import { socialContent } from "@/app/data/socialContent";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";

const topics = [
  socialContent.governance,
  socialContent.assistance,
  socialContent.security,
];

export default function Social() {
  const t = useTranslations("SocialPage");
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL params for initial state
  const urlTopic = searchParams.get("topic");

  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    urlTopic || (topics[0]?.id ?? ""),
  );
  const [animating, setAnimating] = useState(false);

  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInternalNavigation = useRef(false);
  const prevUrlRef = useRef({ topic: urlTopic });

  const selectedTopic = topics.find((t) => t.id === selectedTopicId) ?? null;
  const selectedIndex = topics.findIndex((t) => t.id === selectedTopicId);

  // Update state when URL params change (e.g., from navbar)
  useEffect(() => {
    // Check if URL actually changed
    const urlChanged = prevUrlRef.current.topic !== urlTopic;

    if (urlChanged && !isInternalNavigation.current) {
      const newTopicId = urlTopic || topics[0]?.id || "";
      setSelectedTopicId(newTopicId);
    }

    // Reset the flag and update previous URL
    isInternalNavigation.current = false;
    prevUrlRef.current = { topic: urlTopic };
  }, [urlTopic]);

  // Cleanup animation timer on unmount
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  const handleTabChange = useCallback(
    (id: string) => {
      if (id === selectedTopicId || animating) return;
      setAnimating(true);
      isInternalNavigation.current = true;
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
      animationTimerRef.current = setTimeout(() => {
        setSelectedTopicId(id);
        setAnimating(false);

        // Update URL after state change
        const params = new URLSearchParams();
        params.set("topic", id);
        router.replace(`/Landing-page/Resources/Social?${params.toString()}`, {
          scroll: false,
        });
      }, 220);
    },
    [selectedTopicId, animating, router],
  );

  const renderContent = useCallback(() => {
    const topic = topics.find((t) => t.id === selectedTopicId);
    if (!topic) return null;
    return <SocialContentRenderer topic={topic} showHeader={false} />;
  }, [selectedTopicId]);

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
              <div className="relative flex mt-4 bg-gray-100 rounded-2xl p-1 sm:p-1.5 shadow-inner mb-0 mx-auto max-w-4xl w-full">
                {/* Sliding background pill */}
                <div
                  className="absolute top-1.5 bottom-1.5 rounded-xl bg-white shadow-md transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  style={{
                    width: `calc(${100 / topics.length}% - ${topics.length > 2 ? "3px" : "4px"})`,
                    left: `calc(${selectedIndex * (100 / topics.length)}% + ${topics.length > 2 ? "2px" : "4px"})`,
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
                        py-2.5 px-3 sm:py-3 sm:px-4 md:py-3.5 md:px-5
                        rounded-xl text-xs sm:text-sm md:text-base font-semibold
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
                className="relative mx-auto transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] h-0 hidden sm:block"
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
                  <div className="p-6 sm:p-8 lg:p-12">{renderContent()}</div>
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
