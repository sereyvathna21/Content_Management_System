"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function NewsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const newsItems = [
    {
      title: "NSPC launches new outreach program",
      date: "Jan 15, 2026",
      excerpt:
        "A new initiative to expand social protection services across provinces.",
      image: "/news1.jpg",
    },
    {
      title: "Publication: Social Protection Report 2025",
      date: "Dec 22, 2025",
      excerpt:
        "Comprehensive findings and recommendations from the 2025 study.",
      image: "/news2.jpg",
    },
    {
      title: "Public Consultation Schedule Announced",
      date: "Nov 30, 2025",
      excerpt:
        "Join us for regional consultations to gather feedback on the draft policy.",
      image: "/news3.jpg",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className={`max-w-7xl mx-auto py-24 px-6 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          News & Announcements
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Stay updated with our latest initiatives, publications, and community
          engagements
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {newsItems.map((item, idx) => (
          <article
            key={idx}
            className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 group overflow-hidden ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
            style={{ transitionDelay: isVisible ? `${idx * 150}ms` : "0ms" }}
          >
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <time className="text-sm font-semibold text-white bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                  {item.date}
                </time>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
              <h3 className="font-bold text-xl mb-4 group-hover:text-primary transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-base text-gray-600 mb-6 leading-relaxed">
                {item.excerpt}
              </p>
              <div className="flex justify-end">
                <Link
                  href="/Landing_page/news"
                  className="text-primary font-semibold hover:gap-3 flex items-center gap-2 transition-all duration-300 group-hover:translate-x-1"
                >
                  Read more
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/Landing_page/news"
          className="bg-primary text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
        >
          View All News
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
