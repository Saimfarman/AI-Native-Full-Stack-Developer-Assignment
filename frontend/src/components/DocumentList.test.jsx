import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { describe, expect, it } from 'vitest'

import DocumentList from './DocumentList'

describe('DocumentList', () => {
  it('renders owned and shared documents with ownership badges', () => {
    const documents = [
      {
        id: 1,
        title: 'Quarterly Plan',
        access_role: 'owned',
        owner: { display_name: 'Ajaia Owner' },
        updated_at: '2026-07-15T10:00:00.000Z',
      },
      {
        id: 2,
        title: 'Shared Draft',
        access_role: 'shared',
        owner: { display_name: 'Ajaia Teammate' },
        updated_at: '2026-07-15T11:00:00.000Z',
      },
    ]

    render(<DocumentList documents={documents} activeDocumentId={2} onSelect={() => {}} />)

    expect(screen.getByText('Quarterly Plan')).toBeInTheDocument()
    expect(screen.getByText('Shared Draft')).toBeInTheDocument()
    expect(screen.getAllByText('Owned')[0]).toBeInTheDocument()
    expect(screen.getByText('Shared')).toBeInTheDocument()
  })
})
