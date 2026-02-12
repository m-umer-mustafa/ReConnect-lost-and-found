import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LostFoundProvider } from "@/context/LostFoundContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Auth } from "@/pages/Auth";
import { Home } from "@/pages/Home";
import { Browse } from "@/pages/Browse";
import { ReportItem } from "@/pages/ReportItem";
import { Dashboard } from "@/pages/Dashboard";
import { Blog } from "@/pages/Blog";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <LostFoundProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {  <Route path="/auth" element={<Auth />} /> /**/ }
                <Route path="/" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Home />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/browse" element={
                    <AppLayout>
                      <Browse />
                    </AppLayout>
                } />
                <Route path="/report" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ReportItem />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/blog" element={
                    <AppLayout>
                      <Blog />
                    </AppLayout>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </LostFoundProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
