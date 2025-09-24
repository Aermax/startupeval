import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export interface ChartData {
  type: "line" | "bar"
  title: string
  data: { name: string; value: number }[]
}

export interface ReportData {
  summary: { title: string; content: string }
  keyMetrics: { title: string; metrics: { name: string; value: string | number }[] }
  charts: ChartData[]
  insights: { title: string; content: string[] }
  risks: { title: string; content: string[] }
  sentiment: { title: string; score: number; analysis: string }
}

export async function generateReport(text: string): Promise<ReportData> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set")
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
Analyze the following document(s) and provide a comprehensive report in a bento-grid-friendly JSON format. The structure should be as follows:

{
  "summary": {
    "title": "Executive Summary",
    "content": "A concise 2-3 sentence summary of the main content."
  },
  "keyMetrics": {
    "title": "Key Metrics",
    "metrics": [
      { "name": "Metric Name 1", "value": "Value 1" },
      { "name": "Metric Name 2", "value": "Value 2" }
    ]
  },
  "charts": [
    {
      "type": "line",
      "title": "Financial Projections",
      "data": [
        { "name": "Q1 2024", "value": 10000 },
        { "name": "Q2 2024", "value": 15000 }
      ]
    }
  ],
  "insights": {
    "title": "Key Insights",
    "content": [
      "Insight 1",
      "Insight 2"
    ]
  },
  "risks": {
    "title": "Potential Risks",
    "content": [
      "Risk 1",
      "Risk 2"
    ]
  },
  "sentiment": {
    "title": "Sentiment Analysis",
    "score": 75,
    "analysis": "The document exhibits a positive sentiment, focusing on growth and opportunities."
  }
}

IMPORTANT: For the 'charts' array, only include a chart object if you can extract meaningful, accurate, and relevant data from the document that can be visualized as a line or bar chart. If no such data is available, return an empty array for 'charts'.

Document(s) to analyze:
${text}

Please ensure the response is valid JSON only, with no additional text or formatting.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const responseText = response.text()

    const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, "").trim()

    try {
      const reportData = JSON.parse(cleanedResponse) as ReportData

      if (!reportData.summary || !reportData.keyMetrics) {
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
