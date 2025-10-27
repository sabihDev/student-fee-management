import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navigation from "@/components/ui/Navigation";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import SkipLink from "@/components/ui/SkipLink";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Student Fee Management System",
  description: "Manage student information and track monthly fee payments efficiently",
  keywords: ["school", "student", "fee", "management", "education"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <SkipLink />
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main id="main-content" role="main">
              {children}
            </main>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
