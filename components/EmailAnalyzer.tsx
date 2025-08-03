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
import { Mail, Link, Search, RotateCcw, AlertTriangle, Shield, Loader2 } from 'lucide-react'

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
      {/* Main header */}
      <header className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Shield className="w-12 h-12 text-primary" aria-hidden="true" />
          <h1 className="text-4xl font-bold text-foreground">
            Is This Phish?
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Real-time phishing detection service combining AI and static rules
        </p>
        <Badge variant="secondary" className="text-sm">
          🤖 Powered by OpenAI GPT-4o
        </Badge>
      </header>

      <Separator role="separator" aria-label="Header content divider" />

      {/* Analysis input form */}
      <section aria-labelledby="analysis-form-heading">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2" id="analysis-form-heading">
              <Search className="w-6 h-6" aria-hidden="true" />
              Phishing Analysis
            </CardTitle>
            <CardDescription>
              Analyze suspicious emails or URLs to assess risk levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input type selection */}
            <fieldset className="space-y-3">
              <legend className="sr-only">Select analysis type</legend>
              <div className="flex justify-center gap-2" role="radiogroup" aria-label="Analysis type selection">
                {Object.entries(INPUT_TYPES).map(([type, config]) => {
                  const IconComponent = config.icon
                  return (
                    <Button
                      key={type}
                      variant={inputType === type ? 'default' : 'outline'}
                      onClick={() => setInputType(type as 'email' | 'url')}
                      className="gap-2"
                      role="radio"
                      aria-checked={inputType === type}
                      aria-describedby={`${type}-description`}
                    >
                      <IconComponent className="w-4 h-4" aria-hidden="true" />
                      {config.label}
                    </Button>
                  )
                })}
              </div>
              <div className="sr-only">
                <div id="email-description">Analyze email content for phishing indicators</div>
                <div id="url-description">Analyze URL for suspicious characteristics</div>
              </div>
            </fieldset>

            {/* Content input area */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label htmlFor="content-input" className="text-sm font-medium">
                  {currentConfig.fieldLabel}
                </label>
                <Badge variant="outline" className="text-xs">
                  Max {API_CONFIG.MAX_CONTENT_SIZE / 1024}KB
                </Badge>
              </div>
              <Textarea
                id="content-input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={currentConfig.placeholder}
                className="min-h-[200px] resize-none"
                maxLength={API_CONFIG.MAX_CONTENT_SIZE}
                aria-describedby="content-help content-count"
                aria-invalid={isNearSizeLimit ? 'true' : 'false'}
              />
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span id="content-count" aria-live="polite">
                  {content.length.toLocaleString()} / {API_CONFIG.MAX_CONTENT_SIZE.toLocaleString()} characters
                </span>
                <span id="content-help" className="text-xs" role="status" aria-live="polite">
                  {isNearSizeLimit && 'Warning: Approaching size limit'}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !isContentValid}
                className="flex-1 gap-2"
                size="lg"
                variant="destructive"
                aria-describedby="analyze-button-help"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Analyzing...</span>
                    <span className="sr-only">Analysis in progress, please wait</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" aria-hidden="true" />
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
                aria-label="Clear input content"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                Clear
              </Button>
            </div>
            <div id="analyze-button-help" className="sr-only">
              {!isContentValid && 'Please enter content before starting analysis'}
              {isAnalyzing && 'Analysis is currently in progress'}
            </div>

            {/* Important notes */}
            <Alert variant="warning" role="region" aria-labelledby="important-notes">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              <AlertTitle id="important-notes">Important Notes</AlertTitle>
              <AlertDescription className="space-y-1 mt-2">
                <ul className="list-disc list-inside space-y-1">
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
        <section aria-labelledby="results-heading" role="region">
          <h2 id="results-heading" className="sr-only">Analysis Results</h2>
          {result.success && result.result ? (
            <div role="status" aria-live="polite" aria-atomic="true">
              <AnalysisResult result={result.result} originalContent={content} />
            </div>
          ) : (
            <Alert variant="destructive" role="alert">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              <AlertTitle>Analysis Failed</AlertTitle>
              <AlertDescription>
                {result.error || 'An unknown error occurred.'}
              </AlertDescription>
            </Alert>
          )}
        </section>
      )}
    </div>
  )
} 