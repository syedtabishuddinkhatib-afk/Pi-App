import { GoogleGenAI } from "@google/genai";
import { MOCK_PRODUCTS } from "./mockData";

let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiClient) {
    const apiKey = process.env.API_KEY || ''; 
    // In a real app, we handle missing keys more gracefully in the UI.
    // The instructions say assume process.env.API_KEY is available.
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const getProductRecommendations = async (userQuery: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const productContext = MOCK_PRODUCTS.map(p => `${p.name} (${p.category}): $${p.price} - ${p.description}`).join('\n');
    
    const prompt = `
      You are an intelligent shopping assistant for PiShop.
      Here is our current product catalog:
      ${productContext}

      The user asks: "${userQuery}"

      Recommend products from our catalog that match the user's needs. 
      Be helpful, enthusiastic, and concise. 
      If no product matches perfectly, suggest the closest alternative.
      Do not invent products not in the list.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "I'm having trouble connecting to the product database right now.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I apologize, but I cannot access my brain right now to help with recommendations. Please try again later.";
  }
};
