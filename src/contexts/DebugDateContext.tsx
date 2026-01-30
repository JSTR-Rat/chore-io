import { createContext, useContext, useState, ReactNode } from 'react'
import { createServerFn } from '@tanstack/react-start'
import { getSessionData } from '@/utils/auth.functions'

// Server function to check if user is admin
export const checkIsAdmin = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await getSessionData()
    if (!session?.user) {
      return false
    }
    // Better-auth admin plugin sets role to 'admin' for admin users
    return session.user.role === 'admin'
  },
)

interface DebugDateContextType {
  debugDate: Date
  setDebugDate: (date: Date) => void
  isEnabled: boolean
  goToPreviousDay: () => void
  goToNextDay: () => void
  resetToToday: () => void
  formatDate: (date: Date) => string
}

const DebugDateContext = createContext<DebugDateContextType | null>(null)

export function DebugDateProvider({
  children,
  isAdmin,
}: {
  children: ReactNode
  isAdmin: boolean
}) {
  const [debugDate, setDebugDate] = useState<Date>(new Date())

  // Only enable debug date controls for admins
  const isEnabled = isAdmin

  const goToPreviousDay = () => {
    const newDate = new Date(debugDate)
    newDate.setDate(newDate.getDate() - 1)
    setDebugDate(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(debugDate)
    newDate.setDate(newDate.getDate() + 1)
    setDebugDate(newDate)
  }

  const resetToToday = () => {
    setDebugDate(new Date())
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <DebugDateContext.Provider
      value={{
        debugDate,
        setDebugDate,
        isEnabled,
        goToPreviousDay,
        goToNextDay,
        resetToToday,
        formatDate,
      }}
    >
      {children}
    </DebugDateContext.Provider>
  )
}

export function useDebugDate() {
  const context = useContext(DebugDateContext)
  if (!context) {
    throw new Error('useDebugDate must be used within a DebugDateProvider')
  }
  return context
}

// Hook to get the current date (debug or real)
export function useCurrentDate(): Date {
  const context = useContext(DebugDateContext)

  // If context doesn't exist or debug mode is not enabled, return real date
  if (!context || !context.isEnabled) {
    return new Date()
  }

  return context.debugDate
}
