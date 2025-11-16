import { createFileRoute } from '@tanstack/react-router'
import { Heading } from '~/ui/heading'
import { Table, type TableCell } from '~/ui/table'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { Badge } from '~/ui/badge'
import { type FunctionReturnType } from "convex/server";
import { useQuery } from 'convex/react'
import { PhoneIcon, MailIcon, ClockIcon, TrophyIcon } from 'lucide-react'

type Result = FunctionReturnType<typeof api.matches.listUserMatchesInLadder>;

export const Route = createFileRoute(
  '/_authed/ladders/$ladderId/player/$playerId/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { ladderId, playerId } = Route.useParams()
  const matches = useQuery(api.matches.listUserMatchesInLadder, {
    ladderId: ladderId as Id<'ladders'>,
    userId: playerId as Id<'users'>,
  })

  const tableCells: TableCell<Result['matches'][number]>[] = [
    {
      headerLabel: "Opponent",
      renderCell: (match) => (
        <div className="font-medium">
          {match.opponent.name}
        </div>
      ),
    },
    {
      headerLabel: "Date",
      renderCell: (match) => (
        <div className="text-sm text-gray-600">
          {new Date(match.matchDate).toLocaleDateString('en-US')}
        </div>
      ),
    },
    {
      headerLabel: "Score",
      renderCell: (match) => (
        <div className="text-sm">
          {match.sets.length > 0 ? (
            <div className="flex flex-row gap-2">
              {match.sets.map((set) => (
                <div key={set._id} className="flex items-center">
                  <span className="text-sm">
                    <span className="relative font-semibold">
                      {match.winnerId === playerId ? set.winnerGames : set.loserGames}
                      {set.winnerTiebreak && set.loserTiebreak && match.winnerId === playerId && (
                        <span className="absolute text-gray-400 -top-[12px] -right-[4px] text-[10px] font-mono">
                          {set.winnerTiebreak}
                        </span>
                      )}
                      {set.winnerTiebreak && set.loserTiebreak && match.winnerId !== playerId && (
                        <span className="absolute text-gray-400 -top-[12px] -right-[4px] text-[10px] font-mono">
                          {set.loserTiebreak}
                        </span>
                      )}
                    </span>
                    -
                    <span className="relative">
                      {match.winnerId === playerId ? set.loserGames : set.winnerGames}
                      {set.winnerTiebreak && set.loserTiebreak && match.winnerId !== playerId && (
                        <span className="absolute text-gray-400 -top-[12px] -right-[4px] text-[10px] font-mono">
                          {set.winnerTiebreak}
                        </span>
                      )}
                      {set.winnerTiebreak && set.loserTiebreak && match.winnerId === playerId && (
                        <span className="absolute text-gray-400 -top-[12px] -right-[4px] text-[10px] font-mono">
                          {set.loserTiebreak}
                        </span>
                      )}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">No score recorded</span>
          )}
        </div>
      ),
    },
    {
      headerLabel: "Result",
      renderCell: (match) => (
        <div className="flex items-center">
          {match.winnerId === playerId ? (
            <Badge color="green">
              Won
            </Badge>
          ) : (
            <Badge color="red">
              Lost
            </Badge>
          )}
        </div>
      ),
    },
  ]

  // Calculate stats
  const totalMatches = matches?.matches.length || 0
  const wins = matches?.matches.filter(match => match.winnerId === playerId).length || 0
  const losses = totalMatches - wins
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Player Header Card */}
      <div className="bg-white dark:bg-gray-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Player Info */}
          <div className="flex-1">
            <Heading level={1} className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {matches?.user.name}
            </Heading>
            
            {/* Contact Info */}
            <div className="space-y-3">
              {matches?.user.email && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <MailIcon className="w-4 h-4 shrink-0" />
                  <span className="break-all">{matches.user.email}</span>
                </div>
              )}
              
              {matches?.user.phoneNumber && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <PhoneIcon className="w-4 h-4 shrink-0" />
                  <span>{matches.user.phoneNumber}</span>
                </div>
              )}
              
              {matches?.user.availability && (
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <ClockIcon className="w-4 h-4 shrink-0" />
                  <span>{matches.user.availability}</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalMatches}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Matches</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{wins}</div>
              <div className="text-sm text-green-600 dark:text-green-400">Wins</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{losses}</div>
              <div className="text-sm text-red-600 dark:text-red-400">Losses</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{winRate}%</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Win Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Match History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg">
        <div className="py-6">
          <div className="flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-yellow-500" />
            <Heading level={2} className="text-lg font-semibold text-gray-900 dark:text-white">
              Match History
            </Heading>
          </div>
        </div>
        
        <Table
          cells={tableCells}
          rows={matches?.matches || []}
          isLoading={false}
          striped
          dense
          isContentHeight
          zeroStateContent={
            <div className="text-center py-12 text-gray-500">
              <TrophyIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <div className="text-lg font-medium mb-2">No matches yet</div>
              <div className="text-sm">This player hasn't played any matches in this ladder.</div>
            </div>
          }
        />
      </div>
    </div>
  )
}
