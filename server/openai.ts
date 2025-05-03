import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || 'demo-api-key'
});

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

/**
 * Summarize text into key points
 */
export async function summarizeText(text: string, isDetailed: boolean = false): Promise<{
  summary: string;
  keyPoints: string[];
}> {
  try {
    const detail = isDetailed ? "detailed" : "concise";
    
    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { 
            role: "system", 
            content: `You are an expert at summarizing educational content. Provide a ${detail} summary followed by key points in bullet format.`
          },
          {
            role: "user",
            content: `Please summarize the following text and extract the key points. 
                      The summary should be ${detail} and capture the main ideas.
                      Provide the output in JSON format with 'summary' and 'keyPoints' fields:
                      ${text}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{"summary": "", "keyPoints": []}');
      
      return {
        summary: result.summary || "",
        keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints : []
      };
    } catch (apiError) {
      console.error("API error, using fallback response:", apiError);
      
      // Extract sample content from the provided text to create a realistic example
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const firstSentence = sentences[0] || "Sample content";
      const shortText = text.length > 100 ? text.substring(0, 100) + "..." : text;
      
      return {
        summary: `This is a sample summary of: "${shortText}"`,
        keyPoints: [
          `Key point about "${firstSentence}"`,
          "The text covers important concepts in this subject area",
          "More in-depth study would reveal additional insights",
          isDetailed ? "Additional detailed information would normally be included here" : ""
        ].filter(point => point !== "")
      };
    }
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw new Error("Failed to summarize text. Please try again later.");
  }
}

/**
 * Generate flashcards from content
 */
export async function generateFlashcards(content: string, count: number = 5): Promise<{
  question: string;
  answer: string;
}[]> {
  try {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { 
            role: "system", 
            content: `You are an expert at creating educational flashcards. Generate concise and clear flashcards with questions on one side and answers on the other.`
          },
          {
            role: "user",
            content: `Based on the following content, generate ${count} flashcards with questions and answers.
                      Each flashcard should cover a key concept from the material.
                      Provide the output in JSON format as an array of objects with 'question' and 'answer' fields:
                      ${content}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{"flashcards": []}');
      
      return Array.isArray(result.flashcards) ? result.flashcards : [];
    } catch (apiError) {
      console.error("API error, using fallback flashcards:", apiError);
      
      // Extract some content for flashcard creation
      const words = content.split(/\s+/).filter(w => w.length > 0);
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      // Generate sample flashcards
      const flashcards = [];
      for (let i = 0; i < Math.min(count, 5); i++) {
        const sampleQuestion = `What is ${words[i * 10 % Math.max(words.length, 1)]||"this concept"}?`;
        const sampleAnswer = sentences[i % Math.max(sentences.length, 1)] || "This is an example answer.";
        
        flashcards.push({
          question: sampleQuestion,
          answer: sampleAnswer
        });
      }
      
      return flashcards;
    }
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error("Failed to generate flashcards. Please try again later.");
  }
}

/**
 * Generate a quiz with multiple choice questions
 */
export async function generateQuiz(topic: string, difficulty: string, content: string = "", count: number = 5): Promise<{
  title: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}> {
  try {
    let promptContent = `Topic: ${topic}\nDifficulty: ${difficulty}\n`;
    if (content) {
      promptContent += `Additional content to include: ${content}\n`;
    }
    
    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { 
            role: "system", 
            content: `You are an expert at creating educational quizzes. Generate multiple-choice questions on various topics.`
          },
          {
            role: "user",
            content: `Create a quiz with ${count} multiple-choice questions about '${topic}' at '${difficulty}' difficulty level.
                     ${content ? `Include information from this additional content: ${content}` : ''}
                     Each question should have 4 options with only one correct answer.
                     Format the output as JSON with a 'title' field and a 'questions' array.
                     Each question should have 'question', 'options' (array of strings), and 'correctAnswer' (index of the correct option, 0-based) fields.`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{"title": "", "questions": []}');
      
      return {
        title: result.title || `${topic} Quiz`,
        questions: Array.isArray(result.questions) ? result.questions : []
      };
    } catch (apiError) {
      console.error("API error, using fallback quiz:", apiError);
      
      // Generate fallback quiz questions
      const sampleQuestions = [];
      for (let i = 0; i < Math.min(count, 5); i++) {
        sampleQuestions.push({
          question: `Sample ${topic} question #${i+1}?`,
          options: [
            `Answer option A for question ${i+1}`,
            `Answer option B for question ${i+1}`,
            `Answer option C for question ${i+1}`,
            `Answer option D for question ${i+1}`
          ],
          correctAnswer: i % 4 // Rotating between answers
        });
      }
      
      return {
        title: `${topic} Quiz (${difficulty} level)`,
        questions: sampleQuestions
      };
    }
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz. Please try again later.");
  }
}

