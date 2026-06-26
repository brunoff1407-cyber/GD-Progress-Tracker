import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import NewLevel from "@/pages/NewLevel";
import LevelDetail from "@/pages/LevelDetail";
import { LocalAuthProvider } from "@/context/LocalAuth";
import { LoginGate } from "@/components/LoginGate";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/levels/new" component={NewLevel} />
      <Route path="/levels/:id" component={LevelDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocalAuthProvider>
        <TooltipProvider>
          <LoginGate>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </LoginGate>
          <Toaster />
        </TooltipProvider>
      </LocalAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
