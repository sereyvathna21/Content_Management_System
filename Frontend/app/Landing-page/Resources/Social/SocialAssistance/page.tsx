"use client";

import SocialContentRenderer from "@/app/components/SocialContentRenderer";
import { socialContent } from "@/app/data/socialContent";

export default function SocialAssistance() {
  return (
    <>
      <div aria-hidden="true" className="h-24 sm:h-24 md:h-24 lg:h-28" />

      <div className="min-h-screen bg-white">
        <div className="min-h-screen bg-gray-50/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-8 lg:p-12">
              <SocialContentRenderer topic={socialContent.assistance} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
