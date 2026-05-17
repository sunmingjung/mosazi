import type { Metadata } from "next";
import { Geist, Gowun_Dodum, Press_Start_2P } from "next/font/google";
import "./globals.css";
import SparkleCursor from "./components/SparkleCursor";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const gowunDodum = Gowun_Dodum({
  variable: "--font-rounded",
  subsets: ["latin"],
  weight: "400",
});

const pressStart = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "MOSAZI — Curated Gifts",
  description: "감도 있는 독립 브랜드 큐레이션",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${gowunDodum.variable} ${pressStart.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--ink)]">
        <SparkleCursor />
        {children}
      </body>
    </html>
  );
}
