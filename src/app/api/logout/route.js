import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function POST() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  return Response.json({ success: true });
}