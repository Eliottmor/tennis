import { useFormContext, Controller } from 'react-hook-form'
import { useMemo } from 'react'
import type { Doc } from '../../convex/_generated/dataModel'
import { Field, Label } from '../ui/fieldset'
import { Listbox, ListboxLabel, ListboxOption } from '../ui/listbox'
import { Avatar } from '~/ui/avatar'
import { getInitials } from '~/utils/user'

interface PlayersDropdownProps {
  opponents: (Doc<'users'> | null)[]
}

const PlayersDropdown = ({ opponents }: PlayersDropdownProps) => {
  const { control } = useFormContext()

  // Filter out null opponents to avoid issues
  const validOpponents = useMemo(() => opponents.filter((opp): opp is Doc<'users'> => opp !== null), [opponents])

  if (validOpponents.length === 0) {
    return <p>No opponents found</p>
  }

  return (
    <Field>
      <Label>Select Opponent</Label>
      <Controller
        name="opponentId"
        control={control}
        render={({ field }) => {
          const selectedOpponent = validOpponents.find(opponent => opponent._id === field.value)
          
          return (
            <Listbox
              value={selectedOpponent || null}
              onChange={(opponent: Doc<'users'> | null) => {
                // Only update if we have a valid opponent with an ID
                // This prevents the Listbox from clearing the selection when onChange is called with null
                if (opponent && opponent._id) {
                  field.onChange(opponent._id)
                }
              }}
              placeholder="Select opponent..."
            >
              {validOpponents.map((opponent) => (
                <ListboxOption key={opponent._id} value={opponent}>
                  <Avatar
                    src={opponent.imageUrl}
                    initials={getInitials(opponent.name || '')}
                    alt=""
                  />
                  <ListboxLabel>{opponent.name} {opponent.status && `(${opponent.status})`}</ListboxLabel>
                </ListboxOption>
              ))}
            </Listbox>
          )
        }}
      />
    </Field>
  )
}

export default PlayersDropdown
