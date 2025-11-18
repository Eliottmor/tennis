import { createFileRoute } from '@tanstack/react-router'
import { Button } from '~/ui/button'
import { HeadingGreen } from '~/ui/heading'
import { signInWithGoogle } from '~/lib/auth-client'
import { useMutation } from '@tanstack/react-query'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const signIn = useMutation({
    mutationFn: signInWithGoogle,
  })
  return (
    <div className="relative isolate overflow-hidden bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <svg
        aria-hidden="true"
        className="absolute inset-0 -z-10 size-full mask-[radial-gradient(100%_100%_at_top_right,white,transparent)] stroke-gray-900/10 dark:stroke-white/10"
      >
        <defs>
          <pattern
            x="50%"
            y={-1}
            id="0787a7c5-978c-4f66-83c7-11c213f99cb7"
            width={200}
            height={200}
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 200V.5H200" fill="none" />
          </pattern>
        </defs>
        <rect fill="url(#0787a7c5-978c-4f66-83c7-11c213f99cb7)" width="100%" height="100%" strokeWidth={0} />
      </svg>
      <div className="mx-auto max-w-7xl px-6 pt-10 pb-24 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:shrink-0 lg:pt-8">
          <div className="mt-24 sm:mt-32 lg:mt-16">
          </div>
          <h1 className="mt-10 text-5xl font-semibold tracking-tight text-pretty text-gray-900 dark:text-white sm:text-7xl transition-colors duration-200">
            Tennis <HeadingGreen>Ladder</HeadingGreen>
          </h1>
          <p className="mt-8 text-lg font-medium text-pretty text-gray-600 dark:text-gray-400 sm:text-xl/8 transition-colors duration-200">
            Login to your account to continue.
          </p>
          <Button
            color="green"
            onClick={() => signIn.mutate()}
            className="mt-8 w-96"
            disabled={signIn.isPending}
            >
             {signIn.isPending ? 'Signing in...' : 'Sign in with Google'}
          </Button>
        </div>
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:mt-0 lg:mr-0 lg:ml-10 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">

          </div>
        </div>
      </div>
    </div>
  )
}
