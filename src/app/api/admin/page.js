import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: users} = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return Response.json(users);
}