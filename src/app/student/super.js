import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";

export default async function StudentDashboard() {
  const supabase = await createSupabaseServerClient();

  // 🔐 ambil user dari session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase 
    .from("users") 
    .select("role, id") 
    .eq("id", user.id) 
    .single();

  const { data: student } = await supabase
    .from("students")
    .select(`
        *,
        users (
            username
        )
    `)
    .eq("user_id", user.id)
    .single();

  const { data: schedule } = await supabase
    .from("schedules")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  // 🔥 proteksi role
  if (profile.role !== "student") {
    redirect("/admin");
  }

  return (
    <div>
      <h1>Dashboard Student</h1>
      {/* <p>Role: {student.users.role}</p> */}
      {/* <p>Schedule: {schedule ? schedule.date : "No schedule found"}</p>    */}
      <p>Title: {schedule ? schedule.title : "No title found"}</p>
      <p>Username: {student.users.username}</p>

      </div>
  );
}