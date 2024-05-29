import AppLayoutLk from '@/components/AppLayoutLk'
import { Box, Divider, em, useMantineTheme } from '@mantine/core'
import classes from '@/styles/pages/MassageLk.module.css'
import { PageHead } from '@/components/PageHead/PageHead'
import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { useDocumentVisibility, useMediaQuery } from '@mantine/hooks'
import { useEffect, useMemo, useRef, useState } from 'react'
import { withAuth } from '@/components/HOC/withAuth'
import ChatList from '@/components/Chat/ChatList'
import { IChatBoxData, IChatBoxDataList, IChatListItem, IChatSendMessage, IChatUser, IChatUserMessage } from '@/types/lk/chat'
import ChatBox from '@/components/Chat/ChatBox'
import { prisma } from '@/util/prisma'
import { useSession } from '@/hooks/useSession'
import { DateTime } from 'luxon'
import { ChatMessage, DialogData } from '@@/shared/chat/types/Chat'
import { ClientGetConversation, ClientGetDialogs, ClientMessage, ClientReadConversation, ClientSendMessage, FrontendMessage } from '@@/shared/chat/types/ClientMessage'
import { ServerGetDialogsMessage, ServerDialogMessage, ServerAcceptedMessage, ServerIncomingMessage, ServerConversationReadedMessage } from '@@/shared/chat/types/ServerMessage'
import { v4 as uuid } from 'uuid'
import axios from 'axios'
import { FileWithPath } from '@mantine/dropzone'
import { fetchApi } from '@/util/fetch'
import { PageProps } from '@/types/PageProps'
import { UserPanelInfoResponse } from '@@/shared/api/types/internal/Panel'

export const getMessageHash = () => uuid().replaceAll('-', '')


interface LkPageMessagesProps extends PageProps {
    userData: UserPanelInfoResponse
}

export const getServerSideProps = withAuth(async (ctx) => {
    const extendedData = (await fetchApi('GET', 'internal', `/user/info/${ctx.user.id}?` + 
        new URLSearchParams([
            ['include', 'dates']
        ]).toString()
    )).data


    return {
        props: {
            userData: extendedData
        } as LkPageMessagesProps
    }
}, 'lk/index')



