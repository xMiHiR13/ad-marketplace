"use client";

import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error }: GlobalErrorProps) {
  useEffect(() => {
    (async () => {
      try {
        await fetch("/api/log-error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "global-boundary-error",
            message: error.message,
            stack: error.stack,
            digest: error.digest,
            url: location.href,
            userAgent: navigator.userAgent,
          }),
          keepalive: true,
        });
      } catch (_) {}
    })();
  }, [error]);

  return (
    <div className="h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-br from-slate-900 to-slate-800">
      <i className="ri-error-warning-line text-5xl text-red-400 mb-3 animate-pulse"></i>
      <h2 className="text-xl font-semibold text-white mb-1">
        Application Error
      </h2>
      <p className="text-sm text-slate-400">
        Something broke on our end. The team has been notified.
      </p>
    </div>
  );
}
