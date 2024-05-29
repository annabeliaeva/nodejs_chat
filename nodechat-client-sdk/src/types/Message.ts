export type RawMessage = string | object

export interface ChatMessage {
    hash: string
    data: RawMessage
}