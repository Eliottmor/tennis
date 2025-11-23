import { Table, type TableCell } from '../ui/table'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useRouter } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import clsx from 'clsx'

type LadderMemberWithDetails = {
  _id: Id<"ladder_members">
  userId: Id<"users">
  userName: string
  userEmail: string
  joinedAt: number
  wins: number
  losses: number
  points: number
  winStreak: number
  city?: string | undefined
  status?: string | undefined
}

interface LadderMembersTableProps {
  ladderId: Id<"ladders">;
  currentUserId: string;
}


export function LadderMembersTable({ ladderId, currentUserId }: LadderMembersTableProps) {
  const { data: members } = useQuery(convexQuery(api.ladders.getLadderMembers, { ladderId }))
  const router = useRouter()
  
  // Sort members by points (descending), then by wins (descending) as tiebreaker
  const sortedMembers = members 
    ? [...members].sort((a, b) => {
        // First sort by points (descending)
        if (b.points !== a.points) {
          return b.points - a.points
        }
        // If points are equal, sort by wins (descending)
        return b.wins - a.wins
      })
    : []
  
  const cells: TableCell<LadderMemberWithDetails>[] = [
    {
      headerLabel: 'Name',
      renderCell: (member) => {
        const isCurrentUser = currentUserId === member.userId
        return (
          <div className={clsx(
            "font-medium wrap-break-word",
            isCurrentUser 
              ? "text-green-600 dark:text-green-400" 
              : "text-gray-900 dark:text-white"
          )}>
            <div className="flex items-center gap-2">
              <span>{member.userName}</span>
            </div>
            {member.status && (
              <div className={clsx(
                "text-sm mt-0.5",
                isCurrentUser 
                  ? "text-green-500 dark:text-green-500" 
                  : "text-gray-600 dark:text-gray-400"
              )}>
                ({member.status})
              </div>
            )}
          </div>
        )
      },
      className: 'min-w-[150px]',
      mobileVisibility: 'always'
    },
    {
      headerLabel: 'Email',
      renderCell: (member) => (
        <span className="text-gray-600 dark:text-gray-400">
          {member.userEmail}
        </span>
      ),
      className: 'min-w-[200px]',
      mobileVisibility: 'never',
      mobileLabel: 'Email'
    },
    {
      headerLabel: 'City',
      renderCell: (member) => (
        <span className="text-gray-600 dark:text-gray-400">
          {member.city ?? ''}
        </span>
      ),
      className: 'min-w-[150px]',
      mobileVisibility: 'lg'
    },
    {
      headerLabel: 'W/L Record',
      renderCell: (member) => (
        <>
          <span className="text-gray-600 dark:text-gray-400">{member.wins} - {member.losses}</span>
          {member.winStreak > 2 && <span className="ml-2">🔥</span>}
        </>
      ),
      className: 'min-w-[150px]',
      mobileVisibility: 'always'
    },
    {
      headerLabel: 'Points',
      renderCell: (member) => (
        <span className="text-gray-600 dark:text-gray-400">
          {member.points}
        </span>
      ),
      className: 'min-w-[150px]',
      mobileVisibility: 'always'
    },
  ]

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Total Members: {members?.length}
      </div>
      <Table
        cells={cells}
        rows={sortedMembers}
        isLoading={!members}
        skeletonRowCount={5}
        isContentHeight
        zeroStateContent={
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              No members found
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              No users have joined this ladder yet
            </p>
          </div>
        }
        onClick={(member) => {
          router.navigate({ to: '/ladders/$ladderId/player/$playerId', params: { ladderId: ladderId, playerId: member.userId } })
        }}
        striped
        dense
      />
    </div>
  )
}
