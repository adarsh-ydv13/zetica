import {initializeSocketConnection} from "../service/chat.socket"
import {sendMessage,getMessages,getChats,deleteChat} from "../service/chat.api"
import {setChats,createNewChat,setCurrentChatId,setError,setLoading, addNewMessage} from "../chat.slice";
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

    return{
        initializeSocketConnection,
        handleSendMessage
    }
}