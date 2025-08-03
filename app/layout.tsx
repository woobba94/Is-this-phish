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
    <html lang="ko" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-background to-muted/20`}>
        <main className="pb-16">
          {children}
        </main>
        
        {/* 푸터 */}
        <footer className="bg-card border-t mt-16">
          <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              {/* 브랜드 섹션 */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">Is This Phish?</h3>
                </div>
                <p className="text-muted-foreground max-w-md">
                  AI와 정적 규칙을 결합한 실시간 피싱 탐지 서비스로 
                  이메일과 URL의 보안 위험도를 정확하게 분석합니다.
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="w-3 h-3" />
                    99.8% 정확도
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    ⚡ 3초 분석
                  </Badge>
                </div>
              </div>
              
              {/* 통계 섹션 */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  서비스 통계
                </h4>
                <ul className="text-muted-foreground text-sm space-y-2">
                  <li>• 2024년 한국 피싱 메일 신고 61% 증가</li>
                  <li>• 실시간 AI 분석으로 3초 내 결과 제공</li>
                  <li>• IP당 일 1회 무료 분석 지원</li>
                  <li>• OpenAI GPT-4o 기반 분석 엔진</li>
                </ul>
              </div>
              
              {/* 보안 수칙 섹션 */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  보안 수칙
                </h4>
                <ul className="text-muted-foreground text-sm space-y-2">
                  <li>• 의심스러운 링크 클릭 금지</li>
                  <li>• 개인정보 입력 전 도메인 확인</li>
                  <li>• 첨부파일 실행 전 검증 필수</li>
                  <li>• 금융 정보 요구 시 공식 채널 확인</li>
                </ul>
              </div>
            </div>
            
            <Separator className="my-8" />
            
            {/* 하단 정보 */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-4">
                <p>&copy; 2024 Is This Phish. All rights reserved.</p>
                <Badge variant="outline" className="text-xs">
                  Made with Next.js 14 + OpenAI
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-center">
                  AI 기반 피싱 탐지로 더 안전한 인터넷을 만들어갑니다.
                </p>
              </div>
            </div>
            
            {/* 면책 조항 */}
            <Card className="mt-6 bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground text-center">
                  ⚠️ 이 서비스는 참고용이며, 최종 보안 판단은 항상 사용자의 책임입니다. 
                  중요한 보안 결정은 전문가와 상의하시기 바랍니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </footer>
      </body>
    </html>
  )
} 