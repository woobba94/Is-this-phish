'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import AnalysisResult from './AnalysisResult'
import { AnalyzeRequest, AnalyzeResponse } from '@/utils/types'
import { API_CONFIG } from '@/utils/constants'
import { Search, RotateCcw, AlertTriangle, Shield, Loader2 } from 'lucide-react'

// 자동 감지 함수
const detectInputType = (content: string): 'email' | 'url' => {
  const trimmedContent = content.trim()
  
  // URL 패턴 감지 (http/https로 시작하거나 도메인 형태)
  const urlPattern = /^(https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/i
  
  if (urlPattern.test(trimmedContent)) {
    return 'url'
  }
  
  return 'email' // 기본값은 이메일
}

// Input configuration
const INPUT_CONFIG = {
  email: {
    placeholder: `Please paste the complete email content...

Example:
From: sender@example.com
Subject: Urgent - Account Verification Required

Hello. Please verify your account immediately for security...`,
    fieldLabel: 'Email Content (HTML/Plain Text)'
  },
  url: {
    placeholder: `Please enter the URL...

Example:
https://suspicious-site.com/login?user=...`,
    fieldLabel: 'Suspicious URL'
  }
} as const

export default function EmailAnalyzer() {
  const [content, setContent] = useState('')
  const [inputType, setInputType] = useState<'email' | 'url'>('email')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalyzeResponse | null>(null)

  // 내용이 변경될 때 자동으로 타입 감지
  useEffect(() => {
    if (content.trim()) {
      const detectedType = detectInputType(content)
      setInputType(detectedType)
    }
  }, [content])

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

  const currentConfig = INPUT_CONFIG[inputType]
  const isContentValid = content.trim().length > 0
  const isNearSizeLimit = content.length > API_CONFIG.MAX_CONTENT_SIZE * 0.75

  return (
    <div className="container mx-auto max-w-6xl space-y-8 p-6">
      {/* Main header */}
      <header className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Shield className="w-16 h-16 text-primary" aria-hidden="true" />
          <h1 className="text-5xl font-bold text-foreground">
            Is This Phish?
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-xl mx-auto">
          AI-powered phishing detection service
        </p>
      </header>

      <Separator role="separator" aria-label="Header content divider" />

      {/* Analysis input form */}
      <section aria-labelledby="analysis-form-heading">
        <Card className="shadow-lg">
          <CardHeader className="p-6">
            <CardTitle className="text-3xl flex items-center gap-3" id="analysis-form-heading">
              <Search className="w-8 h-8" aria-hidden="true" />
              Phishing Analysis
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Analyze suspicious emails or URLs to assess risk levels
              {content.trim() && (
                <span className="block mt-2 text-sm">
                  <Badge variant="outline" className="mr-2">
                    Auto-detected: {inputType === 'email' ? 'Email' : 'URL'}
                  </Badge>
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Content input area */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label htmlFor="content-input" className="text-lg font-medium">
                  {currentConfig.fieldLabel}
                </label>
                <Badge variant="outline" className="text-sm">
                  Max {API_CONFIG.MAX_CONTENT_SIZE / 1024}KB
                </Badge>
              </div>
              <Textarea
                id="content-input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={currentConfig.placeholder}
                className="min-h-[250px] resize-none text-base p-4"
                maxLength={API_CONFIG.MAX_CONTENT_SIZE}
                aria-describedby="content-help content-count"
                aria-invalid={isNearSizeLimit ? 'true' : 'false'}
              />
              <div className="flex justify-between items-center text-base text-muted-foreground">
                <span id="content-count" aria-live="polite">
                  {content.length.toLocaleString()} / {API_CONFIG.MAX_CONTENT_SIZE.toLocaleString()} characters
                </span>
                <span id="content-help" className="text-sm" role="status" aria-live="polite">
                  {isNearSizeLimit && 'Warning: Approaching size limit'}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !isContentValid}
                className="flex-1 gap-3 text-lg px-8 py-4 h-auto"
                size="lg"
                variant="destructive"
                aria-describedby="analyze-button-help"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    <span>Analyzing...</span>
                    <span className="sr-only">Analysis in progress, please wait</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" aria-hidden="true" />
                    Start Analysis
                  </>
                )}
              </Button>
              <Button
                onClick={handleClear}
                disabled={isAnalyzing}
                variant="outline"
                size="lg"
                className="gap-3 text-lg px-8 py-4 h-auto"
                aria-label="Clear input content"
              >
                <RotateCcw className="w-5 h-5" aria-hidden="true" />
                Clear
              </Button>
            </div>
            <div id="analyze-button-help" className="sr-only">
              {!isContentValid && 'Please enter content before starting analysis'}
              {isAnalyzing && 'Analysis is currently in progress'}
            </div>

            {/* Important notes */}
            <Alert variant="warning" role="region" aria-labelledby="important-notes" className="p-6">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              <AlertTitle id="important-notes" className="text-lg">Important Notes</AlertTitle>
              <AlertDescription className="space-y-2 mt-3 text-base">
                <ul className="list-disc list-inside space-y-2">
                  <li>10 analyses per IP address per day</li>
                  <li>Please be careful when entering content containing personal information</li>
                  <li>Analysis results are for reference only, final decisions are the user&apos;s responsibility</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      {/* Analysis results */}
      {result && (
        <section aria-labelledby="results-heading" role="region" className="space-y-6">
          <h2 id="results-heading" className="sr-only">Analysis Results</h2>
          {result.success && result.result ? (
            <div role="status" aria-live="polite" aria-atomic="true">
              <AnalysisResult result={result.result} originalContent={content} />
            </div>
          ) : (
            <Alert variant="destructive" role="alert" className="p-6">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              <AlertTitle className="text-lg">Analysis Failed</AlertTitle>
              <AlertDescription className="text-base mt-2">
                {result.error || 'An unknown error occurred.'}
              </AlertDescription>
            </Alert>
          )}
        </section>
      )}

      {/* Footer with PoweredBy */}
      <footer className="text-center py-6 border-t">
        <Badge variant="secondary" className="text-base px-4 py-2">
          🤖 Powered by OpenAI GPT-4o
        </Badge>
      </footer>
    </div>
  )
} 