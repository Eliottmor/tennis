import { Table, type TableCell } from '../ui/table'
import { api } from 'convex/_generated/api'
import { useQuery } from 'convex/react'
import type { Id } from 'convex/_generated/dataModel'

interface LadderMember {
  _id: Id<"ladder_members">;
  userId: Id<"users">;
  userName: string;
  userEmail: string;
  joinedAt: number;
}

interface LadderMembersTableProps {
  ladderId: Id<"ladders">;
}

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function LadderMembersTable({ ladderId }: LadderMembersTableProps) {
  const members = useQuery(api.ladders.getLadderMembers, { ladderId })

  const cells: TableCell<LadderMember>[] = [
    {
      headerLabel: 'Name',
      renderCell: (member) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {member.userName}
        </div>
      ),
      className: 'min-w-[150px]'
    },
    {
      headerLabel: 'Email',
      renderCell: (member) => (
        <span className="text-gray-600 dark:text-gray-400">
          {member.userEmail}
        </span>
      ),
      className: 'min-w-[200px]'
    },
    {
      headerLabel: 'Joined Date',
      renderCell: (member) => (
        <span className="text-gray-600 dark:text-gray-400">
          {formatDate(member.joinedAt)}
        </span>
      ),
      className: 'min-w-[150px]'
    },

  ]

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Total Members: {members?.length}
      </div>
      <Table
        cells={cells}
        rows={members || []}
        isLoading={!members}
        skeletonRowCount={5}
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
        striped
        dense
      />
    </div>
  )
}
