import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Invite and password-reset emails link here (see the email templates in SETUP.md).
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");
  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      if (type === "invite" || type === "recovery") return NextResponse.redirect(`${origin}/set-password`);
      return NextResponse.redirect(`${origin}/home`);
    }
  } else if (code) {
    // Fallback for links that use a code instead of a token.
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/set-password`);
  }
  return NextResponse.redirect(`${origin}/login?error=link`);
}
