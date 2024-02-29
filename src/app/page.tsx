import Image from 'next/image'

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-slate-300 to-zinc-100 p-4">
      <div className="bg-white rounded-3xl shadow-lg p-10 max-w-sm">
        <h2 className="text-slate-300 text-4xl font-bold select-none text-center">Auth</h2>
        <Image
          src="/icon_lock.jpg"
          width={120}
          height={120}
          className="rounded-2xl block m-auto my-10"
          alt="Logo"
        />
        <form className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="select-none block text-slate-300 font-medium">Email</label>
            <input
              type="email"
              id="email"
              className="w-full p-3 border-b outline-none border-gray-300 rounded mt-1"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label htmlFor="password" className="select-noneblock text-slate-300 font-medium">Password</label>
            <input
              type="password"
              id="password"
              className="w-full p-3 border-b outline-none border-gray-300 rounded mt-1"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="block w-full transition-colors duration-300 ease-in-out  bg-zinc-800 hover:bg-zinc-950 text-white py-2 rounded font-medium "
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  )
}
