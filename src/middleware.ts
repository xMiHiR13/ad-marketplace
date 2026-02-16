import type { NextRequest } from "next/server";
import { getSession, updateSession } from "./lib/session";

export async function middleware(request: NextRequest) {
  const session = await getSession();
  if (session) {
    return updateSession(request);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
