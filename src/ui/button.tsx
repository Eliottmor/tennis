import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import React, { forwardRef } from 'react'
import { Link } from './link'

const styles = {
  base: [
    // Base
    'relative isolate inline-flex items-center justify-center gap-x-2 rounded-lg border text-base/6 font-semibold',
    // Sizing
    'px-[calc(theme(spacing[3.5])-1px)] py-[calc(theme(spacing[2.5])-1px)] sm:px-[calc(theme(spacing.3)-1px)] sm:py-[calc(theme(spacing[1.5])-1px)] sm:text-sm/6',
    // Focus
    'focus:outline-none data-[focus]:outline data-[focus]:outline-2 data-[focus]:outline-offset-2 data-[focus]:outline-blue-500',
    // Disabled
    'data-[disabled]:opacity-50',
    // Icon
    '[&>[data-slot=icon]]:-mx-0.5 [&>[data-slot=icon]]:my-0.5 [&>[data-slot=icon]]:size-5 [&>[data-slot=icon]]:shrink-0 [&>[data-slot=icon]]:text-zinc-500 [&>[data-slot=icon]]:sm:my-1 [&>[data-slot=icon]]:sm:size-4',
  ],
  solid: [
    // Base styling
    'border-transparent shadow-sm',
    // Dark mode: border is rendered on `after` so background is set to button background
    'dark:border-white/5',
    // Shim/overlay, inset to match button foreground and used for hover state + highlight shadow
    'after:absolute after:inset-0 after:-z-10 after:rounded-[calc(theme(borderRadius.lg)-1px)]',
    // Inner highlight shadow
    'after:shadow-[shadow:inset_0_1px_theme(colors.white/15%)]',
    // White overlay on hover
    'after:data-[active]:bg-white/10 after:data-[hover]:bg-white/10',
    // Dark mode: `after` layer expands to cover entire button
    'dark:after:-inset-px dark:after:rounded-lg',
    // Disabled
    'after:data-[disabled]:shadow-none',
  ],
  outline: [
    // Base
    'border-zinc-950/10 text-zinc-950 data-[active]:bg-zinc-950/[2.5%] data-[hover]:bg-zinc-950/[2.5%]',
    // Dark mode
    'dark:border-white/15 dark:text-white dark:bg-transparent dark:data-[active]:bg-white/5 dark:data-[hover]:bg-white/5',
    // Icon
    '[&>[data-slot=icon]]:text-zinc-500 data-[active]:[&>[data-slot=icon]]:text-zinc-700 data-[hover]:[&>[data-slot=icon]]:text-zinc-700 dark:data-[active]:[&>[data-slot=icon]]:text-zinc-400 dark:data-[hover]:[&>[data-slot=icon]]:text-zinc-400',
  ],
  plain: [
    // Base
    'border-transparent text-zinc-950 data-[active]:bg-zinc-950/5 data-[hover]:bg-zinc-950/5',
    // Dark mode
    'dark:text-white dark:data-[active]:bg-white/10 dark:data-[hover]:bg-white/10',
    // Icon
    '[&>[data-slot=icon]]:text-zinc-500 data-[active]:[&>[data-slot=icon]]:text-zinc-700 data-[hover]:[&>[data-slot=icon]]:text-zinc-700 dark:[&>[data-slot=icon]]:text-zinc-500 dark:data-[active]:[&>[data-slot=icon]]:text-zinc-400 dark:data-[hover]:[&>[data-slot=icon]]:text-zinc-400',
  ],
  colors: {
    'dark/zinc': [
      'text-white bg-zinc-900 border-zinc-950/90 data-[hover]:bg-zinc-800 data-[active]:bg-zinc-700',
      'dark:bg-zinc-600 dark:data-[hover]:bg-zinc-500 dark:data-[active]:bg-zinc-400',
      '[&>[data-slot=icon]]:text-zinc-400 data-[active]:[&>[data-slot=icon]]:text-zinc-300 data-[hover]:[&>[data-slot=icon]]:text-zinc-300',
    ],
    light: [
      'text-zinc-950 bg-white border-zinc-950/10 data-[hover]:bg-zinc-50 data-[active]:bg-zinc-100',
      'dark:text-white dark:bg-zinc-800 dark:data-[hover]:bg-zinc-700 dark:data-[active]:bg-zinc-600',
      '[&>[data-slot=icon]]:text-zinc-500 data-[active]:[&>[data-slot=icon]]:text-zinc-700 data-[hover]:[&>[data-slot=icon]]:text-zinc-700 dark:[&>[data-slot=icon]]:text-zinc-500 dark:data-[active]:[&>[data-slot=icon]]:text-zinc-400 dark:data-[hover]:[&>[data-slot=icon]]:text-zinc-400',
    ],
    'dark/white': [
      'text-white bg-zinc-900 border-zinc-950/90 data-[hover]:bg-zinc-800 data-[active]:bg-zinc-700',
      'dark:text-zinc-950 dark:bg-white dark:data-[hover]:bg-zinc-100 dark:data-[active]:bg-zinc-200',
      '[&>[data-slot=icon]]:text-zinc-400 data-[active]:[&>[data-slot=icon]]:text-zinc-300 data-[hover]:[&>[data-slot=icon]]:text-zinc-300 dark:[&>[data-slot=icon]]:text-zinc-500 dark:data-[active]:[&>[data-slot=icon]]:text-zinc-400 dark:data-[hover]:[&>[data-slot=icon]]:text-zinc-400',
    ],
    dark: [
      'text-white bg-zinc-900 border-zinc-950/90 data-[hover]:bg-zinc-800 data-[active]:bg-zinc-700',
      'dark:data-[hover]:bg-zinc-700 dark:bg-zinc-800',
      '[&>[data-slot=icon]]:text-zinc-400 data-[active]:[&>[data-slot=icon]]:text-zinc-300 data-[hover]:[&>[data-slot=icon]]:text-zinc-300',
    ],
    white: [
      'text-zinc-950 bg-white border-zinc-950/10 data-[hover]:bg-zinc-50 data-[active]:bg-zinc-100',
      'dark:data-[hover]:bg-zinc-100',
      '[&>[data-slot=icon]]:text-zinc-400 data-[active]:[&>[data-slot=icon]]:text-zinc-500 data-[hover]:[&>[data-slot=icon]]:text-zinc-500',
    ],
    zinc: [
      'text-white bg-zinc-600 border-zinc-700/90 data-[hover]:bg-zinc-500 data-[active]:bg-zinc-400',
      'dark:data-[hover]:bg-zinc-500',
      '[&>[data-slot=icon]]:text-zinc-400 data-[active]:[&>[data-slot=icon]]:text-zinc-300 data-[hover]:[&>[data-slot=icon]]:text-zinc-300',
    ],
    indigo: [
      'text-white bg-indigo-600 border-indigo-700/90 data-[hover]:bg-indigo-500 data-[active]:bg-indigo-400',
      '[&>[data-slot=icon]]:text-indigo-300 data-[active]:[&>[data-slot=icon]]:text-indigo-200 data-[hover]:[&>[data-slot=icon]]:text-indigo-200',
    ],
    cyan: [
      'text-cyan-950 bg-cyan-300 border-cyan-400/80 data-[hover]:bg-cyan-200 data-[active]:bg-cyan-100',
      '[&>[data-slot=icon]]:text-cyan-500',
    ],
    red: [
      'text-white bg-red-600 border-red-700/90 data-[hover]:bg-red-500 data-[active]:bg-red-400',
      '[&>[data-slot=icon]]:text-red-300 data-[active]:[&>[data-slot=icon]]:text-red-200 data-[hover]:[&>[data-slot=icon]]:text-red-200',
    ],
    orange: [
      'text-white bg-orange-500 border-orange-600/90 data-[hover]:bg-orange-400 data-[active]:bg-orange-300',
      '[&>[data-slot=icon]]:text-orange-300 data-[active]:[&>[data-slot=icon]]:text-orange-200 data-[hover]:[&>[data-slot=icon]]:text-orange-200',
    ],
    amber: [
      'text-amber-950 bg-amber-400 border-amber-500/80 data-[hover]:bg-amber-300 data-[active]:bg-amber-200',
      '[&>[data-slot=icon]]:text-amber-600',
    ],
    yellow: [
      'text-yellow-950 bg-yellow-300 border-yellow-400/80 data-[hover]:bg-yellow-200 data-[active]:bg-yellow-100',
      '[&>[data-slot=icon]]:text-yellow-600 data-[active]:[&>[data-slot=icon]]:text-yellow-700 data-[hover]:[&>[data-slot=icon]]:text-yellow-700',
    ],
    lime: [
      'text-lime-950 bg-lime-300 border-lime-400/80 data-[hover]:bg-lime-200 data-[active]:bg-lime-100',
      '[&>[data-slot=icon]]:text-lime-600 data-[active]:[&>[data-slot=icon]]:text-lime-700 data-[hover]:[&>[data-slot=icon]]:text-lime-700',
    ],
    green: [
      'text-white bg-green-600 border-green-700/90 data-[hover]:bg-green-500 data-[active]:bg-green-400',
      '[&>[data-slot=icon]]:text-white/60 data-[active]:[&>[data-slot=icon]]:text-white/80 data-[hover]:[&>[data-slot=icon]]:text-white/80',
    ],
    emerald: [
      'text-white bg-emerald-600 border-emerald-700/90 data-[hover]:bg-emerald-500 data-[active]:bg-emerald-400',
      '[&>[data-slot=icon]]:text-white/60 data-[active]:[&>[data-slot=icon]]:text-white/80 data-[hover]:[&>[data-slot=icon]]:text-white/80',
    ],
    teal: [
      'text-white bg-teal-600 border-teal-700/90 data-[hover]:bg-teal-500 data-[active]:bg-teal-400',
      '[&>[data-slot=icon]]:text-white/60 data-[active]:[&>[data-slot=icon]]:text-white/80 data-[hover]:[&>[data-slot=icon]]:text-white/80',
    ],
    sky: [
      'text-white bg-sky-500 border-sky-600/80 data-[hover]:bg-sky-400 data-[active]:bg-sky-300',
      '[&>[data-slot=icon]]:text-white/60 data-[active]:[&>[data-slot=icon]]:text-white/80 data-[hover]:[&>[data-slot=icon]]:text-white/80',
    ],
    blue: [
      'text-white bg-blue-600 border-blue-700/90 data-[hover]:bg-blue-500 data-[active]:bg-blue-400',
      '[&>[data-slot=icon]]:text-blue-400 data-[active]:[&>[data-slot=icon]]:text-blue-300 data-[hover]:[&>[data-slot=icon]]:text-blue-300',
    ],
    violet: [
      'text-white bg-violet-500 border-violet-600/90 data-[hover]:bg-violet-400 data-[active]:bg-violet-300',
      '[&>[data-slot=icon]]:text-violet-300 data-[active]:[&>[data-slot=icon]]:text-violet-200 data-[hover]:[&>[data-slot=icon]]:text-violet-200',
    ],
    purple: [
      'text-white bg-purple-500 border-purple-600/90 data-[hover]:bg-purple-400 data-[active]:bg-purple-300',
      '[&>[data-slot=icon]]:text-purple-300 data-[active]:[&>[data-slot=icon]]:text-purple-200 data-[hover]:[&>[data-slot=icon]]:text-purple-200',
    ],
    fuchsia: [
      'text-white bg-fuchsia-500 border-fuchsia-600/90 data-[hover]:bg-fuchsia-400 data-[active]:bg-fuchsia-300',
      '[&>[data-slot=icon]]:text-fuchsia-300 data-[active]:[&>[data-slot=icon]]:text-fuchsia-200 data-[hover]:[&>[data-slot=icon]]:text-fuchsia-200',
    ],
    pink: [
      'text-white bg-pink-500 border-pink-600/90 data-[hover]:bg-pink-400 data-[active]:bg-pink-300',
      '[&>[data-slot=icon]]:text-pink-300 data-[active]:[&>[data-slot=icon]]:text-pink-200 data-[hover]:[&>[data-slot=icon]]:text-pink-200',
    ],
    rose: [
      'text-white bg-rose-500 border-rose-600/90 data-[hover]:bg-rose-400 data-[active]:bg-rose-300',
      '[&>[data-slot=icon]]:text-rose-300 data-[active]:[&>[data-slot=icon]]:text-rose-200 data-[hover]:[&>[data-slot=icon]]:text-rose-200',
    ],
  },
}

