import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import KVKIssuerPage from "./pages/issuers/kvk/page";
import BankIssuancePage from "./pages/issuers/bank/page";
import TaxRegistrationPage from "./pages/issuers/tax-registration/page";
import KYCKYSPage from "./pages/use-cases/kyc-kys/page";
import CreateBranchPage from "./pages/use-cases/create-branch/page";
import KVKVerifierPage from "./pages/verifiers/kvk/page";
import InfogreffeVerifierPage from "./pages/verifiers/infogreffe/page";
import BelastingdienstVerifierPage from "./pages/verifiers/belastingdienst/page";
import IGrantWalletPage from "./pages/wallets/igrant/page";
import FictiveCoVerifierPage from "./pages/verifiers/fictiveco/page";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/issuers/kvk" element={<KVKIssuerPage />} />
          <Route path="/issuers/bank" element={<BankIssuancePage />} />
          <Route path="/issuers/tax-registration" element={<TaxRegistrationPage />} />
          <Route path="/use-cases/kyc-kys" element={<KYCKYSPage />} />
          <Route path="/use-cases/create-branch" element={<CreateBranchPage />} />
          <Route path="/verifiers/kvk" element={<KVKVerifierPage />} />
          <Route path="/verifiers/infogreffe" element={<InfogreffeVerifierPage />} />
          <Route path="/verifiers/belastingdienst" element={<BelastingdienstVerifierPage />} />
          <Route path="/verifiers/fictiveco" element={<FictiveCoVerifierPage />} />
          <Route path="/wallets/igrant" element={<IGrantWalletPage />} />
          {/* Redirects for old /issue paths */}
          <Route path="/issue" element={<Navigate to="/" replace />} />
          <Route path="/issue/*" element={<Navigate to="/" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
