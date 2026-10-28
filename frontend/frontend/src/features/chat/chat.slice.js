import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",

    initialState: {
        chats: {},
        currentChatId: null,
        isLoading: false,
        error: null,
    },

    reducers: {
        createNewChat: (state, action) => {
            const { chatId, title } = action.payload;

            if (!state.chats[chatId]) {
                state.chats[chatId] = {
                    id: chatId,
                    title,
                    messages: [],
                    lastUpdated: new Date().toISOString(),
                };
            }
        },

        addNewMessage: (state, action) => {
            const { chatId, content, role } = action.payload;
            if (!state.chats[chatId]) {
                return;
            }

            state.chats[chatId].messages.push({
                id: crypto.randomUUID(),
                content,
                role,
            });

            state.chats[chatId].lastUpdated = new Date().toISOString();
        },

        addMessages:(state,action)=>{
        const {chatId,messages}=action.payload
        state.chats[chatId].messages.push(...messages)
        },

        setChats:(state, action) => {
            state.chats = action.payload;
        },

        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload;
        },

        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },

        setError: (state, action) => {
            state.error = action.payload;
        },
    },
});

export const {
    setChats,
    setCurrentChatId,
    setLoading,
    setError,
    createNewChat,
    addNewMessage,
    addMessages
} = chatSlice.actions;

export default chatSlice.reducer;