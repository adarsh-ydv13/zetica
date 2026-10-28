import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {ChatMistralAI}  from "@langchain/mistralai"
import {HumanMessage,SystemMessage,AIMessage} from "langchain"

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-3.6-flash",
  apiKey: process.env.GEMINI_API_KEY,
});


const mistralModel=new ChatMistralAI({
  model:"ministral-3b-2512",
   temperature: 0,
  apiKey:process.env.MISTRAL_API_KEY
})

export async function generateResponse(messages) {
  const response=await geminiModel.invoke(messages.map(msg=>{
    if(msg.role=="user"){
      return new HumanMessage(msg.content)
    }
    else if(msg.role=="ai"){
      return new AIMessage(msg.content)
    }
  }))



  return (await response).text
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