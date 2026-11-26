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
    add: useMutation({ mutationFn: async (s: TablesInsert<"students">) => fail((await supabase.from("students").insert(s)).error), onSuccess: inv }),
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
