import { initializeSocketConnection } from "../service/chat.socket";

import {
  sendMessage,
  getMessages,
  getChats,
  deleteChat,
} from "../service/chat.api";

import {
  setChats,
  createNewChat,
  setCurrentChatId,
  setError,
  setLoading,
  addMessages,
  addNewMessage,
} from "../chat.slice";

import { useDispatch } from "react-redux";

export const useChat = () => {
  const dispatch = useDispatch();

  async function handleSendMessage({
    message,
    chatId,
    webSearch = false,
  }) {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const data = await sendMessage({
        message,
        chatId,
        webSearch,
      });

      console.log("API Response:", data);

      const { chat, aiMessage } = data;

      if (!aiMessage) {
        throw new Error("AI message is missing");
      }

      const activeChatId = chatId || chat?._id;

      if (!activeChatId) {
        throw new Error("Chat ID is missing");
      }

      if (!chatId) {
        if (!chat) {
          throw new Error("Chat data is missing");
        }

        dispatch(
          createNewChat({
            chatId: chat._id,
            title: chat.title,
          })
        );
      }

      dispatch(
        addNewMessage({
          chatId: activeChatId,
          content: message,
          role: "user",
        })
      );

      dispatch(
        addNewMessage({
          chatId: activeChatId,
          content: aiMessage.content,
          role: aiMessage.role,
        })
      );

      dispatch(setCurrentChatId(activeChatId));
    } catch (error) {
      console.error(
        "handleSendMessage error:",
        error.response?.data || error.message
      );

      dispatch(
        setError(
          error.response?.data?.message || error.message
        )
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleGetChats() {
    dispatch(setLoading(true));

    try {
      const data = await getChats();
      const { chats } = data;

      const formattedChats = chats.reduce((acc, chat) => {
        acc[chat._id] = {
          id: chat._id,
          title: chat.title,
          messages: [],
          lastUpdated: chat.updatedAt,
        };

        return acc;
      }, {});

      dispatch(setChats(formattedChats));
    } catch (error) {
      console.error("handleGetChats error:", error);
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleOpenChat(chatId, chats) {
    try {
      if (chats[chatId]?.messages.length === 0) {
        const data = await getMessages({ chatId });
        const { messages } = data;

        const formattedMessages = messages.map((msg) => ({
          content: msg.content,
          role: msg.role,
        }));

        dispatch(
          addMessages({
            chatId,
            messages: formattedMessages,
          })
        );
      }

      dispatch(setCurrentChatId(chatId));
    } catch (error) {
      console.error("handleOpenChat error:", error);
      dispatch(setError(error.message));
    }
  }

  return {
    initializeSocketConnection,
    handleSendMessage,
    handleGetChats,
    handleOpenChat,
  };
};