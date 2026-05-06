"use client";

import SocialContentRenderer from "@/app/components/Resource/SocialContentRenderer";
import { ContentSection, SocialTopic } from "@/app/data/socialContent";
import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
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

    let parsedContent: string | string[] = s.content || "";
    if (typeof s.content === "string" && s.content.includes("\n\n")) {
      parsedContent = s.content.split("\n\n").map((p: string) => p.trim()).filter(Boolean);
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

function mapApiTopicToRenderer(apiTopic: any): SocialTopic {
  return {
    id: apiTopic.slug,
    title: apiTopic.title || "",
    subtitle: apiTopic.subtitle || "",
    category: "Governance",
    reference: apiTopic.reference || "",
    sections: mapApiSections(apiTopic.sections),
  };
}

export default function Governance() {
  const locale = useLocale();
  const [topicData, setTopicData] = useState<SocialTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTopicData = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
        // Fetch specific topic "governance"
        const res = await axios.get(`${apiUrl}/api/public/social/topics/governance?lang=${locale}`);
        setTopicData(mapApiTopicToRenderer(res.data));
      } catch (err) {
        console.error("Failed to load governance topic details", err);
        setError("Failed to load topic details");
      } finally {
        setLoading(false);
      }
    };

    fetchTopicData();
  }, [locale]);

  return (
    <>
      <div aria-hidden="true" className="h-24 sm:h-24 md:h-24 lg:h-28" />

      <div className="min-h-screen bg-white">
        <div className="min-h-screen bg-gray-50/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8 lg:p-12">
              {loading && (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              )}
              {error && (
                <div className="flex justify-center items-center py-20 text-red-500">
                  {error}
                </div>
              )}
              {!loading && !error && topicData && (
                <SocialContentRenderer topic={topicData} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
