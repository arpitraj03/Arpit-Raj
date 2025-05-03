import {
  users, type User, type InsertUser,
  notes, type Note, type InsertNote,
  flashcards, type Flashcard, type InsertFlashcard,
  quizzes, type Quiz, type InsertQuiz,
  studyReminders, type StudyReminder, type InsertStudyReminder,
  type QuizQuestion
} from "@shared/schema";

// Interface for storage
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Notes methods
  createNote(note: InsertNote): Promise<Note>;
  getNoteById(id: number): Promise<Note | undefined>;
  getNotesByUserId(userId: number): Promise<Note[]>;
  updateNoteSummary(id: number, summary: string): Promise<Note | undefined>;
  
  // Flashcard methods
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  getFlashcardsByUserId(userId: number): Promise<Flashcard[]>;
  getFlashcardsByDeck(userId: number, deckName: string): Promise<Flashcard[]>;
  
  // Quiz methods
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  getQuizById(id: number): Promise<Quiz | undefined>;
  getQuizzesByUserId(userId: number): Promise<Quiz[]>;
  
  // Study reminder methods
  createStudyReminder(reminder: InsertStudyReminder): Promise<StudyReminder>;
  getStudyRemindersByUserId(userId: number): Promise<StudyReminder[]>;
  updateStudyReminderStatus(id: number, completed: boolean): Promise<StudyReminder | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private notes: Map<number, Note>;
  private flashcards: Map<number, Flashcard>;
  private quizzes: Map<number, Quiz>;
  private studyReminders: Map<number, StudyReminder>;
  
  private currentUserId: number;
  private currentNoteId: number;
  private currentFlashcardId: number;
  private currentQuizId: number;
  private currentStudyReminderId: number;

  constructor() {
    this.users = new Map();
    this.notes = new Map();
    this.flashcards = new Map();
    this.quizzes = new Map();
    this.studyReminders = new Map();
    
    this.currentUserId = 1;
    this.currentNoteId = 1;
    this.currentFlashcardId = 1;
    this.currentQuizId = 1;
    this.currentStudyReminderId = 1;
    
    // Add some default users
    this.createUser({ username: "testuser", password: "password" });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Notes methods
  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.currentNoteId++;
    const now = new Date();
    const note: Note = { 
      ...insertNote, 
      id, 
      summary: null,
      createdAt: now
    };
    this.notes.set(id, note);
    return note;
  }

  async getNoteById(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async getNotesByUserId(userId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(
      (note) => note.userId === userId
    );
  }

  async updateNoteSummary(id: number, summary: string): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;

    const updatedNote = { ...note, summary };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  // Flashcard methods
  async createFlashcard(insertFlashcard: InsertFlashcard): Promise<Flashcard> {
    const id = this.currentFlashcardId++;
    const now = new Date();
    const flashcard: Flashcard = { 
      ...insertFlashcard, 
      id,
      createdAt: now 
    };
    this.flashcards.set(id, flashcard);
    return flashcard;
  }

  async getFlashcardsByUserId(userId: number): Promise<Flashcard[]> {
    return Array.from(this.flashcards.values()).filter(
      (flashcard) => flashcard.userId === userId
    );
  }

  async getFlashcardsByDeck(userId: number, deckName: string): Promise<Flashcard[]> {
    return Array.from(this.flashcards.values()).filter(
      (flashcard) => flashcard.userId === userId && flashcard.deckName === deckName
    );
  }

  // Quiz methods
  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const id = this.currentQuizId++;
    const now = new Date();
    const quiz: Quiz = { 
      ...insertQuiz, 
      id,
      createdAt: now 
    };
    this.quizzes.set(id, quiz);
    return quiz;
  }

  async getQuizById(id: number): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async getQuizzesByUserId(userId: number): Promise<Quiz[]> {
    return Array.from(this.quizzes.values()).filter(
      (quiz) => quiz.userId === userId
    );
  }

  // Study reminder methods
  async createStudyReminder(insertReminder: InsertStudyReminder): Promise<StudyReminder> {
    const id = this.currentStudyReminderId++;
    const now = new Date();
    const reminder: StudyReminder = { 
      ...insertReminder, 
      id,
      completed: false,
      createdAt: now 
    };
    this.studyReminders.set(id, reminder);
    return reminder;
  }

  async getStudyRemindersByUserId(userId: number): Promise<StudyReminder[]> {
    return Array.from(this.studyReminders.values()).filter(
      (reminder) => reminder.userId === userId
    );
  }

  async updateStudyReminderStatus(id: number, completed: boolean): Promise<StudyReminder | undefined> {
    const reminder = this.studyReminders.get(id);
    if (!reminder) return undefined;

    const updatedReminder = { ...reminder, completed };
    this.studyReminders.set(id, updatedReminder);
    return updatedReminder;
  }
}

export const storage = new MemStorage();
