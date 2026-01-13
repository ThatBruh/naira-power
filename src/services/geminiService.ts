import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { UtilityLog, AnalysisResult } from "../types";

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is missing in environment variables");
  }
  return new GoogleGenerativeAI(apiKey);
};

export const analyzeUtilityUsage = async (logs: UtilityLog[]): Promise<AnalysisResult> => {
  try {
    const genAI = getClient();
    
    // Sort logs by date for better context
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // We only send the last 10 logs to save context window and keep it relevant
    const recentLogs = sortedLogs.slice(-10);

    const prompt = `
      You are an energy efficiency expert for a household in Nigeria.
      Here is the recent history of utility recharges (electricity).
      Currency is Naira (NGN). Units are kWh.
      
      Data:
      ${JSON.stringify(recentLogs, null, 2)}

      Please analyze this data and provide:
      1. A brief summary of the spending trend (increasing, decreasing, stable).
      2. 3 actionable tips to save costs based on the usage patterns (or general best practices if data is sparse).
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            summary: { 
              type: SchemaType.STRING, 
              description: "A brief summary of spending trends." 
            },
            tips: { 
              type: SchemaType.ARRAY, 
              items: { type: SchemaType.STRING },
              description: "Three actionable tips."
            }
          },
          required: ["summary", "tips"]
        }
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing usage:", error);
    return {
      summary: "Could not generate analysis at this time. Please ensure your API Key is valid.",
      tips: ["Check insulation", "Turn off unused lights", "Service AC units regularly"]
    };
  }
};