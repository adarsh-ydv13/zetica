import { useState } from 'react'
import { useAuth } from '../hook/useAuth'
import { Navigate, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const user=useSelector(state=>state.auth.user)
  const loading=useSelector(state=>state.auth.loading)

  const {handleLogin}=useAuth()
  const navigate=useNavigate()

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

 const handleSubmit = async (event) => {
  event.preventDefault()

  try {
    await handleLogin({
      email: formData.email,
      password: formData.password,
    })

    navigate("/")
  } catch (error) {
    console.error("Login failed:", error)
  }
}


  if(!loading && user){
  return <Navigate to="/" replace/>
  }



  return (
    <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-zinc-950/80 p-8 shadow-2xl shadow-red-950/40 backdrop-blur">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-red-400">Welcome back</p>
        <h1 className="text-3xl font-bold text-white">Sign in to your account</h1>
        <p className="mt-2 text-sm text-zinc-400">Continue where you left off.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-zinc-300">
          Email
          <input
            className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="block text-sm font-medium text-zinc-300">
          Password
          <input
            className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </label>

        <button className="w-full rounded-lg bg-gradient-to-r from-red-600 to-rose-500 px-4 py-3 font-semibold text-white shadow-lg shadow-red-950/40 transition hover:from-red-500 hover:to-rose-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-zinc-950" type="submit">
          Sign in
        </button>
      </form>
    </div>
  )
}

export default Login
