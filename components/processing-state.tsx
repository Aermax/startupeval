"use client"

import { Card } from "@/components/ui/card"
import { Sparkles, FileText, Brain, CheckCircle } from "lucide-react"

interface ProcessingStateProps {
  fileName: string
  currentStep: "extracting" | "analyzing" | "generating" | "complete"
}

export function ProcessingState({ fileName, currentStep }: ProcessingStateProps) {
  const steps = [
    {
      id: "extracting",
      label: "Extracting Text",
      icon: <FileText className="w-5 h-5" />,
      description: "Reading and parsing document content",
    },
    {
      id: "analyzing",
      label: "AI Analysis",
      icon: <Brain className="w-5 h-5" />,
      description: "Processing content with advanced AI",
    },
    {
      id: "generating",
      label: "Generating Report",
      icon: <Sparkles className="w-5 h-5" />,
      description: "Creating comprehensive insights",
    },
    {
      id: "complete",
      label: "Complete",
      icon: <CheckCircle className="w-5 h-5" />,
      description: "Report ready for review",
    },
  ]

  const getCurrentStepIndex = () => {
    return steps.findIndex((step) => step.id === currentStep)
  }

  const currentStepIndex = getCurrentStepIndex()

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated starfield background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black opacity-90" />

        {/* Animated stars */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-px bg-white rounded-full star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Accent stars */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300 font-medium tracking-wide">startupEval AI Analysis</span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">Processing Your Document</h1>
          <p className="text-gray-400 text-lg">
            Analyzing <span className="text-blue-400 font-medium">{fileName}</span>
          </p>
        </div>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 shadow-2xl">
          <div className="space-y-6">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex
              const isCompleted = index < currentStepIndex
              const isPending = index > currentStepIndex

              return (
                <div key={step.id} className="flex items-center gap-4">
                  <div
                    className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border
                    ${isActive ? "bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/30" : ""}
                    ${isCompleted ? "bg-green-500/20 border-green-500/50" : ""}
                    ${isPending ? "bg-white/5 border-white/20" : ""}
                  `}
                  >
                    {isActive && <div className="animate-spin text-blue-400">{step.icon}</div>}
                    {isCompleted && <div className="text-green-400">{step.icon}</div>}
                    {isPending && <div className="text-gray-500">{step.icon}</div>}
                  </div>

                  <div className="flex-1">
                    <h3
                      className={`
                      font-semibold transition-colors duration-300
                      ${isActive ? "text-blue-400" : ""}
                      ${isCompleted ? "text-green-400" : ""}
                      ${isPending ? "text-gray-500" : ""}
                    `}
                    >
                      {step.label}
                    </h3>
                    <p
                      className={`
                      text-sm transition-colors duration-300
                      ${isActive ? "text-gray-300" : ""}
                      ${isCompleted ? "text-gray-400" : ""}
                      ${isPending ? "text-gray-600" : ""}
                    `}
                    >
                      {step.description}
                    </p>
                  </div>

                  {isActive && (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-8">
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
            <p className="text-center text-gray-400 text-sm mt-2">
              Step {currentStepIndex + 1} of {steps.length}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
