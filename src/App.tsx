import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LandingPage } from "@/pages/LandingPage";
import { AuthPage } from "@/components/auth/AuthPage";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { UniversalIdSearch } from "@/components/vet/UniversalIdSearch";
import { QuickConsultation } from "@/components/vet/QuickConsultation";
import { CSVImport } from "@/components/vet/CSVImport";
import { AlertsFeed } from "@/components/tutor/AlertsFeed";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="search" element={<UniversalIdSearch />} />
              <Route path="consultation" element={<QuickConsultation />} />
              <Route path="import" element={<CSVImport />} />
              <Route path="alerts" element={<AlertsFeed />} />
              <Route path="*" element={<DashboardHome />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
