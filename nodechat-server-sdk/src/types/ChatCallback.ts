import { ChatClient } from '@/types/ChatClient'
import { ChatMessage } from './ChatMessage'

export interface ChatCallback {
    message: (client: ChatClient, message: ChatMessage) => void
    auth: (client: ChatClient) => void
    connect: (client: ChatClient) => void
    disconnect: (client: ChatClient) => void
}