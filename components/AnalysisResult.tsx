'use client'

import { useRef } from 'react'
import dynamic from 'next/dynamic'
import html2canvas from 'html2canvas'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import PhishingBadge from './PhishingBadge'
import { AnalysisResult as AnalysisResultType } from '@/utils/types'
import { Download, Calendar, Clock, AlertTriangle, FileText, Shield } from 'lucide-react'

// react-quill을 dynamic import로 로드 (SSR 방지)
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

interface AnalysisResultProps {
  result: AnalysisResultType
  originalContent: string
}

export default function AnalysisResult({ result, originalContent }: AnalysisResultProps) {
  const resultRef = useRef<HTMLDivElement>(null)

  // 하이라이트가 적용된 컨텐츠 생성
  const getHighlightedContent = () => {
    let highlightedContent = originalContent
    
    // 각 하이라이트 텍스트를 배경색으로 강조
    result.highlights.forEach((highlight, index) => {
      const escapedText = highlight.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(escapedText, 'gi')
      const backgroundColor = `bg-destructive/20 border border-destructive/40 rounded px-1 py-0.5`
      
      highlightedContent = highlightedContent.replace(
        regex,
        `<span class="${backgroundColor}" title="${highlight.reason}" data-highlight-id="${index}">${highlight.text}</span>`
      )
    })
    
    return highlightedContent
  }

  const handleShareAsImage = async () => {
    if (!resultRef.current) return

    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `phishing-analysis-${result.score}-${Date.now()}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      }, 'image/png')
    } catch (error) {
      console.error('이미지 생성 실패:', error)
      alert('이미지 생성에 실패했습니다.')
    }
  }

  return (
    <div className="space-y-6">
      <Card ref={resultRef} className="shadow-lg border-2">
        {/* 헤더 */}
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <CardTitle className="text-3xl">피싱 분석 결과</CardTitle>
          </div>
          <div className="flex justify-center">
            <PhishingBadge score={result.score} />
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* 분석 요약 */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              분석 요약
            </h3>
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-foreground leading-relaxed">{result.summary}</p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* 하이라이트된 컨텐츠 */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">
              원본 내용 (의심 구간 강조)
            </h3>
            <Card>
              <CardContent className="p-0">
                <div className="border rounded-lg p-4 bg-background max-h-96 overflow-y-auto custom-scrollbar">
                  <ReactQuill
                    value={getHighlightedContent()}
                    readOnly={true}
                    theme="bubble"
                    modules={{ toolbar: false }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 발견된 위험 요소 */}
          {result.highlights.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                발견된 위험 요소
                <Badge variant="destructive" className="ml-2">
                  {result.highlights.length}개
                </Badge>
              </h3>
              <div className="grid gap-3">
                {result.highlights.map((highlight, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="space-y-1">
                      <div className="font-medium">&quot;{highlight.text}&quot;</div>
                      <div className="text-sm opacity-90">{highlight.reason}</div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* 푸터 정보 */}
          <div className="text-center space-y-2 text-muted-foreground">
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                분석 일시: {new Date().toLocaleDateString('ko-KR')}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date().toLocaleTimeString('ko-KR')}
              </div>
            </div>
            <p className="text-xs">Is This Phish? - AI 기반 피싱 탐지 서비스</p>
          </div>
        </CardContent>
      </Card>

      {/* 공유 버튼 */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Button
              onClick={handleShareAsImage}
              className="gap-2"
              size="lg"
            >
              <Download className="w-4 h-4" />
              이미지로 저장하기
            </Button>
            <CardDescription>
              분석 결과를 이미지로 저장하여 팀원들과 공유할 수 있습니다
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 