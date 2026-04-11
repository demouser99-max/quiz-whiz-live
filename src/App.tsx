import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import PageLoader from "@/components/PageLoader";
import { BuiltByButton } from "./components/BuiltByButton";

// Lazy load all pages
const Welcome = lazy(() => import("./pages/Welcome"));
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreateQuiz = lazy(() => import("./pages/CreateQuiz"));
const JoinQuiz = lazy(() => import("./pages/JoinQuiz"));
const Lobby = lazy(() => import("./pages/Lobby"));
const QuizPlay = lazy(() => import("./pages/QuizPlay"));
const Results = lazy(() => import("./pages/Results"));
const SoloTopicSelect = lazy(() => import("./pages/SoloTopicSelect"));
const SoloSetup = lazy(() => import("./pages/SoloSetup"));
const SoloPlay = lazy(() => import("./pages/SoloPlay"));
const SoloResults = lazy(() => import("./pages/SoloResults"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <Toaster />
            <Sonner />
            <BuiltByButton />

            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Primary landing — always /home */}
                  <Route path="/" element={<Navigate to="/home" replace />} />
                  <Route path="/home" element={<Index />} />
                  <Route path="/welcome" element={<Welcome />} />
                  <Route path="/auth" element={<Auth />} />

                  {/* Main Routes */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/create" element={<CreateQuiz />} />
                  <Route path="/join" element={<JoinQuiz />} />
                  <Route path="/join/:code" element={<JoinQuiz />} />
                  <Route path="/lobby/:code" element={<Lobby />} />
                  <Route path="/play/:code" element={<QuizPlay />} />
                  <Route path="/results/:code" element={<Results />} />

                  {/* Solo Mode */}
                  <Route path="/solo" element={<SoloTopicSelect />} />
                  <Route path="/solo/setup/:topic" element={<SoloSetup />} />
                  <Route path="/solo/play" element={<SoloPlay />} />
                  <Route path="/solo/results" element={<SoloResults />} />

                  {/* OAuth Callback */}
                  <Route path="/auth/callback" element={<AuthCallback />} />

                  {/* Fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
