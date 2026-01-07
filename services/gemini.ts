import { GoogleGenAI } from "@google/genai";
import { SaleOrder } from "../types";

export const getSalesInsight = async (orders: SaleOrder[]) => {
  if (!orders || orders.length === 0) {
    return "No sales data available for analysis. Add some records to get started.";
  }

  // Use the required initialization pattern with named parameter
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const salesSummary = orders.map(o => 
    `- ${o.date}: ${o.product} (${o.weight}) sold to ${o.customerName} in ${o.area}. Total: ₹${o.totalPrice}`
  ).slice(-20).join('\n');

  const systemInstruction = "You are a Senior Agricultural Market Analyst. Analyze the provided bean sales data and provide 3 high-impact bullet points covering performance trends, revenue health, and actionable market strategy. Keep it extremely concise and professional.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze these recent transactions:\n\n${salesSummary}`,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });
    
    return response.text || "Analysis complete. Market parameters are stable.";
  } catch (error) {
    console.error("[Gemini] Service Error:", error);
    return "The intelligence engine is currently offline. Please verify your API configuration.";
  }
};