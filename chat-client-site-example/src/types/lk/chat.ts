import { FileWithPath } from '@mantine/dropzone'

export interface IChatUser {
    id: number
    name: string
    avatarUrl: string | ''
    lastActive: true | Date
}

export interface IChatListItem {
    message: IChatUserMessage
    user: IChatUser
    newMessages: number
}

export interface IChatSendImage {
    image: string,
    load: {
        uploaded: any
        total: any
        unit: any
        progress: any
        label: any
        done: any
    }
}
export interface IChatSendMessage {
    text: string
    images?: IChatSendImage[]
}

export interface IChatUserMessage {
    sender: number //отправитель тоже будет всегда 
    time?: string //пусть время будет всегда
    text: string
    isUserMessage: boolean
    images?: string[] | IChatSendImage[] // тут всегда ''
    state: 'pending' | 'sent' | 'readed'
    key: any
}

export interface IChatBoxData {
    partnerUser: IChatUser
    messages: IChatUserMessage[]
}

export interface IChatBoxDataList {
    [user: number]: IChatBoxData
}