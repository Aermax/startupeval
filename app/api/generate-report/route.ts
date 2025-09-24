import { type NextRequest, NextResponse } from "next/server"
import { generateReport } from "@/lib/gemini-client"

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100mb",
    },
  },
  maxDuration: 300,
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text content is required" }, { status: 400 })
    }

    if (text.length < 50) {
      return NextResponse.json({ error: "Text content is too short for meaningful analysis" }, { status: 400 })
    }

    const report = await generateReport(text)

    return NextResponse.json({ report })
  } catch (error) {
    console.error("Report generation error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to generate report. Please try again.",
      },
      { status: 500 },
    )
  }
}
