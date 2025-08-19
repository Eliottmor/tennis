import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  Outlet,
} from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import * as React from 'react'
import appCss from '~/styles/app.css?url'
import { ConvexProviderWithAuth, ConvexReactClient } from 'convex/react'
import { ClerkProvider, useAuth } from '@clerk/tanstack-react-start'
import { createServerFn } from '@tanstack/react-start'
import { getWebRequest } from '@tanstack/react-start/server'
import { getAuth } from '@clerk/tanstack-react-start/server'
import { ConvexQueryClient } from '@convex-dev/react-query'

const fetchClerkAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getWebRequest()
  if (!request) throw new Error('No request found')

  const auth = await getAuth(getWebRequest())
  const token = await auth.getToken({ template: 'convex'})

  return {
    userId: auth.userId,
    token,
  }
})

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  convexClient: ConvexReactClient,
  convexQueryClient: ConvexQueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Tennis Ladder',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  beforeLoad: async (ctx) => {
    const { userId, token } = await fetchClerkAuth()
    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token)
    }
    return {
      userId,
      token
    }
  },
  notFoundComponent: () => <div>Route not found</div>,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

// Ensure Convex URL is set
const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl) {
  throw new Error('VITE_CONVEX_URL environment variable is not set');
}

const convex = new ConvexReactClient(convexUrl);

// Wrapper to convert Clerk's useAuth to Convex's expected format
const useConvexAuth = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  
  const fetchAccessToken = React.useCallback(async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
    const token = await getToken({ skipCache: forceRefreshToken });
    return token;
  }, [getToken]);

  return React.useMemo(() => ({
    isLoading: !isLoaded,
    isAuthenticated: !!isSignedIn,
    fetchAccessToken,
  }), [isLoaded, isSignedIn, fetchAccessToken]);
};

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithAuth client={convex} useAuth={useConvexAuth}>
        <html>
          <head>
            <HeadContent />
          </head>
          <body>
            {children}
            <Scripts />
          </body>
        </html>
      </ConvexProviderWithAuth>
    </ClerkProvider>
  )
}
