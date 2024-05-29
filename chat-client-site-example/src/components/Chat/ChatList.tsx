import { Divider, Group, ScrollArea, Title } from '@mantine/core'
import BtnChatSearch from './BtnChatSearch'
import classes from '@/styles/pages/MassageLk.module.css'
import { t } from 'i18next'
import MassageUser from './MassageUser'
import { IChatListItem, IChatUser } from '@/types/lk/chat'
import { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'next-i18next'
import { DateTime } from 'luxon'
import { useSession } from '@/hooks/useSession'

interface ChatListProps {
    isMobile?: boolean
    chatListData?: IChatListItem[]
    onSelect: (id: number) => void
    onSearchUser: (user: IChatUser) => void
}

export default function ChatList(props: ChatListProps) {
    const session = useSession()

    const { t } = useTranslation('lk/message')
    return (
        <div className={props.isMobile ? classes.massageUserMobile : classes.massageUser}>
            <Group px={!props.isMobile ? 'xs' : ''} mb={22} align='center' justify='space-between' w='100%'>
                <Title order={6}>
                    {t('message')}
                </Title>
                <BtnChatSearch
                    onUserClicked={props.onSearchUser} />
                {/* <ActionIcon className={classes.chatSearchIcon}
                                size={45}
                                radius='lg'
                                color={'var(---color-black-transparent-0)'}
                                variant='filled'>
                                <IconSearch style={{ width: rem(24), height: rem(24) }} stroke={1.5} />
                            </ActionIcon> */}
            </Group>
            <Divider />
            <ScrollArea className={classes.scrollArea} h={680} scrollbarSize={4} scrollHideDelay={3000}>
                {props.chatListData?.map((chat) =>
                    <MassageUser
                        key={'chat-' + chat.user.id}
                        chatId={chat.user.id.toString()}
                        avatarUrl={chat.user.avatarUrl}
                        timeUser={chat.message ? chat.message.time : ''}
                        nameUser={chat.user.name}
                        newMessage={chat.newMessages}
                        isUserMessage={chat.message ? chat.message.sender == session.session.id : false}
                        text={chat.message?.images?.length > 0 ? chat.message.images.length > 1 ? t('images') : t('image') : chat.message?.text}
                        online={chat.user.lastActive === true}
                        onClick={() => {
                            props.onSelect(chat.user.id)
                        }}
                    />
                )}
            </ScrollArea>
        </div>
    )
}