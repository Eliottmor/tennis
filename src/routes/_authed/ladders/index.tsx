import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '../../../ui/button'
import { CreateLadderDialog } from '~/components/create-ladder-dialog'
import { LaddersTable } from '~/components/ladders-table'
import { Heading } from '~/ui/heading'

export const Route = createFileRoute('/_authed/ladders/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
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

      <LaddersTable />

      <CreateLadderDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
    </div>
  )
}
