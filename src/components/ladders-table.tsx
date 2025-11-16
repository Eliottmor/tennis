import { Table, type TableCell } from '../ui/table'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useRouter } from '@tanstack/react-router'
import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'

interface Ladder {
  _id: Id<"ladders">;
  _creationTime: number;
  name: string;
  hasPassword: boolean;
  startDate: number;
  endDate: number;
  creator?: {
    _id: Id<"users">;
    name: string;
    email: string;
  };
  isActive: boolean;
}

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatStatus = (isActive: boolean, endDate: number): string => {
  if (!isActive) return 'Inactive'
  if (Date.now() > endDate) return 'Ended'
  if (Date.now() < endDate) return 'Active'
  return 'Active'
}

const getStatusColor = (isActive: boolean, endDate: number): string => {
  if (!isActive) return 'text-gray-500'
  if (Date.now() > endDate) return 'text-orange-600'
  return 'text-green-600'
}

export function LaddersTable({ ladders, isPending }: { ladders: Ladder[], isPending: boolean }) {
  const router = useRouter()
  const cells: TableCell<Ladder>[] = [
    {
      headerLabel: 'Name',
      renderCell: (ladder) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {ladder.name}
          {ladder.hasPassword && (
            <svg 
              className="ml-2 inline-block w-4 h-4 text-gray-500 dark:text-gray-400" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" 
                clipRule="evenodd" 
              />
            </svg>
          )}
        </div>
      ),
      className: 'min-w-[200px]'
    },
    {
      headerLabel: 'Status',
      renderCell: (ladder) => (
        <span className={`font-medium ${getStatusColor(ladder.isActive, ladder.endDate)}`}>
          {formatStatus(ladder.isActive, ladder.endDate)}
        </span>
      ),
      className: 'min-w-[100px]'
    },
    {
      headerLabel: 'Start Date',
      renderCell: (ladder) => (
        <span className="text-gray-600 dark:text-gray-400">
          {formatDate(ladder.startDate)}
        </span>
      ),
      className: 'min-w-[120px]'
    },
    {
      headerLabel: 'End Date',
      renderCell: (ladder) => (
        <span className="text-gray-600 dark:text-gray-400">
          {formatDate(ladder.endDate)}
        </span>
      ),
      className: 'min-w-[120px]'
    },
    {
      headerLabel: 'Created By',
      renderCell: (ladder) => (
        <span className="text-gray-600 dark:text-gray-400">{ladder.creator?.name || 'Unknown'}</span>
      ),
      className: 'min-w-[120px]'
    },
  ]

  return (
    <Table
      cells={cells}
      rows={ladders || []}
      isLoading={isPending}
      isContentHeight
      skeletonRowCount={5}
      zeroStateContent={
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-2">
            No ladders found
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Create your first ladder to get started
          </p>
        </div>
      }
      onClick={(ladder) => {
        router.navigate({
          to: '/ladders/$ladderId',
          params: { ladderId: ladder._id },
        })
      }}
      striped
      dense
    />
  )
}
