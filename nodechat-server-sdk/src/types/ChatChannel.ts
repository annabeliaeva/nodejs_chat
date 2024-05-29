import { ChatClient } from './ChatClient'

export class ChatChannel {
    private name: string
    private maxClients: number
    private clients: ChatClient[]

    constructor(name: string, maxClients: number = -1) {
        this.name = name
        this.maxClients = maxClients
        this.clients = []
    }

    public getName = () => this.name
    public getMaxClients = () => this.maxClients
    public getClients = () => this.clients

    public connectClient(client: ChatClient) {
        if (this.clients.find(x => x.getId() == client.getId()))
            throw new Error(`Client with id ${client.getId()} is already connected to channel ${this.name}`)

        this.clients.push(client)
    }

    public disconnectClient(client: ChatClient) {
        this.clients = this.clients.filter(x => x.getId() != client.getId())
    }
}