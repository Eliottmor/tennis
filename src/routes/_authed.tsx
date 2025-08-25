import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SignIn } from '@clerk/tanstack-react-start'
import { SidebarLayout } from '../ui/sidebar-layout'
import { UserButton } from "@clerk/tanstack-react-start"
import { Sidebar, SidebarBody, SidebarFooter, SidebarHeader, SidebarItem, SidebarLabel, SidebarSection, SidebarSpacer } from '~/ui/sidebar'

export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ context }) => {
    if (!context.userId) {
      throw new Error('Not authenticated')
    }
  },
  errorComponent: ({ error }) => {
    if (error.message === 'Not authenticated') {
      return (
        <div className="flex items-center justify-center p-12">
          <SignIn routing="hash" forceRedirectUrl={window.location.href} />
        </div>
      )
    }

    throw error
  },
  component: AuthedLayout,
})

function AuthedLayout() {
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
            <UserButton 
              showName 
              appearance={{
                elements: {
                  userButtonBox: "!flex-row-reverse hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200 rounded-lg pr-2",
                  button: "hover:text-white"
                }
              }}
            />
          </SidebarFooter>
        </Sidebar>
      }
    >
      <Outlet />
    </SidebarLayout>
  )
}