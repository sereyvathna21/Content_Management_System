import React, { useEffect, useState } from "react";

type MobilePDFModalProps = {
  title: string;
  url: string;
  onClose: () => void;
};

export default function MobilePDFModal({
  title,
  url,
  onClose,
}: MobilePDFModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      className={`sm:hidden fixed inset-0 z-50 bg-white flex flex-col transition-transform duration-300 ease-out transform ${
        mounted ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="px-4 py-3 border-b flex items-center justify-between bg-white shadow-sm pt-4 sm:pt-3">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <span className="font-semibold truncate flex-1 mx-2 text-fluid-base">
          {title}
        </span>
        <a href={url} download className="text-primary p-2">
          <svg
            className="w-6 h-6"
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
        </a>
      </div>
      <div className="flex-1 relative overflow-auto">
        <iframe src={url} className="w-full h-full min-h-[320px]" />
      </div>
    </div>
  );
}