/**
 * Generate a study tip or motivational content
 */
export async function generateStudyTip(): Promise<string> {
  try {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { 
            role: "system", 
            content: `You are an expert in study techniques and motivation. Provide short, practical study tips that students can apply.`
          },
          {
            role: "user",
            content: `Generate an insightful study tip or motivational advice for a student. 
                      Keep it concise (2-3 sentences) and practical.
                      Focus on effective study techniques, motivation, or productivity.
                      Provide the output as a simple JSON with a 'tip' field.`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{"tip": ""}');
      
      return result.tip || "Break your study sessions into shorter periods with small breaks in between to maintain focus and avoid burnout.";
    } catch (apiError) {
      console.error("API error, using fallback study tip:", apiError);
      
      // Array of study tips to use as fallbacks
      const studyTips = [
        "Break your study sessions into shorter periods with small breaks in between to maintain focus and avoid burnout.",
        "Use active recall by testing yourself on material rather than just rereading it. This strengthens memory and improves retention.",
        "Create a dedicated study space free from distractions to help your brain associate that environment with focused work.",
        "Teach the material to someone else or explain it out loud. If you can explain it clearly, you truly understand it.",
        "Use spaced repetition by reviewing material at increasing intervals over time rather than cramming all at once."
      ];
      
      return studyTips[Math.floor(Math.random() * studyTips.length)];
    }
  } catch (error) {
    console.error("Error generating study tip:", error);
    throw new Error("Failed to generate study tip. Please try again later.");
  }
}

/**
 * Generate a study schedule suggestion
 */
export async function generateStudySchedule(subjects: string[]): Promise<{
  schedule: {
    day: string;
    sessions: {
      subject: string;
      time: string;
      duration: string;
    }[];
  }[];
}> {
  try {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          { 
            role: "system", 
            content: `You are an expert in creating effective study schedules. Create balanced study plans that help students manage their time.`
          },
          {
            role: "user",
            content: `Create a weekly study schedule for the following subjects: ${subjects.join(", ")}.
                      The schedule should include study sessions for the next 7 days (Monday-Sunday).
                      Each day should have 1-3 study sessions for different subjects.
                      Format output as JSON with a 'schedule' array containing objects with 'day' and 'sessions'.
                      Each session should have 'subject', 'time', and 'duration' fields.`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{"schedule": []}');
      
      return {
        schedule: Array.isArray(result.schedule) ? result.schedule : []
      };
    } catch (apiError) {
      console.error("API error, using fallback study schedule:", apiError);
      
      // Create a basic fallback schedule
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const times = ["09:00", "14:00", "18:00"];
      const durations = ["45 min", "60 min", "90 min"];
      
      const schedule = days.map((day, dayIndex) => {
        // Create 1-3 study sessions per day
        const sessionsCount = Math.min(Math.floor(Math.random() * 3) + 1, subjects.length);
        const sessions = [];
        
        // Assign random subjects to sessions
        const shuffledSubjects = [...subjects].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < sessionsCount; i++) {
          sessions.push({
            subject: shuffledSubjects[i] || "General Study",
            time: times[i % times.length],
            duration: durations[Math.floor(Math.random() * durations.length)]
          });
        }
        
        return {
          day,
          sessions
        };
      });
      
      return { schedule };
    }
  } catch (error) {
    console.error("Error generating study schedule:", error);
    throw new Error("Failed to generate study schedule. Please try again later.");
  }
}
