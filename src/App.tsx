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
import { TutorLayout } from "@/pages/tutor/TutorLayout";
import { TutorDashboardPage } from "@/pages/tutor/TutorDashboardPage";
import { TutorPetsPage } from "@/pages/tutor/TutorPetsPage";
import { TutorCofrePage } from "@/pages/tutor/TutorCofrePage";
import { TutorVacinasPage } from "@/pages/tutor/TutorVacinasPage";
import { TutorReceitasPage } from "@/pages/tutor/TutorReceitasPage";
import { TutorDocumentosPage } from "@/pages/tutor/TutorDocumentosPage";
import { TutorLembretesPage } from "@/pages/tutor/TutorLembretesPage";
import { VetLayout } from "@/pages/vet/VetLayout";
import { VetDashboardPage } from "@/pages/vet/VetDashboardPage";
import { VetClientesPage } from "@/pages/vet/VetClientesPage";
import { VetReceitasPage } from "@/pages/vet/VetReceitasPage";
import { VetZoonosesPage } from "@/pages/vet/VetZoonosesPage";
import { VetMicrochipPage } from "@/pages/vet/VetMicrochipPage";
import { VetImportacaoPage } from "@/pages/vet/VetImportacaoPage";
import { VetGoldenTicketsPage } from "@/pages/vet/VetGoldenTicketsPage";
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

            {/* Tutor Area */}
            <Route path="/app/tutor" element={<TutorLayout />}>
              <Route index element={<TutorDashboardPage />} />
              <Route path="dashboard" element={<TutorDashboardPage />} />
              <Route path="pets" element={<TutorPetsPage />} />
              <Route path="cofre" element={<TutorCofrePage />} />
              <Route path="vacinas" element={<TutorVacinasPage />} />
              <Route path="receitas" element={<TutorReceitasPage />} />
              <Route path="documentos" element={<TutorDocumentosPage />} />
              <Route path="lembretes" element={<TutorLembretesPage />} />
            </Route>

            {/* Vet Area */}
            <Route path="/app/vet" element={<VetLayout />}>
              <Route index element={<VetDashboardPage />} />
              <Route path="dashboard" element={<VetDashboardPage />} />
              <Route path="clientes" element={<VetClientesPage />} />
              <Route path="receitas" element={<VetReceitasPage />} />
              <Route path="zoonoses" element={<VetZoonosesPage />} />
              <Route path="microchip" element={<VetMicrochipPage />} />
              <Route path="importacao" element={<VetImportacaoPage />} />
              <Route path="golden-tickets" element={<VetGoldenTicketsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
