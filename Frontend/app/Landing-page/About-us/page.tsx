"use client";

import Header from "@/app/components/Home/Header";
import Navigation from "@/app/components/Home/Navigation";
import Footer from "@/app/components/Home/Footer";
import HeroCover from "@/app/components/HeroCover";
import AboutContentRenderer from "@/app/components/About/AboutContentRenderer";
import { aboutContent, AboutTopic } from "@/app/data/aboutContent";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";

const mainTopics = [
  aboutContent.national,
  aboutContent.executive,
  aboutContent.general,
];

export default function AboutUs() {
  const t = useTranslations("AboutUsPage");
  const locale = useLocale() as "en" | "kh";
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL params for initial state
  const urlTopic = searchParams.get("topic");
  const urlSubtopic = searchParams.get("subtopic");

  const [selectedMainId, setSelectedMainId] = useState<string>(
    urlTopic || (mainTopics[0]?.id ?? ""),
  );
  const [selectedSubId, setSelectedSubId] = useState<string | null>(
    urlSubtopic || null,
  );
  const [animating, setAnimating] = useState(false);

  const mainTabsRef = useRef<HTMLDivElement>(null);
  const subTabsRef = useRef<HTMLDivElement>(null);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInternalNavigation = useRef(false);
  const prevUrlRef = useRef({ topic: urlTopic, subtopic: urlSubtopic });

  const selectedMain = mainTopics.find((t) => t.id === selectedMainId) ?? null;
  const selectedMainIndex = mainTopics.findIndex(
    (t) => t.id === selectedMainId,
  );

  // If the selected main topic has sub-topics, show the first one by default
  const subTopics = useMemo(
    () => selectedMain?.subTopics || [],
    [selectedMain],
  );
  const effectiveSubId = selectedSubId || subTopics[0]?.id || null;
  const selectedSubIndex = subTopics.findIndex((t) => t.id === effectiveSubId);

  // Update state when URL params change (e.g., from navbar)
  useEffect(() => {
    // Check if URL actually changed
    const urlChanged =
      prevUrlRef.current.topic !== urlTopic ||
      prevUrlRef.current.subtopic !== urlSubtopic;

    if (urlChanged && !isInternalNavigation.current) {
      const newMainId = urlTopic || mainTopics[0]?.id || "";
      const newSubId = urlSubtopic || null;

      setSelectedMainId(newMainId);
      setSelectedSubId(newSubId);
    }

    // Reset the flag and update previous URL
    isInternalNavigation.current = false;
    prevUrlRef.current = { topic: urlTopic, subtopic: urlSubtopic };
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  const handleMainTabChange = useCallback(
    (id: string) => {
      if (id === selectedMainId || animating) return;
      setAnimating(true);
      isInternalNavigation.current = true;
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
      animationTimerRef.current = setTimeout(() => {
        setSelectedMainId(id);
        setSelectedSubId(null); // Reset sub-tab when changing main tab
        setAnimating(false);

        // Update URL after state change
        const params = new URLSearchParams();
        params.set("topic", id);
        // Get the first subtopic of the new main topic if it has subtopics
        const newMain = mainTopics.find((t) => t.id === id);
        if (newMain?.subTopics && newMain.subTopics.length > 0) {
          params.set("subtopic", newMain.subTopics[0].id);
        }
        router.replace(`/Landing-page/About-us?${params.toString()}`, {
          scroll: false,
        });
      }, 220);
    },
    [selectedMainId, animating, router],
  );

  const handleSubTabChange = useCallback(
    (id: string) => {
      if (id === effectiveSubId || animating) return;
      setAnimating(true);
      isInternalNavigation.current = true;
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
      animationTimerRef.current = setTimeout(() => {
        setSelectedSubId(id);
        setAnimating(false);

        // Update URL after state change
        const params = new URLSearchParams();
        params.set("topic", selectedMainId);
        params.set("subtopic", id);
        router.replace(`/Landing-page/About-us?${params.toString()}`, {
          scroll: false,
        });
      }, 220);
    },
    [effectiveSubId, animating, selectedMainId, router],
  );

  // Keyboard navigation for main tabs
  const handleMainKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        handleMainTabChange(mainTopics[index - 1].id);
        setTimeout(() => {
          mainTabsRef.current
            ?.querySelectorAll<HTMLButtonElement>("button")
            [index - 1]?.focus();
        }, 0);
      } else if (e.key === "ArrowRight" && index < mainTopics.length - 1) {
        e.preventDefault();
        handleMainTabChange(mainTopics[index + 1].id);
        setTimeout(() => {
          mainTabsRef.current
            ?.querySelectorAll<HTMLButtonElement>("button")
            [index + 1]?.focus();
        }, 0);
      }
    },
    [handleMainTabChange],
  );

  // Keyboard navigation for sub tabs
  const handleSubKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        handleSubTabChange(subTopics[index - 1].id);
        setTimeout(() => {
          subTabsRef.current
            ?.querySelectorAll<HTMLButtonElement>("button")
            [index - 1]?.focus();
        }, 0);
      } else if (e.key === "ArrowRight" && index < subTopics.length - 1) {
        e.preventDefault();
        handleSubTabChange(subTopics[index + 1].id);
        setTimeout(() => {
          subTabsRef.current
            ?.querySelectorAll<HTMLButtonElement>("button")
            [index + 1]?.focus();
        }, 0);
      }
    },
    [handleSubTabChange, subTopics],
  );

  const renderContent = useCallback(() => {
    if (!selectedMain) return null;

    // If main topic has sub-topics, use AboutContentRenderer for the selected sub-topic
    if (selectedMain.hasSubTopics && subTopics.length > 0) {
      const selectedSubTopic = subTopics.find((st) => st.id === effectiveSubId);
      if (!selectedSubTopic) return null;

      // Convert subtopic to topic format for AboutContentRenderer
      const subTopicAsTopic: AboutTopic = {
        id: selectedSubTopic.id,
        title: selectedSubTopic.title,
        subtitle: selectedSubTopic.subtitle,
        sections: selectedSubTopic.sections,
        reference: selectedSubTopic.reference || selectedMain.reference,
      };

      return <AboutContentRenderer topic={subTopicAsTopic} showHeader={true} />;
    }

    // Otherwise, render the main topic content
    return <AboutContentRenderer topic={selectedMain} showHeader={true} />;
  }, [selectedMain, subTopics, effectiveSubId]);

  return (
    <>
      <Header />
      <Navigation />
      <div aria-hidden="true" className="h-24 sm:h-24 md:h-24 lg:h-28" />

      <div className="min-h-screen bg-white">
        <div className="relative w-full animate-fade-in overflow-hidden">
          <HeroCover
            image="/about.svg"
            title={t("hero.title")}
            subtitle={t("hero.subtitle")}
          />
        </div>

        <div className="min-h-screen bg-gray-50/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-7xl mx-auto">
              {/* ── Main Tab Bar ── */}
              <div
                ref={mainTabsRef}
                role="tablist"
                aria-label={t("aria.mainTabs")}
                className="relative flex mt-4 bg-gray-100 rounded-2xl p-1 sm:p-1.5 shadow-inner mb-0 mx-auto max-w-4xl w-full"
              >
                {/* Sliding background pill */}
                <div
                  className="absolute top-1.5 bottom-1.5 rounded-xl bg-white shadow-md transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  style={{
                    width: `calc(${100 / mainTopics.length}% - ${mainTopics.length > 2 ? "3px" : "4px"})`,
                    left: `calc(${selectedMainIndex * (100 / mainTopics.length)}% + ${mainTopics.length > 2 ? "2px" : "4px"})`,
                  }}
                />

                {mainTopics.map((topic, index) => {
                  const isActive = topic.id === selectedMainId;
                  return (
                    <button
                      key={topic.id}
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`tabpanel-${topic.id}`}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => handleMainTabChange(topic.id)}
                      onKeyDown={(e) => handleMainKeyDown(e, index)}
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
                      <span>{t(`tabs.${topic.id}`)}</span>
                    </button>
                  );
                })}
              </div>

              {/* ── Sub Tab Bar (if applicable) ── */}
              {selectedMain?.hasSubTopics && subTopics.length > 0 && (
                <>
                  {/* Sub tabs */}
                  <div
                    ref={subTabsRef}
                    role="tablist"
                    aria-label={t("aria.subTabs")}
                    className="flex justify-center gap-2 sm:gap-3 mt-5 mb-0 mx-auto max-w-3xl w-full px-4"
                  >
                    {subTopics.map((subTopic, index) => {
                      const isActive = subTopic.id === effectiveSubId;
                      return (
                        <button
                          key={subTopic.id}
                          role="tab"
                          aria-selected={isActive}
                          aria-controls={`tabpanel-${subTopic.id}`}
                          tabIndex={isActive ? 0 : -1}
                          onClick={() => handleSubTabChange(subTopic.id)}
                          onKeyDown={(e) => handleSubKeyDown(e, index)}
                          className={`
                            flex items-center justify-center gap-2
                            py-2 px-4 sm:py-2.5 sm:px-5 md:py-3 md:px-6
                            rounded-full text-[0.7rem] sm:text-xs md:text-sm font-semibold
                            transition-all duration-300 ease-in-out select-none
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2
                            ${
                              isActive
                                ? "bg-primary text-white shadow-md shadow-primary/30 scale-105"
                                : "bg-white text-gray-700 border-2 border-gray-300 hover:border-primary/60 hover:text-primary hover:shadow-sm"
                            }
                          `}
                        >
                          <span>
                            {t(`subTabs.${selectedMainId}.${subTopic.id}`)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* ── Tab Content Card ── */}
              <div className="mt-5 relative overflow-hidden">
                <div
                  key={`${selectedMainId}-${effectiveSubId}`}
                  role="tabpanel"
                  id={`tabpanel-${effectiveSubId || selectedMainId}`}
                  aria-labelledby={effectiveSubId || selectedMainId}
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
