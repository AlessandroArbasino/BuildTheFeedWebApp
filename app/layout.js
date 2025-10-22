import Script from 'next/script'
import './globals.css'

export const metadata = {
  title: 'Build The Feed',
  description: 'Submit prompts to Neon for the AI pipeline',
  icons: { icon: '/logo.png' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script src="https://cdn.iubenda.com/iubenda.js" strategy="beforeInteractive" />
      </head>
      <body>{children}</body>
    </html>
  )
}
