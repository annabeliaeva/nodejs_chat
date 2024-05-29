import { SessionContext } from '@/components/context/SessionContext'
import { SessionContextType } from '@/types/UserSession'
import { useContext } from 'react'

export const useSession = (): SessionContextType => {
    const context = useContext(SessionContext)
    if (context === undefined) {
        throw new Error('useSession must be used within a SessionProvider')
    }
    return context
}
