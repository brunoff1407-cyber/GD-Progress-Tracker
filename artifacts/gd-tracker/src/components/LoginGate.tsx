import { useState, type FormEvent, type ReactNode } from "react";
import { useLocalAuth } from "@/context/LocalAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gamepad2 } from "lucide-react";

export function LoginGate({ children }: { children: ReactNode }) {
  const { user, login } = useLocalAuth();
  const [name, setName] = useState("");

  if (user) {
    return <>{children}</>;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    login(name);
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-card-border bg-card p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Gamepad2 className="h-9 w-9" />
        </div>
        <h1 className="mt-6 font-display text-2xl tracking-wide text-foreground">
          GD Progress Tracker
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter a username to access your tracked levels. Your progress is saved
          privately in this browser.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-left">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Username"
            aria-label="Username"
          />
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!name.trim()}
          >
            Log in
          </Button>
        </form>
      </div>
    </div>
  );
}
