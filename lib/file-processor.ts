declare global {
  interface Window {
    pdfjsLib: any
  }
}

// Load PDF.js library dynamically
async function loadPDFJS() {
  if (typeof window !== "undefined" && !window.pdfjsLib) {
    // Load PDF.js from reliable CDN
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
    script.async = true

    return new Promise((resolve, reject) => {
      script.onload = () => {
        // Configure worker
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

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    
    await loadPDFJS()


    const arrayBuffer = await file.arrayBuffer()


    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise


    let fullText = ""

    // Process pages in batches to avoid memory issues
    const batchSize = 5
    for (let i = 1; i <= pdf.numPages; i += batchSize) {
      const batch = []
      const endPage = Math.min(i + batchSize - 1, pdf.numPages)


      for (let pageNum = i; pageNum <= endPage; pageNum++) {
        batch.push(
          pdf.getPage(pageNum).then(async (page: any) => {

            const textContent = await page.getTextContent()


            const pageText = textContent.items
              .map((item: any) => {
                // Handle different text item types
                if (item.str && item.str.trim()) {
                  return item.str
                }
                return ""
              })
              .filter((text: string) => text.length > 0)
              .join(" ")


            return pageText
          }),
        )
      }

      const batchResults = await Promise.all(batch)
      const batchText = batchResults.join("\n").trim()
      if (batchText) {
        fullText += batchText + "\n"
      }
    }

    const finalText = fullText.trim()

    return finalText
  } catch (error) {
    
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function extractTextFromFiles(files: File[]): Promise<{ fileName: string; text: string }[]> {
  const results = []

  for (const file of files) {
    try {
      let text = ""

      if (file.type === "text/plain") {
        text = await file.text()
      } else if (file.type === "application/pdf") {
        text = await extractTextFromPDF(file)
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
  const maxSize = 10 * 1024 * 1024 // 10MB per file
  const maxFiles = 5 // Maximum 5 files
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
        error: `File too large: ${file.name}. Please upload files smaller than 10MB.`,
      }
    }
  }

  return { isValid: true }
}

export function validateFile(file: File): { isValid: boolean; error?: string } {
  return validateFiles([file])
}
