import axios from "axios";

const api = axios.create({
    baseURL: "https://nexora-ai-backend-vcnd.onrender.com",
    withCredentials: true,
});

export const sendMessage = async ({ message, chatId, webSearch = false }) => {
    const response = await api.post("/api/chat/sendMessage", {
        message,
        chat: chatId,
        webSearch,
    });

    return response.data;
};

export const getChats = async () => {
    const response = await api.get("/api/chat/");
    return response.data;
};

export const getMessages = async ({ chatId }) => {
    const response = await api.get(`/api/chat/${chatId}/messages`);
    return response.data;
};

export const deleteChat = async ({ chatId }) => {
    const response = await api.delete(`/api/chat/delete/${chatId}`);
    return response.data;
};