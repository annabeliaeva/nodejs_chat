import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import jwt from 'jsonwebtoken'
import { jwtVerify } from '@/util/auth'
import { SessionData } from '@/types/UserSession'
import { SSRConfig, UserConfig } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { fetchApi } from '@/util/fetch'
import { AxiosError } from 'axios'

type UserData = {
    id: string
    email: string
}

interface WithAuthServerSideProps extends SSRConfig {
    user?: SessionData
}

export interface AuthenticatedGSSPContext extends GetServerSidePropsContext {
    user: SessionData
}

export function getCookie(name: string, cookieHeader: string | undefined): string | undefined {
    const matches = cookieHeader?.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return matches ? decodeURIComponent(matches[2]) : undefined
}

export function withAuth(gssp: (ctx: AuthenticatedGSSPContext) => Promise<GetServerSidePropsResult<any>>, localePath?: string): GetServerSideProps {
    return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<any>> => {

        // Setup locale
        const { locale, resolvedUrl } = context
        const translations = await serverSideTranslations(locale as string, [localePath ?? ''])

        // Setup user auth
        let user
        const token = getCookie('-auth', context.req.headers.cookie)
        if (token) {
            try {
                user = (await fetchApi('GET', 'internal', '/user/check/' + token)).data
                // console.log(user)
            } catch (e) {
                console.log(e)
            }
        }

        // Paths that forbidden with no auth
        const forbiddenPaths = ['/panel/']
        const isForbidden = forbiddenPaths.some(path => resolvedUrl.startsWith(`${path}`))

        // Check token for validity
        try {
            if (!token) {
                if (isForbidden) {
                    return {
                        redirect: {
                            destination: '/auth',
                            permanent: false
                        }
                    }
                }
                throw new Error('Token not found')
            }


            const ctxWithUser: AuthenticatedGSSPContext = { ...context, user }

            const gsspResult = await gssp(ctxWithUser)

            if ('props' in gsspResult) {
                (await gsspResult.props).user = user;
                (await gsspResult.props)._nextI18Next = translations._nextI18Next
            }

            return gsspResult
        } catch (error) {
            // console.error(error)
            const ctx: AuthenticatedGSSPContext = { ...context, user: null }
            const gsspResult = await gssp(ctx)

            if ('props' in gsspResult) {
                (await gsspResult.props).user = null;
                (await gsspResult.props)._nextI18Next = translations._nextI18Next
            }

            return gsspResult
        }
    }
}
