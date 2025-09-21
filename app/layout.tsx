import type React from "react"
import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import Image from "next/image"
import "./globals.css"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})

export const metadata: Metadata = {
  title: "startupEval",
  description: "Transform your documents into comprehensive insights with AI-powered analysis",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${outfit.variable}`}>
        <main>
          <Suspense fallback={null}>{children}</Suspense>
        </main>
        <Analytics />
      </body>
    </html>
  )
}
