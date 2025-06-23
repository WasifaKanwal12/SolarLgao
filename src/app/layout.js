import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Solar Lgao",
  description: "Find the best solar energy solutions for your needs",
  icons: {
        icon: [
            {
                url: "/favicon.ico", // /public path
                href: "/favicon.ico", // /public path
            },
        ],
    },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

