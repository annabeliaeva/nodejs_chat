export interface ChatServerOptions {
    protocol: 'ws' | 'wss'
    keys?: {
        certificate: string
        privateKey: string
    }
    useCompression?: boolean
    logging?: boolean

    pingTimeout?: number
    
    onError?: (err: string) => void
}