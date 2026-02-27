"use client";

import Link from "next/link";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  ReactNode,
  memo,
} from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import "@/app/styles/Navigation.css";

type MenuItem = {
  href?: string;
  icon: ReactNode;
  titleKey: string;
  descKey?: string;
  subItems?: MenuItem[];
};

type MobileDropdownState = {
  openDropdown: string | null;
  expandedItems: Set<string>;
};

function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: (e: Event) => void,
) {
  const stableHandler = useCallback(handler, [handler]);

  useEffect(() => {
    function handle(e: Event) {
      const el = ref.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) stableHandler(e);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [ref, stableHandler]);
}

function useMobileDropdownState() {
  const [state, setState] = useState<MobileDropdownState>({
    openDropdown: null,
    expandedItems: new Set(),
  });

  const toggleDropdown = useCallback((id: string) => {
    setState((prev) => ({
      openDropdown: prev.openDropdown === id ? null : id,
      expandedItems: new Set(), // Clear expanded items when switching dropdowns
    }));
  }, []);

  const toggleSubItem = useCallback((key: string) => {
    setState((prev) => {
      const newExpandedItems = new Set<string>();
      if (!prev.expandedItems.has(key)) {
        newExpandedItems.add(key);
      }
      return {
        ...prev,
        expandedItems: newExpandedItems,
      };
    });
  }, []);

  const resetState = useCallback(() => {
    setState({ openDropdown: null, expandedItems: new Set() });
  }, []);

  return { state, toggleDropdown, toggleSubItem, resetState };
}

function useScrollVisibility() {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

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

  return isNavVisible;
}

// Components
const DesktopDropdown = memo(function DesktopDropdown({
  id,
  label,
  active,
  items,
  t,
  pathname,
  onCloseAll,
  isNavVisible,
}: {
  id: string;
  label: string;
  active?: boolean;
  items: MenuItem[];
  t: ReturnType<typeof useTranslations>;
  pathname: string | null;
  onCloseAll: () => void;
  isNavVisible: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const closeDropdown = useCallback(() => setOpen(false), []);
  useOnClickOutside(ref as React.RefObject<HTMLElement>, closeDropdown);

  useEffect(() => {
    setOpen(false);
    setHoveredItem(null);
  }, [pathname]);

  useEffect(() => {
    if (!isNavVisible) {
      setOpen(false);
      setHoveredItem(null);
    }
  }, [isNavVisible]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = useCallback((key: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem(key);
    }, 100);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 150);
  }, []);

  const toggleOpen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((s) => !s);
  }, []);

  return (
    <div className="relative group" ref={ref}>
      <button
        onClick={toggleOpen}
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

      <div
        id={id}
        className={`absolute mt-4 w-[320px] bg-white rounded-2xl shadow-2xl z-50 overflow-visible dropdown-panel border border-gray-100${open ? " open" : ""}`}
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="bg-primary px-6 py-4">
          <h3 className="text-white font-bold text-lg">{t(`${id}.title`)}</h3>
          <p className="text-white/80 text-xs mt-1 line-clamp-2">
            {t(`${id}.description`)}
          </p>
        </div>

        <div className="py-2 relative">
          {items.map((it, idx) => (
            <div key={it.href || `item-${idx}`} className="relative">
              {it.subItems ? (
                // Item with sub-items (hover to show)
                <div
                  onMouseEnter={() => handleMouseEnter(it.titleKey)}
                  onMouseLeave={handleMouseLeave}
                  className="relative"
                >
                  <div className="dropdown-item flex items-center px-4 py-3 min-h-[64px] transition-all duration-300 ease-out text-gray-800 group cursor-pointer hover:bg-primary/5">
                    <div className="flex-1">
                      <p className="font-semibold text-base transition-colors duration-300 ease-out text-gray-900 group-hover:text-primary">
                        {t(it.titleKey)}
                      </p>
                      {it.descKey && (
                        <p className="text-sm font-normal line-clamp-2 transition-colors duration-300 ease-out text-gray-500 group-hover:text-gray-700">
                          {t(it.descKey)}
                        </p>
                      )}
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 transition-all duration-300 ease-out group-hover:text-primary group-hover:translate-x-1"
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
                  </div>

                  {/* Sub-items panel (absolutely positioned) */}
                  {it.subItems && (
                    <div
                      className={`absolute left-full top-0 w-[280px] bg-white rounded-r-xl shadow-xl border-r border-t border-b border-gray-100 z-50 dropdown-subpanel${hoveredItem === it.titleKey ? " open" : ""}`}
                      style={{
                        boxShadow:
                          "0 20px 40px -12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                      }}
                      onMouseEnter={() => {
                        if (hoverTimeoutRef.current) {
                          clearTimeout(hoverTimeoutRef.current);
                        }
                        setHoveredItem(it.titleKey);
                      }}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="px-4 py-3 border-b border-gray-200/50 bg-gray-50">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {t(it.titleKey)}
                        </p>
                      </div>
                      <div className="py-1">
                        {it.subItems.map((subIt, subIdx) => (
                          <Link
                            key={subIt.href || `sub-${subIdx}`}
                            href={subIt.href!}
                            className="flex items-start px-4 py-3 hover:bg-primary/5 transition-all duration-300 ease-out text-gray-700 group"
                            onClick={() => onCloseAll()}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-gray-800 group-hover:text-primary transition-colors duration-300 ease-out leading-tight">
                                {t(subIt.titleKey)}
                              </p>
                              {subIt.descKey && (
                                <p className="text-xs text-gray-500 group-hover:text-gray-700 mt-0.5 line-clamp-2 transition-colors duration-300 ease-out">
                                  {t(subIt.descKey)}
                                </p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Regular item without sub-items
                <Link
                  href={it.href!}
                  className="dropdown-item flex items-center px-4 py-3 min-h-[64px] hover:bg-primary/5 transition-all duration-300 ease-out text-gray-800 group"
                  onClick={() => onCloseAll()}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-base text-gray-900 group-hover:text-primary transition-colors duration-300 ease-out">
                      {t(it.titleKey)}
                    </p>
                    {it.descKey && (
                      <p className="text-sm font-normal text-gray-500 group-hover:text-gray-700 line-clamp-2 transition-colors duration-300 ease-out">
                        {t(it.descKey)}
                      </p>
                    )}
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const MobileDropdown = memo(function MobileDropdown({
  id,
  label,
  items,
  t,
  closeMenu,
  open,
  expandedItems,
  onToggle,
  onToggleSubItem,
}: {
  id: string;
  label: string;
  items: MenuItem[];
  t: ReturnType<typeof useTranslations>;
  closeMenu: () => void;
  open: boolean;
  expandedItems: Set<string>;
  onToggle: (id: string) => void;
  onToggleSubItem: (key: string) => void;
}) {
  const handleToggle = useCallback(() => onToggle(id), [onToggle, id]);
  return (
    <div>
      <button
        onClick={handleToggle}
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
          {items.map((it, idx) => (
            <div key={it.href || `mobile-item-${idx}`}>
              {it.subItems ? (
                // Item with sub-items
                <>
                  <button
                    onClick={() => onToggleSubItem(it.titleKey)}
                    className="w-full px-8 sm:px-10 py-2.5 text-sm sm:text-base hover:bg-white/10 transition-all duration-300 active:bg-white/20 font-normal flex justify-between items-center"
                  >
                    {t(it.titleKey)}
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${expandedItems.has(it.titleKey) ? "rotate-90" : ""}`}
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
                  </button>
                  {expandedItems.has(it.titleKey) && (
                    <div className="bg-white/5">
                      {it.subItems.map((subIt, subIdx) => (
                        <Link
                          key={subIt.href || `mobile-sub-${subIdx}`}
                          href={subIt.href!}
                          className="block px-12 sm:px-14 py-2 text-sm sm:text-base hover:bg-white/10 transition-all duration-300 active:bg-white/20 font-light"
                          onClick={() => closeMenu()}
                        >
                          {t(subIt.titleKey)}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // Regular item without sub-items
                <Link
                  href={it.href!}
                  className="block px-8 sm:px-10 py-2.5 text-sm sm:text-base hover:bg-white/10 transition-all duration-300 active:bg-white/20 font-normal"
                  onClick={() => closeMenu()}
                >
                  {t(it.titleKey)}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// Constants
const MENU_ITEMS = {
  aboutItems: [
    {
      href: "/Landing-page/About-us/National",

      titleKey: "aboutDropdown.national.title",
      descKey: "aboutDropdown.national.description",
    },
    {
      titleKey: "aboutDropdown.executive.title",
      descKey: "aboutDropdown.executive.description",
      subItems: [
        {
          href: "/Landing-page/About-us/Executive",

          titleKey: "aboutDropdown.executive.overview.title",
          descKey: "aboutDropdown.executive.overview.description",
        },
        {
          href: "/Landing-page/About-us/Executive/Leadership",

          titleKey: "aboutDropdown.executive.leadership.title",
          descKey: "aboutDropdown.executive.leadership.description",
        },
        {
          href: "/Landing-page/About-us/Executive/Structure",

          titleKey: "aboutDropdown.executive.structure.title",
          descKey: "aboutDropdown.executive.structure.description",
        },
      ],
    },
    {
      titleKey: "aboutDropdown.general.title",
      descKey: "aboutDropdown.general.description",
      subItems: [
        {
          href: "/Landing-page/About-us/General",

          titleKey: "aboutDropdown.general.overview.title",
          descKey: "aboutDropdown.general.overview.description",
        },
        {
          href: "/Landing-page/About-us/General/Mission",

          titleKey: "aboutDropdown.general.mission.title",
          descKey: "aboutDropdown.general.mission.description",
        },
        {
          href: "/Landing-page/About-us/General/History",

          titleKey: "aboutDropdown.general.history.title",
          descKey: "aboutDropdown.general.history.description",
        },
      ],
    },
  ] as MenuItem[],
  resourcesItems: [
    {
      href: "/Landing-page/Resources/Laws",

      titleKey: "resourcesDropdown.laws.title",
      descKey: "resourcesDropdown.laws.description",
    },
    {
      href: "/Landing-page/Resources/Publication",

      titleKey: "resourcesDropdown.publication.title",
      descKey: "resourcesDropdown.publication.description",
    },
    {
      href: "/Landing-page/Resources/Social",

      titleKey: "resourcesDropdown.social.title",
      descKey: "resourcesDropdown.social.description",
    },
  ] as MenuItem[],
};

export default function Navigation() {
  const t = useTranslations("Common.nav");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isNavVisible = useScrollVisibility();
  const mobileDropdownState = useMobileDropdownState();
  const pathname = usePathname();

  // Memoized handlers
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((s) => !s);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
    mobileDropdownState.resetState();
  }, [pathname, mobileDropdownState.resetState]);

  const { aboutItems, resourcesItems } = MENU_ITEMS;

  const closeAll = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const navStyle = useMemo(
    () => ({
      transform: isNavVisible ? "translateY(0)" : "translateY(-100%)",
    }),
    [isNavVisible],
  );

  const isAboutActive = useMemo(
    () => !!pathname?.includes("/Landing-page/About-us"),
    [pathname],
  );
  const isResourcesActive = useMemo(
    () => !!pathname?.includes("/Landing-page/Resources"),
    [pathname],
  );

  return (
    <>
      <nav
        className="fixed left-0 right-0 z-40 bg-primary shadow-lg transition-transform duration-300 ease-in-out top-16 sm:top-20 md:top-24 lg:top-28"
        style={navStyle}
      >
        <div className="max-w-7xl mx-auto">
          {/* Mobile Menu Button */}
          <div className="lg:hidden flex justify-start ">
            <button
              onClick={toggleMobileMenu}
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
              active={isAboutActive}
              items={aboutItems}
              t={t}
              pathname={pathname}
              onCloseAll={closeAll}
              isNavVisible={isNavVisible}
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
              active={isResourcesActive}
              items={resourcesItems}
              t={t}
              pathname={pathname}
              onCloseAll={closeAll}
              isNavVisible={isNavVisible}
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
                  onClick={closeMobileMenu}
                >
                  {t("home")}
                </Link>

                <MobileDropdown
                  id="about"
                  label={t("about")}
                  items={aboutItems}
                  t={t}
                  closeMenu={closeMobileMenu}
                  open={mobileDropdownState.state.openDropdown === "about"}
                  expandedItems={mobileDropdownState.state.expandedItems}
                  onToggle={mobileDropdownState.toggleDropdown}
                  onToggleSubItem={mobileDropdownState.toggleSubItem}
                />
                <MobileDropdown
                  id="resources"
                  label={t("resources")}
                  items={resourcesItems}
                  t={t}
                  closeMenu={closeMobileMenu}
                  open={mobileDropdownState.state.openDropdown === "resources"}
                  expandedItems={mobileDropdownState.state.expandedItems}
                  onToggle={mobileDropdownState.toggleDropdown}
                  onToggleSubItem={mobileDropdownState.toggleSubItem}
                />

                <Link
                  href="/Landing-page/News"
                  className="px-4 sm:px-6 py-3 font-semibold hover:bg-white/10 transition-all duration-300 active:bg-white/20"
                  onClick={closeMobileMenu}
                >
                  {t("news")}
                </Link>
                <Link
                  href="/Landing-page/Contact"
                  className="px-4 sm:px-6 py-3 font-semibold hover:bg-white/10 transition-all duration-300 active:bg-white/20"
                  onClick={closeMobileMenu}
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
