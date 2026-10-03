import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router'

const Protected = ({children}) => {
    const user=useSelector(state=>state.auth.user)
    const loading=useSelector(state=>state.auth.loading)
    const navigate=useNavigate()

    if(loading){
        return <div>Loading...</div>
    }

    if(!user){
        return <Navigate to="/login" replace/>
    }

  return children
}

export default Protected
