import { Avatar, Badge, Box, Group, Indicator, Stack, Text, em } from '@mantine/core'
import classes from '@/styles/components/lk/MassageUser.module.css'
import { useMediaQuery } from '@mantine/hooks'

interface MassageUserProps {
    chatId: string
    avatarUrl: string
    newMessage: number
    nameUser: string
    timeUser: string
    text: string
    online: boolean
    isUserMessage: boolean
    onClick?: () => void
}


export default function MassageUser(props: MassageUserProps) {
    const isMobile = useMediaQuery(`(max-width: ${em(750)})`)
    return (
        <>
            <Box px='xs' pt={8} className={isMobile ? classes.chatMassageMobile : classes.chatMassage} w='100%' onClick={props.onClick}>
                <Stack gap={8} align='flex-start'>
                    <Group align='center' w='100%' justify='space-between'>
                        <Group align='center' gap={8}>
                            <Indicator color={props.online ? 'green' : 'red'} size={15} offset={3} withBorder processing={props.online}>
                                <Avatar variant='filled' radius='xl' size='md'
                                    src={props.avatarUrl ?? '/images/avatar.jpg'} />
                            </Indicator>
                            <Stack align='flex-start' gap={2}>
                                <Text size='sm' fw={600}>
                                    {props.nameUser}
                                </Text>
                                {isMobile ?
                                    <Text c='var(---color-text-small)' size='xss' fw={400}>
                                        {props.timeUser}
                                    </Text>
                                    :
                                    <></>
                                }
                            </Stack>
                        </Group>
                        {isMobile ?
                            props.newMessage > 0 && (
                                <Badge
                                    className={classes.badgeMassageMobile}
                                    color='var(--mantine-color-red-6)'
                                    size='xs'
                                    fz={12}
                                    fw={400}>
                                    {props.newMessage}
                                </Badge>
                            )
                            :
                            <Group align='center' gap={8}>
                                {props.newMessage > 0 && (
                                    <Badge
                                        className={classes.badgeMassage}
                                        color='var(--mantine-color-red-6)'
                                        size='xs'
                                        fz={12}
                                        fw={400}>
                                        {props.newMessage}
                                    </Badge>
                                )}
                                <Text c='var(---color-text-small)' size='xss' fw={400}>
                                    {props.timeUser}
                                </Text>
                            </Group>
                        }

                    </Group>
                    <Group className={classes.textUser}>
                        <Text className={classes.textUserTxt} fz='xs' fw={400}>
                            {props.isUserMessage && <b>Вы: </b>}
                            {props.text}
                        </Text>
                    </Group>
                </Stack>
            </Box >
        </>
    )
}