export default function MassageLk(props) {
    const { t } = useTranslation('lk/message')
    const theme = useMantineTheme()
    const isMobile = useMediaQuery(`(max-width: ${em(750)})`)
    // const [messages, setMessages] = useState<{ text: string; isUserMessage: boolean }[]>([])

    const [mobileVisible, setMobileVisible] = useState<'chatList' | 'chatUser'>('chatList')
    const [dialogs, setDialogs] = useState<IChatListItem[]>([])
    const dialogsRef = useRef(dialogs) // Нужно для получения актуального состояния в любом месте 

    const [loadedChats, setLoadedChats] = useState<IChatBoxDataList>({})
    const [currentChatId, setCurrentChatId] = useState(null)
    const currentChatIdRef = useRef(currentChatId)
    const currentDialog = currentChatId != null ? dialogs.find(x => x.user.id == currentChatId) : null
    const [isLoadingDialog, setIsLoadingDialog] = useState(false)

    const [newMessageImages, setNewMessageImages] = useState(null)
    const [newChatMsg, setNewChatMsg] = useState(null)

    const session = useSession()
    const documentState = useDocumentVisibility()


    const openChat = (withUser: IChatUser) => {
        if (dialogsRef.current.find(x => x.user.id == withUser.id))
            handleChatSelect(withUser.id)
        else {
            setDialogs(currentDialogs => ([{
                message: null,
                newMessages: 0,
                user: withUser
            }, ...currentDialogs]))
            handleChatSelect(withUser.id)
        }
    }

    const handleChatSelect = (id: number) => {
        setCurrentChatId(id)
        setMobileVisible('chatUser')
    }

    const handleBackClick = () => {
        setCurrentChatId(null)
        setMobileVisible('chatList')
    }

    const getBase64 = (file: FileWithPath): Promise<string> => {
        console.log('blob: ', file)
        return new Promise(resolve => {
            let reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result.toString())
        })
    }
    // const handleSendMessage = async (withUser: number, msg: IChatSendMessage) => {
    //     if (!withUser) return


    //     const newChatMsg = {
    //         isUserMessage: true,
    //         sender: session.session.id,
    //         state: 'pending',
    //         text: msg.text,
    //         images: msg.images,
    //         time: DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
    //         key: DateTime.now().toMillis()
    //     } as IChatUserMessage


    //     setLoadedChats(currentState => {
    //         let loadedChatsUpdated = { ...currentState, [withUser]: { ...currentState[withUser], messages: [...currentState[withUser].messages, newChatMsg] } } as IChatBoxDataList
    //         return loadedChatsUpdated
    //     })

    //     session.chat.handleMessage({
    //         action: 'sendMessage',
    //         to: withUser,
    //         message: {
    //             text: msg.text,
    //             images: msg.images.map(x => x.image)
    //         }
    //     } as FrontendMessage<ClientSendMessage>)
    //         .then(res => {
    //             const response = res as ServerAcceptedMessage
    //             if (!response.accepted) return // TODO SHOW ERROR

    //             setLoadedChats(currentState => {
    //                 const updated = currentState[withUser].messages.map(x => {
    //                     if (x.key != newChatMsg.key) return x
    //                     return { ...x, state: 'sent' } as IChatUserMessage
    //                 })

    //                 const newState = { ...loadedChats, [withUser]: { ...loadedChats[withUser], messages: [...updated] } } as IChatBoxDataList
    //                 return newState
    //             })

    //             // update dialog msg
    //             setDialogs(currentDialogs => currentDialogs.map(x => {
    //                 if (x.user.id != withUser) return x
    //                 return { ...x, message: newChatMsg }
    //             }))
    //         })
    // }

    function updateMessageImageProgress(chatPartnerId, messageKey, imageId, load) {
        setLoadedChats(currentChats => {
            const currentChat = currentChats[chatPartnerId]
            if (!currentChat) return currentChats // Если чат не найден, возвращаем текущее состояние

            // Находим и обновляем нужное сообщение
            const updatedMessages = currentChat.messages.map(message => {
                if (message.key === messageKey) {
                    // Находим и обновляем нужное изображение в сообщении
                    const updatedImages = message.images?.map(image => {
                        if ('id' in image && image.id === imageId) { // Проверяем наличие свойства 'id' для TS
                            return { ...image, load }
                        }
                        return image
                    })
                    return { ...message, images: updatedImages }
                }
                return message
            })

            // Обновляем чат с новым списком сообщений
            return {
                ...currentChats,
                [chatPartnerId]: {
                    ...currentChat,
                    messages: updatedMessages
                }
            }
        })
    }

    function calculateUploadProgress(event, done: boolean) {
        const { loaded, total } = event
        const units = ['Байт', 'Кб', 'Мб', 'Гб', 'Тб']
        let index = 0

        let loadedDisplay = loaded
        let totalDisplay = total
        while (totalDisplay >= 1024 && index < units.length - 1) {
            index++
            loadedDisplay /= 1024
            totalDisplay /= 1024
        }

        const result = {
            uploaded: parseFloat(loadedDisplay.toFixed(2)),
            total: parseFloat(totalDisplay.toFixed(2)),
            unit: units[index],
            progress: parseFloat(((loaded / total) * 100).toFixed(2)),
            label: `${parseFloat(loadedDisplay.toFixed(2))} ${units[index]} / ${parseFloat(totalDisplay.toFixed(2))} ${units[index]}`,
            // done: parseFloat(((loaded / total) * 100).toFixed(2)) == 100,
            done: done
        }
        return result
    }

    const handleSendMessage = async (withUser, msg) => {
        if (!withUser) return

        const initialImages = msg.files.map(file => ({
            image: URL.createObjectURL(file), // Временный URL для отображения
            load: {
                loaded: 10,
                total: 4096,
            }, // Начальный прогресс загрузки
            id: Date.now() + Math.random(), // Уникальный ID для изображения
        }))
        const messageKey = DateTime.now().toMillis()

        const newChatMsg = {
            isUserMessage: true,
            sender: session.session.id,
            state: 'pending', // Изначально все сообщения в состоянии ожидания
            text: msg.text,
            images: initialImages,
            time: DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
            key: messageKey// Уникальный ключ сообщения
        }

        // Добавление сообщения в локальный чат
        setLoadedChats(currentState => {
            let loadedChatsUpdated = { ...currentState, [withUser]: { ...currentState[withUser], messages: [...currentState[withUser].messages, newChatMsg] } } as IChatBoxDataList
            return loadedChatsUpdated
        })

        // Обновление диалога
        setDialogs(dialogs => dialogs.map(d => {
            if (d.user.id != withUser) return d
            d.message = { ...newChatMsg, state: 'pending' }
            return d
        }))

        // Асинхронная загрузка изображений и обновление состояния чата
        const imageUploads = await Promise.all(msg.files.map(async (img, index) => {
            // console.log('image upl: ', img)
            try {
                const imageId = initialImages[index].id
                const response = await axios.post('/api/util/compressImage',
                    {
                        data: await getBase64(img)
                    },
                    {
                        onUploadProgress: progressEvent => {
                            const progress = calculateUploadProgress(progressEvent, false)
                            updateMessageImageProgress(withUser, messageKey, imageId, progress)

                            console.log('image loading: ', progressEvent)
                        },

                    })

                // MAXIM ETO KOSTIL FIX PLEASE
                updateMessageImageProgress(withUser, messageKey, imageId, {
                    done: true
                })


                // Обновление URL изображения после загрузки
                newChatMsg.images[index].image = response.data.message // Предполагается, что сервер возвращает URL загруженного изображения
                return true
            } catch (error) {
                console.error("Ошибка загрузки изображения", error)
                // Обработка ошибки загрузки, если требуется
            }
        }))

        // await Promise.all(imageUploads).then(() => console.log('new images: ', newChatMsg.images))
        const uploaded = imageUploads.every(x => x === true)
        // Обновление статуса сообщения после загрузки всех изображений
        if (uploaded)
            session.chat.handleMessage({
                action: 'sendMessage',
                to: withUser,
                message: {
                    text: msg.text,
                    images: newChatMsg.images.map(x => x.image)
                }
            } as FrontendMessage<ClientSendMessage>).then(res => {
                const response = res as ServerAcceptedMessage
                if (!response.accepted) {
                    console.error("Сообщение не было принято сервером")
                    // TODO: Показать ошибку пользователю
                    return
                }
                // Обновление состояния сообщения на "отправлено"
                setLoadedChats(currentState => {
                    const updated = currentState[withUser].messages.map(x => {
                        if (x.key != newChatMsg.key) return x
                        return { ...x, state: 'sent' } as IChatUserMessage
                    })

                    const newState = { ...loadedChats, [withUser]: { ...loadedChats[withUser], messages: [...updated] } } as IChatBoxDataList
                    return newState
                })
            })
    }




    const requestDialogs = () => session.chat.handleMessage({
        action: 'getDialogs'
    } as FrontendMessage<ClientGetDialogs>).then(res => {
        const response = res as ServerGetDialogsMessage
        loadDialogs(response.dialogs)
    })

    const loadDialogs = (data: DialogData[]) => {
        const ds = data.map(x => ({
            newMessages: x.newMessages,
            user: {
                id: x.id,
                name: x.name,
                avatarUrl: x.avatarUrl,
                lastActive: x.online
            },
            message: {
                isUserMessage: x.lastMessage.sender == session.session.id,
                sender: x.lastMessage.sender,
                text: x.lastMessage.text,
                images: x.lastMessage.images,
                time: DateTime.fromISO(x.lastMessage.time.toString()).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
                key: DateTime.fromISO(x.lastMessage.time.toString()).toMillis()
            }
        } as IChatListItem))

        setDialogs(ds)
    }


    useEffect(() => {
        if (!session.chat) return
        requestDialogs()

        session?.chat?.on('message', (msg: any) => {
            if (!msg.data.message) return
            const { message } = msg.data as ServerIncomingMessage
            const sender = message.sender

            const dialog = dialogsRef.current.find(x => x.user.id == sender)

            if (!dialog) {
                requestDialogs()
                return
            }

            const frontendMessage = {
                key: DateTime.fromISO(message.time.toString()).toMillis(),
                isUserMessage: false,
                sender: sender,
                state: 'sent',
                text: message.text,
                images: message.images,
                time: DateTime.fromISO(message.time.toString()).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
            } as IChatUserMessage

            setDialogs(currentDialogs => currentDialogs.map(x => {
                if (x.user.id != sender) return x
                return {
                    ...x,
                    user: {
                        ...x.user,
                        lastActive: true
                    },
                    newMessages: x.newMessages + 1,
                    message: frontendMessage
                }
            }))

            setLoadedChats(currentChats => {
                if (currentChats[sender]) {
                    return {
                        ...currentChats, [sender]: {
                            ...currentChats[sender],
                            messages: [...currentChats[sender].messages, frontendMessage]
                        }
                    }
                }
                else return currentChats
            })

            // Tell that im reading
            if (currentChatIdRef?.current == sender && documentState == 'visible')
                session.chat.sendMessage({
                    action: 'readConversation',
                    dialogWith: currentChatIdRef.current
                } as FrontendMessage<ClientReadConversation>)
        })


        session?.chat?.on('message', (msg: any) => {
            if (!msg.data.userId) return
            const { userId } = msg.data as ServerConversationReadedMessage

            setLoadedChats(currentChats => {
                if (currentChats[userId]) {
                    return {
                        ...currentChats, [userId]: {
                            ...currentChats[userId],
                            messages: currentChats[userId].messages.map(x => ({ ...x, state: 'readed' }))
                        }
                    }
                }
                else return currentChats
            })

            setDialogs(currentDialogs => currentDialogs.map(x => {
                if (x.user.id != userId) return x
                return {
                    ...x,
                    user: {
                        ...x.user,
                        lastActive: true
                    }
                }
            }))
        })

    }, [session?.chat])

    useEffect(() => {
        dialogsRef.current = dialogs

        // if dialogs changed and chat is opened
        if (currentChatId) {
            const dialog = dialogs.find(x => x.user.id == currentChatId)
            if (dialog) {
                dialog.newMessages = 0
                setDialogs([dialog, ...dialogs.filter(x => x.user.id != currentChatId)])
            } else {

            }
        }
    }, [dialogs, currentChatId])



    useEffect(() => {
        currentChatIdRef.current = currentChatId
        if (currentChatId == null) return

        setIsLoadingDialog(true)
        session.chat.handleMessage({
            action: 'getConversation',
            dialogWith: currentChatId
        } as FrontendMessage<ClientGetConversation>)
            .then(res => {
                const response = res as ServerDialogMessage
                const dialog = dialogs.find(x => x.user.id == currentChatId)
                const dialogData = {
                    partnerUser: dialog.user,
                    messages: response.messages.map(x => ({
                        sender: x.sender,
                        isUserMessage: x.sender != dialog.user.id,
                        text: x.text,
                        images: x.images,
                        state: x.readed ? 'readed' : 'sent',
                        time: x.time.toString(),
                        key: DateTime.fromISO(x.time.toString()).toMillis()
                    } as IChatUserMessage))
                } as IChatBoxData

                setLoadedChats(currentChats => ({ ...currentChats, [currentChatId]: dialogData }))
                setDialogs(currentDialogs => currentDialogs.map((d, i) => {
                    if (i == currentDialogs.indexOf(dialog)) return { ...d, newMessages: 0 }
                    else return d
                }))
                setIsLoadingDialog(false)
            })

    }, [currentChatId])

    return (
        <>
            <PageHead title='Сообщения' description={t('HeadDescription')} />
            <AppLayoutLk {...props} >
                <Box className={isMobile ? classes.boxMobile : classes.box} w='100%' bg='var(---color-paper)'>
                    {(isMobile && mobileVisible === 'chatList') || !isMobile ? (
                        <>
                            <ChatList
                                isMobile={isMobile}
                                chatListData={dialogs}
                                onSelect={handleChatSelect}
                                onSearchUser={openChat} />
                            {!isMobile && <Divider className={classes.dividerMassage} orientation='vertical' size='xs' />}
                        </>
                    ) : null}

                    {(isMobile && mobileVisible === 'chatUser') || !isMobile ? (
                        <ChatBox
                            isLoading={isLoadingDialog}
                            isMobile={isMobile}
                            onBackClick={handleBackClick}
                            onEscapeFromChat={() => setCurrentChatId(null)}
                            whoArWrite={currentDialog?.user}
                            chatBoxData={currentChatId ? loadedChats[currentChatId] : null}
                            onSendMessage={handleSendMessage} />
                    ) : null}
                </Box>
            </AppLayoutLk>
        </>
    )
}