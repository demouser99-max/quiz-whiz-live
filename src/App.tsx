import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import Welcome from "./pages/Welcome";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateQuiz from "./pages/CreateQuiz";
import JoinQuiz from "./pages/JoinQuiz";
import Lobby from "./pages/Lobby";
import QuizPlay from "./pages/QuizPlay";
import Results from "./pages/Results";
import SoloTopicSelect from "./pages/SoloTopicSelect";
import SoloSetup from "./pages/SoloSetup";
import SoloPlay from "./pages/SoloPlay";
import SoloResults from "./pages/SoloResults";
import NotFound from "./pages/NotFound";
import { BuiltByButton } from "./components/BuiltByButton";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BuiltByButton />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/home" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create" element={<CreateQuiz />} />
              <Route path="/join" element={<JoinQuiz />} />
              <Route path="/join/:code" element={<JoinQuiz />} />
              <Route path="/lobby/:code" element={<Lobby />} />
              <Route path="/play/:code" element={<QuizPlay />} />
              <Route path="/results/:code" element={<Results />} />
              <Route path="/solo" element={<SoloTopicSelect />} />
              <Route path="/solo/setup/:topic" element={<SoloSetup />} />
              <Route path="/solo/play" element={<SoloPlay />} />
              <Route path="/solo/results" element={<SoloResults />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
