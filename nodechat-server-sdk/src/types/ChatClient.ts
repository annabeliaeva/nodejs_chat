import { ChatServer } from '@/server'
import WebSocket from 'ws'
import { logger } from '@/logger'
import { AesEncryptor } from '@/crypto'
import { randomMessageHash } from '@/util/util'
import { ChatMessage } from '@/types/ChatMessage'

export class ChatClient {
    private identifier: string
    private data: any
    private ws: WebSocket
    private password: string
    private approved: boolean

    constructor(ws: WebSocket, identifier: string, initialState: any) {
        this.identifier = identifier
        this.data = initialState
        this.ws = ws
        this.password = AesEncryptor.getRandomKey()
        this.approved = false
    }

    public getData = () => this.data
    public setData = (state: any) => this.data = state

    public getId = () => this.identifier
    public getSalt = () => this.password
    public isApproved = () => this.approved

    public getChannels = (server: ChatServer) =>
        server.getChannels().filter(x => x.getClients().find(x => x.getId() == this.identifier) != undefined)


    public processMessage = (rawMessage: string) => {
        try {
            const message: ChatMessage = JSON.parse(new AesEncryptor(this.password).decrypt(rawMessage))
            return message
        } catch (e) {
            logger.info(`Wrong message detected from ${this.getId()}, disconnecting...`)
            logger.error(e)
            this.ws.close()
            return null
        }
    }


    public sendMessage = (message: any, responseTo: ChatMessage | null = null) => {
        this.ws.send(new AesEncryptor(this.password).encrypt(JSON.stringify({
            hash: responseTo ? responseTo.hash : randomMessageHash(),
            data: message
        } as ChatMessage)))
        logger.info(`[Chat] Message ${responseTo ? 'responded' : 'sent'} to ${this.identifier}: ` + message)
    }

    public sendHelloMessage = () => {
        this.ws.send(JSON.stringify({
            hash: randomMessageHash(),
            data: `hello:${this.identifier}:${this.password}`
        }))
        logger.info(`[Chat] Hello Message sent to ${this.identifier} with salt ${this.password}`)
    }

    public processHelloMessage = (message: ChatMessage) => {
        if (message.data != 'hello:' + this.password.split('').reverse().join('')) {
            logger.info('[Chat] User not responded to hello message and was kicked...')
            this.ws.close()
            return false
        } else {
            this.approved = true
            logger.info('[Chat] User authenticated: ' + this.getId())
            return true
        }
    }

}