'use client'

import { Moon, Sun } from 'lucide-react'
import * as React from 'react'
import { useTheme } from '~/contexts/theme-context'
import { Button } from '~/ui/button'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // During SSR or before mount, render a placeholder
  if (!mounted) {
    return (
      <Button
        color="zinc"
        aria-label="Toggle theme"
        disabled
      >
        <Moon data-slot="icon" />
      </Button>
    )
  }

  return (
    <Button
      onClick={toggleTheme}
      color="zinc"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon data-slot="icon" />
      ) : (
        <Sun data-slot="icon" />
      )}
    </Button>
  )
}

