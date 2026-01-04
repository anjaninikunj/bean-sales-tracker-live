
import { GoogleGenAI } from "@google/genai";
import { SaleOrder } from "../types";

export const getSalesInsight = async (orders: SaleOrder[]) => {
  if (orders.length === 0) return "No sales data found. Start by entering your first bean crop transaction to get insights.";

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const salesSummary = orders.map(o => 
    `Date: ${o.date}, Crop: ${o.product}, Mandi/Area: ${o.area}, Variant: ${o.weight}, Qty: ${o.quantity}, Revenue: ₹${o.totalPrice}`
  ).join('\n');

  const systemInstruction = `You are a Senior Agricultural Economist specializing in pulse and bean markets in Gujarat (Surat, Adajan, etc.). 
  Your task is to analyze sales data and provide 3-4 concise, high-impact bullet points:
  1. Top performing crop and its dominant weight variant.
  2. Geographic area/Mandi with the highest revenue density.
  3. A strategic pricing or inventory tip for the next month based on volume trends.
  Keep the tone professional, encouraging, and data-driven.`;

  const userPrompt = `Analyze the following sales report for my bean crop business:\n\n${salesSummary}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The market analysis engine is temporarily resting. Please try again in a moment.";
  }
};
