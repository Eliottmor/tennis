import { Dialog, DialogTitle, DialogBody, DialogActions } from '../ui/dialog'
import { Button } from '../ui/button'
import { Fieldset, Field, Label } from '../ui/fieldset'
import { Input } from '../ui/input'
import { Checkbox, CheckboxField } from '../ui/checkbox'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'

type LadderFormData = {
  name: string
  password: string
  startDate: string
  endDate: string
}

export function CreateLadderDialog({
  isDialogOpen,
  setIsDialogOpen
 }: { isDialogOpen: boolean, setIsDialogOpen: (open: boolean) => void }) {
  const [error, setError] = useState<string | null>(null)
  const [autoAddCreator, setAutoAddCreator] = useState(true)
  const { userId } = useCurrentUser()
  const createLadder = useMutation(api.ladders.createLadder)
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<LadderFormData>()
  
  const onSubmit = async (data: LadderFormData) => {
    if (!userId) {
      setError("You must be logged in to create a ladder")
      return
    }

    try {
      setError(null)
      
      // Convert date strings to Unix timestamps
      const startTimestamp = new Date(data.startDate).getTime()
      const endTimestamp = new Date(data.endDate).getTime()
      
      // Call the Convex mutation
      await createLadder({
        name: data.name,
        password: data.password || undefined, // Convert empty string to undefined
        startDate: startTimestamp,
        endDate: endTimestamp,
        createdBy: userId,
        autoAddCreator: autoAddCreator,
      })
      
      // Success - close dialog and reset form
      setIsDialogOpen(false)
      reset()
      setAutoAddCreator(true) // Reset to default value
      
      // TODO: Add success notification here
      console.log('Ladder created successfully!')
      
    } catch (error) {
      // Handle error
      const errorMessage = error instanceof Error ? error.message : 'Failed to create ladder'
      setError(errorMessage)
      console.error('Failed to create ladder:', error)
    }
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    reset()
    setError(null)
    setAutoAddCreator(true) // Reset to default value
  }
  
  return (
    <Dialog open={isDialogOpen} onClose={setIsDialogOpen} size="md">
        <DialogTitle>Create Ladder</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <Fieldset className="space-y-4">
              <Field>
                <Label htmlFor="name">
                  Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter ladder name"
                  {...register('name', { 
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                  aria-invalid={errors.name ? 'true' : 'false'}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </Field>

              <Field>
                <Label htmlFor="password">
                  Password (Optional)
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password if needed"
                  {...register('password')}
                />
              </Field>

              <CheckboxField>
                <Checkbox
                  id="autoAddCreator"
                  checked={autoAddCreator}
                  onChange={setAutoAddCreator}
                />
                <Label htmlFor="autoAddCreator">
                  Automatically add me to the ladder
                </Label>
              </CheckboxField>

              <Field>
                <Label htmlFor="startDate">
                  Start Date *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate', { 
                    required: 'Start date is required',
                  })}
                  aria-invalid={errors.startDate ? 'true' : 'false'}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                    {errors.startDate.message}
                  </p>
                )}
              </Field>

              <Field>
                <Label htmlFor="endDate">
                  End Date *
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate', { 
                    required: 'End date is required',
                    validate: (value, formValues) => {
                      if (new Date(value) <= new Date(formValues.startDate)) {
                        return 'End date must be after start date'
                      }
                      return true
                    }
                  })}
                  aria-invalid={errors.endDate ? 'true' : 'false'}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-500">
                    {errors.endDate.message}
                  </p>
                )}
              </Field>
            </Fieldset>
          </DialogBody>
          <DialogActions>
            <Button type="button" outline onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" color="blue" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Ladder'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
  )
}