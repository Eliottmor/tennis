import { createFileRoute, Link } from '@tanstack/react-router'
import { useConvexAuth } from 'convex/react'
import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate({ to: '/dashboard', replace: true })
      } else {
        navigate({ to: '/login', replace: true })
      }
    }
  }, [isAuthenticated, isLoading, navigate])

  return (
    <main className="p-8 flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to Tennis Ladder</h1>
        <Link
          to="/login"
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
