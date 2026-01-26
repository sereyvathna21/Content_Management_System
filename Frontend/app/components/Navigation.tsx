"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navigation() {
  const [showAboutDropdown, setShowAboutDropdown] = useState(false);
  const [showResourcesDropdown, setShowResourcesDropdown] = useState(false);

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
        
        .nav-link:hover::after {
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

      <nav className="fixed top-28 left-0 right-0 z-40 bg-primary shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="text-white font-bold text-lg flex justify-center items-center gap-10 py-5 px-4">
            <Link href="/Landing_page/home" className="nav-link">
              Home
            </Link>

            {/* About Us Dropdown */}
            <div className="relative group">
              <button
                onMouseEnter={() => setShowAboutDropdown(true)}
                onMouseLeave={() => setShowAboutDropdown(false)}
                className="nav-link flex items-center gap-2 hover:opacity-80 transition-all duration-300"
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
                  onMouseEnter={() => setShowAboutDropdown(true)}
                  onMouseLeave={() => setShowAboutDropdown(false)}
                  className="absolute left-0 mt-6 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden dropdown-enter border border-gray-100"
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
                      href="/Landing_page/about/national"
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
                          National overview & structure
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
                      href="/Landing_page/about/executive"
                      className="dropdown-item flex items-center gap-4 px-6 py-4 hover:bg-gradient-to-r hover:from-primary/5 hover:via-primary/3 hover:to-transparent transition-all duration-300 text-gray-800 group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <span className="text-2xl">👔</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-base text-gray-900 group-hover:text-primary transition-colors">
                          Executive
                        </p>
                        <p className="text-sm text-gray-500 group-hover:text-gray-700">
                          Leadership team & board
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
                      href="/Landing_page/about/general"
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
                          General information & FAQs
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
            <div className="relative group">
              <button
                onMouseEnter={() => setShowResourcesDropdown(true)}
                onMouseLeave={() => setShowResourcesDropdown(false)}
                className="nav-link flex items-center gap-2 hover:opacity-80 transition-all duration-300"
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
                  onMouseEnter={() => setShowResourcesDropdown(true)}
                  onMouseLeave={() => setShowResourcesDropdown(false)}
                  className="absolute left-0 mt-6 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden dropdown-enter border border-gray-100"
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

            <Link href="/Landing_page/news" className="nav-link">
              News & Announment
            </Link>
            <Link href="/Landing_page/contact" className="nav-link">
              Contact Us
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
