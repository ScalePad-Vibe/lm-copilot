import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { AppStoreProvider } from "@/context/AppStoreContext";
import Marketplace from "./pages/Marketplace";
import AppDetail from "./pages/AppDetail";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <AppStoreProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/"                   element={<Navigate to="/marketplace" replace />} />
              <Route path="/marketplace"        element={<Marketplace />} />
              <Route path="/marketplace/:appId" element={<AppDetail />} />
              <Route path="/settings"           element={<SettingsPage />} />
              <Route path="*"                   element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppStoreProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
