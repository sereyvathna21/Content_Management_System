import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import ClientProviders from "./components/ClientProviders";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("SEO");
  const locale = await getLocale();

  return {
    metadataBase: new URL("https://nspc.gov.kh"),
    title: {
      template: "%s | " + t("defaultTitle"),
      default: t("defaultTitle"),
    },
    description: t("defaultDescription"),
    alternates: {
      canonical: "/",
      languages: {
        en: "/en",
        "km-KH": "/kh",
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: t("defaultTitle"),
      description: t("defaultDescription"),
      url: "https://nspc.gov.kh",
      siteName: t("defaultTitle"),
      images: [
        {
          url: "/favicon.svg",
          width: 800,
          height: 600,
        }
      ],
      locale: locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("defaultTitle"),
      description: t("defaultDescription"),
    },
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
      apple: "/favicon.svg",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    "name": "National Social Protection Council",
    "alternateName": "NSPC",
    "url": "https://nspc.gov.kh",
    "logo": "https://nspc.gov.kh/favicon.svg",
    "sameAs": [
      "https://www.facebook.com/CAMNSPC/"
    ]
  };

  return (
    <html lang={locale} className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientProviders>{children}</ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
