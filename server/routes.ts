import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  summarizeText, 
  generateFlashcards, 
  generateQuiz, 
  generateStudyTip,
  generateStudySchedule
} from "./openai";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Notes API routes
  app.post("/api/notes/summarize", async (req, res) => {
    try {
      const { text, isDetailed } = req.body;
      
      if (!text || typeof text !== "string") {
        return res.status(400).json({ 
          message: "Text is required and must be a string" 
        });
      }
      
      const result = await summarizeText(text, isDetailed);
      res.json(result);
    } catch (error) {
      console.error("Error in /api/notes/summarize:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to summarize text" 
      });
    }
  });

  // Flashcards API routes
  app.post("/api/flashcards/generate", async (req, res) => {
    try {
      const { content, count } = req.body;
      
      if (!content || typeof content !== "string") {
        return res.status(400).json({ 
          message: "Content is required and must be a string" 
        });
      }
      
      const flashcards = await generateFlashcards(content, count || 5);
      res.json({ flashcards });
    } catch (error) {
      console.error("Error in /api/flashcards/generate:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate flashcards" 
      });
    }
  });

  // Quiz API routes
  app.post("/api/quizzes/generate", async (req, res) => {
    try {
      const { topic, difficulty, content, count } = req.body;
      
      if (!topic || typeof topic !== "string") {
        return res.status(400).json({ 
          message: "Topic is required and must be a string" 
        });
      }
      
      if (!difficulty || typeof difficulty !== "string") {
        return res.status(400).json({ 
          message: "Difficulty is required and must be a string" 
        });
      }
      
      const quiz = await generateQuiz(topic, difficulty, content, count || 5);
      res.json(quiz);
    } catch (error) {
      console.error("Error in /api/quizzes/generate:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate quiz" 
      });
    }
  });

  // Study Reminder Bot API routes
  app.get("/api/study/tip", async (req, res) => {
    try {
      const tip = await generateStudyTip();
      res.json({ tip });
    } catch (error) {
      console.error("Error in /api/study/tip:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate study tip" 
      });
    }
  });

  app.post("/api/study/schedule", async (req, res) => {
    try {
      const { subjects } = req.body;
      
      if (!subjects || !Array.isArray(subjects)) {
        return res.status(400).json({ 
          message: "Subjects are required and must be an array" 
        });
      }
      
      const schedule = await generateStudySchedule(subjects);
      res.json(schedule);
    } catch (error) {
      console.error("Error in /api/study/schedule:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate schedule" 
      });
    }
  });

  app.post("/api/study/reminders", async (req, res) => {
    try {
      const schema = z.object({
        userId: z.number(),
        subject: z.string(),
        date: z.string().transform(str => new Date(str)),
        duration: z.number().min(1),
        reminderTime: z.string().optional().transform(str => str ? new Date(str) : undefined),
      });
      
      const validated = schema.parse(req.body);
      
      const reminder = await storage.createStudyReminder({
        userId: validated.userId,
        subject: validated.subject,
        date: validated.date,
        duration: validated.duration,
        reminderTime: validated.reminderTime,
      });
      
      res.json(reminder);
    } catch (error) {
      console.error("Error in /api/study/reminders:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to create reminder" 
      });
    }
  });

  app.get("/api/study/reminders/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const reminders = await storage.getStudyRemindersByUserId(userId);
      res.json(reminders);
    } catch (error) {
      console.error("Error in GET /api/study/reminders/:userId:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to get reminders" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
