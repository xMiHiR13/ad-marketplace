"use client";

import React, { useCallback, memo } from "react";
import { usePathname, useRouter } from "next/navigation";

interface NavItem {
  path: string;
  label: string;
  icon: string;
  activeIcon: string;
}

const navItems: NavItem[] = [
  {
    path: "/deals",
    label: "Deals",
    icon: "ri-shake-hands-line",
    activeIcon: "ri-shake-hands-fill",
  },
  {
    path: "/",
    label: "Market",
    icon: "ri-store-2-line",
    activeIcon: "ri-store-2-fill",
  },
  {
    path: "/profile",
    label: "Profile",
    icon: "ri-user-line",
    activeIcon: "ri-user-fill",
  },
];

export const BottomNavigation = memo(function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = useCallback(
    (path: string) => {
      if (path === "/") return pathname === "/";
      return pathname.startsWith(path);
    },
    [pathname],
  );

  const handleNavigate = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router],
  );

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="absolute inset-0 bg-background/95 backdrop-blur-xl border-t border-white/10" />

      <div className="relative flex items-center justify-around h-16 max-w-lg mx-auto py-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className="flex flex-col items-center justify-center flex-1"
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
            >
              <i
                className={`${active ? item.activeIcon : item.icon} text-2xl transition-colors duration-200 ${
                  active ? "text-primary" : "text-foreground-muted"
                }`}
              />
              <span
                className={`text-xs mt-0.5 font-medium transition-colors duration-200 ${
                  active ? "text-primary" : "text-foreground-muted"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});
