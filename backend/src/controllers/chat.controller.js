import { generateResponse,generateChatTitle } from "../services/ai.services.js"
import chatModel from "../model/chat.model.js"
import messageModel from "../model/message.model.js"



export async function sendMessage(req,res) {

    const {message,chat:chatId}=req.body

   let title = null;
   let chat = null;

    if (!chatId) {
    title = await generateChatTitle(message);

    chat = await chatModel.create({
        user: req.user.id,
        title
    })
    
  }

     const userMessage= await messageModel.create({
        chat:chatId||chat._id,
        content:message,
        role:"user"
    })

     const messages= await messageModel.find({chat:chatId|| chat._id})
     const result=await generateResponse(messages)

     const aiMessage=await messageModel.create({
        chat:chatId||chat._id,
        content:result,
        role:"ai"
    })

    res.status(201.).json({
      title,
      chat,
      userMessage,
      aiMessage
    })
    
}

export async function getChats(req,res) {
  const  user=req.user

  const chats=await chatModel.find({user:user.id})

  res.status(200).json({
    message:"chat retrived successfull",
    chats
  })

}

export async function getMessages(req,res) {
  const {chatId}=req.params


const chat=await chatModel.findOne({
  user:req.user.id,
  _id:chatId
})

  if(!chat){
    return res.status(404).json({
      message:"chat not found"
    })
  }

  const messages=await messageModel.find({
    chat:chatId
  })

  res.status(200).json({
    message:"messages retrived successfully",
    messages
  })


} 

export async function deleteChat(req,res) {
  const {chatId}=req.params

  const chat=await chatModel.findOneAndDelete({
    _id:chatId,
    user:req.user.id
  })


  await messageModel.deleteMany({
    chat:chatId
  })

  if(!chat){
    return res.status(404).json({
      message:"chat not found"
    })
  }

  
  res.status(200).json({
    message:"chat deleted successfully"
  })

}