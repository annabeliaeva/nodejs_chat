import { useEffect, useState } from 'react'
import { useClickOutside, useDebouncedValue } from '@mantine/hooks'
import { Transition, Paper, Button, Box, ActionIcon, Autocomplete, rem, AutocompleteProps, Group, Avatar, Text, Indicator, Select, SelectProps, Stack } from '@mantine/core'
import classes from '@/styles/components/lk/ChatSearch.module.css'
import { IconSearch } from '@tabler/icons-react'
import { t } from 'i18next'
import { IChatUser } from '@/types/lk/chat'
import { DateTime } from 'luxon'


const scaleY = {
    in: { opacity: 1, transform: 'scaleX(1)' },
    out: { opacity: 0, transform: 'scaleX(0)' },
    common: { transformOrigin: 'right' },
    transitionProperty: 'transform, opacity',
}

interface BtnSearchProps {
    onUserClicked(user: IChatUser)
}

export default function BtnChatSearch(props: BtnSearchProps) {
    const [users, setUsers] = useState<IChatUser[]>([])
    const [searchValue, setSearchValue] = useState('')
    const [selectVal, _] = useState(null)
    const [debouncedSearch] = useDebouncedValue(searchValue, 200)

    const [opened, setOpened] = useState(false)
    // const clickOutsideRef = useClickOutside(() => setOpened(false))


    useEffect(() => {
        const searchVal = debouncedSearch.trim()
        if (searchVal.length == 0) return

        fetch('/api/panel/chat/searchUser', {
            method: 'POST',
            body: JSON.stringify({ username: searchVal })
        }).then(res => res.json())
            .then(res => {
                setUsers(res.users)
            })
    }, [debouncedSearch])



    const renderSearch: SelectProps['renderOption'] = ({ option }) => {
        const user = users.find(x => x.name == option.value)
        const isOnline = DateTime.fromISO(user.lastActive.toString()).diffNow('minutes').minutes >= -5
        return (<Group gap='md'>
            <Indicator color={isOnline ? 'green' : 'red'} size={15} offset={3} withBorder processing={isOnline}>
                <Avatar variant='filled' radius='xl' size='md'
                    src={user.avatarUrl ?? '/images/avatar.jpg'} />
            </Indicator>
            <Stack gap={0}>
                <Text size='sm'>{user.name}</Text>
                <Text size='xs' c='gray.6'>{isOnline ? 'Онлайн' : 'Не в сети'}</Text>
            </Stack>
        </Group>
        )
    }


    return (
        <Box
            maw={200}
            pos='relative'
        >
            <ActionIcon className={classes.chatSearchIcon}
                size={45}
                radius='lg'
                color={'var(---color-transparent-black-15)'}
                onClick={() => setOpened(true)}
                variant='filled'>
                <IconSearch size={24} stroke={1.5} />
            </ActionIcon>
            <Transition
                mounted={opened}
                transition={scaleY}
                duration={200}
                timingFunction='easeOut'
                keepMounted
            >
                {(transitionStyle) => (

                    <Paper
                        w='auto'
                        shadow='md'
                        p='xs'
                        h='auto'
                        pos='absolute'
                        radius={14}
                        top={0}
                        right={0}
                        style={{ ...transitionStyle, zIndex: 1 }}
                    >
                        <Select
                            // ref={clickOutsideRef}
                            inputMode='search'
                            searchable
                            w='200'
                            size='xs'
                            radius='md'
                            className={classes.search}
                            placeholder={t('search_place')}
                            leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                            data={users.map(x => x.name)}
                            searchValue={searchValue}
                            renderOption={renderSearch}
                            onSearchChange={setSearchValue}
                            onChange={(v, _) => {
                                props.onUserClicked(users.find(x => x.name == v))
                                setOpened(false)
                            }}
                            value={searchValue}
                            comboboxProps={{ withinPortal: false }}
                            visibleFrom='xs' />
                    </Paper>
                )}
            </Transition>
        </Box>
    )
}