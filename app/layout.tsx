import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "출장 경비 계산기 - 자동 출장비 정산 | 교통비·식비 간편 계산",
  description: "출장 교통비, 식비, 숙박비, 일비 등 모든 경비를 자동으로 계산해주는 출장 경비 계산기 서비스입니다. 복잡한 정산 없이 총액을 쉽고 빠르게 확인하세요.",
  keywords: "출장 경비 계산기, 출장비 계산, 출장비 정산, 경비 계산기, 출장 계산기, 교통비 계산기, 출장 식비",
  verification: {
    google: "fhLAmClL1dkQoiPwgkRpQaFs9c4XoqJvPqGLAfKUDB4",
  },
  openGraph: {
    title: "출장 경비 계산기 - 출장비 자동 정산",
    description: "교통비·식비·숙박비·일비를 자동 합산하는 간편 출장 경비 계산기",
    url: "https://expenses-calculator-five.vercel.app/",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-[#1f1f1f]`}
      >
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const root = document.documentElement;
                // Follow system preference
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  root.classList.add('dark');
                  root.style.colorScheme = 'dark';
                } else {
                  root.classList.remove('dark');
                  root.style.colorScheme = 'light';
                }
              })();
            `,
          }}
        />
        <Script
          id="schema-org"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "출장 경비 계산기",
              "url": "https://expenses-calculator-five.vercel.app/",
              "description": "교통비, 식비, 숙박비, 일비 등을 자동으로 합산해주는 출장 경비 계산기. 누구나 쉽게 사용할 수 있는 무료 웹 서비스.",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "All"
            }),
          }}
        />
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Script
          id="kakao-adfit-script"
          src="//t1.daumcdn.net/kas/static/ba.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
