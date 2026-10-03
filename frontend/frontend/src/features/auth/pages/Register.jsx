import { useState } from 'react'

const Register = () => {
	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
	})

	const handleChange = (event) => {
		const { name, value } = event.target
		setFormData((currentData) => ({ ...currentData, [name]: value }))
	}

	const handleSubmit = (event) => {
		event.preventDefault()
		console.log('Registration submitted:', formData)
	}

	return (
		<div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-zinc-950/80 p-8 shadow-2xl shadow-red-950/40 backdrop-blur">
			<div className="mb-8">
				<p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-red-400">Get started</p>
				<h1 className="text-3xl font-bold text-white">Create your account</h1>
				<p className="mt-2 text-sm text-zinc-400">Join the conversation today.</p>
			</div>

			<form className="space-y-5" onSubmit={handleSubmit}>
				<label className="block text-sm font-medium text-zinc-300">
					Username
					<input className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Your username" required />
				</label>

				<label className="block text-sm font-medium text-zinc-300">
					Email
					<input className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
				</label>

				<label className="block text-sm font-medium text-zinc-300">
					Password
					<input className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a password" required />
				</label>

				<button className="w-full rounded-lg bg-gradient-to-r from-red-600 to-rose-500 px-4 py-3 font-semibold text-white shadow-lg shadow-red-950/40 transition hover:from-red-500 hover:to-rose-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-zinc-950" type="submit">
					Create account
				</button>
			</form>
		</div>
	)
}

export default Register
