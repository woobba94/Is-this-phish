'use client'

import { useState } from 'react'
import AnalysisResult from './AnalysisResult'
import { AnalyzeRequest, AnalyzeResponse } from '@/utils/types'

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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 입력 섹션 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          🛡️ Is This Phish?
        </h1>
        <p className="text-center text-gray-600 mb-8">
          AI와 정적 규칙을 활용한 실시간 피싱 탐지 서비스
        </p>

        {/* 입력 타입 선택 */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setInputType('email')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 ${
              inputType === 'email'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📧 이메일 분석
          </button>
          <button
            onClick={() => setInputType('url')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 ${
              inputType === 'url'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🔗 URL 분석
          </button>
        </div>

        {/* 입력 영역 */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            {inputType === 'email' ? '이메일 원문 (HTML/Plain Text)' : '의심스러운 URL'}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              inputType === 'email'
                ? '이메일의 전체 내용을 붙여넣어 주세요...\n\n예시:\nFrom: sender@example.com\nSubject: 긴급 - 계정 확인 필요\n\n안녕하세요. 보안을 위해 즉시 계정을 확인해주세요...'
                : 'URL을 입력해주세요...\n\n예시:\nhttps://suspicious-site.com/login?user=...'
            }
            className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={20480}
          />
          <div className="text-right text-sm text-gray-500">
            {content.length} / 20,480 글자
          </div>
        </div>

        {/* 버튼 그룹 */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !content.trim()}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
          >
            {isAnalyzing ? '🔍 분석 중...' : '🔍 피싱 분석 시작'}
          </button>
          <button
            onClick={handleClear}
            disabled={isAnalyzing}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            🗑️ 초기화
          </button>
        </div>

        {/* 주의사항 */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ 주의사항</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• IP당 하루 1회 분석 가능합니다</li>
            <li>• 최대 20KB까지 입력 가능합니다</li>
            <li>• 개인정보가 포함된 내용은 주의해서 입력해주세요</li>
            <li>• 분석 결과는 참고용이며, 최종 판단은 사용자가 해야 합니다</li>
          </ul>
        </div>
      </div>

      {/* 결과 표시 */}
      {result && (
        <div>
          {result.success && result.result ? (
            <AnalysisResult result={result.result} originalContent={content} />
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">분석 실패</h3>
              <p className="text-red-600">{result.error || '알 수 없는 오류가 발생했습니다.'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 