import { createFileRoute } from '@tanstack/react-router'
import { useConvexAuth } from "convex/react";
import { UserButton } from "@clerk/tanstack-react-start";

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const auth = useConvexAuth()
  console.log(auth)

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard</p>
      <UserButton />
    </div>
  )
}
