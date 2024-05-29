import { Html, Head, Main, NextScript } from 'next/document'
import { ColorSchemeScript } from '@mantine/core'

export default function Document() {
  return (
    <Html lang="ru">
      <Head>
        <ColorSchemeScript
          nonce='8IBTHwOdqNKAWeKl7plt8g=='
          defaultColorScheme='light'
          localStorageKey='color-scheme'
        />
      </Head>
      <body className='body'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
