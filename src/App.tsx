import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import { PremiumLoader } from "@/components/PremiumLoader";
import React, { Suspense, lazy } from 'react';

// Lazy load all pages for optimal bundle splitting and performance
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreateProfile = lazy(() => import("./pages/CreateProfile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ProfileAnalytics = lazy(() => import("./pages/ProfileAnalytics"));
const DesignStudio = lazy(() => import("./pages/DesignStudio"));
const DemoProfile = lazy(() => import("./pages/DemoProfile"));
const Pricing = lazy(() => import("./pages/Pricing"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PremiumLoader fullScreen={true} />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/signup" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/create-profile" element={<CreateProfile />} />
                <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
                <Route path="/p/:slug" element={<PublicProfile />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/profile-analytics/:id" element={<ProtectedRoute><ProfileAnalytics /></ProtectedRoute>} />
                <Route path="/design-studio/:id" element={<ProtectedRoute><DesignStudio /></ProtectedRoute>} />
                <Route path="/demo" element={<DemoProfile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

