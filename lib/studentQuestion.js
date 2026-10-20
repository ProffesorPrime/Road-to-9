// Loads one of the logged-in student's questions, checking it belongs to them. SERVER ONLY.
// kind "practice" (default) never returns a Grade Check question, and kind "placement" only returns one,
// so placement questions can't earn mastery or get hints.
export async function loadOwnQuestion(admin, studentId, questionId, kind = "practice") {
  if (!questionId || typeof questionId !== "string") return null;
  const { data } = await admin.from("questions").select("*").eq("id", questionId).eq("student_id", studentId).maybeSingle();
  if (!data) return null;
  const isPlacement = !!data.payload?.placement;
  return (kind === "placement") === isPlacement ? data : null;
}

export async function loadProgress(admin, studentId) {
  const { data } = await admin.from("progress").select("*").eq("student_id", studentId).maybeSingle();
  return data;
}

export async function saveProgress(admin, studentId, p) {
  return admin.from("progress").upsert({ student_id: studentId, ...p, updated_at: new Date().toISOString() });
}

// Records that the student got help on this question (once per question).
export async function recordHelp(admin, studentId, q, markHelped) {
  if (q.helped || q.done) return [];
  await admin.from("questions").update({ helped: true }).eq("id", q.id);
  const row = await loadProgress(admin, studentId);
  const { progress, newBadges } = markHelped(row, q.topic);
  await saveProgress(admin, studentId, progress);
  q.helped = true;
  return newBadges;
}
