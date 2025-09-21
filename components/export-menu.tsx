"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, CheckCircle } from "lucide-react"
import type { ReportData } from "@/lib/gemini-client"
import { generateMarkdownReport, downloadFile, getFileNameWithoutExtension } from "@/lib/export-utils"

interface ExportMenuProps {
  reportData: ReportData
  fileName: string
}

export function ExportMenu({ reportData, fileName }: ExportMenuProps) {
  const [isDownloaded, setIsDownloaded] = useState(false)

  const baseFileName = getFileNameWithoutExtension(fileName)

  const handleDownload = () => {
    const content = generateMarkdownReport(reportData, fileName)
    const downloadFileName = `${baseFileName}_report.md`
    const mimeType = "text/markdown"

    downloadFile(content, downloadFileName, mimeType)
    setIsDownloaded(true)

    // Reset the downloaded indicator after 2 seconds
    setTimeout(() => setIsDownloaded(false), 2000)
  }

  return (
    <Button
      onClick={handleDownload}
      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
    >
      {isDownloaded ? (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          Downloaded!
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </>
      )}
    </Button>
  )
}
