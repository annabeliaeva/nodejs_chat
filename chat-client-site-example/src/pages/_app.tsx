import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/dropzone/styles.css'
import '@mantine/charts/styles.css'
// import '@/styles/globals.sass'
import type { AppProps } from 'next/app'
import {
  DirectionProvider,
  MantineProvider,
  localStorageColorSchemeManager,
} from '@mantine/core'
import { resolver, theme } from '../../theme'
import Head from 'next/head'
import { Notifications } from '@mantine/notifications'
import nextI18nConfig from '../../next-i18next.config'
import { appWithTranslation, useTranslation } from 'next-i18next'
import { SessionProvider } from '@/components/context/SessionContext'
import { HistoryProvider } from '@/components/context/HistoryContext'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
// import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
// import { localStorageColorSchemeManager } from '@/components/localStorageColorSchemeManager'
// import { SessionProvider } from "next-auth/react"

// export async function getServerSideProps(ctx) {

//   const { locale } = ctx
//   const translations = await serverSideTranslations(locale, ['root/_app'])

//   return {
//     props: {
//       ...translations
//     }
//   }
// }

const App = ({ Component, pageProps: { session, ...pageProps } }: AppProps,) => {
  const { t } = useTranslation('root/_app')
  const router = useRouter()


  const colorSchemeManager = localStorageColorSchemeManager({
    key: 'color-scheme',
  })

  useEffect(() => {
    const path = router.asPath
    if (!path.startsWith('/auth/')) {
      Cookies.set('lastPath', path, { expires: 1/48 })
    }
  }, [router.asPath])
  
  return (
    <>
      <Head>
        <title>Chat Example</title>
        <meta name='language' content='Russian' />
        <link rel='shortcut icon' href='/favicon.svg' />
        <meta
          name='viewport'
          content='minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no'
        />
        <meta name='og:type' content='website' />
      </Head>
      <DirectionProvider>
        <MantineProvider
          theme={theme}
          colorSchemeManager={colorSchemeManager}
          defaultColorScheme='light'
          cssVariablesSelector='html'
          cssVariablesResolver={resolver}
        // getRootElement={getRootElement}
        >
            <SessionProvider pageProps={pageProps} >
              <Component {...pageProps} />
            </SessionProvider>
        </MantineProvider>
      </DirectionProvider >
    </>
  )
}
export default appWithTranslation(App, nextI18nConfig)