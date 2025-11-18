import { createFileRoute, Outlet, redirect, useNavigate } from '@tanstack/react-router'
import { SidebarLayout } from '../ui/sidebar-layout'
import { Sidebar, SidebarBody, SidebarFooter, SidebarHeader, SidebarItem, SidebarLabel, SidebarSection, SidebarSpacer } from '~/ui/sidebar'
import { api } from '../../convex/_generated/api'
import { convexQuery } from '@convex-dev/react-query'
import { signOut } from '~/lib/auth-client'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async (ctx) => {
    const user = await ctx.context.queryClient.ensureQueryData(convexQuery(api.auth.getCurrentUser, {}))
    if (!user) {
      // Redirect to login with the current path as redirect parameter
      const redirectTo = ctx.location.pathname + ctx.location.search
      throw redirect({ 
        to: '/',
        search: { redirect: redirectTo }
      })
    }
    return { user }
  },
  component: AuthedLayout,
})

function AuthedLayout() {
  const { user } = Route.useRouteContext()
  const navigate = useNavigate()
  console.log(user)
  
  const handleSignOut = async () => {
    await signOut()
    navigate({ to: '/' })
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center p-12">
        <div>Please sign in to access this page</div>
      </div>
    )
  }

  return (
    <SidebarLayout
      navbar={<></>}
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <SidebarLabel>Tennis Ladder</SidebarLabel>
          </SidebarHeader>
          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/dashboard">
                <SidebarLabel>Dashboard</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
            <SidebarItem href="/ladders">
              <SidebarLabel>Ladders</SidebarLabel>
            </SidebarItem>
            <SidebarSpacer />
            <SidebarItem onClick={handleSignOut}>Sign out</SidebarItem>
          </SidebarBody>
          <SidebarFooter>
            <div className="flex items-center p-2">
              {user.image && (
                <img
                  src={user.image}
                  alt="User avatar"
                  className="w-8 h-8 rounded-full mr-2"
                />
              )}
              <div className="flex-1">
                <div className="text-sm font-medium">{user?.name || 'User'}</div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
      }
    >
      <Outlet />
    </SidebarLayout>
  )
}