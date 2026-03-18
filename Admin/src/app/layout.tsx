import { Roboto, Noto_Sans_Khmer } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import SessionProviderWrapper from '@/components/auth/SessionProviderWrapper';

export const metadata = {
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};
const roboto = Roboto({
  
  variable: "--font-outfit-sans",
});

const notoSansKhmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  variable: "--font-noto-khmer",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${roboto.variable} ${notoSansKhmer.variable}`}>
      <body className="dark:bg-gray-900">
        <SessionProviderWrapper>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
