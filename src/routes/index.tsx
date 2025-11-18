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
        className="absolute inset-0 -z-10 size-full mask-[radial-gradient(100%_100%_at_top_right,white,transparent)] stroke-gray-200"
      >
        <defs>
          <pattern
            x="50%"
            y={-1}
            id="983e3e4c-de6d-4c3f-8d64-b9761d1534cc"
            width={200}
            height={200}
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 200V.5H200" fill="none" />
          </pattern>
        </defs>
        <svg x="50%" y={-1} className="overflow-visible fill-gray-50">
          <path
            d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
            strokeWidth={0}
          />
        </svg>
        <rect fill="url(#983e3e4c-de6d-4c3f-8d64-b9761d1534cc)" width="100%" height="100%" strokeWidth={0} />
      </svg>
      <div
        aria-hidden="true"
        className="absolute top-10 left-[calc(50%-4rem)] -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:top-[calc(50%-30rem)] lg:left-48 xl:left-[calc(50%-24rem)]"
      >
        <div
          style={{
            clipPath:
              'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
          }}
          className="aspect-1108/632 w-277 bg-linear-to-r from-[#bbff80] to-[#16a34a] opacity-20"
        />
      </div>
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
