import { useMediaQuery } from '@mantine/hooks'
import { BreadcrumbsLk } from './Breadcrumbs'
import Header from './Header/Header'
import ShellLeftPositionNav from './ShellLeftPositionNav'
import classes from '@/styles/components/lkMain.module.css'
import { em } from '@mantine/core'
import { useSession } from '@/hooks/useSession'
import { useEffect } from 'react'
import { PageProps } from '@/types/PageProps'
import { UserPanelInfoResponse } from '@@/shared/api/types/internal/Panel'
import { useRouter } from 'next/router'
import { getBreadcrumbs } from '@/util/breadcrumbs'

interface AppLayoutLkProps extends PageProps {
    children: React.ReactNode
    breadcrumbs?: { title: string, href: string }[]
    userData: UserPanelInfoResponse
}



export default function AppLayoutLk(props: AppLayoutLkProps) {
    const isMobile = useMediaQuery(`(max-width: ${em(750)})`)
    const { session } = useSession()
    const router = useRouter()

    return (
        <>
            <ShellLeftPositionNav
                userImage={props.userData.avatarUrl}
                userName={session?.login}
                badgeMassage={props.userData.newMessages}
                badgeNotification={0}
                userVerified={props.userData.verified}
            />
            <div className={isMobile ? classes.mobileMain : classes.main}>
                <BreadcrumbsLk breadcrumbs={getBreadcrumbs(router.asPath)} />
                <main>
                    {props.children}
                </main>
            </div>
        </>
    )
}