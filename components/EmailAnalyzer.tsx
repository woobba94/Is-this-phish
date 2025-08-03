'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import AnalysisResult from './AnalysisResult'
import { AnalyzeRequest, AnalyzeResponse } from '@/utils/types'
import { Mail, Link, Search, RotateCcw, AlertTriangle, Shield } from 'lucide-react'

export default function EmailAnalyzer() {
  const [inputType, setInputType] = useState<'email' | 'url'>('email')
  const [content, setContent] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalyzeResponse | null>(null)

  const handleAnalyze = async () => {
    if (!content.trim()) {
      alert('분석할 내용을 입력해주세요.')
      return
    }

    setIsAnalyzing(true)
    setResult(null)

    try {
      const request: AnalyzeRequest = {
        content: content.trim(),
        type: inputType,
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      const data: AnalyzeResponse = await response.json()
      setResult(data)

      if (!data.success) {
        console.error('Analysis failed:', data.error)
      }
    } catch (error) {
      console.error('Request failed:', error)
      setResult({
        success: false,
        error: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    setContent('')
    setResult(null)
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-8 p-4">
      {/* 메인 헤더 */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Shield className="w-12 h-12 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Is This Phish?
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          AI와 정적 규칙을 결합한 실시간 피싱 탐지 서비스
        </p>
        <Badge variant="secondary" className="text-sm">
          🤖 OpenAI GPT-4o 기반 분석
        </Badge>
      </div>

      <Separator />

      {/* 분석 입력 카드 */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Search className="w-6 h-6" />
            피싱 분석
          </CardTitle>
          <CardDescription>
            의심스러운 이메일이나 URL을 분석하여 위험도를 평가합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 입력 타입 선택 */}
          <div className="flex justify-center gap-2">
            <Button
              variant={inputType === 'email' ? 'default' : 'outline'}
              onClick={() => setInputType('email')}
              className="gap-2"
            >
              <Mail className="w-4 h-4" />
              이메일 분석
            </Button>
            <Button
              variant={inputType === 'url' ? 'default' : 'outline'}
              onClick={() => setInputType('url')}
              className="gap-2"
            >
              <Link className="w-4 h-4" />
              URL 분석
            </Button>
          </div>

          {/* 입력 영역 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">
                {inputType === 'email' ? '이메일 원문 (HTML/Plain Text)' : '의심스러운 URL'}
              </label>
              <Badge variant="outline" className="text-xs">
                최대 20KB
              </Badge>
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                inputType === 'email'
                  ? `이메일의 전체 내용을 붙여넣어 주세요...

예시:
From: sender@example.com
Subject: 긴급 - 계정 확인 필요

안녕하세요. 보안을 위해 즉시 계정을 확인해주세요...`
                  : `URL을 입력해주세요...

예시:
https://suspicious-site.com/login?user=...`
              }
              className="min-h-[200px] resize-none"
              maxLength={20480}
            />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>{content.length} / 20,480 글자</span>
              <span className="text-xs">
                {content.length > 15000 && '⚠️ 크기 제한에 근접했습니다'}
              </span>
            </div>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex gap-3">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !content.trim()}
              className="flex-1 gap-2"
              size="lg"
              variant="destructive"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  피싱 분석 시작
                </>
              )}
            </Button>
            <Button
              onClick={handleClear}
              disabled={isAnalyzing}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              초기화
            </Button>
          </div>

          {/* 주의사항 */}
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>주의사항</AlertTitle>
            <AlertDescription className="space-y-1 mt-2">
              <div>• IP당 하루 1회 분석 가능합니다</div>
              <div>• 개인정보가 포함된 내용은 주의해서 입력해주세요</div>
              <div>• 분석 결과는 참고용이며, 최종 판단은 사용자가 해야 합니다</div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* 결과 표시 */}
      {result && (
        <div>
          {result.success && result.result ? (
            <AnalysisResult result={result.result} originalContent={content} />
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>분석 실패</AlertTitle>
              <AlertDescription>
                {result.error || '알 수 없는 오류가 발생했습니다.'}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
} 