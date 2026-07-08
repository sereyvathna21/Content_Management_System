"use client";

import Header from "@/app/components/Home/Header";
import Navigation from "@/app/components/Home/Navigation";
import Footer from "@/app/components/Home/Footer";
import HeroCover from "@/app/components/HeroCover";
import AboutContentRenderer from "@/app/components/About/AboutContentRenderer";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { ApiAboutSection, ApiAboutTopic, ApiAboutMedia, ApiTopicReference, AboutTopic, AboutContentSection } from "@/types/api";

const publicBackendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const getFullImageUrl = (url: string | null | undefined) => {
  if (!url) return "";
  
  let finalUrl = url;
  if (finalUrl.startsWith("http://backend:5001")) {
    finalUrl = finalUrl.replace("http://backend:5001", publicBackendUrl);
  }

  if (finalUrl.startsWith("http://") || finalUrl.startsWith("https://") || finalUrl.startsWith("data:")) {
    return finalUrl;
  }
  if (finalUrl.startsWith("/")) {
    return `${publicBackendUrl}${finalUrl}`;
  }
  return `${publicBackendUrl}/${finalUrl}`;
};

// Helper to map API section to the format expected by the renderer
function mapApiSections(apiSections: ApiAboutSection[] | undefined): AboutContentSection[] {
  if (!apiSections || !Array.isArray(apiSections)) return [];
  return apiSections.map((s) => {
    let image: AboutContentSection["image"] = undefined;
    let images: AboutContentSection["images"] = undefined;

    const validMedia = Array.isArray(s.media)
      ? s.media.filter(
          (m: ApiAboutMedia) =>
            typeof m?.publicUrl === "string" && m.publicUrl.trim().length > 0,
        )
      : [];

    if (validMedia.length > 0) {
      if (validMedia.length === 1) {
        image = {
          src: getFullImageUrl(validMedia[0].publicUrl),
          alt: validMedia[0].alt || "",
          caption: validMedia[0].caption,
          position: (validMedia[0].position || "top") as "top" | "bottom" | "left" | "right" | "full",
          width: validMedia[0].width || 100,
        };
      } else {
        images = validMedia.map((m: ApiAboutMedia) => ({
          src: getFullImageUrl(m.publicUrl),
          alt: m.alt || "",
          caption: m.caption,
          width: m.width || 100,
        }));
      }
    }

    // Convert markdown/text to string array by splitting newlines
    let parsedContent: string | string[] = s.content || "";
    if (typeof s.content === "string" && s.content.includes("\n\n")) {
      parsedContent = s.content
        .split("\n\n")
        .map((p: string) => p.trim())
        .filter(Boolean);
    }

    return {
      id: s.sectionKey || `section-${s.sortOrder}`,
      title: s.title || "",
      content: parsedContent,
      image,
      images,
      subsections: mapApiSections(s.childSections),
    };
  });
}

// Helper to map API topic to the format expected by the renderer
function mapApiTopicToRenderer(apiTopic: ApiAboutTopic): AboutTopic {
  return {
    id: apiTopic.slug,
    title: apiTopic.title || "",
    subtitle: apiTopic.subtitle || "",
    // Fallbacks since category is not in the current public API
    category:
      apiTopic.slug === "governance"
        ? "Governance"
        : apiTopic.slug === "assistance"
          ? "Assistance"
          : "Security",
    reference: apiTopic.reference || "",
    referenceFilesKm: Array.isArray(apiTopic.referencesKm)
      ? apiTopic.referencesKm.map((ref: ApiTopicReference) => ({
          title: ref.title || "Document.pdf",
          publicUrl: ref.publicUrl,
          fileSizeBytes: ref.fileSizeBytes,
        }))
      : [],
    referenceFilesEn: Array.isArray(apiTopic.referencesEn)
      ? apiTopic.referencesEn.map((ref: ApiTopicReference) => ({
          title: ref.title || "Document.pdf",
          publicUrl: ref.publicUrl,
          fileSizeBytes: ref.fileSizeBytes,
        }))
      : [],
    sections: mapApiSections(apiTopic.sections),
  };
}

