import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { encrypt, SESSION_DURATION } from "@/lib/session";
import { validateTelegramWebAppData } from "@/lib/telegramAuth";

export async function POST(request: NextRequest) {
  const { initData } = await request.json();

  const validationResult = validateTelegramWebAppData(initData);

  if (validationResult.validatedData) {
    // Create a new session
    const expires = new Date(Date.now() + SESSION_DURATION);
    const session = await encrypt({ id: validationResult.user.id, expires });

    // Save the session in a cookie
    const cookiesStore = await cookies();
    cookiesStore.set("session", session, { expires, httpOnly: true });

    return NextResponse.json({ message: "Authentication successful" });
  } else {
    return NextResponse.json(
      { message: validationResult.message },
      { status: 401 },
    );
  }
}
