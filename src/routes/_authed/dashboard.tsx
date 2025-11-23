import { createFileRoute } from '@tanstack/react-router'
import { Heading, HeadingGreen } from '~/ui/heading'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { CheckCircle, XCircle, TrophyIcon } from 'lucide-react'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { formatScore, getBonusPointsBreakdown } from '~/utils/match'
import { Link } from '@tanstack/react-router'


export const Route = createFileRoute('/_authed/dashboard')({
  component: RouteComponent,
  loader: async ({ context }) => {
    const userId = context.user?._id as Id<'users'> | undefined
    const [matches, activeLadders] = await Promise.all([
      context.queryClient.ensureQueryData(convexQuery(api.matches.listRecentMatches, {
        limit: 5,
      })),
      userId ? context.queryClient.ensureQueryData(convexQuery(api.ladders.getUserActiveLaddersWithPositions, {
        userId,
      })) : Promise.resolve([]),
    ])
    return { matches, activeLadders }
  },
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const userId = user?._id as Id<'users'> | undefined
  const { data: matches } = useSuspenseQuery(convexQuery(api.matches.listRecentMatches, {
    limit: 5,
  }))
  const { data: activeLadders } = useSuspenseQuery(convexQuery(api.ladders.getUserActiveLaddersWithPositions, {
    userId: userId as Id<'users'>,
  }))

  const formatPosition = (position: number): string => {
    if (position === 0) return 'Unranked'
    const suffix = position % 10 === 1 && position % 100 !== 11 ? 'st' :
                   position % 10 === 2 && position % 100 !== 12 ? 'nd' :
                   position % 10 === 3 && position % 100 !== 13 ? 'rd' : 'th'
    return `${position}${suffix}`
  }

  return (
    <div>
      <Heading level={1}><HeadingGreen>Dashboard</HeadingGreen></Heading>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">Welcome to your tennis ladder dashboard</p>
      
      {/* Active Ladders Section */}
      {userId && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg">
          <div className="py-6">
            <div className="flex items-center gap-2">
              <Heading level={2} className="text-2xl! text-gray-900 dark:text-white">
                Your Active <HeadingGreen className="text-2xl!">Ladders</HeadingGreen>
              </Heading>
            </div>
          </div>
          
          {!activeLadders || activeLadders.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 pb-6">
              <TrophyIcon className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <div className="text-lg font-medium mb-2">No active ladders</div>
              <div className="text-sm">You're not enrolled in any active ladders yet.</div>
            </div>
          ) : (
            <div>
              <ul role="list" className="space-y-3">
                {activeLadders.map((ladder) => (
                  <li key={ladder._id}>
                    <Link
                      to="/ladders/$ladderId"
                      params={{ ladderId: ladder._id }}
                      className="block rounded-lg bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-700 dark:text-white">
                            {ladder.name}
                          </h3>
                        </div>
                        <div className="ml-4">
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {formatPosition(ladder.position)} place
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Recent Matches Section */}
      <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg">
        <div className="py-6">
          <div className="flex items-center gap-2">
            <Heading level={2} className="text-2xl! text-gray-900 dark:text-white">
              Recent <HeadingGreen className="text-2xl!">Matches</HeadingGreen>
            </Heading>
          </div>
        </div>
        
        {!userId ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-sm">Loading...</div>
          </div>
        ) : matches?.matches.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <TrophyIcon className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <div className="text-lg font-medium mb-2">No matches yet</div>
            <div className="text-sm">You haven't played any matches yet.</div>
          </div>
        ) : (
          <div className="flow-root px-2 sm:px-6 pb-6">
            <ul role="list" className="-mb-8">
              {matches?.matches.map((match, eventIdx) => {
                const isWin = match.winnerId === userId
                const Icon = isWin ? CheckCircle : XCircle
                const iconBackground = isWin 
                  ? 'bg-green-500 dark:bg-green-600' 
                  : 'bg-red-500 dark:bg-red-600'
                const score = formatScore(match, userId)
                const matchDate = new Date(match.matchDate)
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
                              {' '}in{' '}
                              <span className="font-medium text-gray-900 dark:text-white">
                                {match.ladder.name}
                              </span>
                            </p>
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              {isWin ? (
                                <>
                                  {(() => {
                                    const breakdown = getBonusPointsBreakdown(match, userId)
                                    if (breakdown) {
                                      return (
                                        <>
                                          {breakdown.map((bonus, idx) => (
                                            <p key={idx} className="text-xs text-gray-400 dark:text-gray-500">
                                              +{bonus.points}{bonus.emoji ? ` ${bonus.emoji}` : ''} - {bonus.reason}
                                            </p>
                                          ))}
                                        </>
                                      )
                                    }
                                    return null
                                  })()}
                                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-0.5">
                                    +{match.winnerPointsAwarded ?? 0} points total
                                  </p>
                                </>
                              ) : (
                                <p>+{match.loserPointsAwarded ?? 0} points</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                            <time dateTime={dateTime}>
                              <span className="hidden sm:inline-block">
                                {new Date(match.matchDate).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                              <span className="inline-block sm:hidden">
                                {new Date(match.matchDate).toLocaleDateString('en-US', {
                                  month: '2-digit',
                                  day: '2-digit',
                                  year: 'numeric',
                                })}
                              </span>
                            </time>
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
