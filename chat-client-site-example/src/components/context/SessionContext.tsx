// context/SessionContext.tsx
import { SessionContextType, SessionData } from '@/types/UserSession'
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react'
import Cookies from 'js-cookie'
import { useRouter } from 'next/router'
import { ChatClient } from 'nodechat-client-sdk'
import { readLocalStorageValue, useLocalStorage } from '@mantine/hooks'
import { IChatSendMessage } from '@/types/lk/chat'
import { v4 as uuid } from 'uuid'
import { fetchApi } from '@/util/fetch'

export const getMessageHash = () => uuid().replaceAll('-', '')

export const SessionContext = createContext<SessionContextType | undefined>(undefined)

export const SessionProvider: React.FC<{ pageProps: any, children: ReactNode }> = ({ pageProps, children }) => {
    const [session, setSession] = useState<SessionData | null>(null)
    const [chat, setChat] = useState<ChatClient>()
    const [notificationSound, setNotificationSound] = useLocalStorage({ key: 'send-notification', defaultValue: true })
    // const [play] = useSound('/sounds/alert.wav')

    const toggleNotification = () => {
        console.log(!notificationSound)
        setNotificationSound(!notificationSound)
    }

    // Connect to chat if logged
    useEffect(() => {
        if (session == null) return

        const _chat = new ChatClient('95.163.214.158', 3288)
        _chat.on('connect', () => console.log('Connected to message server'))
        _chat.connect()



        _chat.on('message', (msg) => {
            // console.log(!readLocalStorageValue({ key: 'send-notification' }))
            if (msg.data.action != 'sendMessage' || !readLocalStorageValue({ key: 'send-notification' })) return

            const soundAlert = new Audio('/sounds/alert.wav')
            soundAlert.play()
        })

        _chat.on('auth', () => {
            _chat.sendMessage({
                action: 'fakeAuthenticate',
                ...session
            })
            console.log('Fake auth sent')

            setChat(_chat)
        })
    }, [session])


    useEffect(() => {
        setSession(pageProps?.user)
    }, [pageProps])


    return (
        <SessionContext.Provider
            value={{ session, chat, toggleNotification, notificationSound }}>
            {children}
        </SessionContext.Provider>
    )
}
