import { describe, expect, it } from 'vitest'

import { fileNameWithoutExtension, textToHtml } from './documentImport'

describe('documentImport', () => {
  it('converts markdown-like text into structured html', () => {
    const html = textToHtml('# Heading\n\n- First\n- Second\n1. One\n2. Two\nParagraph')

    expect(html).toContain('<h1>Heading</h1>')
    expect(html).toContain('<ul><li>First</li><li>Second</li></ul>')
    expect(html).toContain('<ol><li>One</li><li>Two</li></ol>')
    expect(html).toContain('<p>Paragraph</p>')
  })

  it('removes the last extension from a file name', () => {
    expect(fileNameWithoutExtension('notes.final.md')).toBe('notes.final')
  })
})
