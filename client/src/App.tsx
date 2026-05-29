import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FinanceProvider } from "./contexts/FinanceContext";
import Home from "./pages/Home";
import Categorias from "./pages/Categorias";
import Historico from "@/pages/Historico"; // <--- Alterado para o padrão @/ que o seu app usa

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/categorias"} component={Categorias} />
      <Route path={"/historico"} component={Historico} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    const redirect = sessionStorage.redirect;
    if (redirect) {
      delete sessionStorage.redirect;
      window.location.href = redirect;
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <FinanceProvider>
          <TooltipProvider>
            <Toaster position="top-center" richColors />
            <Router />
          </TooltipProvider>
        </FinanceProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
