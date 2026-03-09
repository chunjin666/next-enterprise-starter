import './globals.css'
import { Navbar } from '@/presentation/components/navbar'
import { PrefetchInitializer } from '@/app/_providers/prefetch-initializer'
import { PrefetchProvider } from '@/app/_providers/prefetch-provider'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/presentation/context/auth-context'
import { TRPCReactProvider } from '@/app/_providers/trpc-provider'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { createClient } from '@/infra/supabase/server-client'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: 'Next Enterprise Starter',
  description: '基于 Clean Architecture 的企业级 Next.js 全栈模板',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} font-sans antialiased`}>
        <TRPCReactProvider>
          <AuthProvider initialSession={session} initialUser={session?.user}>
            <PrefetchProvider>
              <Navbar />
              <PrefetchInitializer />
              <main className="min-h-screen pt-16">{children}</main>
              <Toaster position='top-center' />
            </PrefetchProvider>
          </AuthProvider>
        </TRPCReactProvider>
      </body>
    </html>
  )
}
