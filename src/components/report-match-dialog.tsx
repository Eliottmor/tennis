import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Doc, Id } from '../../convex/_generated/dataModel'
import { Dialog, DialogTitle, DialogBody, DialogActions } from '~/ui/dialog'
import { Button } from '~/ui/button'
import { Text } from '~/ui/text'
import { useCurrentUser } from '~/hooks/useCurrentUser'
import SetInputField from './set-input-field'
import PlayersDropdown from './players-dropdown'
import { getMatchWinner, getSetScores } from '~/utils/match'
import { Avatar } from '~/ui/avatar'
import { getInitials } from '~/utils/user'
import { Badge } from '~/ui/badge'

interface ReportMatchDialogProps {
  ladderId: Id<'ladders'>
  trigger?: React.ReactNode
}

const ReportMatchDialog = ({ ladderId, trigger }: ReportMatchDialogProps) => {
  const { user } = useCurrentUser()
  const [isOpen, setIsOpen] = useState(false)

  const opponents = useQuery(
    api.matches.getOpponentsInLadder,
    user ? { ladderId } : 'skip'
  )

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Report Match</Button>
      <Dialog open={isOpen} onClose={setIsOpen}>
        <DialogTitle>Report Match Score</DialogTitle>
        <DialogBody>
          {user && opponents && (
            <ReportMatchForm
              currentUser={user}
              ladderId={ladderId}
              opponents={opponents}
              setIsOpen={setIsOpen}
            />
          )}
        </DialogBody>
        {trigger && (
          <div className="absolute top-4 right-4" onClick={() => setIsOpen(true)}>
            {trigger}
          </div>
        )}
      </Dialog>
    </>
  )
}

interface ReportMatchFormProps {
  currentUser: Doc<'users'>
  ladderId: Id<'ladders'>
  opponents: (Doc<'users'> | null)[]
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

const ReportMatchForm = ({ currentUser, ladderId, opponents, setIsOpen }: ReportMatchFormProps) => {
  const formMethods = useForm({
    defaultValues: {
      playerOne: {},
      playerTwo: {},
      opponentId: '',
    }
  })
  
  const { watch, handleSubmit, register, formState: { errors } } = formMethods
  const reportMatch = useMutation(api.matches.reportMatch)

  const [playerOne, playerTwo] = watch(['playerOne', 'playerTwo'])
  const opponentId = watch('opponentId')
  const winner = getMatchWinner(playerOne || {}, playerTwo || {})

  const isPlayerOneWinner = winner === 'playerOne'
  const isPlayerTwoWinner = winner === 'playerTwo'

  // Custom validation function
  const validateForm = () => {
    if (!opponentId) return false
    if (!winner) return false
    return true
  }

  const onSubmit = async (data: any) => {
    if (!validateForm()) return

    try {
      const sets = getSetScores(winner!, data.playerOne, data.playerTwo)
      const winnerId = isPlayerOneWinner ? currentUser._id : data.opponentId as Id<'users'>
      const loserId = !isPlayerOneWinner ? currentUser._id : data.opponentId as Id<'users'>

      await reportMatch({
        ladderId,
        matchDate: Date.now(),
        winnerId,
        loserId,
        sets,
      })

      setIsOpen(false)
      formMethods.reset()
    } catch (error) {
      console.error('Error reporting match:', error)
      formMethods.setError('root', {
        type: 'server',
        message: 'Failed to report match. Please try again.'
      })
    }
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {errors.root && (
          <Text className="text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
            {errors.root.message}
          </Text>
        )}

        {/* Current User Section */}
        <div className='flex items-center space-x-3 py-4'>
          <Avatar
            className='size-12'
            src={currentUser.imageUrl}
            initials={getInitials(currentUser.name)}
            alt={currentUser.name}
          />
          <div>
            <p className='text-lg font-medium'>{currentUser.name}</p>
            {isPlayerOneWinner && <Badge color='green'>Winner!</Badge>}
          </div>
        </div>

        {/* Sets Input */}
        <div className='pl-8'>
          <SetInputField setNumber='1' register={register} />
          <SetInputField setNumber='2' register={register} />
          <SetInputField setNumber='3' register={register} />
          {!winner && opponentId && (
            <Text className="text-red-600 mt-2">Please enter match scores</Text>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <PlayersDropdown opponents={opponents} />
          {isPlayerTwoWinner && <Badge color='green'>Winner!</Badge>}
        </div>

        <DialogActions>
          <Button type='button' outline onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            type='submit' 
            color='green'
            disabled={!validateForm()}
          >
            Report Match
          </Button>
        </DialogActions>
      </form>
    </FormProvider>
  )
}

export default ReportMatchDialog
