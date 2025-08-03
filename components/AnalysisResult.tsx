'use client'

import { useRef } from 'react'
import dynamic from 'next/dynamic'
import html2canvas from 'html2canvas'
import PhishingBadge from './PhishingBadge'
import { AnalysisResult as AnalysisResultType } from '@/utils/types'

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
      const backgroundColor = `bg-red-200 border border-red-400 rounded px-1 py-0.5`
      
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
      <div ref={resultRef} className="bg-white p-6 rounded-lg shadow-lg border">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">피싱 분석 결과</h2>
          <PhishingBadge score={result.score} />
        </div>

        {/* 분석 요약 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">분석 요약</h3>
          <p className="text-gray-600 leading-relaxed">{result.summary}</p>
        </div>

        {/* 하이라이트된 컨텐츠 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            원본 내용 (의심 구간 강조)
          </h3>
          <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
            <ReactQuill
              value={getHighlightedContent()}
              readOnly={true}
              theme="bubble"
              modules={{ toolbar: false }}
            />
          </div>
        </div>

        {/* 발견된 위험 요소 */}
        {result.highlights.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              발견된 위험 요소 ({result.highlights.length}개)
            </h3>
            <div className="space-y-3">
              {result.highlights.map((highlight, index) => (
                <div key={index} className="border-l-4 border-red-400 bg-red-50 p-3 rounded-r">
                  <div className="font-medium text-red-800 mb-1">"{highlight.text}"</div>
                  <div className="text-red-600 text-sm">{highlight.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 푸터 정보 */}
        <div className="text-center text-sm text-gray-500 border-t pt-4">
          <p>Is This Phish? - AI 기반 피싱 탐지 서비스</p>
          <p>분석 시간: {new Date().toLocaleString('ko-KR')}</p>
        </div>
      </div>

      {/* 공유 버튼 */}
      <div className="text-center">
        <button
          onClick={handleShareAsImage}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
        >
          📸 이미지로 저장하기
        </button>
        <p className="text-sm text-gray-500 mt-2">
          분석 결과를 이미지로 저장하여 공유할 수 있습니다
        </p>
      </div>
    </div>
  )
} 