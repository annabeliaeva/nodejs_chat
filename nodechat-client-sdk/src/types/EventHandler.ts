export interface EventHandler {
    message: Function[]
    auth: Function[]
    connect: Function[]
    error: Function[]
    disconnect: Function[]
}