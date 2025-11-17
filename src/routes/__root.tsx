import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  Outlet,
} from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import * as React from 'react'
import appCss from '~/styles/app.css?url'
import { Toaster } from 'sonner'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
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
      { rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
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
  notFoundComponent: () => <div>Route not found</div>,
  shellComponent: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
      <Toaster position="top-center" />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {

  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body id="tennis-main">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
