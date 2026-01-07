import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { ThemeProvider } from "@/components/ThemeProvider";
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { base } from 'viem/chains';
import { SplashScreen } from "@/components/SplashScreen";

import Home from "@/pages/Home";
import Challenges from "@/pages/Challenges";
import Pool from "@/pages/Pool";
import Mint from "@/pages/Mint";
import Leaderboard from "@/pages/Leaderboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/pool" component={Pool} />
      <Route path="/mint" component={Mint} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Show splash for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <OnchainKitProvider chain={base}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-background text-foreground font-sans selection:bg-secondary selection:text-secondary-foreground">
              <Router />
              <Navigation />
              <Toaster />
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </OnchainKitProvider>
  );
}

export default App;