export default function About() {
  const t = useTranslations("AboutUsPage");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL params for initial state
  const urlTopic = searchParams.get("topic");

  const [topicsSummary, setTopicsSummary] = useState<{slug: string, title: string}[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    urlTopic || "national",
  );
  const [topicData, setTopicData] = useState<AboutTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [animating, setAnimating] = useState(false);
  const [activeSubTabId, setActiveSubTabId] = useState<string | null>(null);

  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInternalNavigation = useRef(false);
  const prevUrlRef = useRef({ topic: urlTopic });

  const fetchTopics = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const res = await axios.get(
        `${apiUrl}/api/public/about/topics?lang=${locale}`,
        { headers: { "Cache-Control": "no-cache" } },
      );
      setTopicsSummary(res.data);
      if (res.data.length > 0 && !urlTopic) {
        setSelectedTopicId(res.data[0].slug);
      }
    } catch (err) {
      console.error("Failed to load topics", err);
      setError("Failed to load topics");
    }
  }, [locale, urlTopic]);

  const fetchTopicData = useCallback(async () => {
    if (!selectedTopicId) return;

    setLoading(true);
    setError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const res = await axios.get(
        `${apiUrl}/api/public/about/topics/${selectedTopicId}?lang=${locale}`,
        { headers: { "Cache-Control": "no-cache" } },
      );
      setTopicData(mapApiTopicToRenderer(res.data));
    } catch (err) {
      console.error("Failed to load topic details", err);
      setError("Failed to load topic details");
    } finally {
      setLoading(false);
    }
  }, [selectedTopicId, locale]);

  // 1. Fetch topics list
  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // 2. Fetch specific topic content when selectedTopicId changes
  useEffect(() => {
    fetchTopicData();
  }, [fetchTopicData]);

  // 3. Set active sub tab when topic data is loaded
  useEffect(() => {
    if (topicData?.sections && topicData.sections.length > 1) {
        setActiveSubTabId(topicData.sections[0].id);
    } else {
        setActiveSubTabId(null);
    }
  }, [topicData]);

  useEffect(() => {
    const refreshLiveData = () => {
      fetchTopics();
      fetchTopicData();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshLiveData();
      }
    };

    refreshLiveData();
    window.addEventListener("focus", refreshLiveData);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const intervalId = window.setInterval(refreshLiveData, 30000);

    return () => {
      window.removeEventListener("focus", refreshLiveData);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [fetchTopics, fetchTopicData]);

  // Update state when URL params change (e.g., from navbar)
  useEffect(() => {
    // Check if URL actually changed
    const urlChanged = prevUrlRef.current.topic !== urlTopic;

    if (urlChanged && !isInternalNavigation.current) {
      const newTopicId =
        urlTopic ||
        (topicsSummary.length > 0 ? topicsSummary[0].slug : "national");
      setSelectedTopicId(newTopicId);
    }

    // Reset the flag and update previous URL
    isInternalNavigation.current = false;
    prevUrlRef.current = { topic: urlTopic };
  }, [urlTopic, topicsSummary]);

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
        router.replace(`/Landing-page/About-us?${params.toString()}`, {
          scroll: false,
        });
      }, 220);
    },
    [selectedTopicId, animating, router],
  );

  const selectedIndex = topicsSummary.findIndex(
    (t) => t.slug === selectedTopicId,
  );

  const getLocalizedText = useCallback(
    (text?: string | { en: string; kh: string } | null): string => {
      if (!text) return "";
      if (typeof text === "string") return text;
      return text[locale as "en" | "kh"] || text.en || "";
    },
    [locale]
  );

  const renderContent = useCallback(() => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex justify-center items-center py-20 text-red-500">
          {error}
        </div>
      );
    }
    if (!topicData) return null;

    // Filter topicData to only include the active sub-section if we have multiple sections
    const hasMultipleSections = topicData.sections.length > 1;
    const filteredTopicData = hasMultipleSections && activeSubTabId
      ? { ...topicData, sections: topicData.sections.filter(s => s.id === activeSubTabId) }
      : topicData;

    return (
      <div>
        {hasMultipleSections && (
          <div className="relative mb-8 bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
            <div 
              className="flex overflow-x-auto gap-2 sm:gap-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {topicData.sections.map((section) => {
                const isActive = activeSubTabId === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSubTabId(section.id)}
                    className={`whitespace-nowrap px-5 py-2.5 sm:px-6 sm:py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 flex-shrink-0 ${
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 shadow-sm"
                    }`}
                  >
                    {getLocalizedText(section.title) || section.id}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <AboutContentRenderer topic={filteredTopicData} showHeader={false} />
      </div>
    );
  }, [topicData, loading, error, activeSubTabId, getLocalizedText]);

  return (
    <>
      <Header />
      <Navigation />
      <div aria-hidden="true" className="h-24 sm:h-24 md:h-24 lg:h-28" />

      <div className="min-h-screen bg-white">
        <div className="relative w-full animate-fade-in overflow-hidden">
          <HeroCover
            image="/images/image.png"
            title={t("hero.title")}
            subtitle={t("hero.subtitle")}
          />
        </div>

        <div className="min-h-screen bg-gray-50/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-7xl mx-auto">
              {/* ── Connected Tab Bar ── */}
              {topicsSummary.length > 0 && (
                <div className="relative flex mt-4 bg-gray-100 rounded-2xl p-1 sm:p-1.5 shadow-inner mb-0 mx-auto max-w-4xl w-full">
                  {/* Sliding background pill */}
                  {selectedIndex >= 0 && (
                    <div
                      className="absolute top-1.5 bottom-1.5 rounded-xl bg-white shadow-md transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                      style={{
                        width: `calc(${100 / topicsSummary.length}% - ${topicsSummary.length > 2 ? "3px" : "4px"})`,
                        left: `calc(${selectedIndex * (100 / topicsSummary.length)}% + ${topicsSummary.length > 2 ? "2px" : "4px"})`,
                      }}
                    />
                  )}

                  {topicsSummary.map((topic) => {
                    const isActive = topic.slug === selectedTopicId;
                    return (
                      <button
                        key={topic.slug}
                        onClick={() => handleTabChange(topic.slug)}
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
                        <span>{topic.title || t("tabs.security")}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Connector line between tab bar and card */}
              {topicsSummary.length > 0 && selectedIndex >= 0 && (
                <div
                  className="relative mx-auto transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] h-0 hidden sm:block"
                  style={{
                    width: `calc(${100 / topicsSummary.length}% - 24px)`,
                    marginLeft: `calc(${selectedIndex * (100 / topicsSummary.length)}% + 12px)`,
                  }}
                >
                  <div className="absolute left-1/2 -translate-x-1/2 top-0 w-px h-4 bg-gray-200" />
                  <div className="absolute left-1/2 -translate-x-1/2 top-3 w-2 h-2 rounded-full bg-gray-300" />
                </div>
              )}

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
