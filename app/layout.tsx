import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#185FA5",
};

export const metadata: Metadata = {
  title: {
    default: "Maskan — Ko'chmas mulk platformasi",
    template: "%s | Maskan",
  },
  description: "Toshkent va atrofdagi uylar, kvartiralar, kottejlar va yerlarni toping. Maskan — O'zbekistondagi eng qulay ko'chmas mulk platformasi.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Maskan — Ko'chmas mulk platformasi",
    description: "Toshkent va atrofdagi uylar, kvartiralar, kottejlar va yerlarni toping.",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://makon.uz',
    siteName: "Maskan",
    locale: "uz_UZ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://accounts.google.com" />
        <link rel="dns-prefetch" href="https://accounts.google.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('makon-theme');var isDark=t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches);if(isDark)document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme',isDark?'dark':'light')})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              name: "Maskan",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://makon.uz",
              logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://makon.uz"}/maskan-logo.jpg`,
              description: "O'zbekistondagi eng qulay ko'chmas mulk platformasi",
              areaServed: "UZ",
              availableLanguage: ["uz", "ru"],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Maskan",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://makon.uz",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || "https://makon.uz"}/?search={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body
        className="min-h-dvh"
        style={{ background: "var(--gray-50)", fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      >
        <Providers><AppShell>{children}</AppShell></Providers>
      </body>
    </html>
  );
}
