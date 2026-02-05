"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const [showAboutDropdown, setShowAboutDropdown] = useState(false);
  const [showResourcesDropdown, setShowResourcesDropdown] = useState(false);
  const [showMobileAboutDropdown, setShowMobileAboutDropdown] = useState(false);
  const [showMobileResourcesDropdown, setShowMobileResourcesDropdown] =
    useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const pathname = usePathname();

  const aboutDropdownRef = useRef<HTMLDivElement>(null);
  const resourcesDropdownRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        aboutDropdownRef.current &&
        !aboutDropdownRef.current.contains(event.target as Node)
      ) {
        setShowAboutDropdown(false);
      }
      if (
        resourcesDropdownRef.current &&
        !resourcesDropdownRef.current.contains(event.target as Node)
      ) {
        setShowResourcesDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle scroll behavior to hide/show navigation
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Don't hide nav if we're at the top of the page
      if (currentScrollY < 10) {
        setIsNavVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down & past threshold
        setIsNavVisible(false);
        // Close dropdowns when hiding
        setShowAboutDropdown(false);
        setShowResourcesDropdown(false);
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up
        setIsNavVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu and dropdowns when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowAboutDropdown(false);
    setShowResourcesDropdown(false);
    setShowMobileAboutDropdown(false);
    setShowMobileResourcesDropdown(false);
  }, [pathname]);

  return (
    <>
      <style>{`
        .nav-link {
          position: relative;
          transition: all 0.3s ease;
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 0;
          height: 2px;
          background: white;
          transition: width 0.3s ease;
        }
        
        .nav-link:hover::after,
        .nav-link.active::after {
          width: 100%;
        }
        
        .nav-link.active::after {
          width: 100%;
        }
        
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInFromTop {
          0% {
            opacity: 0;
            max-height: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            max-height: 100vh;
            transform: translateY(0);
          }
        }
        
        .mobile-menu-enter {
          animation: slideInFromTop 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .dropdown-enter {
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .dropdown-item {
          position: relative;
          overflow: hidden;
        }
        
        .dropdown-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 3px;
          background: linear-gradient(to bottom, var(--tw-gradient-from), var(--tw-gradient-to));
          transform: scaleY(0);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .dropdown-item:hover::before {
          transform: scaleY(1);
        }
      `}</style>

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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
          <div className="hidden lg:flex text-white font-bold text-sm lg:text-base xl:text-lg justify-center items-center gap-4 lg:gap-6 xl:gap-10 py-4 lg:py-5 px-4">
            <Link
              href="/Landing_page/Home"
              className={`nav-link ${pathname === "/Landing_page/Home" ? "active" : ""}`}
            >
              Home
            </Link>

            {/* About Us Dropdown */}
            <div className="relative group" ref={aboutDropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAboutDropdown(!showAboutDropdown);
                }}
                className={`nav-link flex items-center gap-2 hover:opacity-80 transition-all duration-300 ${
                  pathname?.includes("/Landing_page/About_us") ? "active" : ""
                }`}
              >
                About Us
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    showAboutDropdown ? "rotate-180" : ""
                  }`}
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
              {showAboutDropdown && (
                <div
                  className="absolute left-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden dropdown-enter border border-gray-100"
                  style={{
                    boxShadow:
                      "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div className="bg-gradient-to-r from-primary to-primary/90 px-6 py-4">
                    <h3 className="text-white font-bold text-lg">About Us</h3>
                    <p className="text-white/80 text-xs mt-1">
                      Learn more about NSPC
                    </p>
                  </div>

                  <div className="py-2">
                    <Link
                      href="/Landing_page/About_us/National"
                      className="dropdown-item flex items-center gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-primary/5 hover:via-primary/3 hover:to-transparent transition-all duration-300 text-gray-800 group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <span className="text-2xl">🏛️</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-base text-gray-900 group-hover:text-primary transition-colors">
                          National
                        </p>
                        <p className="text-sm text-gray-500 group-hover:text-gray-700">
                          National Social Protection Council
                        </p>
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

                    <Link
                      href="/Landing_page/About_us/Executive"
                      className="dropdown-item flex items-center gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-primary/5 hover:via-primary/3 hover:to-transparent transition-all duration-300 text-gray-800 group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <span className="text-2xl">👔</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-base text-gray-900 group-hover:text-primary transition-colors">
                          Executives
                        </p>
                        <p className="text-sm text-gray-500 group-hover:text-gray-700">
                          Executive Committee & Secretariat Office
                        </p>
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

                    <Link
                      href="/Landing_page/About_us/General"
                      className="dropdown-item flex items-center gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-primary/5 hover:via-primary/3 hover:to-transparent transition-all duration-300 text-gray-800 group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <span className="text-2xl">ℹ️</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-base text-gray-900 group-hover:text-primary transition-colors">
                          General
                        </p>
                        <p className="text-sm text-gray-500 group-hover:text-gray-700">
                          General Secretariat Office
                        </p>
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
                  </div>
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div className="relative group" ref={resourcesDropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowResourcesDropdown(!showResourcesDropdown);
                }}
                className={`nav-link flex items-center gap-2 hover:opacity-80 transition-all duration-300 ${
                  pathname?.includes("/Landing_page/resources") ? "active" : ""
                }`}
              >
                Resources
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    showResourcesDropdown ? "rotate-180" : ""
                  }`}
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
              {showResourcesDropdown && (
                <div
                  className="absolute left-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden dropdown-enter border border-gray-100"
                  style={{
                    boxShadow:
                      "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div className="bg-gradient-to-r from-primary to-primary/90 px-6 py-4">
                    <h3 className="text-white font-bold text-lg">Resources</h3>
                    <p className="text-white/80 text-xs mt-1">
                      Access our documents & materials
                    </p>
                  </div>

                  <div className="py-2">
                    <Link
                      href="/Landing_page/resources/law"
                      className="dropdown-item flex items-center gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-primary/5 hover:via-primary/3 hover:to-transparent transition-all duration-300 text-gray-800 group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <span className="text-2xl">⚖️</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-base text-gray-900 group-hover:text-primary transition-colors">
                          Law
                        </p>
                        <p className="text-sm text-gray-500 group-hover:text-gray-700">
                          Legal documents & regulations
                        </p>
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

                    <Link
                      href="/Landing_page/resources/publication"
                      className="dropdown-item flex items-center gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-primary/5 hover:via-primary/3 hover:to-transparent transition-all duration-300 text-gray-800 group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <span className="text-2xl">📄</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-base text-gray-900 group-hover:text-primary transition-colors">
                          Publication
                        </p>
                        <p className="text-sm text-gray-500 group-hover:text-gray-700">
                          Research papers & articles
                        </p>
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

                    <Link
                      href="/Landing_page/resources/social"
                      className="dropdown-item flex items-center gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-primary/5 hover:via-primary/3 hover:to-transparent transition-all duration-300 text-gray-800 group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <span className="text-2xl">🤝</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-base text-gray-900 group-hover:text-primary transition-colors">
                          Social
                        </p>
                        <p className="text-sm text-gray-500 group-hover:text-gray-700">
                          Community & engagement
                        </p>
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
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/Landing_page/News"
              className={`nav-link ${pathname === "/Landing_page/News" ? "active" : ""}`}
            >
              News & Announment
            </Link>
            <Link
              href="/Landing_page/Contact"
              className={`nav-link ${pathname === "/Landing_page/Contact" ? "active" : ""}`}
            >
              Contact Us
            </Link>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-primary border-t border-white/10 mobile-menu-enter">
              <div className="flex flex-col text-white font-bold text-sm sm:text-base py-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                <Link
                  href="/Landing_page/Home"
                  className="px-4 sm:px-6 py-3 hover:bg-white/10 transition-all duration-300 active:bg-white/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>

                {/* Mobile About Dropdown */}
                <div>
                  <button
                    onClick={() => {
                      setShowMobileAboutDropdown(!showMobileAboutDropdown);
                    }}
                    className="w-full px-4 sm:px-6 py-3 hover:bg-white/10 transition-all duration-300 flex justify-between items-center active:bg-white/20"
                  >
                    About Us
                    <svg
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${showMobileAboutDropdown ? "rotate-180" : ""}`}
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
                  {showMobileAboutDropdown && (
                    <div className="bg-white/5 py-2 overflow-hidden">
                      <Link
                        href="/Landing_page/About_us/National"
                        className="block px-8 sm:px-10 py-2.5 text-xs sm:text-sm hover:bg-white/10 transition-all duration-300 active:bg-white/20"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setShowAboutDropdown(false);
                        }}
                      >
                        National Social Protection Council
                      </Link>
                      <Link
                        href="/Landing_page/About_us/Executive"
                        className="block px-8 sm:px-10 py-2.5 text-xs sm:text-sm hover:bg-white/10 transition-all duration-300 active:bg-white/20"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setShowMobileAboutDropdown(false);
                        }}
                      >
                        Executive Secretariat Office
                      </Link>
                      <Link
                        href="/Landing_page/About_us/General"
                        className="block px-8 sm:px-10 py-2.5 text-xs sm:text-sm hover:bg-white/10 transition-all duration-300 active:bg-white/20"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setShowMobileAboutDropdown(false);
                        }}
                      >
                        General Secretariat Office
                      </Link>
                    </div>
                  )}
                </div>

                {/* Mobile Resources Dropdown */}
                <div>
                  <button
                    onClick={() => {
                      setShowMobileResourcesDropdown(
                        !showMobileResourcesDropdown,
                      );
                    }}
                    className="w-full px-4 sm:px-6 py-3 hover:bg-white/10 transition-all duration-300 flex justify-between items-center active:bg-white/20"
                  >
                    Resources
                    <svg
                      className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${showMobileResourcesDropdown ? "rotate-180" : ""}`}
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
                  {showMobileResourcesDropdown && (
                    <div className="bg-white/5 py-2 overflow-hidden">
                      <Link
                        href="/Landing_page/resources/law"
                        className="block px-8 sm:px-10 py-2.5 text-xs sm:text-sm hover:bg-white/10 transition-all duration-300 active:bg-white/20"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setShowMobileResourcesDropdown(false);
                        }}
                      >
                        Law & Regulation
                      </Link>
                      <Link
                        href="/Landing_page/resources/publication"
                        className="block px-8 sm:px-10 py-2.5 text-xs sm:text-sm hover:bg-white/10 transition-all duration-300 active:bg-white/20"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setShowMobileResourcesDropdown(false);
                        }}
                      >
                        Publication & Report
                      </Link>
                      <Link
                        href="/Landing_page/resources/social"
                        className="block px-8 sm:px-10 py-2.5 text-xs sm:text-sm hover:bg-white/10 transition-all duration-300 active:bg-white/20"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setShowMobileResourcesDropdown(false);
                        }}
                      >
                        Social Protection Program
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  href="/Landing_page/News"
                  className="px-4 sm:px-6 py-3 hover:bg-white/10 transition-all duration-300 active:bg-white/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  News & Announment
                </Link>
                <Link
                  href="/Landing_page/Contact"
                  className="px-4 sm:px-6 py-3 hover:bg-white/10 transition-all duration-300 active:bg-white/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact Us
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
