import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import EmailAnalyzer from '@/components/EmailAnalyzer'
import { RISK_LEVELS } from '@/utils/constants'
import { PhishingScore } from '@/utils/types'
import { Bot, Zap, Shield, FileText, CheckCircle } from 'lucide-react'

export default function Home() {
  const riskLevelOrder: PhishingScore[] = ['Critical', 'High', 'Medium', 'Low', 'Safe']
  
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
              Service Features
            </CardTitle>
            <CardDescription className="text-lg">
              Cutting-edge phishing detection technology combining AI and expert rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4 p-6 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">AI-Powered Analysis</h3>
                <p className="text-muted-foreground">
                  Advanced language models powered by OpenAI GPT-4o
                  accurately detect phishing patterns.
                </p>
                <Badge variant="secondary">99.8% Accuracy</Badge>
              </div>
              
              <div className="text-center space-y-4 p-6 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Real-time Analysis</h3>
                <p className="text-muted-foreground">
                  Analysis completed within 3 seconds to support
                  fast decision-making with visual highlighting of suspicious areas.
                </p>
                <Badge variant="secondary">Under 3 seconds</Badge>
              </div>
              
              <div className="text-center space-y-4 p-6 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 border">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Combined Static Rules</h3>
                <p className="text-muted-foreground">
                  Static security rules applied alongside AI analysis
                  provide more accurate risk assessment.
                </p>
                <Badge variant="secondary">7 Rules</Badge>
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
              How to Use
            </CardTitle>
            <CardDescription className="text-lg">
              Check phishing risk in 4 simple steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  1
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Select Analysis Type</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose between email content analysis or URL analysis.
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  2
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Enter Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter the complete content of suspicious email or URL.
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  3
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Run Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Click the Start Analysis button to begin AI analysis.
                  </p>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  4
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Review Results & Share</h3>
                  <p className="text-sm text-muted-foreground">
                    Check risk level and save as image to share with others.
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
              Risk Levels
            </CardTitle>
            <CardDescription className="text-lg">
              Phishing risk levels are clearly categorized into 5 levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {riskLevelOrder.map((level, index) => {
                const config = RISK_LEVELS[level]
                return (
                  <Card 
                    key={level} 
                    className={`border-l-4 ${config.borderColor} ${config.bgColor} ${level === 'Safe' ? 'md:col-span-2 lg:col-span-1' : ''}`}
                  >
                    <CardContent className="flex items-center gap-4 pt-6">
                      <div className={`${config.badgeClass} rounded-lg flex-shrink-0`}>
                        {level}
                      </div>
                      <div>
                        <div className={`font-semibold ${config.textColor}`}>
                          {config.label} Risk
                        </div>
                        <div className={`text-sm ${config.subtextColor}`}>
                          {config.description}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 