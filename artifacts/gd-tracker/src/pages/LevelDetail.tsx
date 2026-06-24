import { useParams, useLocation } from "wouter";
import { useGetLevel, useUpdateLevel, useDeleteLevel, getGetLevelQueryKey, getGetLevelsQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { ProgressBar } from "@/components/ProgressBar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, ArrowLeft, Star, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";

export default function LevelDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const levelId = parseInt(id || "0", 10);
  const { data: level, isLoading } = useGetLevel(levelId, { query: { enabled: !!levelId, queryKey: getGetLevelQueryKey(levelId) } });
  
  const updateLevel = useUpdateLevel();
  const deleteLevel = useDeleteLevel();

  const [editMode, setEditMode] = useState(false);
  const [percent, setPercent] = useState<string>("0");
  const [attempts, setAttempts] = useState<string>("0");
  const [notes, setNotes] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (level && !editMode) {
      setPercent(level.bestPercent.toString());
      setAttempts(level.attempts.toString());
      setNotes(level.notes || "");
      setIsCompleted(level.isCompleted);
    }
  }, [level, editMode]);

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (!level) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-20">
          <h2 className="text-2xl font-display text-destructive">Level not found</h2>
        </div>
      </Layout>
    );
  }

  const handleSave = () => {
    const updatedData = {
      bestPercent: parseInt(percent, 10),
      attempts: parseInt(attempts, 10),
      notes,
      isCompleted: isCompleted || parseInt(percent, 10) === 100,
    };
    
    // Automatically set isCompleted if percent is 100
    if (updatedData.bestPercent === 100) {
      updatedData.isCompleted = true;
      setIsCompleted(true);
    }

    updateLevel.mutate(
      { id: levelId, data: updatedData },
      {
        onSuccess: (data) => {
          queryClient.setQueryData(getGetLevelQueryKey(levelId), data);
          queryClient.invalidateQueries({ queryKey: getGetLevelsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
          setEditMode(false);
          toast({ title: "Progress updated!", description: "Keep grinding." });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Update failed" });
        }
      }
    );
  };

  const handleDelete = () => {
    if (!window.confirm("Delete this level from tracking?")) return;
    deleteLevel.mutate(
      { id: levelId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetLevelsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
          toast({ title: "Level removed" });
          setLocation("/");
        }
      }
    );
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground p-0 px-2" onClick={() => setLocation("/")}>
          <ArrowLeft className="mr-2" size={16} /> Back to Dashboard
        </Button>

        <div className="bg-card border border-card-border p-8 rounded-lg shadow-lg relative overflow-hidden mb-8">
          {level.isCompleted && (
             <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-20">
               <div className="absolute top-10 -right-10 bg-accent w-40 h-10 rotate-45"></div>
             </div>
          )}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-display uppercase tracking-wider text-foreground mb-2">
                {level.name}
              </h1>
              {level.creator && <p className="text-xl text-muted-foreground font-light">by {level.creator}</p>}
            </div>
            <div className="flex flex-col items-end gap-3">
              <DifficultyBadge difficulty={level.difficulty} />
              {level.stars != null && (
                <div className="flex items-center text-yellow-400 text-lg font-bold gap-1">
                  {level.stars} <Star size={20} className="fill-yellow-400" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-end">
              <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Progress</div>
              <div className={`text-4xl font-display ${level.isCompleted ? 'text-accent drop-shadow-[0_0_10px_hsl(var(--accent)/0.5)]' : 'text-primary drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)]'}`}>
                {editMode ? null : `${level.bestPercent}%`}
              </div>
            </div>
            <ProgressBar value={editMode ? parseInt(percent, 10) || 0 : level.bestPercent} isCompleted={isCompleted || (editMode && parseInt(percent, 10) === 100)} />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-border">
            <div className="text-muted-foreground">
              Added {new Date(level.createdAt).toLocaleDateString()}
            </div>
            {!editMode && (
              <div className="flex gap-2">
                <Button variant="outline" className="border-border hover:bg-border text-foreground font-display uppercase text-xs" onClick={() => setEditMode(true)}>
                  Update Progress
                </Button>
                <Button variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" size="icon" onClick={handleDelete}>
                  <Trash2 size={18} />
                </Button>
              </div>
            )}
          </div>
        </div>

        {editMode ? (
          <div className="bg-card border border-card-border p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-display mb-4 text-primary uppercase">Log Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Best Percent</label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    min="0" max="100" 
                    value={percent} 
                    onChange={e => {
                      setPercent(e.target.value);
                      if (e.target.value === "100") setIsCompleted(true);
                    }} 
                    className="bg-background text-2xl font-display text-primary h-14"
                  />
                  <span className="text-2xl font-display text-muted-foreground">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Total Attempts</label>
                <Input 
                  type="number" 
                  min="0" 
                  value={attempts} 
                  onChange={e => setAttempts(e.target.value)} 
                  className="bg-background text-2xl font-display text-foreground h-14"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 mb-6 p-4 bg-background border border-border rounded-md">
              <Switch 
                checked={isCompleted} 
                onCheckedChange={setIsCompleted} 
                className="data-[state=checked]:bg-accent"
              />
              <div>
                <div className="font-display uppercase text-sm">Level Completed</div>
                <div className="text-xs text-muted-foreground">Toggle to mark as beaten.</div>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Session Notes</label>
              <Textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                placeholder="Where did you die? What's the new strategy?"
                className="bg-background min-h-[120px] font-sans text-sm"
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setEditMode(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground font-display uppercase tracking-wider glow-primary" disabled={updateLevel.isPending}>
                {updateLevel.isPending ? "Saving..." : <><Save size={16} className="mr-2" /> Save Progress</>}
              </Button>
            </div>
          </div>
        ) : (
          level.notes && (
            <div className="bg-card border border-card-border p-6 rounded-lg">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Notes</h3>
              <p className="whitespace-pre-wrap text-foreground/90 font-light leading-relaxed">{level.notes}</p>
            </div>
          )
        )}
      </div>
    </Layout>
  );
}
