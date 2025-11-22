import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSave } from "./SaveContext";
import { useSeason } from "./SeasonContext";
import { supabase } from "@/integrations/supabase/client";

export type NextAction = 
  | 'view_squad'
  | 'next_match'
  | 'review_tactics'
  | 'check_inbox'
  | 'manage_transfers'
  | 'review_finances'
  | 'continue_season';

export interface PendingTask {
  id: string;
  type: 'contract_expiry' | 'injury_update' | 'transfer_offer' | 'board_message';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

interface GameFlowContextType {
  nextAction: NextAction;
  pendingTasks: PendingTask[];
  updateNextAction: (action: NextAction) => Promise<void>;
  addPendingTask: (task: Omit<PendingTask, 'id'>) => Promise<void>;
  removePendingTask: (taskId: string) => Promise<void>;
  getNextMatchPrompt: () => { title: string; description: string; actionUrl: string } | null;
}

const GameFlowContext = createContext<GameFlowContextType | undefined>(undefined);

export const GameFlowProvider = ({ children }: { children: ReactNode }) => {
  const { currentSave } = useSave();
  const { fixtures, currentDate } = useSeason();
  const [nextAction, setNextAction] = useState<NextAction>('view_squad');
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);

  // Load next action and pending tasks from database
  useEffect(() => {
    if (!currentSave) return;

    const loadGameFlowState = async () => {
      const { data, error } = await supabase
        .from('game_saves')
        .select('next_action, pending_tasks')
        .eq('id', currentSave.id)
        .single();

      if (data && !error) {
        setNextAction((data.next_action as NextAction) || 'view_squad');
        setPendingTasks(Array.isArray(data.pending_tasks) ? data.pending_tasks as unknown as PendingTask[] : []);
      }
    };

    loadGameFlowState();
  }, [currentSave]);

  const updateNextAction = async (action: NextAction) => {
    if (!currentSave) return;

    setNextAction(action);
    
    await supabase
      .from('game_saves')
      .update({ next_action: action })
      .eq('id', currentSave.id);
  };

  const addPendingTask = async (task: Omit<PendingTask, 'id'>) => {
    if (!currentSave) return;

    const newTask: PendingTask = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    const updatedTasks = [...pendingTasks, newTask];
    setPendingTasks(updatedTasks);

    await supabase
      .from('game_saves')
      .update({ pending_tasks: updatedTasks as unknown as any })
      .eq('id', currentSave.id);
  };

  const removePendingTask = async (taskId: string) => {
    if (!currentSave) return;

    const updatedTasks = pendingTasks.filter(t => t.id !== taskId);
    setPendingTasks(updatedTasks);

    await supabase
      .from('game_saves')
      .update({ pending_tasks: updatedTasks as unknown as any })
      .eq('id', currentSave.id);
  };

  const getNextMatchPrompt = () => {
    const upcomingMatches = fixtures
      .filter(f => f.status === 'scheduled' && new Date(f.date) >= currentDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (upcomingMatches.length === 0) return null;

    const nextMatch = upcomingMatches[0];
    const daysUntilMatch = Math.ceil(
      (new Date(nextMatch.date).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      title: `${nextMatch.homeTeam} vs ${nextMatch.awayTeam}`,
      description: `${nextMatch.competition} - ${daysUntilMatch === 0 ? 'Today' : `in ${daysUntilMatch} day${daysUntilMatch > 1 ? 's' : ''}`}`,
      actionUrl: '/calendar'
    };
  };

  return (
    <GameFlowContext.Provider
      value={{
        nextAction,
        pendingTasks,
        updateNextAction,
        addPendingTask,
        removePendingTask,
        getNextMatchPrompt
      }}
    >
      {children}
    </GameFlowContext.Provider>
  );
};

export const useGameFlow = () => {
  const context = useContext(GameFlowContext);
  if (!context) {
    throw new Error("useGameFlow must be used within GameFlowProvider");
  }
  return context;
};
