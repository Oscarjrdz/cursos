import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Candidatic Knowledge | Revoluciona tu aprendizaje",
  description: "La plataforma inteligente de capacitación y evaluación diseñada para potenciar el talento de tu empresa.",
  openGraph: {
    title: "Candidatic Knowledge | Revoluciona tu aprendizaje",
    description: "La plataforma inteligente de capacitación y evaluación diseñada para potenciar el talento de tu empresa.",
    url: "https://knowledge.candidatic.com",
    siteName: "Candidatic Knowledge",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Candidatic Knowledge | Revoluciona tu aprendizaje",
    description: "La plataforma inteligente de capacitación y evaluación diseñada para potenciar el talento de tu empresa.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body style={{ minHeight: "100dvh" }}>{children}</body>
    </html>
  );
}
