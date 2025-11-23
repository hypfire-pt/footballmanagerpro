import { useEffect, useRef } from "react";
import { useSave } from "@/contexts/SaveContext";
import { useGameFlow } from "@/contexts/GameFlowContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AutoSaveOptions {
  interval?: number; // in milliseconds, default 2 minutes
  enabled?: boolean;
}

export const useAutoSave = (options: AutoSaveOptions = {}) => {
  const { interval = 120000, enabled = true } = options; // Default: 2 minutes
  const { currentSave } = useSave();
  const { nextAction, pendingTasks } = useGameFlow();
  const { toast } = useToast();
  const lastSaveRef = useRef<Date>(new Date());
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (!enabled || !currentSave) return;

    const autoSave = async () => {
      // Prevent concurrent saves
      if (isSavingRef.current) return;
      
      try {
        isSavingRef.current = true;
        
        // Update the save with current game state
        const { error } = await supabase
          .from("game_saves")
          .update({
            next_action: nextAction,
            pending_tasks: pendingTasks as any,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentSave.id);

        if (error) throw error;

        lastSaveRef.current = new Date();
        
        // Silent save - only show toast on first auto-save
        const timeSinceLastSave = Date.now() - lastSaveRef.current.getTime();
        if (timeSinceLastSave > interval * 2) {
          toast({
            title: "Auto-saved",
            description: "Your progress has been saved automatically",
            duration: 2000,
          });
        }
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        isSavingRef.current = false;
      }
    };

    // Initial save after 30 seconds
    const initialTimeout = setTimeout(autoSave, 30000);

    // Then save at regular intervals
    const intervalId = setInterval(autoSave, interval);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [currentSave, nextAction, pendingTasks, enabled, interval, toast]);

  // Manual save function
  const manualSave = async () => {
    if (!currentSave || isSavingRef.current) return;

    try {
      isSavingRef.current = true;
      
      const { error } = await supabase
        .from("game_saves")
        .update({
          next_action: nextAction,
          pending_tasks: pendingTasks as any,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentSave.id);

      if (error) throw error;

      lastSaveRef.current = new Date();
      
      toast({
        title: "Game Saved",
        description: "Your progress has been saved successfully",
      });
    } catch (error) {
      console.error("Manual save failed:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save your progress",
        variant: "destructive",
      });
    } finally {
      isSavingRef.current = false;
    }
  };

  return {
    manualSave,
    lastSaveTime: lastSaveRef.current,
    isSaving: isSavingRef.current,
  };
};
