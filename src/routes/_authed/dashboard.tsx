import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">Welcome to your tennis ladder dashboard</p>
      
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Recent Matches</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">View your latest tennis matches and results.</p>
        </div>
        
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Ladder Position</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Check your current position on the ladder.</p>
        </div>
        
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Upcoming Games</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Schedule and manage your upcoming matches.</p>
        </div>
      </div>
    </div>
  )
}
