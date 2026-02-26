import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LandingPage } from "@/pages/LandingPage";
import { AuthPage } from "@/components/auth/AuthPage";
import { PlanosTutor } from "@/pages/PlanosTutor";
import { PlanosVeterinario } from "@/pages/PlanosVeterinario";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { UniversalIdSearch } from "@/components/vet/UniversalIdSearch";
import { QuickConsultation } from "@/components/vet/QuickConsultation";
import { CSVImport } from "@/components/vet/CSVImport";
import { GoldenTickets } from "@/components/vet/GoldenTickets";
import { AlertsFeed } from "@/components/tutor/AlertsFeed";
import { DigitalVault } from "@/components/tutor/DigitalVault";
import { PlansPage } from "@/components/subscription/PlansPage";
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
            <Route path="/login" element={<AuthPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/planos/tutor" element={<PlanosTutor />} />
            <Route path="/planos/veterinario" element={<PlanosVeterinario />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="search" element={<UniversalIdSearch />} />
              <Route path="consultation" element={<QuickConsultation />} />
              <Route path="import" element={<CSVImport />} />
              <Route path="golden-tickets" element={<GoldenTickets />} />
              <Route path="alerts" element={<AlertsFeed />} />
              <Route path="documents" element={<DigitalVault />} />
              <Route path="plans" element={<PlansPage />} />
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
