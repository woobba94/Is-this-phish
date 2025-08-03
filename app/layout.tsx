import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Is This Phish? - AI 기반 피싱 탐지 서비스',
  description: '이메일과 URL을 분석하여 피싱 위험도를 실시간으로 평가하는 AI 서비스입니다. OpenAI GPT-4o와 정적 규칙을 결합하여 정확한 분석을 제공합니다.',
  keywords: ['피싱', '보안', 'AI', '이메일 보안', 'URL 검사', '사이버 보안'],
  authors: [{ name: 'Is This Phish Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Is This Phish? - AI 기반 피싱 탐지 서비스',
    description: 'AI와 정적 규칙을 활용한 실시간 피싱 탐지 서비스',
    type: 'website',
    locale: 'ko_KR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        
        {/* 푸터 */}
        <footer className="bg-gray-800 text-white py-8 mt-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">🛡️ Is This Phish?</h3>
                <p className="text-gray-300 text-sm">
                  AI와 정적 규칙을 결합한 실시간 피싱 탐지 서비스로 
                  이메일과 URL의 보안 위험도를 분석합니다.
                </p>
              </div>
              
              <div>
                <h4 className="text-md font-semibold mb-4">📊 통계</h4>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• 2024년 한국 피싱 메일 신고 61% 증가</li>
                  <li>• 실시간 AI 분석으로 3초 내 결과 제공</li>
                  <li>• IP당 일 1회 무료 분석 지원</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-md font-semibold mb-4">⚠️ 보안 수칙</h4>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• 의심스러운 링크 클릭 금지</li>
                  <li>• 개인정보 입력 전 도메인 확인</li>
                  <li>• 첨부파일 실행 전 검증 필수</li>
                  <li>• 금융 정보 요구 시 공식 채널 확인</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
              <p>&copy; 2024 Is This Phish. AI 기반 피싱 탐지로 더 안전한 인터넷을 만들어갑니다.</p>
              <p className="mt-2">
                이 서비스는 참고용이며, 최종 보안 판단은 사용자의 책임입니다.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
} 