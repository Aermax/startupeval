"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Copy, TrendingUp, Lightbulb, CheckCircle, BarChart3, Target, Zap, Star, User } from "lucide-react"
import type { ReportData } from "@/lib/gemini-client"
import { ExportMenu } from "./export-menu"

interface ReportDashboardProps {
  reportData: ReportData
  fileName: string
  extractedText: string
  onNewReport: () => void
}

export function ReportDashboard({ reportData, fileName, extractedText, onNewReport }: ReportDashboardProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  const generateDocumentAnalytics = useMemo(() => {
    const words = extractedText
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2)
    const sentences = extractedText.split(/[.!?]+/).filter((s) => s.trim().length > 0)

    // Document structure analysis
    const paragraphs = extractedText.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
    const readingTime = Math.ceil(words.length / 200) // Average reading speed

    // Sentence length analysis
    const sentenceLengths = sentences.map((s) => s.trim().split(/\s+/).length)
    const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length || 0

    return {
      documentStats: {
        totalWords: words.length,
        totalSentences: sentences.length,
        totalParagraphs: paragraphs.length,
        avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
        readingTime,
      },
    }
  }, [extractedText])

  const { documentStats } = generateDocumentAnalytics

  const calculateSentimentScore = useMemo(() => {
    const positiveKeywords = [
      "growth",
      "success",
      "profit",
      "increase",
      "improve",
      "strong",
      "excellent",
      "positive",
      "opportunity",
      "advantage",
    ]
    const negativeKeywords = [
      "decline",
      "loss",
      "decrease",
      "problem",
      "issue",
      "weak",
      "poor",
      "negative",
      "challenge",
      "risk",
    ]

    const allText =
      `${reportData.summary} ${reportData.keyPoints.join(" ")} ${reportData.insights.join(" ")}`.toLowerCase()

    let positiveCount = 0
    let negativeCount = 0

    positiveKeywords.forEach((keyword) => {
      const matches = allText.match(new RegExp(keyword, "g"))
      if (matches) positiveCount += matches.length
    })

    negativeKeywords.forEach((keyword) => {
      const matches = allText.match(new RegExp(keyword, "g"))
      if (matches) negativeCount += matches.length
    })

    const totalWords = allText.split(" ").length
    const sentimentRatio = (positiveCount - negativeCount) / Math.max(totalWords / 100, 1)

    // Convert to 0-100 scale with baseline of 50
    const score = Math.max(0, Math.min(100, 50 + sentimentRatio * 25))
    return Math.round(score)
  }, [reportData])

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(section)
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }

  const getSentimentColor = (score: number) => {
    if (score >= 70) return "bg-green-500/20 text-green-400 border-green-500/30"
    if (score >= 50) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    return "bg-red-500/20 text-red-400 border-red-500/30"
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated starfield background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black opacity-90" />

        {/* Animated stars */}
        <div className="absolute inset-0">
          {Array.from({ length: 40 }).map((_, i) => (
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
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {/* Header - Improved mobile responsiveness */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <div className="w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
              startupEval AI Analysis Report
            </h1>
            <p className="text-gray-400 flex items-center gap-2 text-sm md:text-base">
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="truncate max-w-[250px] sm:max-w-[300px] md:max-w-none">{fileName}</span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full sm:w-auto">
            <Button
              onClick={() =>
                copyToClipboard(
                  `# ${fileName} Analysis\n\n${reportData.summary}\n\nKey Points:\n${reportData.keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}`,
                  "full-report",
                )
              }
              variant="outline"
              className="border-white/20 hover:border-white/30 bg-white/5 hover:bg-white/10 text-white text-xs md:text-sm"
            >
              {copiedSection === "full-report" ? (
                <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              Copy Report
            </Button>
            <ExportMenu reportData={reportData} fileName={fileName} />
            <Button onClick={onNewReport} className="bg-blue-600 hover:bg-blue-500 text-xs md:text-sm">
              New Report
            </Button>
          </div>
        </div>

        

        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-white/20 mb-6 md:mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">Startup Sentiment Score</h2>
                  <p className="text-gray-400">Based on AI analysis of your document</p>
                </div>
              </div>
              <div className="text-center">
                <div
                  className={`inline-flex items-center px-6 py-3 rounded-full border ${getSentimentColor(calculateSentimentScore)}`}
                >
                  <span className="text-3xl md:text-4xl font-bold mr-2">{calculateSentimentScore}</span>
                  <span className="text-lg">/100</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  {calculateSentimentScore >= 70
                    ? "Excellent"
                    : calculateSentimentScore >= 50
                      ? "Good"
                      : "Needs Improvement"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                  <FileText className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{documentStats.totalWords}</p>
                  <p className="text-sm text-gray-400">Total Words</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{documentStats.totalSentences}</p>
                  <p className="text-sm text-gray-400">Sentences</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{documentStats.avgSentenceLength}</p>
                  <p className="text-sm text-gray-400">Avg Words/Sentence</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                  <Zap className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{documentStats.readingTime}</p>
                  <p className="text-sm text-gray-400">Min Read Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Summary */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Summary
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(reportData.summary, "summary")}
                className="hover:bg-white/10"
              >
                {copiedSection === "summary" ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed">{reportData.summary}</p>
            </CardContent>
          </Card>

          {/* Key Points */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Key Points
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(reportData.keyPoints.join("\n"), "keypoints")}
                className="hover:bg-white/10"
              >
                {copiedSection === "keypoints" ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {reportData.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-purple-500/30">
                      <span className="text-xs font-medium text-purple-400">{index + 1}</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{point}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-cyan-400" />
                Insights
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(reportData.insights.join("\n"), "insights")}
                className="hover:bg-white/10"
              >
                {copiedSection === "insights" ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {reportData.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-cyan-500/30">
                      <Lightbulb className="w-3 h-3 text-cyan-400" />
                    </div>
                    <p className="text-gray-300 leading-relaxed">{insight}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Actionable Takeaways */}
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Actionable Takeaways
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(reportData.actionableTakeaways.join("\n"), "takeaways")}
                className="hover:bg-white/10"
              >
                {copiedSection === "takeaways" ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {reportData.actionableTakeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-green-500/30">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    </div>
                    <p className="text-gray-300 leading-relaxed">{takeaway}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
