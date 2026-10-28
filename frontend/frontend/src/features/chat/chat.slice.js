 import {createSlice} from '@reduxjs/toolkit';


 const chatslice=createSlice({
    name: 'chat',
    initialState:{
        chats:{},
        currentChatId:null,
        isLoading:false,
        error:null,
    },
    reducers:{
        createNewChat:(state,action)=>{
       const {chatId,title}=action.payload
       state.chats[chatId]={
        id:chatId,
        title,
        messages:[],
        lastUpdated:new Date().toISOString(),
       }
        },

        addNewMessage:(state,action)=>{
            const {chatId,message}=action.payload
            state.chats[chatId].messages.push({content,role})
        },
        setChats:(state,action)=>{
            state.chats=action.payload
        },
        setCurrentChatId:(state,action)=>{
            state.currentChatId=action.payload
        },
        setLoading:(state,action)=>{
            state.isLoading=action.payload
        },
        setError:(state,action)=>{
            state.error=action.payload
        }
    }
 })


 export const {setChats,setCurrentChatId,setLoading,setError,createNewChat,addNewMessage}=chatslice.actions
 export default chatslice.reducer