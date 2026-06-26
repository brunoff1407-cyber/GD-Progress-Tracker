import { Link } from "wouter";
import { Zap, LogOut } from "lucide-react";
import { useLocalAuth } from "@/context/LocalAuth";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useLocalAuth();
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center group-hover:glow-primary transition-all">
              <Zap className="text-primary-foreground" size={20} />
            </div>
            <span className="font-display text-xl tracking-wider uppercase text-foreground group-hover:text-primary transition-colors">
              GD Tracker
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/levels/new" className="text-sm font-medium hover:text-primary transition-colors uppercase tracking-widest bg-primary/10 px-4 py-2 rounded border border-primary/20 hover:border-primary/50">
              Add Level
            </Link>
            {user && (
              <button
                type="button"
                onClick={logout}
                title={`Log out ${user}`}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest px-3 py-2 rounded border border-border hover:border-foreground/30"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Log out</span>
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
