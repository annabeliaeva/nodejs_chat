import { Box, Group, Stack, Image, rem, SimpleGrid, Text, Title, ActionIcon, TextInput, Textarea, Modal, Button, LoadingOverlay } from '@mantine/core'
import classes from '@/styles/pages/MassageLk.module.css'
import BtnPopover from './BtnPopover'
import WhoArWrite from './WhoArWrite'
import MessageMassage from './MessageMassage'
import { ClipboardEventHandler, useEffect, useMemo, useRef, useState } from 'react'
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from '@mantine/dropzone'
import { IconArrowLeft, IconPhoto, IconPlus, IconSend2, IconUpload, IconX } from '@tabler/icons-react'
import { t } from 'i18next'
import EmojiButton from './EmojiButton'
import { IChatBoxData, IChatSendImage, IChatSendMessage, IChatUser, IChatUserMessage } from '@/types/lk/chat'
import { SessionData } from '@/types/UserSession'
import { useTranslation } from 'next-i18next'
import { useSession } from '@/hooks/useSession'
import { MassageIcon } from '../svgIcons/library'
import { useDisclosure, useInViewport, useIntersection } from '@mantine/hooks'
import { ApiResponse } from '@/types/response/ApiResponse'
import ImagePreview from './ImagePreview'
import axios from 'axios'

interface ChatBoxProps {
    isMobile?: boolean
    isLoading?: boolean
    chatBoxData: IChatBoxData
    onSendMessage: (withUser: number, msg: IChatSendMessage) => void
    onBackClick: () => void
    onEscapeFromChat: () => void
    whoArWrite: IChatUser
}

