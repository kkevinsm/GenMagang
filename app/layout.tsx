import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GenMagang — Platform AI All-in-One untuk Anak Magang Indonesia",
  description:
    "GenMagang memadukan GenMonev (otomatisasi laporan Monev harian MagangHub Kemnaker) dan GenNotulis (transkrip cerdas & notulensi rapat korporat) dalam satu ekosistem produktivitas terpadu.",
  keywords: [
    "GenMagang",
    "Monev Magang",
    "MagangHub Kemnaker",
    "Notulensi Rapat",
    "Anak Magang",
    "Magang Merdeka",
    "AI Asisten Magang",
    "GenMonev",
    "GenNotulis",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FBFBFA] font-sans text-surface-900 selection:bg-primary-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
