import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import CreateQuiz from "./pages/CreateQuiz";
import JoinQuiz from "./pages/JoinQuiz";
import Lobby from "./pages/Lobby";
import QuizPlay from "./pages/QuizPlay";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/create" element={<CreateQuiz />} />
            <Route path="/join" element={<JoinQuiz />} />
            <Route path="/join/:code" element={<JoinQuiz />} />
            <Route path="/lobby/:code" element={<Lobby />} />
            <Route path="/play/:code" element={<QuizPlay />} />
            <Route path="/results/:code" element={<Results />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
