import { createFileRoute } from '@tanstack/react-router'
import { LadderMembersTable } from '~/components/ladders-members-table'
import { api } from 'convex/_generated/api'
import { useQuery, useMutation } from 'convex/react'
import type { Id } from 'convex/_generated/dataModel'
import { Heading } from '~/ui/heading'
import { Button } from '~/ui/button'
import { toast } from 'sonner'
import { ConvexError } from 'convex/values'
import { formatDate } from '~/utils/date'
import { useCurrentUser } from '~/hooks/useCurrentUser'

export const Route = createFileRoute('/_authed/ladders/$ladderId')({
  component: LadderDetails,
})

function mapConvexError(e: unknown): string {
  if (e instanceof ConvexError) {
    switch ((e.data as any)?.code) {
      case "USER_NOT_AUTHENTICATED": return "Please sign in to continue."
      case "USER_NOT_FOUND": return "Your account was not found."
      case "LADDER_NOT_FOUND": return "That ladder doesn’t exist."
      case "LADDER_INACTIVE": return "This ladder isn’t active."
      case "LADDER_ENDED": return "This ladder has already ended."
      case "INVALID_PASSWORD": return "Incorrect password. Try again."
      case "ALREADY_MEMBER": return "You are already a member of this ladder."
      default: return "Something went wrong. Please try again."
    }
  }
  return "Something went wrong. Please try again."
}

function LadderDetails() {
  const { ladderId } = Route.useParams()
  const ladder = useQuery(api.ladders.getLadderById, { ladderId: ladderId as Id<"ladders"> })
  const addUserToLadder = useMutation(api.ladders.addUserToLadder)
  const { userId, isAuthenticated } = useCurrentUser()
  const isLoadingLadder = ladder === undefined

  // Check if current user is already a member of this ladder
  const isUserMember = useQuery(
    api.ladders.isUserMemberOfLadder,
    userId && ladderId ? {
      ladderId: ladderId as Id<"ladders">,
      userId: userId as Id<"users">
    } : "skip"
  )

  const joinLadder = async () => {
    try {
      await addUserToLadder({ ladderId: ladderId as Id<"ladders"> })
      toast.success('You have joined the ladder')
    } catch (error: any) {
      console.error(error)
      toast.error(mapConvexError(error))
    }
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

  return (
    <div className="space-y-6">
      <div>
        {isLoadingLadder ? (
          <LadderHeaderSkeleton />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <Heading>
                  <div className="flex items-center gap-3">
                    <span>{ladder.name}</span>
                    {ladder.hasPassword && (
                      <div className="flex items-center gap-1 text-orange-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Private</span>
                      </div>
                    )}
                  </div>
                </Heading>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  View and manage ladder members
                </p>
              </div>
              <Button
                color={isUserMember ? "white" : "green"}
                onClick={joinLadder}
                disabled={isUserMember || !isAuthenticated}
              >
                {isUserMember ? "Already joined" : "Join Ladder"}
              </Button>
            </div>
          </>
        )}
      </div>

      {isLoadingLadder ? (
        <LadderDetailsSkeleton />
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-lg py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</div>
              <div className={`text-lg font-semibold ${getStatusColor(ladder.isActive, ladder.endDate)}`}>
                {formatStatus(ladder.isActive, ladder.endDate)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatDate(ladder.startDate)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatDate(ladder.endDate)}
              </div>
            </div>
          </div>
        </div>
      )}

      <LadderMembersTable ladderId={ladderId as Id<"ladders">} />
    </div>
  )
}

const LadderDetailsSkeleton = () => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg py-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-2"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>
    </div>
  )
}

const LadderHeaderSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
        <div className="h-5 bg-orange-100 dark:bg-orange-900/20 rounded w-16"></div>
      </div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mt-1"></div>
    </div>
  )
}