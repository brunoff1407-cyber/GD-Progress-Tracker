import { type ReactNode } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";
import { Gamepad2, Lock, LogOut, Loader2 } from "lucide-react";

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
  const { isLoading, isAuthenticated, user, login, logout } = useAuth();

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

  if (!user?.isOwner) {
    return (
      <Shell>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
          <Lock className="h-9 w-9" />
        </div>
        <h1 className="mt-6 font-display text-2xl tracking-wide text-foreground">
          Private tracker
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This tracker belongs to someone else. You don't have access to its data.
        </p>
        <Button
          onClick={logout}
          variant="outline"
          className="mt-6 w-full"
          size="lg"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </Shell>
    );
  }

  return <>{children}</>;
}
