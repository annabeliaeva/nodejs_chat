import { ChatClient } from 'nodechat-client-sdk'
import { IChatSendMessage } from './lk/chat'

export interface SessionData {
    id?: number
    email?: string
    login?: string
    reg_date?: string
    last_active?: string
    avatar_url?: string
}

export interface SessionContextType {
    session: SessionData | null
    chat: ChatClient
    toggleNotification: () => void
    notificationSound: boolean
}
