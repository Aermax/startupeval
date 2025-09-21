import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export interface ReportData {
  summary: string
  keyPoints: string[]
  insights: string[]
  actionableTakeaways: string[]
  wordCount: number
  readingTime: number
  sentiment: "positive" | "neutral" | "negative"
}

export async function generateReport(text: string): Promise<ReportData> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set")
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

    const prompt = `
Analyze the following document(s) and provide a comprehensive report in JSON format with the following structure:

{
  "summary": "A concise 2-3 sentence summary of the main content",
  "keyPoints": ["Array of 4-6 most important points from the document(s)"],
  "insights": ["Array of 3-5 analytical insights or patterns discovered"],
  "actionableTakeaways": ["Array of 3-5 specific actionable recommendations"],
  "wordCount": number,
  "readingTime": number (estimated minutes),
  "sentiment": "positive" | "neutral" | "negative"
}

If multiple documents are provided, analyze them collectively and provide insights that span across all documents.

Document(s) to analyze:
${text}

Please ensure the response is valid JSON only, with no additional text or formatting.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const responseText = response.text()

    // Clean the response to ensure it's valid JSON
    const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, "").trim()

    try {
      const reportData = JSON.parse(cleanedResponse) as ReportData

      // Validate the structure
      if (!reportData.summary || !Array.isArray(reportData.keyPoints)) {
        throw new Error("Invalid report structure received from AI")
      }

      return reportData
    } catch (parseError) {
      console.error("Failed to parse AI response:", cleanedResponse)
      throw new Error("Failed to parse AI response. Please try again.")
    }
  } catch (error) {
    console.error("Gemini API error:", error)
    throw new Error("Failed to generate report. Please check your API key and try again.")
  }
}

// Utility function to estimate reading time
export function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200
  const wordCount = text.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

// Utility function to count words
export function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length
}
