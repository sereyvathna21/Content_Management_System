"use client";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const t = useTranslations("ErrorPage");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f8f6] text-[#1a1a1a] relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-[5px]"
          style={{ background: "linear-gradient(90deg, #4CAF4F, #388E3C)" }}
        />

        <div
          className="absolute select-none pointer-events-none leading-none whitespace-nowrap top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[clamp(16rem,40vw,32rem)] font-semibold text-[rgba(76,175,79,0.06)]"
          aria-hidden="true"
        >
          {t("watermark")}
        </div>

        <div className="relative z-20 text-center py-12 px-8 max-w-[560px]">
          <div className="font-semibold text-[clamp(4rem,14vw,7rem)] text-[#4CAF4F] leading-none tracking-tight">
            {t("title")}
          </div>

          <div className="w-[48px] h-[2px] bg-[#4CAF4F] mx-auto my-5 rounded" />

          <h1 className="font-semibold  text-[clamp(1.3rem,4vw,1.8rem)] text-[#1a2e1a] tracking-tight">
            {t("heading")}
          </h1>
          

          <p className="text-[0.97rem] font-light text-[#5a6b5a] mt-3 leading-[1.65]">
            {t("description")}
          </p>

          <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-2 py-3 px-6 bg-[#4CAF4F] text-white no-underline text-[0.9rem] font-medium rounded-[3px] shadow-[0_2px_12px_rgba(76,175,79,0.25)] hover:-translate-y-0.5 transition-transform"
            >
              {t("tryAgain")}
            </button>

            <a
              href="/Landing-page/Home"
              className="inline-flex items-center gap-2 py-3 px-7 bg-transparent border border-[#4CAF4F] text-[#4CAF4F] no-underline text-[0.9rem] font-medium rounded-[3px] transition-transform hover:-translate-y-0.5"
            >
              {t("return")}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
