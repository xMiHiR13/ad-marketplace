// src/contexts/TelegramContext.tsx

"use client";

import Loading from "@/components/shared/Loading";

import { TelegramWebApp, WebAppUser } from "@/types/telegram";
import React, {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
  useState,
} from "react";

interface TelegramContextType {
  telegram: TelegramWebApp | null;
  user: WebAppUser | null;
}

const TelegramContext = createContext<TelegramContextType | undefined>(
  undefined,
);

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const telegram: TelegramWebApp | null = useMemo(() => {
    const tg =
      typeof window !== "undefined" ? (window?.Telegram?.WebApp ?? null) : null;
    if (tg) {
      try {
        tg.ready();
        if (tg.isVersionAtLeast("7.7")) {
          tg.disableVerticalSwipes();
        }
        if (
          tg.isVersionAtLeast("8.0") &&
          !tg.isFullscreen &&
          (tg.platform === "android" || tg.platform === "ios")
        ) {
          tg.requestFullscreen();
        }
      } catch (e) {
        console.warn("Telegram WebApp init failed:", e);
      }
    }
    return tg;
  }, []);

  const user: WebAppUser | null = useMemo(
    () => telegram?.initDataUnsafe?.user ?? null,
    [telegram],
  );

  useEffect(() => {
    telegram &&
      (async () => {
        try {
          const response = await fetch("/api/session");
          if (response.ok) {
            setIsAuthenticated(true);
            return;
          }
        } catch (error) {}
        try {
          const response = await fetch("/api/auth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              initData: telegram!.initData,
            }),
          });

          if (response.ok) {
            setIsAuthenticated(true);
          } else {
            console.error("Authentication failed");
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Error during authentication:", error);
          setIsAuthenticated(false);
        }
      })();
  }, []);

  if (isAuthenticated === null) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-br from-slate-900 to-slate-800">
        <i className="ri-forbid-line text-5xl text-red-400 mb-3 animate-pulse"></i>
        <h2 className="text-xl font-semibold text-white mb-1">
          Not Authorized
        </h2>
        <p className="text-sm text-slate-400">
          This app can only be open in Telegram mini app.
        </p>
      </div>
    );
  }

  return (
    <TelegramContext.Provider value={{ telegram, user }}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error("useTelegram must be used within a TelegramProvider");
  }
  return context;
}
