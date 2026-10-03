import { createBrowserRouter } from "react-router";
import Auth from "../features/auth/Auth";
import Dashboard from "../features/chat/pages/Dashboard";
import Protected from "../features/auth/components/Protected";



export const router=createBrowserRouter([
    {
        path:"/login",
        element:<Auth initialIsLogin={true}/>
    },
    {
        path:"/register",
        element:<Auth initialIsLogin={false}/>
    },
    {
        path:"/",
        element:<Protected>
            <Dashboard/>
        </Protected>
    }
])