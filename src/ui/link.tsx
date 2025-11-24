import * as Headless from '@headlessui/react'
import React, { forwardRef } from 'react'
import { Link as RouterLink, type LinkProps } from '@tanstack/react-router'

export const Link = forwardRef(function Link(
  props: LinkProps & React.ComponentPropsWithoutRef<'a'>,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  return (
    <Headless.DataInteractive>
      <RouterLink {...props} ref={ref} />
    </Headless.DataInteractive>
  )
})
