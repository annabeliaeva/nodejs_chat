export interface ChatMessage {
    text?: string
    images?: string[]
    time: Date
    sender: number
    readed: boolean
}

export interface DialogData {
    id: number
    name: string
    avatarUrl?: string
    newMessages: number
    lastMessage: ChatMessage
    online: true | Date
}