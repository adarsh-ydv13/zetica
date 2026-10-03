import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.6-flash",
  apiKey: process.env.GEMINI_API_KEY,
});

export async function testAi() {
  try {
    const response = await model.invoke(
      "What is AI? Explain in under 100 words."
    );

    console.log(response.content);
  } catch (error) {
    console.error("AI ERROR:", error.message);
  }
}