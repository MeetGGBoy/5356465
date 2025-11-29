import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types.ts";

// Safely retrieve API key to prevent "process is not defined" errors in browser
const getApiKey = (): string => {
  try {
    // Check for standard process.env (Node.js/Webpack/Polyfilled)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Error accessing environment variables:", e);
  }
  return '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

export const analyzeFileMetadata = async (fileName: string, fileType: string, fileSize: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    console.warn("API Key is missing. Please ensure API_KEY is set in your environment variables.");
    return {
      description: "API Key missing. Cannot generate analysis.",
      tags: ["Error"]
    };
  }

  const prompt = `
    I have a file in a local network share. 
    Filename: "${fileName}"
    Type: "${fileType}"
    Size: "${fileSize}"

    Please generate a short, helpful description (max 15 words) describing what this file likely contains based on its name and extension.
    Also provide 3 short, relevant tags (max 1 word each) for categorization.
    Return the result in JSON format.
    Language: Simplified Chinese (zh-CN).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["description", "tags"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      description: "AI Analysis failed.",
      tags: ["Unknown"]
    };
  }
};