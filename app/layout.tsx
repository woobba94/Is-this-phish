import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
            <div className="grid md:grid-cols-4 gap-8">
              {/* Brand section */}
              <section className="md:col-span-2 space-y-4" aria-labelledby="brand-heading">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-primary" aria-hidden="true" />
                  <h2 id="brand-heading" className="text-2xl font-bold">Is This Phish?</h2>
                </div>
                <p className="text-muted-foreground max-w-md">
                  AI-powered real-time phishing detection service that combines AI and static rules 
                  to accurately analyze security risks in emails and URLs.
                </p>
                <div className="flex gap-2" role="list" aria-label="Service highlights">
                  <Badge variant="secondary" className="gap-1" role="listitem">
                    <Shield className="w-3 h-3" aria-hidden="true" />
                    99.8% Accuracy
                  </Badge>
                  <Badge variant="outline" className="gap-1" role="listitem">
                    <span aria-hidden="true">⚡</span> 3-second Analysis
                  </Badge>
                </div>
              </section>
              
              {/* Statistics section */}
              <section className="space-y-4" aria-labelledby="stats-heading">
                <h3 id="stats-heading" className="font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" aria-hidden="true" />
                  Service Statistics
                </h3>
                <ul className="text-muted-foreground text-sm space-y-2">
                  <li>• 61% increase in phishing reports in Korea in 2024</li>
                  <li>• Real-time AI analysis with results in 3 seconds</li>
                  <li>• Up to 10 free analyses per IP address daily</li>
                  <li>• Powered by OpenAI GPT-4o analysis engine</li>
                </ul>
              </section>
              
              {/* Security guidelines section */}
              <section className="space-y-4" aria-labelledby="security-heading">
                <h3 id="security-heading" className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                  Security Guidelines
                </h3>
                <ul className="text-muted-foreground text-sm space-y-2">
                  <li>• Never click suspicious links</li>
                  <li>• Verify domains before entering personal information</li>
                  <li>• Always verify attachments before opening</li>
                  <li>• Use official channels for financial requests</li>
                </ul>
              </section>
            </div>
            
            <Separator className="my-8" />
            
            {/* Bottom information */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-4">
                <p>&copy; 2024 Is This Phish. All rights reserved.</p>
                <Badge variant="outline" className="text-xs">
                  Made with Next.js 14 + OpenAI
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-center">
                  Building a safer internet with AI-powered phishing detection.
                </p>
              </div>
            </div>
            
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
        </footer>
      </body>
    </html>
  )
} 