import { ChatServerOptions } from '@/types/ChatServerOptions'
import WebSocket, { WebSocketServer } from 'ws'
import { logger } from '@/logger'
import { ChatChannel } from '@/types/ChatChannel'
import { ChatClient } from '@/types/ChatClient'
import { v4 as uuid } from 'uuid'
import { ChatCallback } from '@/types/ChatCallback'

export class ChatServer {
    private ws: WebSocket.Server
    private options: ChatServerOptions

    private callbacks = {
        message: [] as ChatCallback['message'][],
        auth: [] as ChatCallback['auth'][],
        connect: [] as ChatCallback['connect'][],
        disconnect: [] as ChatCallback['disconnect'][],
    }

    private channels: ChatChannel[] = []
    private clients: ChatClient[] = []

    constructor(ws: WebSocket.Server, options: ChatServerOptions) {
        this.ws = ws
        this.options = options

        this.ws.on('connection', (wsClient, req) => {
            const client = new ChatClient(wsClient, uuid(), {})
            this.clients.push(client)
            client.sendHelloMessage()

            const ip = req.socket.remoteAddress as string
            if (options.onError) wsClient.on('error', options.onError)
            logger.info('[Chat] Client connected to server: ' + ip)

            wsClient.on('close', () => {
                logger.info('[Chat] Client disconnected from server: ' + client.getId())
                this.disconnectClient(client)
                this.callbacks.disconnect.forEach(func => func(client))
            })

            wsClient.on('message', (data) => {
                const msg = client.processMessage(data.toString())
                if (!msg) return

                if (!client.isApproved() && client.processHelloMessage(msg))
                    this.callbacks.auth.forEach(func => func(client))
                else this.callbacks.message.forEach(func => func(client, msg))
            })

            this.callbacks.connect.forEach(func => func(client))
        })
    }


    public createChannel = (name: string, maxClients: number = -1) => {
        if (this.getChannels().find(x => x.getName() == name))
            throw new Error('Channel already exists: ' + name)

        const channel = new ChatChannel(name, maxClients)

        this.channels.push(channel)

        return channel
    }

    public getChannels = () => this.channels
    public getClients = () => this.clients


    public disconnectClient = (client: ChatClient) => {
        client.getChannels(this).forEach(x => x.disconnectClient(client))
        this.clients = this.clients.filter(x => x.getId() != client.getId())

    }


    public on<T extends keyof ChatCallback>(type: T, callback: ChatCallback[T]) {
        this.callbacks[type].push(callback as any)
    }

    public connectClientToChannel(client: ChatClient, channelName: string) {
        let exChannel = this.channels.find(x => x.getName() == channelName)
        if (!exChannel) exChannel = this.createChannel(channelName)

        if (exChannel.getClients().find(x => x.getId() == client.getId())) return
        exChannel.connectClient(client)
    }

    public disconnectClientFromChannel(client: ChatClient, channelName: string) {
        const exChannel = this.channels.find(x => x.getName() == channelName)
        if (!exChannel) throw new Error('Channel ' + channelName + ' does not exists')

        if (exChannel.getClients().some(x => x.getId() == client.getId())) throw new Error('Client is not connected to channel ' + channelName)
        exChannel.disconnectClient(client)
    }

}


export const createServer = (host: string = '127.0.0.1', port: number = 3090, options: ChatServerOptions) => {
    const preparedParams: WebSocket.ServerOptions = {
        host: host,
        port: port,
        perMessageDeflate: options.useCompression ? {
            zlibDeflateOptions: {
                chunkSize: 1024,
                memLevel: 7,
                level: 3
            },
            zlibInflateOptions: {
                chunkSize: 10 * 1024
            },
        } : undefined,
    }

    if (options.protocol == 'wss' && options.keys) {
        if (!options.keys.privateKey) throw new Error('Private key was not provided')
        if (!options.keys.certificate) throw new Error('Certificate was not provided')
        preparedParams
    }


    logger.level = options.logging ? 'debug' : 'silent'

    const wss = new WebSocketServer(preparedParams)
    const server = new ChatServer(wss, options)

    return server
}