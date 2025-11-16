import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SidebarLayout } from '../ui/sidebar-layout'
import { Sidebar, SidebarBody, SidebarFooter, SidebarHeader, SidebarItem, SidebarLabel, SidebarSection, SidebarSpacer } from '~/ui/sidebar'
import { useCurrentUser } from '~/hooks/useCurrentUser'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    // Authentication check will be handled in the component
    return {}
  },
  errorComponent: ({ error }) => {
    throw error
  },
  component: AuthedLayout,
})

function AuthedLayout() {
  const isAuthenticated = true
  const isLoading = false
  const { user, imageUrl } = useCurrentUser()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
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
          </SidebarBody>
          <SidebarFooter>
            <div className="flex items-center p-2">
              {imageUrl && (
                <img
                  src={imageUrl}
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