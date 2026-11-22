import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { HomePage } from '@/pages/home'
import { GuidePage } from '@/pages/guide'
import { PricingPage } from '@/pages/pricing'
import { BatchPage } from '@/pages/batch'
import { LegalPage } from '@/pages/legal'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <div className="flex min-h-dvh flex-col bg-background">
        <SiteHeader />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/guide/:slug" element={<GuidePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/batch" element={<BatchPage />} />
            <Route path="/legal/:kind" element={<LegalPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <SiteFooter />
      </div>
    </HashRouter>
  )
}
