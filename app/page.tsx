import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import EmailAnalyzer from '@/components/EmailAnalyzer'
import { Bot, Zap, Shield, FileText, CheckCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      <EmailAnalyzer />
      
      {/* 서비스 소개 섹션 */}
      <div className="container mx-auto max-w-6xl p-4 space-y-12 mt-16">
        {/* 특징 소개 */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl flex items-center justify-center gap-3">
              <Zap className="w-8 h-8 text-primary" />
              서비스 특징
            </CardTitle>
            <CardDescription className="text-lg">
              최첨단 AI와 전문가 규칙을 결합한 피싱 탐지 기술
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4 p-6 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">AI 기반 분석</h3>
                <p className="text-muted-foreground">
                  OpenAI GPT-4o를 활용한 고도화된 언어 모델로 
                  피싱 패턴을 정확하게 탐지합니다.
                </p>
                <Badge variant="secondary">99.8% 정확도</Badge>
              </div>
              
              <div className="text-center space-y-4 p-6 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">실시간 분석</h3>
                <p className="text-muted-foreground">
                  3초 이내 분석 완료로 빠른 의사결정을 
                  지원하며 의심 구간을 시각적으로 표시합니다.
                </p>
                                 <Badge variant="secondary">3초 이내</Badge>
              </div>
              
              <div className="text-center space-y-4 p-6 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 border">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">정적 규칙 결합</h3>
                <p className="text-muted-foreground">
                  AI 분석과 함께 정적 보안 규칙을 적용하여
                  더욱 정확한 위험도 평가를 제공합니다.
                </p>
                <Badge variant="secondary">7개 규칙</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />
        
        {/* 사용법 안내 */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl flex items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              사용법
            </CardTitle>
            <CardDescription className="text-lg">
              간단한 4단계로 피싱 위험도를 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  1
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">분석 타입 선택</h3>
                  <p className="text-sm text-muted-foreground">
                    이메일 원문 분석 또는 URL 분석 중 선택하세요.
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  2
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">내용 입력</h3>
                  <p className="text-sm text-muted-foreground">
                    의심스러운 이메일의 전체 내용이나 URL을 입력하세요.
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  3
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">분석 실행</h3>
                  <p className="text-sm text-muted-foreground">
                    피싱 분석 시작 버튼을 클릭하여 AI 분석을 시작하세요.
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  4
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">결과 확인 및 공유</h3>
                  <p className="text-sm text-muted-foreground">
                    A~F 등급으로 위험도를 확인하고, 이미지로 저장하여 공유하세요.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />
        
        {/* 등급 설명 */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl flex items-center justify-center gap-3">
              <CheckCircle className="w-8 h-8 text-primary" />
              위험도 등급
            </CardTitle>
            <CardDescription className="text-lg">
              A~F 등급으로 피싱 위험도를 직관적으로 표시합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-l-4 border-red-500 bg-red-50/50">
                <CardContent className="flex items-center gap-4 pt-6">
                  <Badge className="bg-red-500 text-white text-lg px-3 py-1">A</Badge>
                  <div>
                    <div className="font-semibold text-red-800">매우 위험</div>
                    <div className="text-red-600 text-sm">확실한 피싱으로 판단됨</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-orange-500 bg-orange-50/50">
                <CardContent className="flex items-center gap-4 pt-6">
                  <Badge className="bg-orange-500 text-white text-lg px-3 py-1">B</Badge>
                  <div>
                    <div className="font-semibold text-orange-800">위험</div>
                    <div className="text-orange-600 text-sm">피싱 가능성이 높음</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-yellow-500 bg-yellow-50/50">
                <CardContent className="flex items-center gap-4 pt-6">
                  <Badge className="bg-yellow-500 text-white text-lg px-3 py-1">C</Badge>
                  <div>
                    <div className="font-semibold text-yellow-800">주의</div>
                    <div className="text-yellow-600 text-sm">의심스러운 요소가 있음</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-green-500 bg-green-50/50">
                <CardContent className="flex items-center gap-4 pt-6">
                  <Badge className="bg-green-500 text-white text-lg px-3 py-1">D</Badge>
                  <div>
                    <div className="font-semibold text-green-800">보통</div>
                    <div className="text-green-600 text-sm">약간의 위험 요소</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-cyan-500 bg-cyan-50/50">
                <CardContent className="flex items-center gap-4 pt-6">
                  <Badge className="bg-cyan-500 text-white text-lg px-3 py-1">E</Badge>
                  <div>
                    <div className="font-semibold text-cyan-800">낮음</div>
                    <div className="text-cyan-600 text-sm">경미한 주의사항</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-blue-500 bg-blue-50/50">
                <CardContent className="flex items-center gap-4 pt-6">
                  <Badge className="bg-blue-500 text-white text-lg px-3 py-1">F</Badge>
                  <div>
                    <div className="font-semibold text-blue-800">안전</div>
                    <div className="text-blue-600 text-sm">정상적인 이메일/URL</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 