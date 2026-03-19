import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import Home from "./pages/Home";
import Initiatives from "./pages/Initiatives";
import Goals from "./pages/Goals";
import Opportunities from "./pages/Opportunities";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"               element={<Home />} />
            <Route path="/initiatives"    element={<Initiatives />} />
            <Route path="/goals"          element={<Goals />} />
            <Route path="/opportunities"  element={<Opportunities />} />
            <Route path="/settings"       element={<SettingsPage />} />
            <Route path="*"              element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
