import Tesseract from "tesseract.js"

declare global {
  interface Window {
    pdfjsLib: any
  }
}

async function loadPDFJS() {
  if (typeof window !== "undefined" && !window.pdfjsLib) {
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
    script.async = true

    return new Promise((resolve, reject) => {
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
        resolve(window.pdfjsLib)
      }
      script.onerror = reject
      document.head.appendChild(script)
    })
  }
  return window.pdfjsLib
}

async function extractTextFromPDF(
  file: File,
  updateOcrStatus: (isOcr: boolean) => void,
  updatePageProgress: (page: number, total: number) => void
): Promise<string> {
  try {
    await loadPDFJS()

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const numPages = pdf.numPages
    updatePageProgress(0, numPages)

    const pagePromises = Array.from({ length: numPages }, async (_, i) => {
      const pageNum = i + 1
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      updatePageProgress(pageNum, numPages)
      return textContent.items.map((item: any) => item.str).join(" ")
    })

    let pagesText = await Promise.all(pagePromises)
    let fullText = pagesText.join("\n")

    if (fullText.trim().length === 0) {
      console.log("No text layer found, falling back to OCR...")
      updateOcrStatus(true)
      updatePageProgress(0, numPages)

      const ocrPromises = Array.from({ length: numPages }, async (_, i) => {
        const pageNum = i + 1
        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale: 1.5 })
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")!
        canvas.height = viewport.height
        canvas.width = viewport.width

        await page.render({ canvasContext: context, viewport: viewport }).promise

        const ocrPromise = Tesseract.recognize(canvas, "eng", {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`[OCR Page ${pageNum}/${numPages}] Progress: ${(m.progress * 100).toFixed(2)}%`)
            }
          },
        })

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`OCR process timed out for page ${pageNum}`))
          }, 120000) // 2-minute timeout per page
        })

        const result = await Promise.race([ocrPromise, timeoutPromise])
        updatePageProgress(pageNum, numPages)
        return result.data.text
      })

      pagesText = await Promise.all(ocrPromises)
      fullText = pagesText.join("\n")

      console.log("OCR extraction complete.")
      updateOcrStatus(false)
    } else {
      console.log("Text layer extracted successfully.")
    }

    return fullText.trim()
  } catch (error) {
    updateOcrStatus(false)
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function extractTextFromFiles(
  files: File[],
  updateOcrStatus: (isOcr: boolean) => void,
  updatePageProgress: (page: number, total: number) => void
): Promise<{ fileName: string; text: string }[]> {
  const results = []

  for (const file of files) {
    try {
      let text = ""

      if (file.type === "text/plain") {
        text = await file.text()
      } else if (file.type === "application/pdf") {
        text = await extractTextFromPDF(file, updateOcrStatus, updatePageProgress)
      } else {
        throw new Error(`Unsupported file type: ${file.type}`)
      }

      if (!text || text.trim().length === 0) {
        throw new Error("No text content found in file")
      }

      results.push({
        fileName: file.name,
        text: text.trim(),
      })
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error)
      throw new Error(`Failed to process ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return results
}

export function validateFiles(files: File[]): { isValid: boolean; error?: string } {
  const maxSize = 100 * 1024 * 1024 // 100MB per file
  const maxFiles = 5
  const allowedTypes = ["text/plain", "application/pdf"]

  if (files.length === 0) {
    return { isValid: false, error: "Please select at least one file." }
  }

  if (files.length > maxFiles) {
    return { isValid: false, error: `Maximum ${maxFiles} files allowed.` }
  }

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type: ${file.name}. Please upload .txt or .pdf files only.`,
      }
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File too large: ${file.name}. Please upload files smaller than 100MB.`,
      }
    }
  }

  return { isValid: true }
}
