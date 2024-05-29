// import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { AuthMethod } from '@@/prisma/generated/db'
import Cookies from 'js-cookie'

export const signIn = (provider: AuthMethod) => {
        window.location.href = process.env.NEXT_PUBLIC_API_USER_URL + `/auth/signIn?provider=${provider.toLowerCase()}`
}

export const signOut = () => {
    Cookies.remove('-auth', { path: '/', domain: '.trading' })
    window.location.reload()
}
