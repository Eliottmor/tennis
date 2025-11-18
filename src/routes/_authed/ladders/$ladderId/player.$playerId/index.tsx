import { createFileRoute } from '@tanstack/react-router'
import { Heading, HeadingGreen } from '~/ui/heading'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { type FunctionReturnType } from "convex/server";
import { PhoneIcon, MailIcon, ClockIcon, TrophyIcon, CheckCircle, XCircle } from 'lucide-react'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { formatDate } from '~/utils/date'

type Result = FunctionReturnType<typeof api.matches.listUserMatchesInLadder>;

export const Route = createFileRoute(
  '/_authed/ladders/$ladderId/player/$playerId/',
)({
  loader: async ({ context, params }) => {
    const { ladderId, playerId } = params
    await context.queryClient.ensureQueryData(
      convexQuery(api.matches.listUserMatchesInLadder, {
        ladderId: ladderId as Id<'ladders'>,
        userId: playerId as Id<'users'>,
      })
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { ladderId, playerId } = Route.useParams()
  const { data: matches } = useSuspenseQuery(convexQuery(api.matches.listUserMatchesInLadder, {
      ladderId: ladderId as Id<'ladders'>,
      userId: playerId as Id<'users'>,
    })
  )

  // Helper function to format score display
  const formatScore = (match: Result['matches'][number]) => {
    if (match.sets.length === 0) {
      return null
    }
    
    return match.sets.map((set) => {
      const playerGames = match.winnerId === playerId ? set.winnerGames : set.loserGames
      const opponentGames = match.winnerId === playerId ? set.loserGames : set.winnerGames
      
      // Tiebreak is shown for the set winner (match winner's tiebreak)
      const tiebreak = match.winnerId === playerId ? set.winnerTiebreak : set.loserTiebreak
      
      let score = `${playerGames}-${opponentGames}`
      if (tiebreak) {
        score += `(${tiebreak})`
      }
      
      return score
    }).join(', ')
  }

  // Calculate stats
  const totalMatches = matches?.matches.length || 0
  const wins = matches?.matches.filter(match => match.winnerId === playerId).length || 0
  const losses = totalMatches - wins
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0

  const stats = [
    { name: 'Total Matches', value: totalMatches },
    { name: 'Wins', value: wins },
    { name: 'Losses', value: losses },
    { name: 'Win Rate', value: `${winRate}%` },
  ]

  return (
    <div className="space-y-4">
      {/* Player Header */}
      <div className="lg:flex lg:items-center lg:justify-between bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl/7 font-bold text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
            {matches?.user.name}
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            {matches?.user.email && (
              <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <MailIcon aria-hidden="true" className="mr-1.5 size-5 shrink-0 text-gray-400 dark:text-gray-500" />
                <span className="break-all">{matches.user.email}</span>
              </div>
            )}
            {matches?.user.phoneNumber && (
              <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <PhoneIcon aria-hidden="true" className="mr-1.5 size-5 shrink-0 text-gray-400 dark:text-gray-500" />
                {matches.user.phoneNumber}
              </div>
            )}
            {matches?.user.availability && (
              <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <ClockIcon aria-hidden="true" className="mr-1.5 size-5 shrink-0 text-gray-400 dark:text-gray-500" />
                {matches.user.availability}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <dl className="mx-auto grid max-w-7xl grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 lg:px-2 xl:px-0">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={clsx(
              'flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6 xl:px-8',
            )}
          >
            <dt className="text-sm/6 font-medium text-gray-500 dark:text-gray-400">{stat.name}</dt>
            <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900 dark:text-white">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Match History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg">
        <div className="px-6 py-6">
          <div className="flex items-center gap-2">
            <Heading level={2} className="text-2xl! text-gray-900 dark:text-white">
              Match <HeadingGreen className="text-2xl!">History</HeadingGreen>
            </Heading>
          </div>
        </div>
        
        {matches?.matches.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <TrophyIcon className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <div className="text-lg font-medium mb-2">No matches yet</div>
            <div className="text-sm">This player hasn't played any matches in this ladder.</div>
          </div>
        ) : (
          <div className="flow-root px-6 pb-6">
            <ul role="list" className="-mb-8">
              {matches?.matches.map((match, eventIdx) => {
                const isWin = match.winnerId === playerId
                const Icon = isWin ? CheckCircle : XCircle
                const iconBackground = isWin 
                  ? 'bg-green-500 dark:bg-green-600' 
                  : 'bg-red-500 dark:bg-red-600'
                const score = formatScore(match)
                const matchDate = new Date(match.matchDate)
                const dateShort = formatDate(matchDate)
                const dateTime = matchDate.toISOString()
                
                return (
                  <li key={match._id}>
                    <div className="relative pb-8">
                      {eventIdx !== (matches?.matches.length ?? 0) - 1 ? (
                        <span 
                          aria-hidden="true" 
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" 
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={clsx(
                              iconBackground,
                              'flex size-8 items-center justify-center rounded-full ring-8 ring-white dark:ring-gray-800',
                            )}
                          >
                            <Icon aria-hidden="true" className="size-5 text-white" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {isWin ? 'Beat' : 'Lost to'}{' '}
                              <span className="font-medium text-gray-900 dark:text-white">
                                {match.opponent.name}
                              </span>
                              {score && (
                                <span className="ml-2 text-gray-700 dark:text-gray-300">
                                  {score}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                            <time dateTime={dateTime}>{dateShort}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
