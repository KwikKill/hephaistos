import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hephaistos',
  description: 'A website builder for developers',
  authors: [{name: 'KwikKill'}],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  )
}
