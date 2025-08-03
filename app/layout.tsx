import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, BarChart3, AlertTriangle } from 'lucide-react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Is This Phish? - AI-Powered Phishing Detection Service',
  description: 'An AI service that analyzes emails and URLs to assess phishing risk in real-time. Provides accurate analysis by combining OpenAI GPT-4o with static rules.',
  keywords: ['phishing', 'security', 'AI', 'email security', 'URL analysis', 'cybersecurity'],
  authors: [{ name: 'Is This Phish Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Is This Phish? - AI-Powered Phishing Detection Service',
    description: 'Real-time phishing detection service using AI and static rules',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-background to-muted/20`}>
        {/* Skip to main content link for keyboard navigation */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>
        
        <main id="main-content" className="pb-16" role="main">
          {children}
        </main>
        
        <footer className="bg-card border-t mt-16" role="contentinfo">
          <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Brand section */}
              <section className="md:col-span-2 space-y-4" aria-labelledby="brand-heading">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-primary" aria-hidden="true" />
                  <h2 id="brand-heading" className="text-2xl font-bold">Is This Phish?</h2>
                </div>
                <p className="text-muted-foreground max-w-md">
                  Building a safer internet with AI-powered phishing detection.
                </p>
              </section>
              
              {/* Disclaimer */}
              <Card className="mt-6 bg-muted/50" role="note" aria-labelledby="disclaimer-heading">
              <CardContent className="pt-6">
                <h4 id="disclaimer-heading" className="sr-only">Important Disclaimer</h4>
                <p className="text-xs text-muted-foreground text-center">
                  ⚠️ This service is for reference only. Final security decisions are always the user&apos;s responsibility. 
                  Please consult with security professionals for important security decisions.
                </p>
              </CardContent>
            </Card>
            </div>
            
            {/* Bottom information */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-sm mt-8">
              <div className="flex items-center gap-4">
                <p>&copy; 2024 Is This Phish. All rights reserved.</p>
              </div>
            </div>
            
          </div>
        </footer>
      </body>
    </html>
  )
} 