"use client";

import Header from "@/app/components/Home/Header";
import Navigation from "@/app/components/Home/Navigation";
import Footer from "@/app/components/Home/Footer";
import HeroCover from "@/app/components/HeroCover";
import SocialContentRenderer from "@/app/components/Resource/SocialContentRenderer";
import { ContentSection, SocialTopic } from "@/app/data/socialContent";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

// Helper to map API section to the format expected by the renderer
function mapApiSections(apiSections: any[]): ContentSection[] {
  if (!apiSections || !Array.isArray(apiSections)) return [];
  return apiSections.map((s) => {
    let image: ContentSection["image"] = undefined;
    let images: ContentSection["images"] = undefined;

    if (s.media && s.media.length > 0) {
      if (s.media.length === 1) {
        image = {
          src: s.media[0].publicUrl,
          alt: s.media[0].alt || "",
          caption: s.media[0].caption,
          position: (s.media[0].position || "top") as any,
        };
      } else {
        images = s.media.map((m: any) => ({
          src: m.publicUrl,
          alt: m.alt || "",
          caption: m.caption,
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
function mapApiTopicToRenderer(apiTopic: any): SocialTopic {
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
      ? apiTopic.referencesKm.map((ref: any) => ({
          title: ref.title || "Document.pdf",
          publicUrl: ref.publicUrl,
          fileSizeBytes: ref.fileSizeBytes,
        }))
      : [],
    referenceFilesEn: Array.isArray(apiTopic.referencesEn)
      ? apiTopic.referencesEn.map((ref: any) => ({
          title: ref.title || "Document.pdf",
          publicUrl: ref.publicUrl,
          fileSizeBytes: ref.fileSizeBytes,
        }))
      : [],
    sections: mapApiSections(apiTopic.sections),
  };
}

export default function Social() {
  const t = useTranslations("SocialPage");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL params for initial state
  const urlTopic = searchParams.get("topic");

  const [topicsSummary, setTopicsSummary] = useState<any[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    urlTopic || "governance",
  );
  const [topicData, setTopicData] = useState<SocialTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [animating, setAnimating] = useState(false);

  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInternalNavigation = useRef(false);
  const prevUrlRef = useRef({ topic: urlTopic });

  // 1. Fetch topics list
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
        const res = await axios.get(
          `${apiUrl}/api/public/social/topics?lang=${locale}`,
        );
        setTopicsSummary(res.data);
        if (res.data.length > 0 && !urlTopic) {
          setSelectedTopicId(res.data[0].slug);
        }
      } catch (err) {
        console.error("Failed to load topics", err);
        setError("Failed to load topics");
      }
    };
    fetchTopics();
  }, [locale, urlTopic]);

  // 2. Fetch specific topic content when selectedTopicId changes
  useEffect(() => {
    if (!selectedTopicId) return;

    const fetchTopicData = async () => {
      setLoading(true);
      setError("");
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
        const res = await axios.get(
          `${apiUrl}/api/public/social/topics/${selectedTopicId}?lang=${locale}`,
        );
        setTopicData(mapApiTopicToRenderer(res.data));
      } catch (err) {
        console.error("Failed to load topic details", err);
        setError("Failed to load topic details");
      } finally {
        setLoading(false);
      }
    };

    fetchTopicData();
  }, [selectedTopicId, locale]);

  // Update state when URL params change (e.g., from navbar)
  useEffect(() => {
    // Check if URL actually changed
    const urlChanged = prevUrlRef.current.topic !== urlTopic;

    if (urlChanged && !isInternalNavigation.current) {
      const newTopicId =
        urlTopic ||
        (topicsSummary.length > 0 ? topicsSummary[0].slug : "governance");
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
        router.replace(`/Landing-page/Resources/Social?${params.toString()}`, {
          scroll: false,
        });
      }, 220);
    },
    [selectedTopicId, animating, router],
  );

  const selectedIndex = topicsSummary.findIndex(
    (t) => t.slug === selectedTopicId,
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
    return <SocialContentRenderer topic={topicData} showHeader={false} />;
  }, [topicData, loading, error]);

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
                    // Map topic slug to translation key
                    const tabKey =
                      topic.slug === "governance"
                        ? "governance"
                        : topic.slug === "assistance"
                          ? "assistance"
                          : "security";
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
                        <span>{t(`tabs.${tabKey}`)}</span>
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
