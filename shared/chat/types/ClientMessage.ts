export type Action = 'authenticate' | 'getConversation' | 'getDialogs' | 'readConversation' | 'sendMessage' | 'fakeAuthenticate'
export type FrontendMessage<T extends ClientMessage> = T['data']

export interface ClientMessage {
    hash: string
    data: {
        action: Action
    }
}

export interface ClientAuthMessage extends ClientMessage {
    data: {
        action: 'authenticate'
        token: string
    }
}

export interface ClientGetDialogs extends ClientMessage {
    data: {
        action: 'getDialogs'
    }
}

export interface ClientGetConversation extends ClientMessage {
    data: {
        action: 'getConversation'
        dialogWith: number
    }
}

export interface ClientReadConversation extends ClientMessage {
    data: {
        action: 'readConversation'
        dialogWith: number
    }
}

export interface ClientSendMessage extends ClientMessage {
    data: {
        action: 'sendMessage'
        to: number
        message: {
            text?: string
            images?: string[]
        }
    }
}

