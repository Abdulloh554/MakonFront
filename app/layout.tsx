import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import ContentWrapper from "@/components/layout/ContentWrapper";
import ToastProvider from "@/components/ui/ToastProvider";
import SplashScreen from "@/components/layout/SplashScreen";
import ClientProviders from "@/components/layout/ClientProviders";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#185FA5",
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Makon — Ko'chmas mulk platformasi",
  description: "Toshkent va atrofdagi uylar, kvartiralar, kottejlar va yerlarni toping. Makon — O'zbekistondagi eng qulay ko'chmas mulk platformasi.",
  keywords: "uy sotish, kvartira ijarasi, ko'chmas mulk, Toshkent, Makon",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={`${inter.variable} antialiased`}>
      <body
        className="min-h-dvh"
        style={{ background: "var(--gray-50)", fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      >
        <ClientProviders>
        <ToastProvider>
        <SplashScreen>
          <Navbar />
          <ContentWrapper>
            {children}
          </ContentWrapper>
        </SplashScreen>
        </ToastProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
