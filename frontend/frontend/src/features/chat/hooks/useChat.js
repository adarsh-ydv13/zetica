import {initializeSocketConnection} from "../service/chat.socket"
import {sendMessage,getMessages,getChats,deleteChat} from "../service/chat.api"
import {setChats,createNewChat,setCurrentChatId,setError,setLoading, addNewMessage} from "../chat.slice";
import {useDispatch} from "react-redux"




export const useChat=()=>{

   const dispatch=useDispatch()

  async function handleSendMessage({message,chatId}){
     dispatch(setLoading(true))
     const data=await sendMessage({message,chatId})
     const  {chat,aiMessage}=data
    
     dispatch(createNewChat({
        chatId:chat._id,
        title:chat.title
     }))

     dispatch(addNewMessage({
        chatId:chat._id,
        content:message,
        role:"user"
     }))
     dispatch(addNewMessage({
        chatId:chat._id,
        content:aiMessage.content,
        role:aiMessage.role
     }))
     dispatch(setCurrentChatId(chat._id))
   }

    return{
        initializeSocketConnection,
        handleSendMessage
    }
}