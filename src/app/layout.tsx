import "./globals.css"

import type { Metadata } from "next"
import { Noto_Sans_TC, Geist } from "next/font/google"

import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  variable: "--font-noto-sans-tc"
})

import { ThemeProvider } from "@/components/ThemeProvider"

export const metadata: Metadata = {
  title: "Social Skills AI Coach",
  description: "AI Social Skills Coach"
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body className={`${notoSansTC.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
