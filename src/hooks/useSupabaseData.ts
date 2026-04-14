import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useSupabaseTable<T extends { id: string }>(
  table: string,
  orderBy: string = "created_at"
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data: rows, error } = await (supabase as any)
      .from(table)
      .select("*")
      .order(orderBy, { ascending: true });
    if (error) {
      console.error(`Error fetching ${table}:`, error);
    } else {
      setData(rows || []);
    }
    setLoading(false);
  }, [table, orderBy]);

  useEffect(() => { fetch(); }, [fetch]);

  const insert = async (row: Omit<T, "id" | "created_at" | "updated_at">) => {
    const { data: inserted, error } = await (supabase as any)
      .from(table)
      .insert(row)
      .select()
      .single();
    if (error) {
      toast.error("Erro ao salvar");
      console.error(error);
      return null;
    }
    setData(prev => [...prev, inserted]);
    return inserted as T;
  };

  const update = async (id: string, updates: Partial<T>) => {
    const { error } = await (supabase as any)
      .from(table)
      .update(updates)
      .eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar");
      console.error(error);
      return false;
    }
    setData(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    return true;
  };

  const remove = async (id: string) => {
    const { error } = await (supabase as any)
      .from(table)
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Erro ao remover");
      console.error(error);
      return false;
    }
    setData(prev => prev.filter(r => r.id !== id));
    return true;
  };

  return { data, setData, loading, fetch, insert, update, remove };
}
