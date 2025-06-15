import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/lib/polyfills";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import GoogleSheetsProvider from "@/components/providers/GoogleSheetsProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "HiSeoul Job Platform - 디지털 마케터 구인구직 플랫폼",
  description: "서울시 중소기업과 디지털 마케팅 전문가를 연결하는 프리미엄 구인구직 플랫폼입니다.",
  keywords: "구인구직, 디지털마케팅, 서울시, 취업, 채용, 포트폴리오",
  authors: [{ name: "HiSeoul Team" }],
  openGraph: {
    title: "HiSeoul Job Platform",
    description: "서울시 중소기업과 디지털 마케팅 전문가를 연결합니다",
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
        className={`${inter.variable} antialiased h-full bg-gradient-to-br from-slate-50 via-white to-slate-100 font-sans`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <GoogleSheetsProvider>
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
