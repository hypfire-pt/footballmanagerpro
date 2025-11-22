import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

interface GameSave {
  id: string;
  save_name: string;
  team_id: string;
  team_name: string;
  season_year: number;
  game_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SaveContextType {
  currentSave: GameSave | null;
  allSaves: GameSave[];
  loading: boolean;
  createNewSave: (teamId: string, teamName: string, saveName: string) => Promise<void>;
  loadSave: (saveId: string) => Promise<void>;
  deleteSave: (saveId: string) => Promise<void>;
  refreshSaves: () => Promise<void>;
}

const SaveContext = createContext<SaveContextType | undefined>(undefined);

export const SaveProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentSave, setCurrentSave] = useState<GameSave | null>(null);
  const [allSaves, setAllSaves] = useState<GameSave[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshSaves = async () => {
    if (!user) {
      setAllSaves([]);
      setCurrentSave(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("game_saves")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      setAllSaves(data || []);

      // Set active save or most recent save
      const activeSave = data?.find((save) => save.is_active);
      const saveToSet = activeSave || data?.[0] || null;
      setCurrentSave(saveToSet);
    } catch (error) {
      console.error("Error fetching saves:", error);
      toast({
        title: "Error",
        description: "Failed to load game saves",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSaves();
  }, [user]);

  const createNewSave = async (teamId: string, teamName: string, saveName: string) => {
    if (!user) return;

    try {
      setLoading(true);

      // Deactivate all other saves
      await supabase
        .from("game_saves")
        .update({ is_active: false })
        .eq("user_id", user.id);

      // Create new save
      const { data: newSave, error: saveError } = await supabase
        .from("game_saves")
        .insert({
          user_id: user.id,
          team_id: teamId,
          team_name: teamName,
          save_name: saveName,
          season_year: new Date().getFullYear(),
          is_active: true,
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Create initial season
      const { data: season, error: seasonError } = await supabase
        .from("save_seasons")
        .insert({
          save_id: newSave.id,
          season_year: new Date().getFullYear(),
          is_current: true,
        })
        .select()
        .single();

      if (seasonError) throw seasonError;

      // Create initial finances
      await supabase.from("save_finances").insert({
        save_id: newSave.id,
        transfer_budget: 50000000,
        wage_budget: 2000000,
        balance: 50000000,
      });

      // Create manager performance record
      await supabase.from("manager_performance").insert({
        save_id: newSave.id,
      });

      await refreshSaves();

      toast({
        title: "Career Started!",
        description: `Your career with ${teamName} has begun.`,
      });
    } catch (error) {
      console.error("Error creating save:", error);
      toast({
        title: "Error",
        description: "Failed to create new save",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadSave = async (saveId: string) => {
    if (!user) return;

    try {
      setLoading(true);

      // Deactivate all saves
      await supabase
        .from("game_saves")
        .update({ is_active: false })
        .eq("user_id", user.id);

      // Activate selected save
      const { error } = await supabase
        .from("game_saves")
        .update({ is_active: true })
        .eq("id", saveId);

      if (error) throw error;

      await refreshSaves();

      const loadedSave = allSaves.find((s) => s.id === saveId);
      if (loadedSave) {
        toast({
          title: "Career Loaded",
          description: `Loaded ${loadedSave.save_name}`,
        });
      }
    } catch (error) {
      console.error("Error loading save:", error);
      toast({
        title: "Error",
        description: "Failed to load save",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSave = async (saveId: string) => {
    if (!user) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from("game_saves")
        .delete()
        .eq("id", saveId)
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshSaves();

      toast({
        title: "Career Deleted",
        description: "The save has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting save:", error);
      toast({
        title: "Error",
        description: "Failed to delete save",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SaveContext.Provider
      value={{
        currentSave,
        allSaves,
        loading,
        createNewSave,
        loadSave,
        deleteSave,
        refreshSaves,
      }}
    >
      {children}
    </SaveContext.Provider>
  );
};

export const useSave = () => {
  const context = useContext(SaveContext);
  if (context === undefined) {
    throw new Error("useSave must be used within a SaveProvider");
  }
  return context;
};
