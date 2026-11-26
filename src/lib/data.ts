import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth";

export type Student = Tables<"students">;
export type Lesson = Tables<"lessons">;
export type Message = Tables<"messages">;

const fail = (e: { message: string } | null) => { if (e) throw new Error(e.message); };

export function useStudents() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["students", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("*").order("created_at");
      fail(error);
      return data ?? [];
    },
  });
}

export function useLessons() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["lessons", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("lessons").select("*").order("date").order("start_time");
      fail(error);
      return data ?? [];
    },
  });
}

export function useMessages(studentId: string | null) {
  return useQuery({
    queryKey: ["messages", studentId],
    enabled: !!studentId,
    refetchInterval: 4000,
    queryFn: async () => {
      const { data, error } = await supabase.from("messages").select("*").eq("student_id", studentId!).order("created_at");
      fail(error);
      return data ?? [];
    },
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => Promise.all([qc.invalidateQueries({ queryKey: ["students"] }), qc.invalidateQueries({ queryKey: ["lessons"] })]);
}

export function useStudentMutations() {
  const inv = useInvalidate();
  return {
    add: useMutation({ mutationFn: async (s: TablesInsert<"students">) => { const r = await supabase.from("students").insert(s).select("id").single(); fail(r.error); return r.data?.id ?? ""; }, onSuccess: inv }),
    update: useMutation({ mutationFn: async ({ id, ...s }: TablesUpdate<"students"> & { id: string }) => fail((await supabase.from("students").update(s).eq("id", id)).error), onSuccess: inv }),
    remove: useMutation({ mutationFn: async (id: string) => fail((await supabase.from("students").delete().eq("id", id)).error), onSuccess: inv }),
    claim: useMutation({ mutationFn: async (code: string) => fail((await supabase.rpc("claim_invite", { _code: code })).error), onSuccess: inv }),
  };
}

export function useLessonMutations() {
  const inv = useInvalidate();
  return {
    add: useMutation({ mutationFn: async (rows: TablesInsert<"lessons">[]) => fail((await supabase.from("lessons").insert(rows)).error), onSuccess: inv }),
    update: useMutation({ mutationFn: async ({ id, ...l }: TablesUpdate<"lessons"> & { id: string }) => fail((await supabase.from("lessons").update(l).eq("id", id)).error), onSuccess: inv }),
    remove: useMutation({ mutationFn: async (id: string) => fail((await supabase.from("lessons").delete().eq("id", id)).error), onSuccess: inv }),
    parentPaid: useMutation({ mutationFn: async (id: string) => fail((await supabase.rpc("parent_mark_paid", { _lesson: id })).error), onSuccess: inv }),
  };
}

export function useSendMessage() {
  const qc = useQueryClient();
  const { name } = useAuth();
  return useMutation({
    mutationFn: async ({ studentId, body }: { studentId: string; body: string }) =>
      fail((await supabase.from("messages").insert({ student_id: studentId, body, sender_name: name })).error),
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["messages", v.studentId] }),
  });
}

export const priceMap = (students: Student[]) => {
  const m = new Map(students.map((s) => [s.id, s.price]));
  return (id: string) => m.get(id) ?? 0;
};

export type Topic = Tables<"topics">;
export type TutorSettings = Tables<"tutor_settings">;

export function useTopics() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["topics", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("topics").select("*").order("created_at");
      fail(error);
      return data ?? [];
    },
  });
}

export function useTopicMutations() {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ["topics"] });
  return {
    add: useMutation({ mutationFn: async (rows: TablesInsert<"topics">[]) => fail((await supabase.from("topics").insert(rows)).error), onSuccess: inv }),
    toggle: useMutation({ mutationFn: async ({ id, done }: { id: string; done: boolean }) => fail((await supabase.from("topics").update({ done }).eq("id", id)).error), onSuccess: inv }),
    remove: useMutation({ mutationFn: async (id: string) => fail((await supabase.from("topics").delete().eq("id", id)).error), onSuccess: inv }),
  };
}

/** Settings of a tutor: own (tutorId = me) or of the linked tutor. */
export function useTutorSettings(tutorId: string | undefined) {
  return useQuery({
    queryKey: ["tutor_settings", tutorId],
    enabled: !!tutorId,
    queryFn: async () => {
      const { data, error } = await supabase.from("tutor_settings").select("*").eq("tutor_id", tutorId!).maybeSingle();
      fail(error);
      return data;
    },
  });
}

export function useSaveSettings() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (s: TablesInsert<"tutor_settings">) => fail((await supabase.from("tutor_settings").upsert({ ...s, tutor_id: user!.id })).error),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tutor_settings"] }),
  });
}

export function useQrUrl(path: string | undefined) {
  return useQuery({
    queryKey: ["qr", path],
    enabled: !!path,
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from("qr").createSignedUrl(path!, 3600);
      fail(error);
      return data?.signedUrl ?? "";
    },
  });
}

export function useMarkHomework() {
  const inv = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => fail((await supabase.rpc("student_mark_homework", { _lesson: id, _done: done })).error),
    onSuccess: inv,
  });
}
