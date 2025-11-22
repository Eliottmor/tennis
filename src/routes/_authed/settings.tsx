import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Input } from '~/ui/input'
import { Button } from '~/ui/button'
import { Description, Field, Label } from '~/ui/fieldset'

export const Route = createFileRoute('/_authed/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '')
  const [availability, setAvailability] = useState(user?.availability || '')
  const [isSaving, setIsSaving] = useState(false)
  const [city, setCity] = useState(user?.city ?? undefined)
  const [status, setStatus] = useState(user?.status ?? undefined)
  const updateSettings = useMutation(api.users.updateUserSettings)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await updateSettings({
        phoneNumber: phoneNumber || undefined,
        availability: availability || undefined,
        city: city || undefined,
        status: status || undefined,
      })
      // Optionally show success message
    } catch (error) {
      console.error('Failed to update settings:', error)
      // Optionally show error message
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
            Personal Information
          </h2>
          <p className="mt-1 text-sm/6 text-gray-500 dark:text-gray-400">
            Update your contact information and availability preferences.
          </p>
        </div>
        <form className="md:col-span-2" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
            <Field className="col-span-full">
              <Label htmlFor="name">Name</Label>
              <div className="mt-2" data-slot="control">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
            </Field>

            <Field className="col-span-full">
              <Label htmlFor="email">Email address</Label>
              <div className="mt-2" data-slot="control">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
            </Field>

            <Field className="col-span-full">
              <Label htmlFor="phone-number">Phone number</Label>
              <div className="mt-2" data-slot="control">
                <Input
                  id="phone-number"
                  name="phone-number"
                  type="tel"
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </Field>

            <Field className="col-span-full">
              <Label htmlFor="availability">Availability</Label>
              <div className="mt-2" data-slot="control">
                <Input
                  id="availability"
                  name="availability"
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g., Weekdays after 6pm, Weekends anytime"
                />
              </div>
            </Field>

            <Field className="col-span-full">
              <Label htmlFor="availability">City</Label>
              <div className="mt-2" data-slot="control">
                <Input
                  id="city"
                  name="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Lehi, Salt Lake City, Provo"
                />
              </div>
            </Field>

            <Field className="col-span-full">
              <Label htmlFor="availability">Status</Label>
              <div className="mt-2" data-slot="control">
                <Input
                  id="status"
                  name="status"
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  placeholder="e.g., Injured, Vacation, Out of Town"
                />
              </div>
              <Description>This will display on the ladder page and profile</Description>
            </Field>
          </div>

          <div className="mt-8 flex">
            <Button
              type="submit"
              color="green"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

