import type { Metadata } from "next";
import type { ReactNode } from "react";
import { nunitoSans } from "@/app/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vibyze — AI Website Analyser",
  description:
    "Scan your website for issues and get beginner-friendly AI-powered fix suggestions.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`h-full antialiased ${nunitoSans.variable}`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
