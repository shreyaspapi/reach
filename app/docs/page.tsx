"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function DocsPage() {
  const [docsContent, setDocsContent] = useState<string>("")

  useEffect(() => {
    // Fetch the markdown content
    fetch("/LUNO_TECHNICAL_DOCS.md")
      .then((res) => res.text())
      .then((text) => setDocsContent(text))
      .catch((err) => {
        console.error("Failed to load docs:", err)
        setDocsContent("# Documentation\n\nFailed to load documentation.")
      })
  }, [])

  // Simple markdown to HTML converter for basic formatting
  const renderMarkdown = (markdown: string) => {
    let html = markdown
      // Code blocks first (before other processing)
      .replace(/```([\s\S]*?)```/gim, (match, code) => {
        return `<pre class="bg-reach-blue/10 border-2 border-reach-blue p-4 rounded my-4 overflow-x-auto"><code class="font-mono text-sm whitespace-pre">${code.trim()}</code></pre>`
      })
      // Inline code
      .replace(/`([^`]+)`/gim, '<code class="bg-reach-blue/10 px-1.5 py-0.5 rounded font-mono text-sm">$1</code>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-reach-blue">$1</strong>')
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-8 mb-4 text-reach-blue">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-10 mb-6 text-reach-blue border-b-2 border-reach-blue pb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-12 mb-8 text-reach-blue">$1</h1>')
      // Line breaks
      .replace(/<br\s*\/?>/gim, '<br />')

    // Handle tables
    const lines = html.split('\n')
    const processedLines: string[] = []
    let inTable = false
    let tableRows: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const isTableRow = line.trim().startsWith('|') && line.trim().endsWith('|')
      const isTableSeparator = isTableRow && line.includes('---')

      if (isTableRow && !inTable) {
        inTable = true
        tableRows = [line]
      } else if (isTableRow && inTable) {
        if (isTableSeparator) {
          // Skip separator row
          continue
        }
        tableRows.push(line)
      } else if (!isTableRow && inTable) {
        // End of table, render it
        if (tableRows.length > 0) {
          processedLines.push('<table class="w-full border-collapse border-2 border-reach-blue my-6">')
          tableRows.forEach((row, idx) => {
            const cells = row.split('|').filter(c => c.trim())
            const tag = idx === 0 ? 'th' : 'td'
            const cellClass = idx === 0 
              ? 'border border-reach-blue bg-reach-blue/20 px-4 py-3 font-bold text-left'
              : 'border border-reach-blue/30 px-4 py-2'
            processedLines.push(`<tr>`)
            cells.forEach(cell => {
              processedLines.push(`<${tag} class="${cellClass}">${cell.trim()}</${tag}>`)
            })
            processedLines.push(`</tr>`)
          })
          processedLines.push('</table>')
        }
        inTable = false
        tableRows = []
        processedLines.push(line)
      } else {
        processedLines.push(line)
      }
    }

    // Handle remaining table if file ends with table
    if (inTable && tableRows.length > 0) {
      processedLines.push('<table class="w-full border-collapse border-2 border-reach-blue my-6">')
      tableRows.forEach((row, idx) => {
        const cells = row.split('|').filter(c => c.trim())
        const tag = idx === 0 ? 'th' : 'td'
        const cellClass = idx === 0 
          ? 'border border-reach-blue bg-reach-blue/20 px-4 py-3 font-bold text-left'
          : 'border border-reach-blue/30 px-4 py-2'
        processedLines.push(`<tr>`)
        cells.forEach(cell => {
          processedLines.push(`<${tag} class="${cellClass}">${cell.trim()}</${tag}>`)
        })
        processedLines.push(`</tr>`)
      })
      processedLines.push('</table>')
    }

    html = processedLines.join('\n')

    // Handle lists
    html = html
      .split('\n')
      .map((line) => {
        if (line.trim().match(/^\d+\.\s+/)) {
          const content = line.replace(/^\d+\.\s+/, '')
          return `<li class="ml-6 mb-2 list-decimal">${content}</li>`
        }
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
          const content = line.replace(/^[\*\-\+]\s+/, '')
          return `<li class="ml-6 mb-2 list-disc">${content}</li>`
        }
        return line
      })
      .join('\n')

    // Wrap consecutive list items in ul/ol
    html = html.replace(/(<li[^>]*>.*?<\/li>(?:\s*<li[^>]*>.*?<\/li>)*)/gim, (match) => {
      if (match.includes('list-decimal')) {
        return `<ol class="mb-4 space-y-1">${match}</ol>`
      }
      return `<ul class="mb-4 space-y-1">${match}</ul>`
    })

    // Handle paragraphs (non-empty lines that aren't already HTML tags)
    html = html
      .split('\n\n')
      .map((block) => {
        if (!block.trim()) return ''
        if (block.trim().startsWith('<') || block.trim().startsWith('|')) return block
        if (block.includes('<h') || block.includes('<p') || block.includes('<ul') || block.includes('<ol') || block.includes('<table') || block.includes('<pre')) return block
        return `<p class="mb-4 leading-relaxed">${block}</p>`
      })
      .join('\n\n')

    return { __html: html }
  }

  return (
    <main className="min-h-screen px-6 py-8 safe-area-inset">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link 
            href="/"
            className="font-mono text-sm text-reach-blue/70 hover:text-reach-blue transition-colors uppercase tracking-widest"
          >
            ← Back
          </Link>
          <div className="inline-block border-2 border-reach-blue px-4 py-1.5 bg-reach-blue text-reach-paper transform -rotate-1">
            <span className="font-mono text-xs font-bold tracking-widest uppercase">Technical Docs</span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-reach-paper/50 border-2 border-reach-blue p-8 rounded-lg">
          {docsContent ? (
            <div 
              className="prose prose-blue max-w-none"
              dangerouslySetInnerHTML={renderMarkdown(docsContent)}
            />
          ) : (
            <div className="text-center py-12">
              <p className="font-mono text-reach-blue/60">Loading documentation...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="font-mono text-xs text-reach-blue/50 tracking-wider uppercase">
            Luno Protocol v1.1
          </p>
        </div>
      </div>
    </main>
  )
}
