import { Box, Text, em, Image, Group, Modal, Loader, RingProgress } from '@mantine/core'
import classes from '@/styles/components/lk/MessageMassage.module.css'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { FileWithPath } from '@mantine/dropzone'
import { useEffect, useRef, useState } from 'react'
import { IconCheck, IconChecks, IconClock } from '@tabler/icons-react'
import { IChatSendImage } from '@/types/lk/chat'

interface MessageMassageProps {
    isUserMessage: boolean
    text?: string
    images?: string[] | IChatSendImage[]
    onImageClick?: (img: string) => void
    isFocused: boolean
    index?: number
    state: 'pending' | 'sent' | 'readed'
}

export default function MessageMassage(props: MessageMassageProps) {
    const isMobile = useMediaQuery(`(max-width: ${em(750)})`)
    const messageRef = useRef<HTMLDivElement>(null)
    const [imageLoading, setImageLoading] = useState<'none' | 'loading' | 'done'>(null)

    // const handleProgress = (imgId, event) => {
    //     const progressData = calculateUploadProgress(event)
    //     setImagesProgress(prev => ({ ...prev, [imgId]: progressData }))
    // }
    useEffect(() => console.log('imageLoading ', imageLoading), [imageLoading])

    useEffect(() => {
        if (props.isFocused) {
            messageRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [props.isFocused])

    useEffect(() => {
        console.log('images ', props.images)
    }, [props.images])

    useEffect(() => {
        if (!props.images || props.images.length === 0) {
            setImageLoading('none')
            return
        }

        if (!(props.images[0] as IChatSendImage).image) {
            setImageLoading('none')
            return
        }

        setImageLoading('loading')

        let allImagesLoaded = true
        for (let img of props.images as IChatSendImage[]) {
            if (!img.load || !img.load.done) {
                allImagesLoaded = false
                break
            }
        }

        // Устанавливаем статус загрузки в 'done' только если все изображения загружены
        if (allImagesLoaded) {
            setImageLoading('done')
        }
    }, [props.images])

    let stateIcon
    switch (props.state) {
        case 'pending': stateIcon = <IconClock className={classes.iconCheck} color='var(--mantine-color-green-9)' size={14} />; break
        case 'readed': stateIcon = <IconChecks className={classes.iconCheck} color='var(--mantine-color-green-9)' size={14} />; break
        case 'sent': stateIcon = <IconCheck className={classes.iconCheck} color='var(--mantine-color-green-9)' size={14} />; break
    }

    const imagesCount = props.images?.length

    return (
        <>
            {props.images?.length > 0 ?
                <div ref={messageRef}
                    className={
                        `${classes.message} ${props.isUserMessage ? classes.userMessage : classes.botMessage}`
                    }
                    onClick={() => {
                        console.log('message: ', props)
                        // props.onImageClick(props.images[0].image)
                    }}
                >
                    <div className={`${classes.messageImages} ${classes.messageMessageWithImages} ${props.images.length % 2 == 0 ?
                        classes.messageMessageWithImagesEven : ''}`}>
                        {props.images && (props.images[0] as IChatSendImage)?.image ? (props.images as IChatSendImage[]).map((img, index) => {
                            const imageStatus = img.load
                            return (
                                <div className={classes.imageWrapper + ` ${imagesCount > 2 && imageLoading === 'done' ? classes.imageWrapperMin : ''}`}
                                    key={'d' + index + img.load.total}
                                    onClick={() => props.onImageClick(img.image)}
                                >
                                    <div className={`${classes.imageLoading} ${imageStatus.done ? classes.imageLoadingDone : ''}`}>
                                        {img.load.progress < 100 ?
                                            <RingProgress
                                                size={80}
                                                sections={[
                                                    { value: imageStatus.progress, color: 'blue' },
                                                ]}

                                            /> : <Loader size={80} color="blue" />}
                                        <div className={classes.imageLoadingProgress}>
                                            {imageStatus.label}
                                        </div>
                                    </div>
                                    <Image
                                        fallbackSrc='/images/img-not-found.png'
                                        className={`${classes.image}`}
                                        // maw='33%'
                                        w='auto'
                                        mah='300'
                                        loading='lazy'
                                        src={img.image}
                                        key={index}
                                        alt="Image Message"
                                    />
                                </div>
                            )
                        })
                            :
                            (props.images as string[]).map((img, index) => (
                                <div className={classes.imageWrapper + ` ${imagesCount > 2 ? classes.imageWrapperMin : ''}`} key={'d' + index + props.index}
                                    onClick={() => props.onImageClick(img)}
                                >
                                    <Image
                                        onError={(e) => {
                                            e.currentTarget.onerror = null
                                            e.currentTarget.src = '/images/img-not-found.png'
                                        }}
                                        className={`${classes.image}`}
                                        // maw='33%'
                                        w='auto'
                                        mah='300'
                                        src={img}
                                        key={index}
                                        alt="Image Message" />
                                </div>
                            ))}
                    </div>
                    {props.text ?
                        <Box
                            ref={messageRef}
                            className={`${classes.messageMessageWithImages__text}`}
                        >
                            {props.isUserMessage ?
                                <Group display={'inline'} align='center' gap={5}>
                                    <Text className={classes.text}>{props.text}
                                        {stateIcon}
                                    </Text>
                                </Group>
                                :
                                <Group align='center' gap={5}>
                                    <Text className={classes.text}>{props.text}</Text>
                                </Group>}
                        </Box >
                        : <></>}

                    {!props.text ? <div className={classes.imageWithoutTextState}>{stateIcon}</div> : <></>}
                </div>
                :
                <Box
                    ref={messageRef}
                    className={`${classes.message} ${props.isUserMessage ? classes.userMessage : classes.botMessage}`}>
                    {props.isUserMessage ?
                        <Group display={'inline'} align='center' gap={5}>
                            <Text className={classes.text}>{props.text}
                                {stateIcon}
                            </Text>
                        </Group>
                        :
                        <Group align='center' gap={5}>
                            <Text className={classes.text}>{props.text}</Text>
                        </Group>}
                </Box >
            }
        </>
    )
}

// <Box className={`${classes.message} ${props.isUserMessage ? classes.userMessage : classes.botMessage}`}>
//     {props.file ? (
//         <Image
//             w={250}
//             h={250}
//             src={getImageSource(props.file)}
//             alt="Image Message"
//             className={classes.image}
//         />
//     ) : (
//         <Text className={classes.text}>{props.text}</Text>
//     )}
// </Box>