import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import {
  Calendar,
  BookOpen,
  MessageSquare,
  Clock,
  Sparkles,
  Package,
} from "lucide-react";
import { redirect } from "next/navigation";

function getDayName(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("id-ID", {
    weekday: "long",
  });
}

export default async function StudentDashboard() {
  const supabase = await createSupabaseServerClient();

  // =========================
  // AUTH
  // =========================
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // =========================
  // PROFILE
  // =========================
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role, username")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return <p>Error: {profileError.message}</p>;
  }

  // proteksi role
  if (profile.role !== "student") {
    redirect("/admin");
  }

  // =========================
  // STUDENT
  // =========================
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select(`
      *,
      programs (
        title,
        session
      )
    `)
    .eq("user_id", user.id)
    .single();

  if (studentError || !student) {
    return <p>Student data not found</p>;
  }

  // =========================
  // SCHEDULE
  // =========================
  const { data: scheduleData } = await supabase
    .from("schedules")
    .select("*")
    .eq("user_id", user.id);

  const schedule = scheduleData || [];

  // =========================
  // MATERIAL ACCESS
  // =========================
  const { data: materialData } = await supabase
    .from("material_access")
    .select("*")
    .eq("student_id", student.id);

  const safeMaterials = materialData || [];

  const unlockedCount = safeMaterials.filter(
    (item) => item.is_locked === false
  ).length;

  const totalCount = safeMaterials.length;

  // =========================
  // FEEDBACK
  // =========================
  const { data: feedbackData } = await supabase
    .from("feedbacks")
    .select("*")
    .eq("student_id", student.id);

  const feedback = feedbackData || [];

  // =========================
  // SESSION CALC
  // =========================
  const remainingSession =
    student.programs?.session - student.used_session || 0;

  const sessionPercent = student.programs?.session
    ? Math.round((remainingSession / student.programs.session) * 100)
    : 0;

  const sessionColor =
    sessionPercent <= 15
      ? "var(--error)"
      : sessionPercent <= 40
      ? "var(--warning)"
      : "var(--success)";

  return (
    <div className="animate-fadeIn">
      {/* =========================
          WELCOME
      ========================= */}
      <div
        className="card"
        style={{
          padding: "var(--space-8)",
          background:
            "linear-gradient(135deg, var(--cream-100), rgba(139,115,85,0.08))",
          marginBottom: "var(--space-8)",
          border: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            marginBottom: "var(--space-2)",
          }}
        >
          <Sparkles size={16} style={{ color: "var(--primary)" }} />
          <span
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--primary)",
              fontWeight: 500,
            }}
          >
            Portal Siswa
          </span>
        </div>

        <h1 style={{ marginBottom: "var(--space-2)" }}>
          Selamat Datang, {profile.username} 👋
        </h1>

        <p
          style={{
            fontSize: "var(--text-md)",
            color: "var(--neutral-500)",
            margin: 0,
          }}
        >
          Program:{" "}
          <strong style={{ color: "var(--neutral-700)" }}>
            {student.programs?.title || "-"}
          </strong>
        </p>
      </div>

      {/* =========================
          STATS
      ========================= */}
      <div className="stats-grid" style={{ marginBottom: "var(--space-8)" }}>
        {/* SESSION */}
        <div
          className="stat-card"
          style={{ borderLeft: `3px solid ${sessionColor}` }}
        >
          <div
            className="stat-card-icon"
            style={{
              background:
                sessionPercent <= 15
                  ? "var(--error-light)"
                  : sessionPercent <= 40
                  ? "var(--warning-light)"
                  : "var(--success-light)",
              color: sessionColor,
            }}
          >
            <Package size={24} />
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "var(--space-2)",
              }}
            >
              <div className="stat-card-value" style={{ color: sessionColor }}>
                {remainingSession}
              </div>
              <span style={{ fontSize: "var(--text-sm)", color: "var(--neutral-500)" }}>
                / {student.programs?.session} sesi
              </span>
            </div>

            <div className="stat-card-label">Sisa Sesi</div>

            <div
              style={{
                marginTop: "var(--space-2)",
                height: 4,
                background: "var(--cream-200)",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${sessionPercent}%`,
                  height: "100%",
                  background: sessionColor,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* SCHEDULE */}
        <div className="stat-card">
          <div className="stat-card-icon primary">
            <Calendar size={24} />
          </div>
          <div>
            <div className="stat-card-value">{schedule.length}</div>
            <div className="stat-card-label">Jadwal Kelas</div>
          </div>
        </div>

        {/* MATERIAL */}
        <div className="stat-card">
          <div className="stat-card-icon success">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="stat-card-value">
              {unlockedCount}/{totalCount}
            </div>
            <div className="stat-card-label">Materi Tersedia</div>
          </div>
        </div>

        {/* FEEDBACK */}
        <div className="stat-card">
          <div className="stat-card-icon info">
            <MessageSquare size={24} />
          </div>
          <div>
            <div className="stat-card-value">{feedback.length}</div>
            <div className="stat-card-label">Feedback</div>
          </div>
        </div>
      </div>

      {/* =========================
          UPCOMING SCHEDULE
      ========================= */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {/* console.log({schedule.length}) */}
          {schedule.length > 0 ? (
            schedule.slice(0, 3).map((sch) => (
              <div
                key={sch.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  padding: "var(--space-3)",
                  background: "var(--cream-50)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div style={{ width: 40, textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "var(--text-xs)",
                      fontWeight: 600,
                      color: "var(--primary)",
                      textTransform: "uppercase",
                    }}
                  >
                    {sch.dayOfWeek?.slice(0, 3)}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{sch.subject}</div>
                  <div
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--neutral-500)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Clock size={10} />
                    {sch.startTime} - {sch.endTime}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "var(--space-6)",
                color: "var(--neutral-400)",
              }}
            >
              📅 Belum ada jadwal kelas
            </div>
          )}
        </div>
      </div>
    </div>
  );
}