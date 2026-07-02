'use client'

import { lazy, Suspense } from 'react'

const ClientProviders = lazy(() => import('./ClientProviders'))
const ToastProvider = lazy(() => import('@/components/ui/ToastProvider'))
const SplashScreen = lazy(() => import('./SplashScreen'))
const Navbar = lazy(() => import('./Navbar'))
const ContentWrapper = lazy(() => import('./ContentWrapper'))

export default function HeavyLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <ClientProviders>
        <ToastProvider>
          <Suspense fallback={<>{children}</>}>
            <SplashScreen>
              <Suspense fallback={<div className="lg:ml-20">{children}</div>}>
                <Navbar />
              </Suspense>
              <ContentWrapper>
                {children}
              </ContentWrapper>
            </SplashScreen>
          </Suspense>
        </ToastProvider>
      </ClientProviders>
    </Suspense>
  )
}
