import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import EmailAnalyzer from '@/components/EmailAnalyzer'
import { RISK_LEVELS } from '@/utils/constants'
import { STATIC_RULES } from '@/utils/staticRules'
import { PhishingScore } from '@/utils/types'
import { Bot, Zap, Shield, FileText, CheckCircle } from 'lucide-react'

export default function Home() {
  const riskLevelOrder: PhishingScore[] = ['Critical', 'High', 'Medium', 'Low', 'Safe']
  
  return (
    <div className="min-h-screen">
      <EmailAnalyzer />
      
      {/* Service introduction sections */}
      <div className="container mx-auto max-w-6xl p-4 space-y-12 mt-16" role="region" aria-labelledby="service-info">
        <h2 id="service-info" className="sr-only">Service Information</h2>
        
        {/* Service features */}
        <section aria-labelledby="features-heading">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl flex items-center justify-center gap-3" id="features-heading">
                <Zap className="w-8 h-8 text-primary" aria-hidden="true" />
                Service Features
              </CardTitle>
              <CardDescription className="text-lg">
                Cutting-edge phishing detection technology combining AI and expert rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8" role="list" aria-label="Key features">
                <article className="text-center space-y-4 p-6 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border" role="listitem">
                  <Avatar className="w-16 h-16 mx-auto bg-blue-500" aria-hidden="true">
                    <AvatarFallback className="bg-blue-500 text-white">
                      <Bot className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold">AI-Powered Analysis</h3>
                  <p className="text-muted-foreground">
                    Advanced language models powered by OpenAI GPT-4o
                    accurately detect phishing patterns.
                  </p>
                  <Badge variant="secondary" aria-label="Accuracy rate">99.8% Accuracy</Badge>
                </article>
                
                <article className="text-center space-y-4 p-6 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border" role="listitem">
                  <Avatar className="w-16 h-16 mx-auto bg-green-500" aria-hidden="true">
                    <AvatarFallback className="bg-green-500 text-white">
                      <Zap className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold">Real-time Analysis</h3>
                  <p className="text-muted-foreground">
                    Analysis completed within 3 seconds to support
                    fast decision-making with visual highlighting of suspicious areas.
                  </p>
                  <Badge variant="secondary" aria-label="Analysis speed">Under 3 seconds</Badge>
                </article>
                
                <article className="text-center space-y-4 p-6 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 border" role="listitem">
                  <Avatar className="w-16 h-16 mx-auto bg-purple-500" aria-hidden="true">
                    <AvatarFallback className="bg-purple-500 text-white">
                      <Shield className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold">Combined Static Rules</h3>
                  <p className="text-muted-foreground">
                    Static security rules applied alongside AI analysis
                    provide more accurate risk assessment.
                  </p>
                  <Badge variant="secondary" aria-label={`Number of rules: ${STATIC_RULES.length}`}>
                    {STATIC_RULES.length} Rules
                  </Badge>
                </article>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator role="separator" aria-label="Section divider" />
        
        {/* How to use guide */}
        <section aria-labelledby="guide-heading">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl flex items-center justify-center gap-3" id="guide-heading">
                <FileText className="w-8 h-8 text-primary" aria-hidden="true" />
                How to Use
              </CardTitle>
              <CardDescription className="text-lg">
                Check phishing risk in 4 simple steps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" aria-label="Step-by-step guide">
                <li className="text-center space-y-4">
                  <Badge variant="default" className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xl font-bold" aria-label="Step 1">
                    1
                  </Badge>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Select Analysis Type</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose between email content analysis or URL analysis.
                    </p>
                  </div>
                </li>
                
                <li className="text-center space-y-4">
                  <Badge variant="default" className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xl font-bold" aria-label="Step 2">
                    2
                  </Badge>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Enter Content</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter the complete content of suspicious email or URL.
                    </p>
                  </div>
                </li>
                
                <li className="text-center space-y-4">
                  <Badge variant="default" className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xl font-bold" aria-label="Step 3">
                    3
                  </Badge>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Run Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Click the Start Analysis button to begin AI analysis.
                    </p>
                  </div>
                </li>
                
                <li className="text-center space-y-4">
                  <Badge variant="default" className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xl font-bold" aria-label="Step 4">
                    4
                  </Badge>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Review Results & Share</h3>
                    <p className="text-sm text-muted-foreground">
                      Check risk level and save as image to share with others.
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        </section>

        <Separator role="separator" aria-label="Section divider" />
        
        {/* Risk levels explanation */}
        <section aria-labelledby="risk-levels-heading">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl flex items-center justify-center gap-3" id="risk-levels-heading">
                <CheckCircle className="w-8 h-8 text-primary" aria-hidden="true" />
                Risk Levels
              </CardTitle>
              <CardDescription className="text-lg">
                Phishing risk levels are clearly categorized into 5 levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Risk level definitions">
                {riskLevelOrder.map((level, index) => {
                  const config = RISK_LEVELS[level]
                  return (
                    <Card 
                      key={level} 
                      className={`border-l-4 ${config.borderColor} ${config.bgColor} ${level === 'Safe' ? 'md:col-span-2 lg:col-span-1' : ''}`}
                      role="listitem"
                    >
                      <CardContent className="flex items-center gap-4 pt-6">
                        <div className={`${config.badgeClass} rounded-lg flex-shrink-0`} aria-hidden="true">
                          {level}
                        </div>
                        <div>
                          <h3 className={`font-semibold ${config.textColor}`}>
                            {config.label} Risk
                          </h3>
                          <p className={`text-sm ${config.subtextColor}`}>
                            {config.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
} 