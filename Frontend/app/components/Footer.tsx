"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Facebook } from "lucide-react";
export default function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      className={`bg-gradient-to-br from-primary via-primary to-primary/90 text-white  transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div>
            <div className="transition-transform hover:scale-105 duration-300">
              <img
                src="/favicon.svg"
                alt="NSPC logo"
                className="mb-8"
                style={{ height: "clamp(4rem, 12vw, 10rem)" }}
              />
            </div>
            <p className="text-lg text-white/90 leading-relaxed">
              National Social Protection Council — ensuring social protection
              for all.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-3xl mb-6">Quick Links</h4>
            <ul className="text-lg text-white/90 space-y-3">
              <li>
                <Link
                  href="/Landing_page/about/national"
                  className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/Landing_page/resources"
                  className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/Landing_page/news"
                  className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                >
                  News
                </Link>
              </li>
              <li>
                <Link
                  href="/Landing_page/Contact"
                  className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-3xl mb-6">Contact</h4>
            <p className="text-lg text-white/90 mb-2">
              Ministry address, Phnom Penh
            </p>
            <p className="text-lg text-white/90 mb-2">
              Email: info@nspc.gov.kh
            </p>
            <p className="text-lg text-white/90 mb-6">Phone: +855 23 000 000</p>

            <div className="flex items-center gap-4">
              <a
                href="https://www.facebook.com/CAMNSPC/"
                aria-label="Facebook"
                className="text-3xl hover:scale-125 transition-transform duration-300"
              >
                <Facebook />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-10 border-t border-white/20 text-center text-lg text-white/90">
          © {new Date().getFullYear()} National Social Protection Council. All
          rights reserved.
        </div>
      </div>
    </footer>
  );
}
