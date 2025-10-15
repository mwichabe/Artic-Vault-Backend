// src/aiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { Message } from "./types";
import { aiAnalysts } from "./aiAnalystPersona";

dotenv.config();

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY! || "AIzaSyA18YZTwKi0j8fqzQDf8Ajz9X9AD5bHXtM");

/**
 * Fetches a real AI-generated analyst opinion using Gemini.
 */
export async function getAnalystOpinion(analystId: string, query: string): Promise<Message> {
  const analyst = aiAnalysts.find(a => a.id === analystId);
  if (!analyst) throw new Error(`Analyst ${analystId} not found.`);

   const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
  You are ${analyst.name}, an expert in ${analyst.specialty}.
  Instruction: ${analyst.systemInstruction}
  Task: Analyze this investment query in depth:
  "${query}"
  Provide a concise but insightful opinion.
  `;

  const result = await model.generateContent(prompt);
  const aiContent = result.response.text() || "No response generated.";

  return {
    id: `msg-${Date.now()}-${analystId}`,
    analystId,
    content: aiContent,
    timestamp: new Date(),
    type: "opinion",
  };
}
