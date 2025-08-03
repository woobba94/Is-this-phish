'use client'

import { useRef } from 'react'
import dynamic from 'next/dynamic'
import html2canvas from 'html2canvas'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
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
      const backgroundColor = `bg-destructive/20 border border-destructive/40 rounded px-2 py-1`
      
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
    <div className="space-y-8">
      <article ref={resultRef} className="shadow-lg border-2" role="main" aria-labelledby="result-title">
        {/* Header */}
        <CardHeader className="text-center space-y-6 p-8">
          <div className="flex items-center justify-center gap-4">
            <Shield className="w-10 h-10 text-primary" aria-hidden="true" />
            <CardTitle className="text-4xl" id="result-title">Phishing Analysis Result</CardTitle>
          </div>
          <div className="flex justify-center" role="status" aria-live="polite" aria-atomic="true">
            <PhishingBadge score={result.score} />
          </div>
        </CardHeader>

        <CardContent className="space-y-10 p-8">
          {/* Analysis summary */}
          <section aria-labelledby="summary-heading">
            <h2 id="summary-heading" className="text-2xl font-semibold flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6" aria-hidden="true" />
              Analysis Summary
            </h2>
            <Card className="bg-muted/50">
              <CardContent className="pt-8 p-6">
                <p className="text-lg text-foreground leading-relaxed">{result.summary}</p>
              </CardContent>
            </Card>
          </section>

          {/* Highlighted content */}
          <section aria-labelledby="content-heading">
            <h2 id="content-heading" className="text-2xl font-semibold mb-4">
              Original Content (Suspicious Parts Highlighted)
            </h2>
            <Card>
              <CardContent className="p-6">
                <div 
                  className="bg-background max-h-96 overflow-y-auto rounded-md border p-4 text-base"
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
              <div className="space-y-6">
                <h2 id="risk-factors-heading" className="text-2xl font-semibold flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-destructive" aria-hidden="true" />
                  Risk Factors Found
                  <Badge variant="destructive" className="ml-3 text-base px-3 py-1" aria-label={`${result.highlights.length} risk factors found`}>
                    {result.highlights.length} items
                  </Badge>
                </h2>
                <ul className="grid gap-4" role="list" aria-label="List of identified risk factors">
                  {result.highlights.map((highlight, index) => (
                    <li key={index}>
                      <Alert variant="destructive" role="listitem" className="p-6">
                        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                        <AlertDescription className="space-y-2">
                          <div className="font-medium text-lg">
                            <span className="sr-only">Suspicious text: </span>
                            &quot;{highlight.text}&quot;
                          </div>
                          <div className="text-base opacity-90">
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

          {/* Footer information */}
          <footer className="text-center space-y-3 text-muted-foreground" role="contentinfo">
            <div className="flex items-center justify-center gap-6 text-base">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" aria-hidden="true" />
                <span>
                  <span className="sr-only">Analysis date: </span>
                  {new Date().toLocaleDateString('en-US')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" aria-hidden="true" />
                <span>
                  <span className="sr-only">Analysis time: </span>
                  {new Date().toLocaleTimeString('en-US')}
                </span>
              </div>
            </div>
            <p className="text-sm">Is This Phish? - AI-Powered Phishing Detection Service</p>
          </footer>
        </CardContent>
      </article>

      {/* Share section */}
      <section aria-labelledby="share-heading">
        <Card>
          <CardContent className="pt-8 p-6">
            <div className="text-center space-y-6">
              <h2 id="share-heading" className="sr-only">Share Analysis Result</h2>
              <Button
                onClick={handleShareAsImage}
                className="gap-3 text-lg px-8 py-4 h-auto"
                size="lg"
                aria-describedby="share-description"
              >
                <Download className="w-5 h-5" aria-hidden="true" />
                Save as Image
              </Button>
              <CardDescription id="share-description" className="text-base">
                Save the analysis result as an image to share with team members
              </CardDescription>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
} 