"use client"

import type React from "react"
import { useState } from "react"
import { Upload, FileText, Sparkles, ArrowRight, Zap, BarChart3, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ProcessingState } from "@/components/processing-state"
import { extractTextFromFiles, validateFiles } from "@/lib/file-processor"
import type { ReportData } from "@/lib/gemini-client"
import { ReportDashboard } from "@/components/report-dashboard"
import Image from "next/image"

type AppState = "upload" | "processing" | "report"
type ProcessingStep = "extracting" | "analyzing" | "generating" | "complete"

const MAX_CHAR_LIMIT = 3800000 // Approx. 1M tokens

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>("upload")
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [processingStep, setProcessingStep] = useState<ProcessingStep>("extracting")
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [error, setError] = useState<string>("")
  const [isOcrInProgress, setIsOcrInProgress] = useState(false)
  const [pageProgress, setPageProgress] = useState<{ current: number; total: number } | undefined>()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "text/plain" || file.type === "application/pdf",
    )

    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files].slice(0, 5)) // Max 5 files
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files].slice(0, 5)) // Max 5 files
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const updateOcrStatus = (isOcr: boolean) => {
    setIsOcrInProgress(isOcr)
  }

  const updatePageProgress = (current: number, total: number) => {
    setPageProgress({ current, total })
  }

  const handleGenerate = async () => {
    if (selectedFiles.length === 0) return

    const validation = validateFiles(selectedFiles)
    if (!validation.isValid) {
      setError(validation.error || "Invalid files")
      return
    }

    setError("")
    setAppState("processing")
    setProcessingStep("extracting")
    setPageProgress(undefined)

    try {
      let combinedText: string;
      try {
        const fileResults = await extractTextFromFiles(selectedFiles, updateOcrStatus, updatePageProgress)
        combinedText = fileResults
          .map((result) => `=== ${result.fileName} ===\n\n${result.text}`)
          .join("\n\n" + "=".repeat(50) + "\n\n")
      } catch (extractionError) {
        console.error("Error during file extraction:", extractionError);
        throw new Error("Failed to extract text from files. The file might be corrupted or in an unsupported format.");
      }

      console.log(`Extracted text length: ${combinedText.length} characters`);

      if (combinedText.length > MAX_CHAR_LIMIT) {
        setError("The document is too long to be processed. The extracted text has been truncated.");
        combinedText = combinedText.substring(0, MAX_CHAR_LIMIT);
      }

      setProcessingStep("analyzing")

      let report: ReportData;
      try {
        const response = await fetch("/api/generate-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: combinedText }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to generate report from API")
        }

        const result = await response.json()
        report = result.report
      } catch (apiError) {
        console.error("Error during API call:", apiError);
        throw new Error("Failed to generate report. The AI model may have returned an invalid response.");
      }

      setProcessingStep("generating")
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setReportData(report)

      setProcessingStep("complete")
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setAppState("report")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred while processing the files")
      setAppState("upload")
    }
  }

  const handleNewReport = () => {
    setAppState("upload")
    setSelectedFiles([])
    setReportData(null)
    setError("")
    setProcessingStep("extracting")
  }

  if (appState === "processing") {
    return <ProcessingState fileName={selectedFiles.map((f) => f.name).join(", ")} currentStep={processingStep} isOcr={isOcrInProgress} pageProgress={pageProgress} />
  }

  if (appState === "report" && reportData) {
    return (
      <ReportDashboard
        reportData={reportData}
        fileName={selectedFiles.map((f) => f.name).join(", ")}
        onNewReport={handleNewReport}
      />
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Image
        src="/logo2.png"
        alt="Logo"
        width={180}
        height={50}
        className="absolute top-4 left-4 z-20"
        priority
      />
      <div className="absolute inset-0">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black opacity-90" />

        {/* Animated stars */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
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

        {/* Larger accent stars */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-2000" />
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-emerald-400 rounded-full animate-pulse delay-500" />
        <div className="absolute bottom-1/3 right-1/2 w-1 h-1 bg-violet-400 rounded-full animate-pulse delay-1500" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300 font-medium tracking-wide">startupEval AI Analysis</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 text-balance tracking-tight">
            Upload. Analyze.{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Invest Smart.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-8 md:mb-12 max-w-2xl mx-auto text-pretty leading-relaxed px-4">
            Transform your documents into actionable insights with AI-powered analysis. Upload your files and get
            comprehensive reports in seconds.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-500/10 border border-red-500/20 p-4 mb-6 backdrop-blur-sm">
            <p className="text-red-400 text-center font-medium">{error}</p>
          </Card>
        )}

        <Card className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-4 md:p-8 mb-8 shadow-2xl">
          <div
            className={cn(
              "relative border-2 border-dashed rounded-2xl p-8 md:p-16 text-center transition-all duration-500",
              isDragOver
                ? "border-blue-400/50 bg-blue-500/5 shadow-lg shadow-blue-500/20 scale-[1.02]"
                : "border-white/20 hover:border-white/30",
              selectedFiles.length > 0 && "border-emerald-400/50 bg-emerald-500/5 shadow-lg shadow-emerald-500/20",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".txt,.pdf"
              multiple
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="flex flex-col items-center gap-6">
              {selectedFiles.length > 0 ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <FileText className="w-10 h-10 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-lg md:text-xl font-semibold text-white mb-2">
                      {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected
                    </p>
                    <p className="text-sm md:text-base text-gray-400">Ready to analyze • Up to 5 files supported</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                    <Upload className="w-10 h-10 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg md:text-xl font-semibold text-white mb-3">
                      Drop your files here or click to browse
                    </p>
                    <p className="text-sm md:text-base text-gray-400">
                      Supports .txt and .pdf files • Multiple files supported • Up to 100MB each
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-6 space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-white font-medium">{file.name}</span>
                    <span className="text-gray-400 text-sm">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="text-center mb-12 md:mb-16">
          <Button
            onClick={handleGenerate}
            disabled={selectedFiles.length === 0 || appState === "processing"}
            className="px-8 md:px-12 py-4 md:py-6 text-base md:text-lg font-semibold bg-white text-black hover:bg-gray-100 border-0 shadow-2xl shadow-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
          >
            {appState === "processing" ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin mr-3" />
                Analyzing with AI...
              </>
            ) : (
              <>
                Generate Report
                <ArrowRight className="w-5 h-5 ml-3" />
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[
            {
              icon: <Zap className="w-7 h-7" />,
              title: "AI-Powered Analysis",
              description: "Advanced Gemini 2.0 Flash extracts deep insights and patterns from your documents",
            },
            {
              icon: <FileText className="w-7 h-7" />,
              title: "Smart PDF Processing",
              description: "Intelligent text extraction from PDFs and documents with perfect formatting",
            },
            {
              icon: <BarChart3 className="w-7 h-7" />,
              title: "Visual Reports",
              description: "Interactive charts and comprehensive analytics with export capabilities",
            },
          ].map((feature, index) => (
            <Card
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 text-center hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 transition-colors">
                <div className="text-white">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
