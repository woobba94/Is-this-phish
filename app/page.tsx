import EmailAnalyzer from '@/components/EmailAnalyzer'

export default function Home() {
  return (
    <div className="min-h-screen">
      <EmailAnalyzer />
      
      {/* 서비스 소개 섹션 */}
      <section className="max-w-4xl mx-auto mt-16 space-y-12">
        {/* 특징 소개 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            🚀 서비스 특징
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">AI 기반 분석</h3>
              <p className="text-gray-600 text-sm">
                OpenAI GPT-4o를 활용한 고도화된 언어 모델로 
                피싱 패턴을 정확하게 탐지합니다.
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">실시간 분석</h3>
              <p className="text-gray-600 text-sm">
                3초 이내 분석 완료로 빠른 의사결정을 
                지원하며 의심 구간을 시각적으로 표시합니다.
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">정적 규칙 결합</h3>
              <p className="text-gray-600 text-sm">
                AI 분석과 함께 정적 보안 규칙을 적용하여
                더욱 정확한 위험도 평가를 제공합니다.
              </p>
            </div>
          </div>
        </div>
        
        {/* 사용법 안내 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            📝 사용법
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">분석 타입 선택</h3>
                <p className="text-gray-600 text-sm">
                  이메일 원문 분석 또는 URL 분석 중 선택하세요.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">내용 입력</h3>
                <p className="text-gray-600 text-sm">
                  의심스러운 이메일의 전체 내용이나 URL을 입력하세요. (최대 20KB)
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">분석 실행</h3>
                <p className="text-gray-600 text-sm">
                  "피싱 분석 시작" 버튼을 클릭하여 AI 분석을 시작하세요.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">결과 확인 및 공유</h3>
                <p className="text-gray-600 text-sm">
                  A~F 등급으로 위험도를 확인하고, 이미지로 저장하여 공유하세요.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 등급 설명 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            📊 위험도 등급
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 border-l-4 border-red-500 bg-red-50">
              <span className="bg-red-500 text-white px-2 py-1 rounded font-bold">A</span>
              <div>
                <div className="font-semibold text-red-800">매우 위험</div>
                <div className="text-red-600 text-sm">확실한 피싱으로 판단됨</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border-l-4 border-orange-500 bg-orange-50">
              <span className="bg-orange-500 text-white px-2 py-1 rounded font-bold">B</span>
              <div>
                <div className="font-semibold text-orange-800">위험</div>
                <div className="text-orange-600 text-sm">피싱 가능성이 높음</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border-l-4 border-yellow-500 bg-yellow-50">
              <span className="bg-yellow-500 text-white px-2 py-1 rounded font-bold">C</span>
              <div>
                <div className="font-semibold text-yellow-800">주의</div>
                <div className="text-yellow-600 text-sm">의심스러운 요소가 있음</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border-l-4 border-green-500 bg-green-50">
              <span className="bg-green-500 text-white px-2 py-1 rounded font-bold">D</span>
              <div>
                <div className="font-semibold text-green-800">보통</div>
                <div className="text-green-600 text-sm">약간의 위험 요소</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border-l-4 border-cyan-500 bg-cyan-50">
              <span className="bg-cyan-500 text-white px-2 py-1 rounded font-bold">E</span>
              <div>
                <div className="font-semibold text-cyan-800">낮음</div>
                <div className="text-cyan-600 text-sm">경미한 주의사항</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border-l-4 border-blue-500 bg-blue-50">
              <span className="bg-blue-500 text-white px-2 py-1 rounded font-bold">F</span>
              <div>
                <div className="font-semibold text-blue-800">안전</div>
                <div className="text-blue-600 text-sm">정상적인 이메일/URL</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 