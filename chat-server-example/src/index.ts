import { createServer } from 'nodechat-server-sdk'
import { ChatClient } from 'nodechat-server-sdk/dist/types/ChatClient'
import { ClientAuthMessage, ClientGetConversation, ClientGetDialogs, ClientMessage, ClientReadConversation, ClientSendMessage } from '@@/shared/chat/types/ClientMessage'
import { ServerAcceptedMessage, ServerConversationReadedMessage, ServerDialogMessage, ServerGetDialogsMessage, ServerIncomingMessage } from '@@/shared/chat/types/ServerMessage'

import { UserSession } from '@@/shared/chat/types/UserSession'
import { PrismaClient as PrismaChat } from '@@/prisma/generated/chat'
import { PrismaClient as PrismaMain } from '@@/prisma/generated/db'
import { DialogData } from '@@/shared/chat/types/Chat'


const server = createServer('0.0.0.0', 3288, {
    protocol: 'ws',
    logging: true
})

console.log('[Chat] Server started!')
server.createChannel('main')

const dbChat = new PrismaChat()
const dbMain = new PrismaMain()
console.log('Connected to database!')


server.on('connect', (client: ChatClient) => {
    console.log('[Chat] Client connected: ' + client.getId())
})

server.on('auth', (client: ChatClient) => {
    console.log('[Chat] Client authenticated: ' + client.getId())
})

server.on('message', async (client, _message) => {
    console.log('Incoming message from', client.getId(), _message)
    const message = _message as ClientMessage

    switch (message.data.action) {
        case 'authenticate': authUser(client, message as ClientAuthMessage); break
        case 'fakeAuthenticate': authFakeUser(client, message as ClientMessage); break
        case 'sendMessage': sendMessage(client, message as ClientSendMessage); break
        case 'readConversation': readConversation(client, message as ClientReadConversation); break
        case 'getConversation': getConversation(client, message as ClientGetConversation); break
        case 'getDialogs': getDialogs(client, message as ClientGetDialogs); break
    }
})

server.on('disconnect', (client) => {
    server.disconnectClient(client)
    console.log('[Chat] Client disconnected: ' + client.getId())
})



const authUser = async (client: ChatClient, message: ClientAuthMessage) => {
    try {
        const _req = await fetch('http://127.0.0.1:3100/api/auth/session', {
            method: 'POST',
            body: JSON.stringify({ token: message.data.token })
        })
        const userData = await _req.json() as UserSession

        if (!userData) throw new Error('Wrong credentials')
        client.setData(userData)

        console.log('User data set: ' + userData)
    } catch (error) {
        console.error('Error while auth!')
        console.error(error)
    }
}

const authFakeUser = async (client: ChatClient, message: ClientMessage) => {
    try {
        const userData = message.data
        console.log(userData)
        if (!userData) throw new Error('Wrong credentials')
        client.setData(userData)


        console.log('User data set: ' + userData)
    } catch (error) {
        console.error('Error while auth!')
        console.error(error)
    }
}

const getDialogs = async (client: ChatClient, message: ClientGetDialogs) => {
    const lastMessages = await dbChat.message.findMany({
        where: {
            OR: [
                { from: client.getData().id },
                { to: client.getData().id }
            ]
        },
        take: 1,
        orderBy: {
            id: 'desc'
        }
    })

    const allUniqueUserIds = Array.from(new Set(lastMessages.map(x => x.from == client.getData().id ? x.to : x.from).flat()))
    const users = await dbMain.user.findMany({
        where: {
            id: {
                in: allUniqueUserIds
            }
        }
    })


    const dialogs = await Promise.all(lastMessages.map(async (msg) => {
        let chatWith = msg.from != client.getData().id ? msg.from : msg.to
        let chatWithUser = users.find(x => x.id == chatWith)!

        const isOtherClientOnline = server.getClients().find(x => x.getData().id == chatWith) != null
        const unreadedMessagesCount = await dbChat.message.count({
            where: {
                readed: false,
                to: client.getData().id,
                from: msg.from
            }
        })

        const dialogData = {
            id: chatWith,
            name: chatWithUser.login,
            lastMessage: {
                readed: msg.readed,
                sender: msg.from,
                time: msg.timestamp,
                text: msg.text,
                images: msg.images
            },
            online: isOtherClientOnline ? true : chatWithUser.last_active,
            newMessages: unreadedMessagesCount
        } as DialogData

        return dialogData
    }))


    client.sendMessage({
        dialogs: dialogs
    } as ServerGetDialogsMessage, message)
}

const getConversation = async (client: ChatClient, message: ClientGetConversation) => {

    // update conversations, set it to readed
    await dbChat.message.updateMany({
        where: {
            from: message.data.dialogWith,
            to: client.getData().id
        },
        data: {
            readed: true
        }
    })

    let messages = await dbChat.message.findMany({
        where: {
            OR: [
                { from: client.getData().id, to: message.data.dialogWith },
                { to: client.getData().id, from: message.data.dialogWith }
            ]
        },
        orderBy: {
            id: 'desc'
        }
    })
    messages = messages.reverse()


    client.sendMessage({
        messages: messages.map(x => ({
            text: x.text,
            images: x.images,
            time: x.timestamp,
            readed: x.readed,
            sender: x.from
        }))
    } as ServerDialogMessage, message)

    // Send to receiver if exists
    const receiver = server.getClients().find(x => x.getData().id == message.data.dialogWith)
    if (receiver) {
        receiver.sendMessage({
            userId: client.getData().id
        } as ServerConversationReadedMessage)
        console.log('[Chat] Readed state sent to online receiver: ' + receiver.getData().id)
    }
}


const sendMessage = async (client: ChatClient, msg: ClientSendMessage) => {
    const fromId = client.getData().id
    const user = await dbMain.user.findFirst({
        where: { id: msg.data.to }
    })

    if (!user) {
        console.log('User not found: ' + msg.data.to)
        return
    }

    // TODO CHECK USER EXISTING from API

    const dbmsg = await dbChat.message.create({
        data: {
            from: fromId,
            to: msg.data.to,
            text: msg.data.message.text,
            images: msg.data.message.images
        }
    })


    console.log(`${fromId} sent message to channel ${msg.data.to}`, msg.data.message)


    // Send message to receivers except client
    const receiver = server.getClients().find(x => x.getData().id == msg.data.to)
    if (receiver) {
        receiver.sendMessage({
            message: {
                sender: fromId,
                time: dbmsg.timestamp,
                text: msg.data.message.text,
                images: msg.data.message.images
            }
        } as ServerIncomingMessage)
        console.log('[Chat] Message sent to online receiver: ' + receiver.getData().id)
    }

    // Reply to client
    client.sendMessage({
        accepted: true
    } as ServerAcceptedMessage, msg)
}


const readConversation = async (client: ChatClient, msg: ClientReadConversation) => {
    const userId = client.getData().id

    // update conversations, set it to readed
    await dbChat.message.updateMany({
        where: {
            from: msg.data.dialogWith,
            to: userId
        },
        data: {
            readed: true
        }
    })


    console.log(`${userId} readed all messages from ${msg.data.dialogWith}`)


    // Send message to receivers except client
    const receiver = server.getClients().find(x => x.getData().id == msg.data.dialogWith)
    if (receiver) {
        receiver.sendMessage({
            userId: userId
        } as ServerConversationReadedMessage)
        console.log('[Chat] Readed state sent to online receiver: ' + receiver.getData().id)
    }
}