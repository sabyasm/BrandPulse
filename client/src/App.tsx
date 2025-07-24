import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import CompetitorMonitor from "@/pages/competitor-monitor";
import BrandMonitorComingSoon from "@/pages/brand-monitor-coming-soon";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/competitor-monitor" component={CompetitorMonitor} />
      <Route path="/brand-monitor" component={BrandMonitorComingSoon} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
