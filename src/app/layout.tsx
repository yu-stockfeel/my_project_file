import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Noto_Sans_JP } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NihoNote - 日文學習筆記",
  description: "搭配 Podcast 與 YouTube 逐字稿學習日文，支援讀音標註、螢光筆筆記、單字與文法查詢。",
  keywords: ["日文學習", "日語", "podcast", "逐字稿", "振假名", "筆記"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${inter.variable} ${notoSansJP.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
