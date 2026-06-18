import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SchoolSettingsProvider } from "@/contexts/SchoolSettingsContext";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import NotFound from "./pages/NotFound.tsx";
import NetworkStatus from "@/components/NetworkStatus";
import { useStore } from "@/store/useStore";
import { useSchoolSettingsStore } from "@/store/useSchoolSettingsStore";
import ProtectedRoute, { getRoleHomePath } from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import { Loader2 } from "lucide-react";

// Route components are lazy-loaded so the initial download (the login screen)
// no longer bundles every dashboard and the charting library up front. Each
// dashboard — and its heavy deps like recharts — is fetched only when first
// visited, which cuts the first-load JS the browser must parse.
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const TeacherDashboard = lazy(() => import("@/pages/TeacherDashboard"));
const StudentDashboard = lazy(() => import("@/pages/StudentDashboard"));
const ParentDashboard = lazy(() => import("@/pages/ParentDashboard"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));

const queryClient = new QueryClient();

const AuthGate = () => {
  const { role, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Synchronizing session...</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return <Login />;
  }

  return <Navigate to={getRoleHomePath(role)} replace />;
};

const AppBootstrap = () => {
  const { schoolId, role, authLoading } = useAuth();
  const init       = useStore(state => state.init);
  const resetStore = useStore(state => state.resetStore);

  useEffect(() => {
    if (authLoading) return;

    if (!role || !schoolId) {
      // User logged out — wipe all school-specific data immediately
      // so the next login never sees stale data from the previous session
      resetStore();
      useSchoolSettingsStore.getState().resetSchoolSettings();
      return;
    }

    // User logged in — initialise data for their school
    void init(schoolId);
  }, [authLoading, role, schoolId, init, resetStore]);

  return null;
};

const App = () => {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <SchoolSettingsProvider>
              <NetworkStatus />
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppBootstrap />
                <Suspense fallback={(
                  <div className="flex h-screen items-center justify-center bg-background">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  </div>
                )}>
                <Routes>
                  <Route path="/" element={<AuthGate />} />
                  <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/accountant" element={<ProtectedRoute role="accountant"><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
                  <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
                  <Route path="/parent" element={<ProtectedRoute role="parent"><ParentDashboard /></ProtectedRoute>} />
                  <Route path="/students" element={<Navigate to="/student" replace />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </Suspense>
              </BrowserRouter>
            </SchoolSettingsProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
