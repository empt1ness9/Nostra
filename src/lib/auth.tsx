import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "tutor" | "student" | "parent";
interface AuthState {
  loading: boolean;
  user: User | null;
  role: Role | null;
  name: string;
  signOut: () => Promise<void>;
}
const Ctx = createContext<AuthState>({ loading: true, user: null, role: null, name: "", signOut: async () => {} });
export const useAuth = () => useContext(Ctx);
export const PENDING_TYPE_KEY = "nostra-account-type";

async function loadRole(user: User): Promise<{ role: Role; name: string }> {
  const pending = localStorage.getItem(PENDING_TYPE_KEY);
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  let role = (roles?.[0]?.role ?? "tutor") as Role;
  if (pending && pending !== role) {
    const { error } = await supabase.rpc("set_my_account_type", { _type: pending });
    if (!error) role = pending as Role;
  }
  localStorage.removeItem(PENDING_TYPE_KEY);
  const { data: prof } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  const meta = user.user_metadata as Record<string, string | undefined>;
  return { role, name: prof?.full_name || meta["full_name"] || meta["name"] || user.email || "" };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<AuthState, "signOut">>({ loading: true, user: null, role: null, name: "" });

  useEffect(() => {
    let current: string | null = null;
    const apply = (user: User | null) => {
      if (!user) { current = null; setState({ loading: false, user: null, role: null, name: "" }); return; }
      if (current === user.id) return;
      current = user.id;
      setTimeout(() => {
        loadRole(user).then((r) => setState({ loading: false, user, ...r }));
      }, 0);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => apply(session?.user ?? null));
    supabase.auth.getSession().then(({ data }) => apply(data.session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return <Ctx.Provider value={{ ...state, signOut: async () => { await supabase.auth.signOut(); } }}>{children}</Ctx.Provider>;
}
