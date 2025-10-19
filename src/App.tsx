
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CreateTestUsersPage from "./pages/CreateTestUsers";
import SalesDirectorKPIsDashboard from "./components/SalesDirectorKPIsDashboard";
import VisitReport from "./components/VisitReport";
import ReturnIndexAnalysis from "./components/ReturnIndexAnalysis";
import RythmeRecrutement from "./components/RythmeRecrutement";
import ActionPlansList from "./components/action-plans/ActionPlansList";
import './i18n/config';

const queryClient = new QueryClient();

function App() {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/create-test-users" element={<CreateTestUsersPage />} />
              <Route 
                path="/sales-director/kpis" 
                element={<SalesDirectorKPIsDashboard onBack={handleBack} />} 
              />
              <Route 
                path="/delegate/visit-report" 
                element={<VisitReport onBack={handleBack} />} 
              />
              <Route 
                path="/delegate/return-index" 
                element={<ReturnIndexAnalysis onBack={handleBack} />} 
              />
              <Route 
                path="/delegate/recruitment-rate" 
                element={<RythmeRecrutement onBack={handleBack} />} 
              />
              <Route 
                path="/delegate/action-plans" 
                element={<ActionPlansList onBack={handleBack} />} 
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
