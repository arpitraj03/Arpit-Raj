import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import NoteSummarizer from "@/pages/NoteSummarizer";
import FlashcardGenerator from "@/pages/FlashcardGenerator";
import QuizCreator from "@/pages/QuizCreator";
import StudyReminder from "@/pages/StudyReminder";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/summarizer" component={NoteSummarizer} />
        <Route path="/flashcards" component={FlashcardGenerator} />
        <Route path="/quizzes" component={QuizCreator} />
        <Route path="/reminders" component={StudyReminder} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
