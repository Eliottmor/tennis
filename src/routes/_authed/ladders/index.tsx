import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '~/ui/button'
import { CreateLadderDialog } from '~/components/create-ladder-dialog'
import { LaddersTable } from '~/components/ladders-table'
import { Heading, HeadingGreen } from '~/ui/heading'
import { TextLink } from '~/ui/text'
import { api } from 'convex/_generated/api'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'

export const Route = createFileRoute('/_authed/ladders/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.ladders.getAllLadders, {})
    )
  },
  pendingComponent: () => <LaddersTableSkeleton />,
})

function RouteComponent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showPastLadders, setShowPastLadders] = useState(false)
  const { data: ladders } = useSuspenseQuery(convexQuery(api.ladders.getAllLadders, {}))

  // Filter ladders into active and past groups based on endDate
  const now = Date.now()
  const activeLadders = (ladders || []).filter(ladder => ladder.endDate >= now)
  const pastLadders = (ladders || []).filter(ladder => ladder.endDate < now)

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Heading level={1}>Tennis <HeadingGreen>Ladders</HeadingGreen></Heading>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Manage your tennis ladder competitions.{' '}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          <TextLink to="/ladders/rules">
            View rules & how points work →
          </TextLink>
          </p>
        </div>
        <Button
          color="green"
          onClick={() => setIsDialogOpen(true)}
        >
          Create Ladder
        </Button>
      </div>

      <LaddersTable ladders={activeLadders} isPending={false} />

      {pastLadders.length > 0 && (
        <div className="mt-8">
          {!showPastLadders ? (
            <Button
              outline
              onClick={() => setShowPastLadders(true)}
              className="w-full sm:w-auto"
            >
              View Past Ladders ({pastLadders.length})
            </Button>
          ) : (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <Heading level={2}>Past Ladders</Heading>
                <Button
                  outline
                  onClick={() => setShowPastLadders(false)}
                >
                  Hide Past Ladders
                </Button>
              </div>
              <LaddersTable ladders={pastLadders} isPending={false} />
            </div>
          )}
        </div>
      )}

      <CreateLadderDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
    </div>
  )
}

const LaddersTableSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-2"></div>
    </div>
  )
}
