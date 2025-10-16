import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
import { AuthProvider } from "@/contexts/AuthContext";
import { AztecWalletProvider } from "@/contexts/AztecWalletContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CreateOrganization from "./pages/CreateOrganization";
import Business from "./pages/Business";
import Payroll from "./pages/Payroll";
import Individual from "./pages/Individual";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AztecWalletProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <SidebarProvider>
              <div className="flex min-h-screen w-full flex-col">
                <Header />
                <div className="flex flex-1">
                  <AppSidebar />
                  <div className="flex-1">
                    <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/create-organization" element={<CreateOrganization />} />
                    <Route path="/business" element={<Business />} />
                    <Route path="/payroll" element={<Payroll />} />
                    <Route path="/individual" element={<Individual />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  </div>
                </div>
              </div>
            </SidebarProvider>
          </BrowserRouter>
        </TooltipProvider>
        </AztecWalletProvider>
      </AuthProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
