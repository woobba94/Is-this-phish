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
import { API_CONFIG } from '@/utils/constants'
import { Mail, Link, Search, RotateCcw, AlertTriangle, Shield } from 'lucide-react'

// Input type configuration
const INPUT_TYPES = {
  email: {
    label: 'Email Analysis',
    icon: Mail,
    placeholder: `Please paste the complete email content...

Example:
From: sender@example.com
Subject: Urgent - Account Verification Required

Hello. Please verify your account immediately for security...`,
    fieldLabel: 'Email Content (HTML/Plain Text)'
  },
  url: {
    label: 'URL Analysis',
    icon: Link,
    placeholder: `Please enter the URL...

Example:
https://suspicious-site.com/login?user=...`,
    fieldLabel: 'Suspicious URL'
  }
} as const

export default function EmailAnalyzer() {
  const [inputType, setInputType] = useState<'email' | 'url'>('email')
  const [content, setContent] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalyzeResponse | null>(null)

  const handleAnalyze = async () => {
    if (!content.trim()) {
      alert('Please enter content to analyze.')
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
        error: 'A network error occurred. Please try again.',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    setContent('')
    setResult(null)
  }

  const currentConfig = INPUT_TYPES[inputType]
  const isContentValid = content.trim().length > 0
  const isNearSizeLimit = content.length > API_CONFIG.MAX_CONTENT_SIZE * 0.75

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
          Real-time phishing detection service combining AI and static rules
        </p>
        <Badge variant="secondary" className="text-sm">
          🤖 Powered by OpenAI GPT-4o
        </Badge>
      </div>

      <Separator />

      {/* 분석 입력 카드 */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Search className="w-6 h-6" />
            Phishing Analysis
          </CardTitle>
          <CardDescription>
            Analyze suspicious emails or URLs to assess risk levels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 입력 타입 선택 */}
          <div className="flex justify-center gap-2">
            {Object.entries(INPUT_TYPES).map(([type, config]) => {
              const IconComponent = config.icon
              return (
                <Button
                  key={type}
                  variant={inputType === type ? 'default' : 'outline'}
                  onClick={() => setInputType(type as 'email' | 'url')}
                  className="gap-2"
                >
                  <IconComponent className="w-4 h-4" />
                  {config.label}
                </Button>
              )
            })}
          </div>

          {/* 입력 영역 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">
                {currentConfig.fieldLabel}
              </label>
              <Badge variant="outline" className="text-xs">
                Max {API_CONFIG.MAX_CONTENT_SIZE / 1024}KB
              </Badge>
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={currentConfig.placeholder}
              className="min-h-[200px] resize-none"
              maxLength={API_CONFIG.MAX_CONTENT_SIZE}
            />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>{content.length.toLocaleString()} / {API_CONFIG.MAX_CONTENT_SIZE.toLocaleString()} characters</span>
              <span className="text-xs">
                {isNearSizeLimit && '⚠️ Approaching size limit'}
              </span>
            </div>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex gap-3">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !isContentValid}
              className="flex-1 gap-2"
              size="lg"
              variant="destructive"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Start Analysis
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
              Clear
            </Button>
          </div>

          {/* 주의사항 */}
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Notes</AlertTitle>
            <AlertDescription className="space-y-1 mt-2">
              <div>• One analysis per IP address per day</div>
              <div>• Please be careful when entering content with personal information</div>
              <div>• Analysis results are for reference only, final judgment should be made by the user</div>
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
              <AlertTitle>Analysis Failed</AlertTitle>
              <AlertDescription>
                {result.error || 'An unknown error occurred.'}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
} 