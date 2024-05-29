import dynamic from 'next/dynamic'
import { Categories, EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react'
import { useEffect, useRef, useState } from 'react'
import { ActionIcon, Popover, rem } from '@mantine/core'
import { IconMoodSmile } from '@tabler/icons-react'

const Picker = dynamic(
    () => import('emoji-picker-react'),
    { ssr: false }
)

export default function EmojiButton(props: {
    className?: string;
    getEmoji: (emoji: string) => void
}) {

    const onEmojiSelect = (emoji: EmojiClickData) => {
        props.getEmoji(emoji.emoji)
    }
    // const colorScheme = useColorScheme()
    // const onMouseLeave = () => {
    //     setIsShow(false)
    // }
    // const handleShow = (e) => {
    //     if (isShow && !boxRef?.current?.contains(e.target)) setIsShow(false)
    // }

    // useEffect(() => { // Для мобилы
    //     addEventListener('mouseup', handleShow)

    //     return () => {
    //         removeEventListener('mouseup', handleShow)
    //     }
    // })
    // const [opened, { close, open }] = useDisclosure(false)
    return (
        <>
            <Popover position='top-end' withArrow >
                <Popover.Target>
                    <ActionIcon
                        size={32}
                        radius='xl'
                        color='var(---color-transparent-black-15)'
                        variant='transparent'>
                        <IconMoodSmile
                            style={{ width: rem(24), height: rem(24) }}
                            color='var(---color-text-small)'
                            stroke={1.5} />
                    </ActionIcon>
                </Popover.Target>
                <Popover.Dropdown style={{ background: 'transparent', border: 'none' }}>
                    <Picker
                        autoFocusSearch={true}
                        theme={Theme.LIGHT}
                        emojiStyle={EmojiStyle.NATIVE}
                        lazyLoadEmojis={true}
                        onEmojiClick={onEmojiSelect}/>
                </Popover.Dropdown>
            </Popover>
        </>
    )
}