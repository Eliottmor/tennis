import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { routeTree } from './routeTree.gen'
import { ConvexQueryClient } from '@convex-dev/react-query'

export function getRouter() {
  const CONVEX_URL = import.meta.env.VITE_CONVEX_URL!;
  if (!CONVEX_URL) {
    console.error("missing envar VITE_CONVEX_URL");
  }
  const convex = new ConvexReactClient(CONVEX_URL)
  const convexQueryClient = new ConvexQueryClient(convex);
  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });
  convexQueryClient.connect(queryClient);

  const router = routerWithQueryClient(
    createRouter({
      routeTree,
      defaultPreload: "intent",
      context: { queryClient, convexClient: convex, convexQueryClient },
      scrollRestoration: true,
      Wrap: ({ children }) => (
        <ConvexProvider client={convexQueryClient.convexClient}>
          {children}
        </ConvexProvider>
      ),
    }),
    queryClient,
  );

  // Note: setupRouterSsrQueryIntegration is not needed here because:
  // 1. routerWithQueryClient already integrates React Query with the router
  // 2. TanStack Start handles SSR hydration internally
  // Calling it manually causes ReadableStream lock conflicts

  return router
}
