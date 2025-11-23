import { useState, useEffect } from "react";
import { CloudUpload, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  lastSaveTime: Date;
}

export function AutoSaveIndicator({ isSaving, lastSaveTime }: AutoSaveIndicatorProps) {
  const [timeSinceLastSave, setTimeSinceLastSave] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setTimeSinceLastSave(formatDistanceToNow(lastSaveTime, { addSuffix: true }));
    };

    updateTime();
    const interval = setInterval(updateTime, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [lastSaveTime]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300",
            isSaving
              ? "bg-primary/10 text-primary"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
        >
          {isSaving ? (
            <>
              <CloudUpload className="h-4 w-4 animate-pulse" />
              <span className="text-xs font-medium">Saving...</span>
            </>
          ) : (
            <>
              <div className="relative">
                <CloudUpload className="h-4 w-4" />
                <Check className={cn(
                  "h-3 w-3 absolute -bottom-0.5 -right-0.5 bg-primary text-primary-foreground rounded-full p-0.5",
                  "animate-in fade-in zoom-in duration-500"
                )} />
              </div>
              <span className="text-xs font-medium">Saved</span>
            </>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {isSaving ? (
          <p>Auto-saving your progress...</p>
        ) : (
          <p>Last saved {timeSinceLastSave}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
