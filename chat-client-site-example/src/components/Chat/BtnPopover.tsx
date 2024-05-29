import { Popover, Button, TextInput, ActionIcon, Stack } from '@mantine/core'
import { IconAlertOctagon, IconDots, IconEraser, IconLock, IconVolumeOff } from '@tabler/icons-react'
import classes from '@/styles/components/lk/BtnPopover.module.css'
import { useSession } from '@/hooks/useSession'
import { useEffect } from 'react'
import { IconVolume } from '@tabler/icons-react'


interface BtnPopoverProps {
  notification?: () => void
  complaint?: () => void
  cleanHistory?: () => void
  blocked?: () => void
}

export default function BtnPopover(props: BtnPopoverProps) {


  const session = useSession()

  return (
    <Popover
      width={'auto'}
      trapFocus
      position='bottom-end'
      radius={0}>
      <Popover.Target>
        <ActionIcon
          variant='filled'
          color='var(---color-transparent-black-15)'
          size='xl'
          aria-label='Notifactions'>
          <IconDots color='var(--mantine-color-white)' size={24} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown p={0}>
        <Stack gap={0} align='start'>
          <Button
            leftSection={session.notificationSound ? <IconVolumeOff size={16} /> : <IconVolume size={16} />}
            justify='start'
            className={classes.btn}
            onClick={() => session.toggleNotification()}
            c='var(---color-primary-0)'>
            {session.notificationSound ? 'Выключить уведомления' : 'Включить уведомления'}
          </Button>
          <Button
            leftSection={<IconAlertOctagon size={16} />}
            justify='start'
            className={classes.btn}
            onClick={props.complaint}
            c='var(--mantine-color-red-7)'>
            Пожаловаться
          </Button>
          <Button
            leftSection={<IconEraser size={16} />}
            justify='start'
            className={classes.btn}
            onClick={props.cleanHistory}
            c='var(---color-primary-0)'>
            Очистить историю
          </Button>
          <Button
            leftSection={<IconLock size={16} />}
            justify='start'
            className={classes.btn}
            onClick={props.blocked}
            c='var(---color-primary-0)'>
            Заблокировать
          </Button>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}