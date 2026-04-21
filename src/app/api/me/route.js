import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, username")
    .eq("id", user.id)
    .single();

  return Response.json({
    id: user.id,
    email: user.email,
    role: profile.role,
    username: profile.username,
  });
}