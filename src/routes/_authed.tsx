import { createFileRoute, Outlet, redirect, useLocation, useNavigate } from '@tanstack/react-router'
import { SidebarLayout } from '../ui/sidebar-layout'
import { Sidebar, SidebarBody, SidebarFooter, SidebarHeader, SidebarItem, SidebarLabel, SidebarSection } from '~/ui/sidebar'
import { Dropdown, DropdownButton, DropdownDivider, DropdownItem, DropdownLabel, DropdownMenu } from '~/ui/dropdown'
import { Avatar } from '~/ui/avatar'
import {
  ArrowRightStartOnRectangleIcon,
  ChevronUpIcon,
} from '@heroicons/react/16/solid'
import {
  NumberedListIcon,
  HomeIcon,
} from '@heroicons/react/20/solid'
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
  const location = useLocation()
  console.log(user)
  
  const handleSignOut = async () => {
    await signOut()
    navigate({ to: '/' })
  }
  
  const pathname = location.pathname
  const isDashboardActive = pathname === '/dashboard'
  const isLaddersActive = pathname.startsWith('/ladders')
  
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
              <SidebarItem href="/dashboard" current={isDashboardActive}>
                <span data-slot="icon">
                  <HomeIcon />
                </span>
                <SidebarLabel>Dashboard</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
            <SidebarItem href="/ladders" current={isLaddersActive}>
              <span data-slot="icon">
                <NumberedListIcon />
              </span>
              <SidebarLabel>Ladders</SidebarLabel>
            </SidebarItem>
          </SidebarBody>
          <SidebarFooter>
            <Dropdown>
              <div>
                <DropdownButton as={SidebarItem}>
                  <span className="flex min-w-0 items-center gap-3">
                    <Avatar src={user.image || undefined} className="size-10" square alt="" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">{user?.name || 'User'}</span>
                      <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                        {user?.email || ''}
                      </span>
                    </span>
                  </span>
                  <span data-slot="icon">
                    <ChevronUpIcon />
                  </span>
                </DropdownButton>
                <DropdownMenu className="min-w-64" anchor="top start">
                  <DropdownDivider />
                  <DropdownItem onClick={handleSignOut}>
                    <span data-slot="icon">
                      <ArrowRightStartOnRectangleIcon />
                    </span>
                    <DropdownLabel>Sign out</DropdownLabel>
                  </DropdownItem>
                </DropdownMenu>
              </div>
            </Dropdown>
            {/* <div className="flex items-center p-2">
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
            </div> */}
          </SidebarFooter>
        </Sidebar>
      }
    >
      <Outlet />
    </SidebarLayout>
  )
}