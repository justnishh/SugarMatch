import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AdBanner, StickyAdBanner, StickyBottomAd } from "@/components/ui/AdBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SugarMatch — Find Your Perfect Match",
  description: "Connect with compatible partners. A premium dating experience.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SugarMatch",
  },
};

export const viewport: Viewport = {
  themeColor: "#e11d63",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gradient-to-b from-rose-100 via-pink-50 to-rose-100">
        <AdBanner />
        <StickyAdBanner />
        <div className="mx-auto max-w-[393px] w-full min-h-[100dvh] pt-[50px] pb-[60px]">
          {children}
        </div>
        <StickyBottomAd />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
