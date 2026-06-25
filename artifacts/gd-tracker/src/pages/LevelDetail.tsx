import { useParams, useLocation } from "wouter";
import { 
  useGetLevel, 
  useUpdateLevel, 
  useDeleteLevel, 
  getGetLevelQueryKey, 
  getGetLevelsQueryKey, 
  getGetStatsQueryKey,
  useGetLevelSessions,
  useCreateSession,
  useDeleteSession,
  getGetLevelSessionsQueryKey
} from "@/lib/localApi";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { ProgressBar } from "@/components/ProgressBar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, ArrowLeft, Star, Save, Plus, Calendar, Hash, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { ProgressChart } from "@/components/ProgressChart";

export default function LevelDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const levelId = parseInt(id || "0", 10);
  const { data: level, isLoading } = useGetLevel(levelId, { query: { enabled: !!levelId, queryKey: getGetLevelQueryKey(levelId) } });
  
  const updateLevel = useUpdateLevel();
  const deleteLevel = useDeleteLevel();

  // Sessions
  const { data: sessions, isLoading: sessionsLoading } = useGetLevelSessions(levelId, { query: { enabled: !!levelId, queryKey: getGetLevelSessionsQueryKey(levelId) } });
  const createSession = useCreateSession();
  const deleteSession = useDeleteSession();

  const [editMode, setEditMode] = useState(false);
  const [percent, setPercent] = useState<string>("0");
  const [attempts, setAttempts] = useState<string>("0");
  const [notes, setNotes] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  // Session form state
  const todayStr = new Date().toISOString().split('T')[0];
  const [sessionTotalAttempts, setSessionTotalAttempts] = useState<string>("");
  const [sessionPercent, setSessionPercent] = useState<string>("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [sessionDate, setSessionDate] = useState(todayStr);

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
      bestPercent: parseInt(percent, 10) || 0,
      attempts: parseInt(attempts, 10) || 0,
      notes,
      isCompleted: isCompleted || parseInt(percent, 10) === 100,
    };
    
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

  const handleLogSession = () => {
    const parsedTotal = parseInt(sessionTotalAttempts, 10) || 0;
    const parsedPercent = parseInt(sessionPercent, 10) || 0;
    // How many attempts were done this session = new total minus the previous total
    const sessionAttemptsDelta = Math.max(0, parsedTotal - level.attempts);
    
    createSession.mutate(
      {
        levelId,
        data: {
          attempts: sessionAttemptsDelta,
          bestPercent: parsedPercent,
          notes: sessionNotes || undefined,
          sessionDate: sessionDate ? new Date(sessionDate).toISOString() : undefined,
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetLevelSessionsQueryKey(levelId) });
          toast({ title: "Session logged!" });
          
          setSessionTotalAttempts("");
          setSessionPercent("");
          setSessionNotes("");
          
          const isNewBest = parsedPercent > level.bestPercent;
          const newBestPercent = isNewBest ? parsedPercent : level.bestPercent;
          const isNowCompleted = level.isCompleted || newBestPercent === 100;
          const newTotalAttempts = parsedTotal;

          updateLevel.mutate(
            {
              id: levelId,
              data: {
                bestPercent: newBestPercent,
                isCompleted: isNowCompleted,
                attempts: newTotalAttempts,
              }
            },
            {
              onSuccess: (data) => {
                queryClient.setQueryData(getGetLevelQueryKey(levelId), data);
                queryClient.invalidateQueries({ queryKey: getGetLevelsQueryKey() });
                queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
                if (isNewBest) {
                  toast({ title: "New best percent!", description: `Updated to ${parsedPercent}%` });
                }
              }
            }
          );
        },
        onError: () => {
          toast({ variant: "destructive", title: "Failed to log session" });
        }
      }
    );
  };

  const handleDeleteSession = (sessionId: number) => {
    if (!window.confirm("Delete this session?")) return;
    deleteSession.mutate(
      { id: sessionId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetLevelSessionsQueryKey(levelId) });
          toast({ title: "Session removed" });
        }
      }
    );
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pb-20">
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
          <div className="bg-card border border-card-border p-6 rounded-lg shadow-lg mb-8">
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
            <div className="bg-card border border-card-border p-6 rounded-lg mb-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Notes</h3>
              <p className="whitespace-pre-wrap text-foreground/90 font-light leading-relaxed">{level.notes}</p>
            </div>
          )
        )}

        <div className="mt-12 space-y-8">
          <div>
            <h2 className="text-2xl font-display uppercase tracking-wider mb-6 flex items-center gap-2 text-foreground">
              Practice Sessions
            </h2>
            
            <div className="bg-card border border-card-border p-6 rounded-lg shadow-lg">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Log New Session</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Calendar size={12}/> Date</label>
                  <Input 
                    type="date" 
                    value={sessionDate} 
                    onChange={e => setSessionDate(e.target.value)} 
                    className="bg-background"
                    data-testid="input-session-date"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <Hash size={12}/> Total Attempts Now
                  </label>
                  <Input 
                    type="number" 
                    min={level.attempts}
                    placeholder={level.attempts.toString()}
                    value={sessionTotalAttempts} 
                    onChange={e => setSessionTotalAttempts(e.target.value)} 
                    className="bg-background"
                    data-testid="input-session-attempts"
                  />
                  {sessionTotalAttempts !== "" && (
                    <p className="text-xs text-muted-foreground">
                      +{Math.max(0, (parseInt(sessionTotalAttempts, 10) || 0) - level.attempts)} this session
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Target size={12}/> Best %</label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      min="0" max="100"
                      placeholder="0"
                      value={sessionPercent} 
                      onChange={e => setSessionPercent(e.target.value)} 
                      className="bg-background pr-8"
                      data-testid="input-session-percent"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Notes</label>
                <Textarea 
                  value={sessionNotes} 
                  onChange={e => setSessionNotes(e.target.value)} 
                  placeholder="How did this session go?"
                  className="bg-background min-h-[80px]"
                  data-testid="input-session-notes"
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={handleLogSession} 
                  className="font-display uppercase tracking-wider"
                  disabled={createSession.isPending || !sessionTotalAttempts || !sessionPercent}
                  data-testid="button-log-session"
                >
                  {createSession.isPending ? "Logging..." : <><Plus size={16} className="mr-2" /> Log Session</>}
                </Button>
              </div>
            </div>
          </div>

          {sessions && sessions.length >= 2 && (
            <ProgressChart sessions={sessions} />
          )}

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Session History</h3>
            
            {sessionsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : sessions && sessions.length > 0 ? (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {[...sessions].sort((a, b) => new Date(b.sessionDate || b.createdAt).getTime() - new Date(a.sessionDate || a.createdAt).getTime()).map((session, i) => (
                  <div key={session.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active" data-testid={`card-session-${session.id}`}>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-card border-card-border shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow shadow-primary/20 z-10">
                      <div className="w-2 h-2 bg-primary rounded-full glow-primary"></div>
                    </div>
                    
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-border bg-card shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-primary font-display text-sm" data-testid={`text-session-date-${session.id}`}>
                          {new Date(session.sessionDate || session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-1"
                          onClick={() => handleDeleteSession(session.id)}
                          data-testid={`button-delete-session-${session.id}`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex-1">
                          <div className="text-xs uppercase text-muted-foreground mb-1">Best Percent</div>
                          <div className="flex items-center gap-2">
                            <span className="font-display text-xl" data-testid={`text-session-percent-${session.id}`}>{session.bestPercent}%</span>
                            <div className="flex-1 max-w-[100px]">
                              <ProgressBar value={session.bestPercent} isCompleted={session.bestPercent === 100} />
                            </div>
                          </div>
                        </div>
                        <div className="w-px h-8 bg-border"></div>
                        <div>
                          <div className="text-xs uppercase text-muted-foreground mb-1">Attempts</div>
                          <div className="font-display text-xl" data-testid={`text-session-attempts-${session.id}`}>{session.attempts}</div>
                        </div>
                      </div>
                      
                      {session.notes && (
                        <div className="text-sm text-foreground/80 bg-background/50 p-2 rounded border border-border/50" data-testid={`text-session-notes-${session.id}`}>
                          {session.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card/50 border border-dashed border-border rounded-lg" data-testid="text-no-sessions">
                <Target className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground font-display uppercase tracking-widest text-sm">No sessions logged yet.</p>
                <p className="text-muted-foreground/70 text-xs mt-1">Start grinding!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}