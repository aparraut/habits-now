import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomBar from "@/components/ui/BottomBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Habits Now",
  description: "Track your habits offline and sync when online.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Habits Now",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { Suspense } from "react";
import { headers } from "next/headers";
import { getDictionary, Locale } from "@/lib/dictionaries";
import { I18nProvider } from "@/components/providers/I18nProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={
      <html lang="es" className={`${geistSans.variable} ${geistMono.variable} dark`}>
        <body className="antialiased pb-16 bg-[#0f172a] text-[#ededed]">
        </body>
      </html>
    }>
      <DynamicLayout>{children}</DynamicLayout>
    </Suspense>
  );
}

async function DynamicLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const locale = (headersList.get('x-next-locale') || 'es') as Locale;
  const dictionary = await getDictionary(locale);

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="antialiased pb-16 bg-[#0f172a] text-[#ededed]">
        <I18nProvider locale={locale} dictionary={dictionary}>
          {children}
          <BottomBar />
        </I18nProvider>
      </body>
    </html>
  );
}
