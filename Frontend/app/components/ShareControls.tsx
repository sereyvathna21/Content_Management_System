"use client";

import React, { useState } from "react";

export default function ShareControls() {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const getUrl = () =>
    typeof window !== "undefined" ? window.location.href : "";

  const copyLink = async () => {
    const url = getUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // fallback: select and copy
      console.error("Copy failed", e);
    }
  };

  const shareGeneric = async () => {
    const url = getUrl();
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as any).share({ title: document.title, url });
      } catch (e) {
        console.error("Web Share failed", e);
      }
    } else {
      await copyLink();
    }
  };

  const handleShareFacebook = () => {
    shareFacebook();
    setMenuOpen(false);
  };

  const handleShareLinkedIn = () => {
    shareLinkedIn();
    setMenuOpen(false);
  };

  const handleCopyLink = async () => {
    await copyLink();
    setMenuOpen(false);
  };

  const openPopup = (shareUrl: string) => {
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=600");
  };

  const shareFacebook = () => {
    const url = encodeURIComponent(getUrl());
    openPopup(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
  };

  const shareLinkedIn = () => {
    const url = encodeURIComponent(getUrl());
    openPopup(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`);
  };

  return (
    <div className="space-x-1 mt-3">
      <div className="relative inline-block">
        <button
          type="button"
          onClick={() => setMenuOpen((s) => !s)}
          aria-haspopup="true"
          aria-expanded={menuOpen}
          aria-label="Share"
          className="inline-flex items-center px-3 py-2 rounded-md bg-primary hover:bg-primary-dark text-white text-fluid-sm font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a3.3 3.3 0 000-1.39l7.02-4.11A3 3 0 1014 4a3 3 0 001.96.77L9 8.88a3 3 0 10-.02 6.25l7 4.11c-.01.08-.02.16-.02.26A3 3 0 1018 16.08z" />
          </svg>
          Share
        </button>

        {menuOpen && (
          <div className="origin-top-right absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1">
              <button
                onClick={handleShareFacebook}
                className="w-full text-left px-4 py-2 text-fluid-sm text-gray-700 hover:bg-gray-100"
              >
                Share to Facebook
              </button>
              <button
                onClick={handleShareLinkedIn}
                className="w-full text-left px-4 py-2 text-fluid-sm text-gray-700 hover:bg-gray-100"
              >
                Share to LinkedIn
              </button>
              <button
                onClick={handleCopyLink}
                className="w-full text-left px-4 py-2 text-fluid-sm text-gray-700 hover:bg-gray-100"
              >
                Copy link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
