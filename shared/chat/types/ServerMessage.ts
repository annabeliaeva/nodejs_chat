import { ChatMessage, DialogData } from './Chat'

export interface ServerDialogMessage {
    messages: ChatMessage[]
}

export interface ServerAcceptedMessage {
    accepted: boolean
}

export interface ServerGetDialogsMessage {
    dialogs: DialogData[]
}

export interface ServerIncomingMessage {
    message: ChatMessage
}

export interface ServerConversationReadedMessage {
    userId: number
}

