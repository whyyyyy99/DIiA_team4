'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const TenantPlatform = dynamic(() => import('../components/TenantPlatform'), {
  ssr: false,
})

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<div>Loading...</div>}>
        <TenantPlatform />
      </Suspense>
    </main>
  )
}