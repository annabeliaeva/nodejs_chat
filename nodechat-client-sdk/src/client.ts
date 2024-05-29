import CryptoJS from 'crypto-js'
import { decrypt, encrypt } from './crypto'
import { isJson, randomMessageHash } from './util'
import { EventHandler } from './types/EventHandler'
import { ChatMessage, RawMessage } from './types/Message'

export class ChatClient {
    private server: string
    private port: number
    private ws?: WebSocket
    private settings: ChatSettings

    private isGreet: boolean = false
    private key?: string

    private eventHandlers: EventHandler
    private pendingMessages: Map<string, (response: any) => void> = new Map()


    constructor(server: string, port: number, settings?: ChatSettings) {
        this.server = server
        this.port = port
        this.settings = settings ?? defaultSettings


        this.eventHandlers = {
            auth: [],
            connect: [],
            disconnect: [],
            error: [],
            message: []
        }

    }

    public connect() {
        try {
            this.ws = new WebSocket(`${this.settings.protocol}://${this.server}${this.port ? ':' + this.port : ''}`)

            this.ws.addEventListener('open', (e) => {
                this.eventHandlers.connect.forEach(x => x())
            })

            this.ws.addEventListener('message', (e) => {
                const msg = e.data

                if (!this.isGreet || !this.key) {
                    this.processHelloMessage(JSON.parse(msg))
                    return
                }


                const message = JSON.parse(decrypt(msg, this.key)) as ChatMessage

                console.log('Incoming msg', message)

                if (this.pendingMessages.has(message.hash)) {
                    const callback = this.pendingMessages.get(message.hash)
                    if (callback) {
                        callback(message.data)
                        this.pendingMessages.delete(message.hash)
                    }
                } else this.eventHandlers.message.forEach(x => x(message))
            })

            this.ws.addEventListener('error', (e) => {
                this.eventHandlers.error.forEach(x => x(e))
            })

            this.ws.addEventListener('close', (e) => {
                console.error('Connection closed to ' + this.server + ':' + this.port + '. Retrying in ' + this.settings.reconnectInterval + 'ms')
                setTimeout(this.connect, this.settings.reconnectInterval)
            })

        } catch (e) {
            console.error('Could not connect to server: ' + this.server + ':' + this.port + '. Retrying in ' + this.settings.reconnectInterval + 'ms')
            console.error(e)
            setTimeout(this.connect, this.settings.reconnectInterval)
        }
    }

    public sendMessage(message: RawMessage) {
        if (!this.ws) throw Error('Not connected')
        if (!this.isGreet || !this.key)
            throw Error('Cannot send message without being authorized on server')

        const encryptedMessage = encrypt(JSON.stringify({
            hash: randomMessageHash(),
            data: message
        } as ChatMessage), this.key)
        this.ws.send(encryptedMessage)
    }


    public handleMessage(message: RawMessage): Promise<RawMessage> {
        if (!this.ws) throw Error('Not connected')
        if (!this.isGreet || !this.key)
            throw Error('Cannot send message without being authorized on server')

        const msg = {
            hash: randomMessageHash(),
            data: message
        } as ChatMessage

        const encryptedMessage = encrypt(JSON.stringify(msg), this.key)
        this.ws.send(encryptedMessage)

        return new Promise((resolve, _) => {
            this.pendingMessages.set(msg.hash, resolve)
        })
    }


    public on(event: 'connect' | 'error' | 'message' | 'disconnect' | 'auth', callback: Function) {
        switch (event) {
            case 'connect': this.eventHandlers.connect.push(callback); break
            case 'error': this.eventHandlers.error.push(callback); break
            case 'message': this.eventHandlers.message.push(callback); break
            case 'auth': this.eventHandlers.auth.push(callback); break
            case 'disconnect': this.eventHandlers.disconnect.push(callback); break
        }
    }

    private processHelloMessage(message: ChatMessage) {
        try {
            const msg = (message.data as string).split(':')
            if (!msg || msg.length != 3 || msg[0] != 'hello') throw new Error('Handshake error')

            this.key = msg[2]
            this.isGreet = true

            // Send reversed salt to greet
            this.sendMessage('hello:' + this.key.split('').reverse().join(''))
            this.eventHandlers.auth.forEach(x => x())
        } catch (e) {
            console.error(e)
        }
    }
}


export interface ChatSettings {
    protocol: 'ws' | 'wss',
    reconnectInterval: number
}

const defaultSettings: ChatSettings = {
    protocol: 'ws',
    reconnectInterval: 5000
}