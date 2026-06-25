import { useEffect, type ReactNode } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";
import { Gamepad2, Loader2 } from "lucide-react";
import { setCurrentUserId } from "@/lib/localStore";

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-card-border bg-card p-8 text-center shadow-2xl">
        {children}
      </div>
    </div>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, user, login } = useAuth();

  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id);
    }
  }, [user?.id]);

  if (isLoading) {
    return (
      <Shell>
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading…</p>
      </Shell>
    );
  }

  if (!isAuthenticated) {
    return (
      <Shell>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Gamepad2 className="h-9 w-9" />
        </div>
        <h1 className="mt-6 font-display text-2xl tracking-wide text-foreground">
          GD Progress Tracker
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Log in to view and manage your tracked levels.
        </p>
        <Button onClick={login} className="mt-6 w-full" size="lg">
          Log in
        </Button>
      </Shell>
    );
  }

  return <>{children}</>;
}
