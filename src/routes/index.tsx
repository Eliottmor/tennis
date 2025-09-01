import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getWebRequest } from '@tanstack/react-start/server'
import { getAuth } from '@clerk/tanstack-react-start/server'

const authStateFn = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getWebRequest()
  if (!request) throw new Error('No request found')
  
  const user = await getAuth(request)

  if (!user) {
    throw redirect({ to: '/login/$' })
  }

  return {
    userId: user.userId,
  }
})

export const Route = createFileRoute('/')({
  component: Home,
  beforeLoad: async () => await authStateFn(),
  loader: async ({ context }) => {
    return {
      userId: context.userId,
    }
  }
})

function Home() {
  return (
    <main className="p-8 flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to Tennis Ladder</h1>
        <Link 
          to="/login/$" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
        >
          Go to Login
        </Link>
        <Link 
          to="/dashboard" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  )
}
