import { Link } from 'react-router'
import Login from './pages/Login'
import Register from './pages/Register'

function Auth({ initialIsLogin = true }) {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.2),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(127,29,29,0.2),transparent_35%)]" />
      <section className="relative w-full max-w-md">
        {initialIsLogin ? <Login /> : <Register />}
        <Link
          className="mt-5 w-full text-center text-sm text-zinc-400 transition hover:text-red-400"
          to={initialIsLogin ? '/register' : '/login'}
        >
          {initialIsLogin ? 'Need an account? Create one' : 'Already have an account? Sign in'}
        </Link>
      </section>
    </main>
  )
}

export default Auth
