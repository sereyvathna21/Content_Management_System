"use client";

import Link from "next/link";
import { useState, useEffect, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import "@/app/styles/Navigation.css";

type MenuItem = {
  href: string;
  icon: ReactNode;
  titleKey: string;
  descKey?: string;
};

function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: (e: Event) => void,
) {
  useEffect(() => {
    function handle(e: Event) {
      const el = ref.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) handler(e);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [ref, handler]);
}

function DesktopDropdown({
  id,
  label,
  active,
  items,
  t,
  pathname,
  onCloseAll,
}: {
  id: string;
  label: string;
  active?: boolean;
  items: MenuItem[];
  t: ReturnType<typeof useTranslations>;
  pathname: string | null;
  onCloseAll: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref as React.RefObject<HTMLElement>, () => setOpen(false));
  useEffect(() => {
    // Close dropdown when route changes
    setOpen(false);
  }, [pathname]);

  return (
    <div className="relative group" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((s) => !s);
        }}
        className={`nav-link font-semibold flex items-center gap-2 hover:opacity-80 transition-all duration-300 ${
          active ? "active" : ""
        }`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={id}
        aria-label={label}
      >
        {label}
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div
          id={id}
          className="absolute left-0 mt-4 w-[520px] max-w-[90vw] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden dropdown-enter border border-gray-100"
          style={{
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div className="bg-gradient-to-r from-primary to-primary/90 px-6 py-4">
            <h3 className="text-white font-bold text-lg">{t(`${id}.title`)}</h3>
            <p className="text-white/80 text-xs mt-1">
              {t(`${id}.description`)}
            </p>
          </div>

          <div className="py-2">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className="dropdown-item flex items-center gap-4 px-2 py-2 hover:bg-gradient-to-r hover:from-primary/5 hover:via-primary/3 hover:to-transparent transition-all duration-300 text-gray-800 group"
                onClick={() => {
                  onCloseAll();
                }}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  {it.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-base text-gray-900 group-hover:text-primary transition-colors">
                    {t(it.titleKey)}
                  </p>
                  {it.descKey && (
                    <p className="text-sm font-normal text-gray-500 group-hover:text-gray-700">
                      {t(it.descKey)}
                    </p>
                  )}
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileDropdown({
  label,
  items,
  t,
  closeMenu,
}: {
  label: string;
  items: MenuItem[];
  t: ReturnType<typeof useTranslations>;
  closeMenu: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-full px-4 sm:px-6 py-3 font-semibold hover:bg-white/10 transition-all duration-300 flex justify-between items-center active:bg-white/20"
        aria-expanded={open}
      >
        {label}
        <svg
          className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="bg-white/5 py-2 overflow-hidden">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="block px-8 sm:px-10 py-2.5 text-sm sm:text-base hover:bg-white/10 transition-all duration-300 active:bg-white/20 font-normal"
              onClick={() => {
                closeMenu();
              }}
            >
              {t(it.titleKey)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navigation() {
  const t = useTranslations("Common.nav");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const pathname = usePathname();
  const lastScrollY = useRef(0);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setIsNavVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsNavVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const aboutItems: MenuItem[] = [
    {
      href: "/Landing-page/About-us/National",
      icon: <span className="text-2xl">🏛️</span>,
      titleKey: "aboutDropdown.national.title",
      descKey: "aboutDropdown.national.description",
    },
    {
      href: "/Landing-page/About-us/Executive",
      icon: <span className="text-2xl">👔</span>,
      titleKey: "aboutDropdown.executive.title",
      descKey: "aboutDropdown.executive.description",
    },
    {
      href: "/Landing-page/About-us/General",
      icon: <span className="text-2xl">ℹ️</span>,
      titleKey: "aboutDropdown.general.title",
      descKey: "aboutDropdown.general.description",
    },
  ];

  const resourcesItems: MenuItem[] = [
    {
      href: "/Landing-page/Resources/Laws",
      icon: <span className="text-2xl">⚖️</span>,
      titleKey: "resourcesDropdown.laws.title",
      descKey: "resourcesDropdown.laws.description",
    },
    {
      href: "/Landing-page/Resources/Publication",
      icon: <span className="text-2xl">📄</span>,
      titleKey: "resourcesDropdown.publication.title",
      descKey: "resourcesDropdown.publication.description",
    },
    {
      href: "/Landing-page/Resources/Social",
      icon: <span className="text-2xl">🤝</span>,
      titleKey: "resourcesDropdown.social.title",
      descKey: "resourcesDropdown.social.description",
    },
  ];

  const closeAll = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className="fixed left-0 right-0 z-40 bg-primary shadow-lg transition-transform duration-300 ease-in-out top-16 sm:top-20 md:top-24 lg:top-28"
        style={{
          transform: isNavVisible ? "translateY(0)" : "translateY(-100%)",
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Mobile Menu Button */}
          <div className="lg:hidden flex justify-start ">
            <button
              onClick={() => setMobileMenuOpen((s) => !s)}
              className="text-white p-2.5 rounded-xl transition-all duration-300 active:scale-95"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{
                  transform: mobileMenuOpen ? "rotate(90deg)" : "rotate(0deg)",
                }}
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex text-white text-sm lg:text-base xl:text-lg justify-center items-center gap-4 lg:gap-6 xl:gap-10 py-4 lg:py-5 px-4">
            <Link
              href="/Landing-page/Home"
              className={`nav-link font-semibold ${pathname === "/Landing-page/Home" ? "active" : ""}`}
            >
              {t("home")}
            </Link>

            <DesktopDropdown
              id="aboutDropdown"
              label={t("about")}
              active={!!pathname?.includes("/Landing-page/About-us")}
              items={aboutItems}
              t={t}
              pathname={pathname}
              onCloseAll={closeAll}
            />

            <Link
              href="/Landing-page/News"
              className={`nav-link font-semibold ${pathname === "/Landing-page/News" ? "active" : ""}`}
            >
              {t("news")}
            </Link>

            <DesktopDropdown
              id="resourcesDropdown"
              label={t("resources")}
              active={!!pathname?.includes("/Landing-page/Resources")}
              items={resourcesItems}
              t={t}
              pathname={pathname}
              onCloseAll={closeAll}
            />

            <Link
              href="/Landing-page/Contact"
              className={`nav-link font-semibold ${pathname === "/Landing-page/Contact" ? "active" : ""}`}
            >
              {t("contact")}
            </Link>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-primary border-t border-white/10 mobile-menu-enter">
              <div className="flex flex-col text-white text-base sm:text-lg py-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                <Link
                  href="/Landing-page/Home"
                  className="px-4 sm:px-6 py-3 font-semibold hover:bg-white/10 transition-all duration-300 active:bg-white/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("home")}
                </Link>

                <MobileDropdown
                  label={t("about")}
                  items={aboutItems}
                  t={t}
                  closeMenu={() => setMobileMenuOpen(false)}
                />
                <MobileDropdown
                  label={t("resources")}
                  items={resourcesItems}
                  t={t}
                  closeMenu={() => setMobileMenuOpen(false)}
                />

                <Link
                  href="/Landing-page/News"
                  className="px-4 sm:px-6 py-3 font-semibold hover:bg-white/10 transition-all duration-300 active:bg-white/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("news")}
                </Link>
                <Link
                  href="/Landing-page/Contact"
                  className="px-4 sm:px-6 py-3 font-semibold hover:bg-white/10 transition-all duration-300 active:bg-white/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("contact")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
