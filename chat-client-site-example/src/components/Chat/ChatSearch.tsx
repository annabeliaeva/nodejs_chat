import { ActionIcon, TextInput, TextInputProps, rem, useMantineTheme } from '@mantine/core'
import { IconArrowRight, IconSearch } from '@tabler/icons-react'
import classes from '@/styles/components/lk/ChatSearch.module.css'
import { useState } from 'react'

export default function ChatSearch(props: TextInputProps) {
    const [open, setOpen] = useState()
    const theme = useMantineTheme()


    return (
        <>
            <TextInput
                className={classes.chatSearchInput}
                radius="xl"
                size="md"
                placeholder="Search questions"
                rightSectionWidth={42}
                leftSection={<IconSearch style={{ width: rem(18), height: rem(18) }} stroke={1.5} />}
                rightSection={
                    <ActionIcon className={classes.chatSearchIcon}
                        size={32}
                        radius="md"
                        color={theme.colors.gray[3]}
                        variant="filled">
                        <IconSearch style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
                    </ActionIcon>
                }
                {...props}
            />
        </>
    )
}