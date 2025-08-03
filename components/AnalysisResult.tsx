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
        `<span class="${backgroundColor}" title="${highlight.reason}" data-highlight-id="${index}" role="mark" aria-label="Suspicious text: ${highlight.text}. Reason: ${highlight.reason}">${highlight.text}</span>`
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
          link.setAttribute('aria-label', `Download analysis result as image. Risk level: ${result.score}`)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      }, 'image/png')
    } catch (error) {
      console.error('Image generation failed:', error)
      alert('Failed to generate image.')
    }
  }

  return (
    <div className="space-y-6">
      <article ref={resultRef} className="shadow-lg border-2" role="main" aria-labelledby="result-title">
        {/* Header */}
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Shield className="w-8 h-8 text-primary" aria-hidden="true" />
            <CardTitle className="text-3xl" id="result-title">Phishing Analysis Result</CardTitle>
          </div>
          <div className="flex justify-center" role="status" aria-live="polite" aria-atomic="true">
            <PhishingBadge score={result.score} />
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Analysis summary */}
          <section aria-labelledby="summary-heading">
            <h2 id="summary-heading" className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" aria-hidden="true" />
              Analysis Summary
            </h2>
            <Card className="bg-muted/50 mt-3">
              <CardContent className="pt-6">
                <p className="text-foreground leading-relaxed">{result.summary}</p>
              </CardContent>
            </Card>
          </section>

          <Separator role="separator" aria-label="Content section divider" />

          {/* Highlighted content */}
          <section aria-labelledby="content-heading">
            <h2 id="content-heading" className="text-xl font-semibold">
              Original Content (Suspicious Parts Highlighted)
            </h2>
            <Card className="mt-3">
              <CardContent className="p-4">
                <div 
                  className="bg-background max-h-96 overflow-y-auto rounded-md border"
                  role="region"
                  aria-label="Original content with highlighted suspicious parts"
                  tabIndex={0}
                >
                  <ReactQuill
                    value={getHighlightedContent()}
                    readOnly={true}
                    theme="bubble"
                    modules={{ toolbar: false }}
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Risk factors found */}
          {result.highlights.length > 0 && (
            <section aria-labelledby="risk-factors-heading">
              <div className="space-y-4">
                <h2 id="risk-factors-heading" className="text-xl font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" aria-hidden="true" />
                  Risk Factors Found
                  <Badge variant="destructive" className="ml-2" aria-label={`${result.highlights.length} risk factors found`}>
                    {result.highlights.length} items
                  </Badge>
                </h2>
                <ul className="grid gap-3" role="list" aria-label="List of identified risk factors">
                  {result.highlights.map((highlight, index) => (
                    <li key={index}>
                      <Alert variant="destructive" role="listitem">
                        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                        <AlertDescription className="space-y-1">
                          <div className="font-medium">
                            <span className="sr-only">Suspicious text: </span>
                            &quot;{highlight.text}&quot;
                          </div>
                          <div className="text-sm opacity-90">
                            <span className="sr-only">Reason: </span>
                            {highlight.reason}
                          </div>
                        </AlertDescription>
                      </Alert>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          <Separator role="separator" aria-label="Footer section divider" />

          {/* Footer information */}
          <footer className="text-center space-y-2 text-muted-foreground" role="contentinfo">
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <span>
                  <span className="sr-only">Analysis date: </span>
                  {new Date().toLocaleDateString('en-US')}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" aria-hidden="true" />
                <span>
                  <span className="sr-only">Analysis time: </span>
                  {new Date().toLocaleTimeString('en-US')}
                </span>
              </div>
            </div>
            <p className="text-xs">Is This Phish? - AI-Powered Phishing Detection Service</p>
          </footer>
        </CardContent>
      </article>

      {/* Share section */}
      <section aria-labelledby="share-heading">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 id="share-heading" className="sr-only">Share Analysis Result</h2>
              <Button
                onClick={handleShareAsImage}
                className="gap-2"
                size="lg"
                aria-describedby="share-description"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                Save as Image
              </Button>
              <CardDescription id="share-description">
                Save the analysis result as an image to share with team members
              </CardDescription>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
} 