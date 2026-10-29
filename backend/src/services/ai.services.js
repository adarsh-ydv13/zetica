import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {ChatMistralAI}  from "@langchain/mistralai"
import {HumanMessage,SystemMessage,AIMessage,createAgent,tool } from "langchain"
import * as z from "zod"
import { searchInternet } from "./internet.services.js";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-flash-latest",
  apiKey: process.env.GEMINI_API_KEY,
});


const mistralModel=new ChatMistralAI({
  model:"ministral-3b-2512",
   temperature: 0,
  apiKey:process.env.MISTRAL_API_KEY
})


const searchInternetTool=tool(
  searchInternet,
  {
    name:"searchInternet",
    description:"use this tool to get latest information from the internet",
    schema:z.object({
      query:z.string().describe("the search query to look up on the internet")
    })
  }
)


const agent=createAgent({
  model:mistralModel,
  tools:[searchInternetTool],
})

export async function generateResponse(messages) {
  console.log("Gemini agent calling...");

let response;

try {
    response = await agent.invoke({
   messages:[
    new SystemMessage(`You are a helpful and precise assistance for answering questions.
      If you dont lnow the answer , say you dont know,
      if the question requires up to date information  , USE THE "searchInternet" tool to get the latest 
      information from the internet and then answer based on search results`),
     ...messages.map(msg=>{
    if(msg.role=="user"){
      return new HumanMessage(msg.content)
    }
    else if(msg.role=="ai"){
      return new AIMessage(msg.content)
    }
  })]
})
} catch (error) {
    console.error("AGENT ERROR:", error);
    throw error;
}

console.log("Gemini response received");

  return  response.messages[response.messages.length-1].text
}


export async function generateChatTitle(message) {
  
   const response=await mistralModel.invoke([
    new SystemMessage(`You are a helpful assistant that generates concise and descriptive titles for chat conversations.
      
      User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of 
      the conversation in 2-4 words. The title should be clear, relevant, and engaging, giving users a quick understanding of the chat's topic.
      `),
  

   new HumanMessage( `
    Generate a title for a chat conversation based on following first message:
    "${message}"
    `)
     ])

    return (await response).text

}