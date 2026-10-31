import {
  generateResponse,
  generateChatTitle,
} from "../services/ai.services.js";

import chatModel from "../model/chat.model.js";
import messageModel from "../model/message.model.js";

export async function sendMessage(req, res) {
  try {
    const {
      message,
      chat: chatId,
      webSearch = false,
    } = req.body;

    let title = null;
    let chat = null;

    const isWebSearchEnabled = webSearch === true;

    if (!chatId) {
      title = await generateChatTitle(message);

      chat = await chatModel.create({
        user: req.user.id,
        title,
      });
    }

    const activeChatId = chatId || chat._id;

    await messageModel.create({
      chat: activeChatId,
      content: message,
      role: "user",
    });

    const messages = await messageModel.find({
      chat: activeChatId,
    });

    const result = await generateResponse(
      messages,
      isWebSearchEnabled
    );

    const aiMessage = await messageModel.create({
      chat: activeChatId,
      content: result,
      role: "ai",
    });

    res.status(201).json({
      title,
      chat,
      aiMessage,
    });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);

    res.status(500).json({
      message: "Something went wrong while generating response",
      error: error.message,
    });
  }
}

export async function getChats(req, res) {
  const user = req.user;

  const chats = await chatModel.find({
    user: user.id,
  });

  res.status(200).json({
    message: "Chat retrieved successfully",
    chats,
  });
}

export async function getMessages(req, res) {
  const { chatId } = req.params;

  const chat = await chatModel.findOne({
    user: req.user.id,
    _id: chatId,
  });

  if (!chat) {
    return res.status(404).json({
      message: "Chat not found",
    });
  }

  const messages = await messageModel.find({
    chat: chatId,
  });

  res.status(200).json({
    message: "Messages retrieved successfully",
    messages,
  });
}

export async function deleteChat(req, res) {
  const { chatId } = req.params;

  const chat = await chatModel.findOneAndDelete({
    _id: chatId,
    user: req.user.id,
  });

  if (!chat) {
    return res.status(404).json({
      message: "Chat not found",
    });
  }

  await messageModel.deleteMany({
    chat: chatId,
  });

  res.status(200).json({
    message: "Chat deleted successfully",
  });
}