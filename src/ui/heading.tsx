import clsx from 'clsx'

type HeadingProps = { level?: 1 | 2 | 3 | 4 | 5 | 6 } & React.ComponentPropsWithoutRef<
  'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
>

export function Heading({ className, level = 1, ...props }: HeadingProps) {
  let Element: `h${typeof level}` = `h${level}`

  return (
    <Element
      {...props}
      className={clsx(className, 'text-2xl/7 font-extralight text-gray-900 sm:truncate sm:text-5xl sm:tracking-tight dark:text-white')}
    />
  )
}

export function HeadingBlue({ className, ...props }: HeadingProps) {
  return (
    <span
      {...props}
      className={clsx(className, 'font-bold bg-linear-to-r from-[#005600] to-[#00aa44] bg-clip-text text-transparent')}
    />
  )
}

export function Subheading({ className, level = 2, ...props }: HeadingProps) {
  let Element: `h${typeof level}` = `h${level}`

  return (
    <Element
      {...props}
      className={clsx(className, 'text-base/7 font-semibold text-zinc-950 sm:text-sm/6 dark:text-white')}
    />
  )
}