type ButtonProps = (
  | { color?: keyof typeof styles.colors; outline?: never; plain?: never }
  | { color?: never; outline: true; plain?: never }
  | { color?: never; outline?: never; plain: true }
) & { className?: string; children: React.ReactNode } & (
    | Omit<Headless.ButtonProps, 'as' | 'className'>
    | Omit<React.ComponentPropsWithoutRef<typeof Link>, 'className'>
  )

export const Button = forwardRef(function Button(
  { color, outline, plain, className, children, ...props }: ButtonProps,
  ref: React.ForwardedRef<HTMLElement>
) {
  let classes = clsx(
    className,
    styles.base,
    outline ? styles.outline : plain ? styles.plain : clsx(styles.solid, styles.colors[color ?? 'dark/zinc'])
  )

  return 'href' in props ? (
    <Link {...props} className={classes} ref={ref as React.ForwardedRef<HTMLAnchorElement>}>
      <TouchTarget>{children}</TouchTarget>
    </Link>
  ) : (
    <Headless.Button {...props} className={clsx(classes, 'cursor-pointer')} ref={ref}>
      <TouchTarget>{children}</TouchTarget>
    </Headless.Button>
  )
})

/**
 * Expand the hit area to at least 44×44px on touch devices
 */
export function TouchTarget({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span
        className="absolute left-1/2 top-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 [@media(pointer:fine)]:hidden"
        aria-hidden="true"
      />
      {children}
    </>
  )
}
