// src/app/layout.tsx

import Script from "next/script";
import NextTopLoader from "nextjs-toploader";

import { Providers } from "./providers";
import { AppToaster } from "@/components/shared/Toast";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      style={
        {
          "--tg-viewport-height": "100vh",
          "--tg-viewport-stable-height": "100vh",
        } as React.CSSProperties
      }
    >
      <head>
        {/* Icons CDN */}
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css"
          rel="stylesheet"
        />

        {/* Telegram WebApp SDK */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js?59"
          strategy="beforeInteractive"
        />
      </head>

      <body
        className="bg-black text-white min-h-screen"
        cz-shortcut-listen="true"
      >
        <NextTopLoader color="#229ED9" height={2} showSpinner={false} />

        <Providers>
          {children}
          <BottomNavigation />
          <AppToaster />
        </Providers>
      </body>
    </html>
  );
}