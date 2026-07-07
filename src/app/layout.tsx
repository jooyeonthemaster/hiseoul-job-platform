import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "@/lib/polyfills";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import GoogleSheetsProvider from "@/components/providers/GoogleSheetsProvider";
import ScrollProgress from "@/components/ui/ScrollProgress";
import ScrollToTop from "@/components/ScrollToTop";

// 전역 폰트: Paperlogy (로컬 번들 — 런타임 CDN 의존 없음)
const paperlogy = localFont({
  src: [
    { path: "./fonts/Paperlogy-3Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/Paperlogy-4Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Paperlogy-5Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Paperlogy-6SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Paperlogy-7Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/Paperlogy-8ExtraBold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-paperlogy",
  display: "swap",
});

export const metadata: Metadata = {
  title: "구직자 · 구인기업 면접심사 매칭 플랫폼",
  description: "서울시 민간기업 참여형 매력일자리 사업 · 구직자 · 구인기업 면접심사 매칭 플랫폼",
  keywords: "구인구직, 면접심사, 매칭, 서울시, 취업, 채용, 포트폴리오",
  authors: [{ name: "면접심사 매칭 플랫폼 Team" }],
  openGraph: {
    title: "구직자 · 구인기업 면접심사 매칭 플랫폼",
    description: "서울시 민간기업 참여형 매력일자리 사업 · 구직자 · 구인기업 면접심사 매칭 플랫폼",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body
        className={`${paperlogy.variable} antialiased h-full font-sans text-ink-700`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <GoogleSheetsProvider>
            <ScrollToTop />
            <ScrollProgress />
            <div className="min-h-full">
              <Navigation />
              <main className="pt-16">
                {children}
              </main>
            </div>
          </GoogleSheetsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
