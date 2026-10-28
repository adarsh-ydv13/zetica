import {initializeSocketConnection} from "../service/chat.socket"
import {sendMessage,getMessages,getChats,deleteChat} from "../service/chat.api"
import {setChats,createNewChat,setCurrentChatId,setError,setLoading,addMessages, addNewMessage} from "../chat.slice";
import {useDispatch} from "react-redux"




export const useChat=()=>{

   const dispatch=useDispatch()

 async function handleSendMessage({ message, chatId }) {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
        const data = await sendMessage({ message, chatId });

        console.log("API Response:", data);

        const { chat, aiMessage } = data;

        if (!chat || !aiMessage) {
            throw new Error("Chat or AI message is missing from API response");
        }

        dispatch(createNewChat({
            chatId: chat._id,
            title: chat.title
        }));

        dispatch(addNewMessage({
            chatId: chat._id,
            content: message,
            role: "user"
        }));

        dispatch(addNewMessage({
            chatId: chat._id,
            content: aiMessage.content,
            role: aiMessage.role
        }));

        dispatch(setCurrentChatId(chat._id));

    } catch (error) {
        console.error("handleSendMessage error:", error);
        dispatch(setError(error.message || "Failed to send message"));
    } finally {
        dispatch(setLoading(false));
    }
}

async function handleGetChats(){
   dispatch(setLoading(true))
   const data=await getChats()
   const {chats}=data
   dispatch(setChats(chats.reduce((acc,chat)=>{
      acc[chat._id]={
         id:chat._id,
         title:chat.title,
         messages:[],
         lastUpdated:chat.updatedAt,
      }
      return acc
   },{})))
   dispatch(setLoading(false))
}

async function handleOpenChat(chatId) {

   const data=await getMessages({chatId})
   const {messages}=data

   const formattedMessages=messages.map(msg=>({
      content:msg.content,
      role:msg.role,
   }))
   dispatch(addMessages({
      chatId,
      messages:formattedMessages
   }))
   dispatch(setCurrentChatId(chatId))
   
}

    return{
        initializeSocketConnection,
        handleSendMessage,
        handleGetChats,
        handleOpenChat
    }
}