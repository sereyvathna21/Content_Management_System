"use client";

import Header from "@/app/components/Header";
import Navigation from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { useState } from "react";

const topics = [
  {
    id: "governance",
    title: "Governance",
    subtitle: "Policies, oversight and institutional frameworks for social services.",
    description:
      "Policies, oversight and institutional frameworks for social services.",
    href: "/Landing-page/Resources/Social/Governance",
    category: "Governance",
    image: "/images/landing/governance.jpg",
  },
  {
    id: "assistance",
    title: "Social Assistance",
    subtitle: "Programs and support for vulnerable groups, benefits and services.",
    description:
      "Programs and support for vulnerable groups, benefits and services.",
    href: "/Landing-page/Resources/Social/SocialAssistance",
    category: "Assistance",
    image: "/images/landing/social-assistance.jpg",
  },
  {
    id: "security",
    title: "Social Security",
    subtitle: "Contributory and non-contributory systems: pensions, insurance.",
    description:
      "Contributory and non-contributory systems: pensions, insurance.",
    href: "/Landing-page/Resources/Social/SocialSecurity",
    category: "Security",
    image: "/images/landing/social-security.jpg",
  },
];

export default function Social() {
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

  return (
    <>
      <Header />
      <Navigation />

      <div className="min-h-screen bg-white pt-24 sm:pt-32 md:pt-36 lg:pt-44">
        <div className="bg-primary py-6 sm:py-8 md:py-10 lg:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="fluid-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-2 sm:mb-2 md:mb-3 text-white">
              Social Resources
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-center text-white/90 max-w-2xl mx-auto">
              Explore governance, assistance and social security resources.
            </p>
          </div>
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

                {topics.map((t) => {
                  const isActive = t.id === selectedTopicId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleTabChange(t.id)}
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
                      <span>{t.title}</span>
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
                  {selectedTopic && (
                    <div className="p-8">
                      {/* Header row */}
                      <div className="flex items-start gap-5 mb-6">
                        <div>
                          <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary/70 mb-1">
                            {selectedTopic.category}
                          </span>
                          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                            {selectedTopic.title}
                          </h2>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-gradient-to-r from-primary/20 via-gray-200 to-transparent mb-6" />

                      {/* Description */}
                      <p className="text-gray-600 leading-relaxed mb-8 text-base">
                        {selectedTopic.description}
                      </p>
                    </div>
                  )}
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
