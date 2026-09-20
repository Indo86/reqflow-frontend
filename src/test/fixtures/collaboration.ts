export const sampleComment = {
  id: 'comment-1',
  content: 'Please add a vendor quote before this moves forward.',
  author: { id: 'user-manager', name: 'Mona Manager' },
  createdAt: '2026-09-10T09:00:00.000Z',
  updatedAt: '2026-09-10T09:00:00.000Z',
}

export const ownCommentByEmployee = {
  id: 'comment-2',
  content: 'Quote attached below.',
  author: { id: 'user-employee', name: 'Eddie Employee' },
  createdAt: '2026-09-10T10:00:00.000Z',
  updatedAt: '2026-09-10T10:00:00.000Z',
}

export const sampleAttachment = {
  id: 'attachment-1',
  originalName: 'vendor-quote.pdf',
  mimeType: 'application/pdf',
  size: 245_760,
  uploadedBy: { id: 'user-employee', name: 'Eddie Employee' },
  createdAt: '2026-09-10T10:05:00.000Z',
}
