import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
  createAgent,
  tool,
} from "langchain";
import * as z from "zod";
import { searchInternet } from "./internet.services.js";

const mistralModel = new ChatMistralAI({
  model: "ministral-3b-2512",
  temperature: 0,
  apiKey: process.env.MISTRAL_API_KEY,
});

const searchInternetTool = tool(searchInternet, {
  name: "searchInternet",
  description:
    "Search the internet for latest information, current events, recent updates, and factual information.",
  schema: z.object({
    query: z
      .string()
      .describe("The search query to look up on the internet"),
  }),
});

const normalAgent = createAgent({
  model: mistralModel,
  tools: [],
});

const webSearchAgent = createAgent({
  model: mistralModel,
  tools: [searchInternetTool],
});

export async function generateResponse(messages, webSearch = false) {
  console.log("Mistral agent calling...");
  console.log("Web Search:", webSearch ? "ENABLED" : "DISABLED");

  try {
    const selectedAgent = webSearch ? webSearchAgent : normalAgent;

    const systemPrompt = webSearch
      ? `You are a helpful and precise AI assistant.

You have access to an internet search tool called searchInternet.

Use this tool whenever the question requires current information, latest updates, recent events, or information that may have changed.

Analyze the search results carefully and provide a clear, accurate answer.

Do not invent facts or search results.

If the search results are insufficient, clearly mention that.`
      : `You are a helpful and precise AI assistant.

Answer questions using your existing knowledge.

You do not have access to internet search in this mode.

If you do not know something, clearly say that.

Never pretend that you searched the internet or accessed live information.`;

    const formattedMessages = messages
      .map((msg) => {
        if (msg.role === "user") {
          return new HumanMessage(msg.content);
        }

        if (msg.role === "ai") {
          return new AIMessage(msg.content);
        }

        return null;
      })
      .filter(Boolean);

    const response = await selectedAgent.invoke({
      messages: [
        new SystemMessage(systemPrompt),
        ...formattedMessages,
      ],
    });

    console.log("Mistral response received");

    return response.messages[response.messages.length - 1].text;
  } catch (error) {
    console.error("AGENT ERROR:", error);
    throw error;
  }
}

export async function generateChatTitle(message) {
  const response = await mistralModel.invoke([
    new SystemMessage(`
      You are a helpful assistant that generates concise and descriptive
      titles for chat conversations.

      Generate a title in 2-4 words.

      The title should be clear, relevant, and engaging.
    `),
    new HumanMessage(`
      Generate a title for a chat conversation based on this message:

      "${message}"
    `),
  ]);

  return response.text.replace(/[*"\`#]/g, "").trim();
}