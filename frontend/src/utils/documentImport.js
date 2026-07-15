export function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function fileNameWithoutExtension(fileName) {
  const lastDotIndex = fileName.lastIndexOf('.')
  if (lastDotIndex <= 0) {
    return fileName
  }
  return fileName.slice(0, lastDotIndex)
}

export function textToHtml(text) {
  const normalizedLines = text.replaceAll('\r\n', '\n').split('\n')
  const html = []
  let listType = null

  const closeList = () => {
    if (listType === 'ul') {
      html.push('</ul>')
    }
    if (listType === 'ol') {
      html.push('</ol>')
    }
    listType = null
  }

  normalizedLines.forEach((line) => {
    const trimmedLine = line.trim()
    if (!trimmedLine) {
      closeList()
      return
    }

    if (trimmedLine.startsWith('# ')) {
      closeList()
      html.push(`<h1>${escapeHtml(trimmedLine.slice(2).trim())}</h1>`)
      return
    }

    if (trimmedLine.startsWith('## ')) {
      closeList()
      html.push(`<h2>${escapeHtml(trimmedLine.slice(3).trim())}</h2>`)
      return
    }

    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      if (listType !== 'ul') {
        closeList()
        html.push('<ul>')
        listType = 'ul'
      }
      html.push(`<li>${escapeHtml(trimmedLine.slice(2).trim())}</li>`)
      return
    }

    const numberedMatch = trimmedLine.match(/^\d+\.\s+(.*)$/)
    if (numberedMatch) {
      if (listType !== 'ol') {
        closeList()
        html.push('<ol>')
        listType = 'ol'
      }
      html.push(`<li>${escapeHtml(numberedMatch[1].trim())}</li>`)
      return
    }

    closeList()
    html.push(`<p>${escapeHtml(trimmedLine)}</p>`)
  })

  closeList()

  return html.join('') || '<p></p>'
}
