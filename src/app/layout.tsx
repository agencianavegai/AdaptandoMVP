import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import BottomNav from "@/components/navigation/BottomNav";
import { AudioProvider } from "@/contexts/AudioContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://adaptando.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Adaptando | Instituto Ádapo",
    template: "%s | Adaptando",
  },
  description: "Capacitação gamificada para o Terceiro Setor. Dê linha para seus sonhos! 🪁",
  metadataBase: new URL(APP_URL),
  applicationName: "Adaptando",
  keywords: ["adaptando", "instituto ádapo", "gamificação", "terceiro setor", "microlearning", "voluntários", "capacitação"],
  authors: [{ name: "Instituto Ádapo" }],
  creator: "Instituto Ádapo",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: APP_URL,
    siteName: "Adaptando",
    title: "Adaptando | Instituto Ádapo",
    description: "Capacitação gamificada para o Terceiro Setor. Dê linha para seus sonhos! 🪁",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Adaptando — Dando Linha pra Sonhar",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adaptando | Instituto Ádapo",
    description: "Capacitação gamificada para o Terceiro Setor. Dê linha para seus sonhos! 🪁",
    images: ["/og-image.jpg"],
    creator: "@institutoadapo",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Adaptando",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-slate-50 text-slate-900 dark:bg-[#0f1117] dark:text-slate-100 transition-colors duration-300">
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
        <ThemeProvider>
          <AudioProvider>
            {children}
            <BottomNav />
          </AudioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
