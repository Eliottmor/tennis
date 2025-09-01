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

  const selectedOpponentId = watch('opponentId')
  const selectedOpponent = opponents.find(opponent => opponent?._id === selectedOpponentId)

  if (opponents.length === 0) {
    return <p>No opponents found</p>
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
