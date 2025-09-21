import type { ReportData } from "./gemini-client"

export function generateMarkdownReport(reportData: ReportData, fileName: string): string {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `# startupEval AI Analysis Report: ${fileName}

*Generated on ${currentDate}*

---

## 📋 Document Summary

${reportData.summary}

---

## 🔑 Key Points

${reportData.keyPoints.map((point, index) => `${index + 1}. ${point}`).join("\n\n")}

---

## 💡 Insights

${reportData.insights.map((insight, index) => `${index + 1}. ${insight}`).join("\n\n")}

---

## ✅ Actionable Takeaways

${reportData.actionableTakeaways.map((takeaway, index) => `${index + 1}. ${takeaway}`).join("\n\n")}

---

## 📊 Document Metrics

| Metric | Value |
|--------|-------|
| **Word Count** | ${reportData.wordCount.toLocaleString()} |
| **Estimated Reading Time** | ${reportData.readingTime} minutes |
| **Sentiment** | ${reportData.sentiment.charAt(0).toUpperCase() + reportData.sentiment.slice(1)} |
| **Key Points** | ${reportData.keyPoints.length} |
| **Insights** | ${reportData.insights.length} |
| **Actionable Items** | ${reportData.actionableTakeaways.length} |

---

*This report was generated using startupEval AI-powered analysis. Results may vary based on document content and complexity.*
`
}

export function generateJSONReport(reportData: ReportData, fileName: string): string {
  const exportData = {
    metadata: {
      fileName,
      generatedAt: new Date().toISOString(),
      version: "1.0",
    },
    analysis: reportData,
  }

  return JSON.stringify(exportData, null, 2)
}

export function generateCSVReport(reportData: ReportData): string {
  const csvData = [
    ["Section", "Content"],
    ["Summary", reportData.summary],
    ...reportData.keyPoints.map((point, index) => [`Key Point ${index + 1}`, point]),
    ...reportData.insights.map((insight, index) => [`Insight ${index + 1}`, insight]),
    ...reportData.actionableTakeaways.map((takeaway, index) => [`Takeaway ${index + 1}`, takeaway]),
    ["Word Count", reportData.wordCount.toString()],
    ["Reading Time", `${reportData.readingTime} minutes`],
    ["Sentiment", reportData.sentiment],
  ]

  return csvData.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n")
}

export function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function getFileNameWithoutExtension(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, "")
}
