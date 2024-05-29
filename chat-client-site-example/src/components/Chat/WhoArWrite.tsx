import { Avatar, Group, Indicator, Stack, Text } from '@mantine/core'

import classes from '@/styles/components/lk/WhoArWrite.module.css'
import { IChatUser } from '@/types/lk/chat'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'


export default function WhoArWrite(props: IChatUser) {
    const isOnline = props.lastActive === true
    const { push } = useRouter()
    return (
        <Group align='center' gap={8}>
            <div className={classes.avatarChat} onClick={() => push(`/user/${props.name}`)}>
                <Indicator color={isOnline ? 'green' : 'red'} offset={5} size={15} withBorder processing={isOnline}>
                    <Avatar variant='filled' radius='xl' size='md'
                        src={props.avatarUrl ?? '/images/avatar.jpg'} />
                </Indicator>
            </div>
            <Stack gap={2}>
                <Text className={classes.nicknameChat} size='sm' fw={600} onClick={() => push(`/user/${props.name}`)}>
                    {props.name}
                </Text>
                <Text size='xss' c='var(---color-text-small)'>
                    {isOnline ? 'Онлайн' : 'Был в сети ' + DateTime.fromISO(props.lastActive.toString()).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)}
                </Text>
            </Stack>
        </Group>
    )
}