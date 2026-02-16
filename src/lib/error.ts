"use client";

type LogErrorOptions = {
  type?: string;
  context?: Record<string, any>;
};

export async function logClientError(
  error: unknown,
  options: LogErrorOptions = {},
) {
  try {
    const err =
      error instanceof Error
        ? error
        : new Error(typeof error === "string" ? error : "Unknown error");

    await fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: options.type ?? "client-error",
        message: err.message,
        stack: err.stack,
        url: typeof window !== "undefined" ? location.href : null,
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : null,
        context: options.context ?? {},
      }),
      keepalive: true,
    });
  } catch {}
}
