import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import type { Doc } from '../../convex/_generated/dataModel'
import { Field, Label } from '../ui/fieldset'
import { Listbox, ListboxLabel, ListboxOption } from '../ui/listbox'
import { Avatar } from '~/ui/avatar'
import { getInitials } from '~/utils/user'

interface PlayersDropdownProps {
  opponents: (Doc<'users'> | null)[]
}

const PlayersDropdown = ({ opponents }: PlayersDropdownProps) => {
  const { setValue, watch } = useFormContext()
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(pointer: coarse)')
    const updateIsTouch = () => setIsTouchDevice(mediaQuery.matches)

    updateIsTouch()
    mediaQuery.addEventListener('change', updateIsTouch)

    return () => {
      mediaQuery.removeEventListener('change', updateIsTouch)
    }
  }, [])

  const selectedOpponentId = watch('opponentId')
  const selectedOpponent = opponents.find(opponent => opponent?._id === selectedOpponentId)

  if (opponents.length === 0) {
    return <p>No opponents found</p>
  }

  if (isTouchDevice) {
    return (
      <Field>
        <Label>Select Opponent</Label>
        <select
          value={selectedOpponentId || ''}
          onChange={(event) => setValue('opponentId', event.target.value)}
          className="mt-3 w-full rounded-lg border border-zinc-950/10 bg-white px-4 py-3 text-base text-zinc-950 shadow-sm focus:border-zinc-950/20 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
        >
          <option value="" disabled>Select opponent...</option>
          {opponents.map((opponent) => (
            opponent && (
              <option key={opponent._id} value={opponent._id}>
                {opponent.name}
              </option>
            )
          ))}
        </select>
      </Field>
    )
  }

  return (
    <Field>
      <Label>Select Opponent</Label>
      <Listbox
        value={selectedOpponent || null}
        onChange={(opponent: Doc<'users'> | null) => setValue('opponentId', opponent?._id || '')}
        placeholder="Select opponent..."
      >
        {opponents.map((opponent) => (
          <ListboxOption key={opponent?._id} value={opponent}>
            <Avatar
              src={opponent?.imageUrl}
              initials={getInitials(opponent?.name || '')}
              alt=""
            />
            <ListboxLabel>{opponent?.name}</ListboxLabel>
          </ListboxOption>
        ))}
      </Listbox>
    </Field>
  )
}

export default PlayersDropdown
