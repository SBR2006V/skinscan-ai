import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

/**
 * Analyze skin condition based on description (text-based)
 */
export async function analyzeSkin(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [
      {
        role: "system",
        content:
          "You are a medical assistant that analyzes skin conditions and provides general advice. Do not give definitive diagnoses.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.choices[0]?.message?.content || "No response";
}