export default function ChatBox(props: ChatBoxProps) {
    const { t } = useTranslation('lk/message')

    const [currentMessage, setCurrentMessage] = useState('')
    const chatBoxData = useMemo(() => props.chatBoxData, [props.chatBoxData?.partnerUser])

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const openDropzoneRef = useRef<() => void>(null)
    const messageInputRef = useRef(null)
    const [uploadProgress, setUploadProgress] = useState({})

    const [focusedMessageIndex, setFocusedMessageIndex] = useState<number | null>(null)
    const showChatBox = props.chatBoxData != null

    const [files, setFiles] = useState<FileWithPath[]>([])
    const previews = files.map((file, index) => {
        return <ImagePreview
            file={file}
            index={index}
            key={'preview' + index}
            onCancel={() => setFiles(p => p.filter(f => f !== file))}
        />
    })

    const [isDragOver, setIsDragOver] = useState(false)
    const [isDragOverDropzone, setIsDragOverDropzone] = useState(false)
    const [beforeMessageUser, setBeforeMessageUser] = useState(null)

    // Image modal
    const [opened, { open, close }] = useDisclosure(false)
    const [fullscreenImg, setFullscreenImg] = useState<string>(null)
    const [isInsideDraggable, setIsInsideDraggable] = useState(false)

    const isChildOfMessagesEndRef = (element, container) => {
        while (element && element !== container) {
            element = element.parentNode
        }
        return element === container
    }

    const handleDragStart = (e) => {
        if (isChildOfMessagesEndRef(e.target, messagesEndRef.current)) {
            setIsInsideDraggable(true)
        }
    }

    const handleDragEnd = () => {
        setIsInsideDraggable(false)
        setIsDragOver(false)
    }

    const handleEscapeKey = (event) => {
        if (event.key === 'Escape') {
            props.onEscapeFromChat()
        }
    }

    const handleFileSelect = (selectedFiles) => {
        const filesWithPreview = selectedFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            isLoading: true, // Начальное состояние загрузки
            progress: 0 // Начальный прогресс загрузки
        }))
        setFiles(files => [...files, ...filesWithPreview])
    }

    useEffect(() => { console.log('isInsideDraggable: ', isInsideDraggable) }, [isInsideDraggable])
    useEffect(() => {
        window.addEventListener('keydown', handleEscapeKey)
        return () => {
            window.removeEventListener('keydown', handleEscapeKey)
        }
    }, [handleEscapeKey])
    // ___________________________________________________________
    // Отправка сообщения


    // const sendMessage = async () => {
    //     if (currentMessage.trim() || files.length > 0) {
    //         let newMessage = {} as IChatSendMessage;

    //         if (currentMessage.trim().length > 0) {
    //             newMessage.text = currentMessage.trim();
    //         }

    //         // Добавляем изображения с локальными URL для предварительного просмотра (если они есть)
    //         if (files.length > 0) {
    //             newMessage.images = files.map(file => ({
    //                 image: URL.createObjectURL(file), // Локальный URL для предпросмотра
    //                 uploadProgress: 0, // Начальный прогресс загрузки (0%)
    //             }));
    //         }

    //         // Немедленно отправляем сообщение в чат
    //         props.onSendMessage(props.chatBoxData.partnerUser.id, newMessage);

    //         // Отправляем изображения асинхронно и обновляем прогресс
    //         files.forEach(async (file, index) => {
    //             axios.post('/api/util/compressImage', {
    //                 data: await getBase64(file)
    //             }, {
    //                 onUploadProgress: (progressEvent) => {
    //                     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    //                     // Здесь может быть логика для обновления UI прогресса загрузки
    //                 }
    //             }).then(response => {
    //                 const apiResponse = response.data as ApiResponse;
    //                 // Здесь должна быть логика для обновления URL изображения на серверный URL
    //                 // Возможно, вам понадобится специальная логика для обновления этого конкретного сообщения в чате
    //             });
    //         });

    //         // Очищаем состояние
    //         setCurrentMessage('')
    //         setFiles([])
    //     }
    // }
    const sendMessage = async () => {
        if (currentMessage.trim() || files.length > 0) {
            let newMessage = {
                text: currentMessage.trim(),
                files: files
            }

            // Немедленно отправляем сообщение в чат с локальными изображениями
            props.onSendMessage(props.chatBoxData.partnerUser.id, newMessage)

            // Отправляем файлы на сервер и обновляем UI в соответствии с прогрессом
            // (Логика асинхронной отправки и обновления UI должна быть реализована в handleSendMessage)

            // Очищаем состояние
            setCurrentMessage('')
            setFiles([])
        }
    }
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            sendMessage()
        }
    }
    const handleChange = (event) => {
        setCurrentMessage(event.target.value)
    }

    const handleEmojiSelect = (emoji: string) => {
        setCurrentMessage((prev) => prev + emoji)
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        var image = Array.from(e.clipboardData.items).find(x => /^image\//.test(x.type))
        if (image) {
            var blob = image.getAsFile()
            console.log(blob)
            setFiles(files => [...files, blob])
        }
    }

    useEffect(() => console.log('files: ', files), [files])


    // useEffect(() => {
    //     messagesEndRef.current?.scrollTo({
    //         top: messagesEndRef.current?.scrollHeight,
    //         behavior: 'smooth',
    //     })
    // }, [props.chatBoxData?.messages, messagesEndRef.current])

    // useEffect(() => {
    //     if (props.chatBoxData?.offset == 0) {
    //         messagesEndRef.current?.scrollTo({
    //             top: messagesEndRef.current?.scrollHeight,
    //             // behavior: 'smooth',
    //         })
    //     } else {
    //         messagesEndRef.current?.scrollTo({
    //             top: messagesEndRef.current?.scrollHeight - 200
    //         })
    //     }
    // }, [props.chatBoxData?.offset])

    useEffect(() => {
        if (props.chatBoxData)
            messagesEndRef.current?.scroll({
                top: messagesEndRef.current.scrollHeight
            })
    }, [chatBoxData])

    useEffect(() => {
        if (previews?.length == 0) return

        const timeout = setTimeout(() => messagesEndRef.current?.scrollTo({
            top: messagesEndRef.current?.scrollHeight,
            behavior: 'smooth',
        }), 300)
        return () => clearTimeout(timeout)
    }, [previews])
    // Dropzon

    useEffect(() => {
        console.log('props.chatBoxData?.messages: ', props.chatBoxData?.messages)
    }, [chatBoxData])



    useEffect(() => {
        if (fullscreenImg) open()
    }, [fullscreenImg])

    return (
        <>
            {showChatBox ?
                <div className={props.isMobile ? classes.chatMobile : classes.chat}>
                    <Modal opened={opened} size='lg' centered radius='lg'
                        onClose={() => {
                            setFullscreenImg(null)
                            close()
                        }} withCloseButton={false}>
                        <Image
                            onError={(e) => {
                                e.currentTarget.onerror = null
                                e.currentTarget.src = '/images/img-not-found.png'
                            }}
                            w='100%'
                            h='auto'
                            src={fullscreenImg}
                            alt='Image Message' />
                    </Modal>
                    <Box bg='var(---color-paper)' px={20} pt={24} pb={64} className={classes.chatHeader}>
                        <Group w='100%' justify='space-between' align='center'>
                            {props.isMobile ? <ActionIcon
                                variant='filled'
                                color='var(---color-transparent-black-15)'
                                size='xl'
                                radius='xs'
                                aria-label='back'
                                onClick={() => props.onBackClick()}
                            >
                                <IconArrowLeft color='var(--mantine-color-white)' size={24} />
                            </ActionIcon> : <></>}
                            <WhoArWrite {...props.whoArWrite} />
                            <BtnPopover />
                        </Group>
                    </Box>
                    <Box
                        onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true) }}
                        // onDragOver={(e) => e.preventDefault()} // Необходимо для возможности срабатывания drop
                        // onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true) }}
                        // onDragLeave={(e) => setIsDragOver(false)}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        className={classes.chatMain} ref={messagesEndRef}>
                        <Stack gap={8} className={classes.chatMainContent}>
                            {props.chatBoxData?.messages?.reduce((acc, message, index, array) => {
                                // Проверяем, является ли сообщение первым или отправлено другим пользователем
                                const isDifferentUser = index === 0 || message.isUserMessage !== array[index - 1].isUserMessage

                                if (isDifferentUser) {
                                    acc.push([])
                                }

                                acc[acc.length - 1].push(message)

                                return acc
                            }, []).map((messageGroup, groupIndex) => (
                                <Stack key={groupIndex} gap={5} py={20}>
                                    {messageGroup.map((message, messageIndex) => (
                                        <MessageMassage
                                            key={message.key}
                                            isUserMessage={message.isUserMessage}
                                            index={messageIndex}
                                            isFocused={focusedMessageIndex === messageIndex}
                                            onImageClick={img => {
                                                console.log(img)
                                                setFullscreenImg(img)
                                            }}
                                            text={message.text}
                                            // images={message.images && message.images[0]?.image ? message.images.map(x => x.image) : message.images}
                                            images={message.images}
                                            state={message.state}
                                        />
                                    ))}
                                </Stack>
                            ))}
                        </Stack>
                        {/* <SimpleGrid
                            // h={200}
                            // pos='absolute'
                            // bottom={64}
                            cols={{ base: 1, sm: 4 }}
                            mt={previews.length > 0 ? 'xl' : 0}>
                            {previews}
                        </SimpleGrid> */}
                        <Group className={classes.imagePreviewsBox} wrap='nowrap' gap={8}>
                            {previews}
                        </Group>
                    </Box>

                    <Box
                        className={classes.dropZoneWrapper}
                        style={{
                            visibility: isDragOver && !isInsideDraggable ? 'visible' : 'hidden',
                        }}
                    >
                        <Dropzone
                            // enablePointerEvents={true}
                            onDragLeave={(e) => setIsDragOver(false)}
                            openRef={openDropzoneRef}
                            dragEventsBubbling={false}
                            className={`${classes.dropZone}`}
                            accept={IMAGE_MIME_TYPE}
                            onDrop={(files) => {
                                setFiles(prev => [...prev, ...files])
                                setIsDragOver(false)
                            }}
                            onReject={(files) => {
                                console.log('rejected files', files)
                                setIsDragOver(false)
                            }}
                            w='100%'
                            h='100%'
                            maxSize={5242880}
                            onDragEnd={() => setIsDragOver(false)}
                            onFileDialogCancel={() => setIsDragOver(false)}
                            preventDropOnDocument
                        >
                            <Group align='center' justify='center' gap='xl' mih={220}>
                                <Dropzone.Accept>
                                    <IconUpload
                                        style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-blue-6)' }}
                                        stroke={1.5} />
                                </Dropzone.Accept>
                                <Dropzone.Reject>
                                    <IconX
                                        style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }}
                                        stroke={1.5} />
                                </Dropzone.Reject>
                                <Dropzone.Idle>
                                    <IconPhoto
                                        style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }}
                                        stroke={1.5} />
                                </Dropzone.Idle>
                                <div>
                                    <Text size='xl' inline>
                                        {t('dropZoneTitle')}
                                    </Text>
                                    <Text size='sm' c='dimmed' inline mt={7}>
                                        {t('dropZoneDescription')}
                                    </Text>
                                </div>
                            </Group>
                        </Dropzone>
                    </Box>

                    <Box className={classes.messageInputBlock}>
                        <Group className={classes.messageInputBlockItem}
                            w='100%'
                            align='center'
                            justify='space-between'>
                            <ActionIcon
                                variant='filled'
                                color='var(---color-transparent-black-15)'
                                size='sm'
                                radius='xl'
                                aria-label='Plus'
                                onClick={() => openDropzoneRef.current()}>
                                <IconPlus color='var(--mantine-color-white)' size={14} />
                            </ActionIcon>
                            <Textarea
                                ref={messageInputRef}
                                minRows={1}
                                maxRows={4}
                                autosize
                                value={currentMessage}
                                onKeyDown={handleKeyDown}
                                onChange={handleChange}
                                onPaste={e => handlePaste(e)}
                                radius='md'
                                size='md'
                                w='auto'
                                flex={'1 1 auto'}
                                placeholder='Напишите что-нибудь'
                                rightSection={
                                    <EmojiButton getEmoji={handleEmojiSelect} />
                                } />
                            <ActionIcon
                                onClick={sendMessage}
                                variant='transparent'
                                color='var(---color-transparent-black-15)'
                                size='xl'
                                radius='xl'
                                aria-label='Plus'>
                                <IconSend2 color='var(---color-text-small)' size={32} />
                            </ActionIcon>
                        </Group>
                    </Box>
                </div>
                : props.isLoading ?
                    <div className={props.isMobile ? classes.chatMobile : classes.chat}>
                        <Stack align='center' justify='center' w='100%' h='100%' pos='relative'>
                            <LoadingOverlay visible zIndex={10} overlayProps={{ radius: 'sm', blur: 2 }} />
                        </Stack>
                    </div>
                    :
                    <div className={props.isMobile ? classes.chatMobile : classes.chat}>
                        <Stack align='center' justify='center' w='100%' h='100%'>
                            <MassageIcon size={100} color='var(--mantine-color-gray-3)' />
                            <Title order={5}>Выберите чат чтобы начать общение</Title>
                        </Stack>
                    </div>
            }
        </>
    )
}