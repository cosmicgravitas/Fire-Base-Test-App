import { GoogleGenAI, Type } from "@google/genai";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A professional product title."
    },
    description: {
      type: Type.STRING,
      description: "A brief one-sentence factual description."
    }
  },
  required: ["title", "description"]
};

export const generateItemDetails = async (base64ImageData: string, mimeType: string): Promise<{ title: string; description: string }> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("Gemini API_KEY is not defined in environment variables.");
    throw new Error("AI service not configured. Please add an environment variable named 'API_KEY' in your dashboard settings. Hyphens are not allowed in the name.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            text: "Analyze this product image and extract its title and a short factual description for a marketplace inventory system.",
          },
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("AI returned no content.");
    
    return JSON.parse(jsonText);

  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    throw new Error(`AI Verification Failed: ${error.message || "Unknown Error"}`);
  }
};