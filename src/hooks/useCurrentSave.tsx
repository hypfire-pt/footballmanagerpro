import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CurrentSave {
  id: string;
  save_name: string;
  team_id: string;
  team_name: string;
  season_year: number;
  game_date: string;
  next_action: string | null;
}

export function useCurrentSave() {
  const { user } = useAuth();
  const [currentSave, setCurrentSave] = useState<CurrentSave | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCurrentSave() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('game_saves')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        setCurrentSave(data);
      } catch (err) {
        console.error('Error fetching current save:', err);
        setError(err instanceof Error ? err.message : 'Failed to load save');
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentSave();
  }, [user]);

  return { currentSave, loading, error };
}
