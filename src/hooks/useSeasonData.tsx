import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SeasonData {
  id: string;
  season_year: number;
  current_matchday: number;
  current_game_week: number;
  season_current_date: string | null;
  standings_state: any;
  fixtures_state: any;
}

export function useSeasonData(saveId: string | null | undefined) {
  const [seasonData, setSeasonData] = useState<SeasonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSeasonData() {
      if (!saveId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('save_seasons')
          .select('*')
          .eq('save_id', saveId)
          .eq('is_current', true)
          .maybeSingle();

        if (error) throw error;
        setSeasonData(data);
      } catch (err) {
        console.error('Error fetching season data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load season');
      } finally {
        setLoading(false);
      }
    }

    fetchSeasonData();
  }, [saveId]);

  const refetch = async () => {
    if (!saveId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('save_seasons')
        .select('*')
        .eq('save_id', saveId)
        .eq('is_current', true)
        .maybeSingle();

      if (error) throw error;
      setSeasonData(data);
    } catch (err) {
      console.error('Error refetching season data:', err);
      setError(err instanceof Error ? err.message : 'Failed to reload season');
    } finally {
      setLoading(false);
    }
  };

  return { seasonData, loading, error, refetch };
}
