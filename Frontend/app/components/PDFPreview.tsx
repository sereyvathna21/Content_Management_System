import React, { useEffect, useState } from "react";

type PDFPreviewProps = {
  title: string;
  url: string;
  onClose?: () => void;
};

export default function PDFPreview({ title, url, onClose }: PDFPreviewProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-lg overflow-hidden flex flex-col h-[calc(100vh-180px)] sm:h-[calc(100vh-220px)] md:h-[calc(100vh-280px)] min-h-[250px] sm:min-h-[320px] md:min-h-[600px] transition-all duration-300 ease-out transform ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {/* Preview Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between shrink-0">
        <div className="flex-1 min-w-0 mr-2 sm:mr-4">
          <h2 className="font-semibold text-gray-900 truncate text-sm sm:text-base md:text-lg">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
              aria-label="Close preview"
            >
              <span className="sr-only">Close</span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          <a
            href={url}
            download
            className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span className="hidden xs:inline sm:inline">Download</span>
            <span className="xs:hidden sm:hidden">⬇</span>
          </a>
        </div>
      </div>

      {/* Iframe */}
      <div className="flex-1 bg-gray-100 relative">
        <iframe
          src={`${url}#toolbar=0`}
          className="w-full h-full absolute inset-0"
          title={title}
        />
      </div>
    </div>
  );
}
