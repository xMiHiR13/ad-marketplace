"use client";

import Link from "next/link";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTelegram } from "@/contexts/TelegramContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function NotFound() {
  const pathname = usePathname();
  const { telegram } = useTelegram();

  useDocumentTitle("Page Not Found");

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      pathname,
    );
  }, [pathname]);

  return (
    <main
      className={`flex min-h-screen items-center justify-center bg-background ${telegram?.isFullscreen ? "pt-20" : ""}`}
    >
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-xl text-foreground-muted">
          Oops! Page not found
        </p>
        <Link href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </Link>
      </div>
    </main>
  );
}
