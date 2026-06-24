import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LevelInputDifficulty, useCreateLevel, getGetLevelsQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  creator: z.string().optional(),
  difficulty: z.nativeEnum(LevelInputDifficulty),
  stars: z.coerce.number().min(1).max(10).optional().or(z.literal("").transform(() => undefined)),
  bestPercent: z.coerce.number().min(0).max(100).optional(),
  attempts: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewLevel() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createLevel = useCreateLevel();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      creator: "",
      difficulty: LevelInputDifficulty.Auto,
      stars: undefined,
      bestPercent: 0,
      attempts: 0,
      notes: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    createLevel.mutate(
      { data },
      {
        onSuccess: (level) => {
          queryClient.invalidateQueries({ queryKey: getGetLevelsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
          toast({
            title: "Level added",
            description: "Ready to start grinding.",
          });
          setLocation(`/levels/${level.id}`);
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to add level. Try again.",
          });
        },
      }
    );
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-display text-primary mb-8 uppercase">Add Level</h1>
        
        <div className="bg-card border border-card-border p-6 rounded-lg shadow-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground uppercase tracking-wider text-xs">Level Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Bloodbath" className="bg-background border-border text-foreground font-medium" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="creator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground uppercase tracking-wider text-xs">Creator</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Riot" className="bg-background border-border text-foreground" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground uppercase tracking-wider text-xs">Difficulty</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-border text-foreground">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(LevelInputDifficulty).map(([key, value]) => (
                            <SelectItem key={key} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stars"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground uppercase tracking-wider text-xs">Stars (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={10} className="bg-background border-border text-foreground" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="bestPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground uppercase tracking-wider text-xs">Best Percent</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input type="number" min={0} max={100} className="bg-background border-border text-foreground" {...field} />
                          <span className="text-muted-foreground font-display">%</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="attempts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground uppercase tracking-wider text-xs">Total Attempts</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} className="bg-background border-border text-foreground" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground uppercase tracking-wider text-xs">Notes & Strategy</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g. Practice 40-60% run. Ship part is tricky." className="bg-background border-border text-foreground min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full font-display uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground glow-primary" disabled={createLevel.isPending}>
                {createLevel.isPending ? "Adding..." : "Add Level"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
