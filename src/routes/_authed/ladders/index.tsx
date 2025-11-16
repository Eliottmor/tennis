import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '~/ui/button'
import { CreateLadderDialog } from '~/components/create-ladder-dialog'
import { LaddersTable } from '~/components/ladders-table'
import { Heading } from '~/ui/heading'
import { api } from 'convex/_generated/api'
import { convexQuery } from '@convex-dev/react-query'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/_authed/ladders/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.ladders.getAllLadders, {})
    )
    return null
  },
  pendingComponent: () => <LaddersTableSkeleton />,
})

function RouteComponent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { data: ladders, isPending } = useQuery(
    convexQuery(api.ladders.getAllLadders, {})
  )

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Heading level={1}>Tennis Ladders</Heading>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Manage your tennis ladder competitions</p>
        </div>
        <Button
          color="green"
          onClick={() => setIsDialogOpen(true)}
        >
          Create Ladder
        </Button>
      </div>

      <LaddersTable ladders={ladders || []} isPending={isPending} />

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
