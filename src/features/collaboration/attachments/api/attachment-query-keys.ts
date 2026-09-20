export const attachmentKeys = {
  all: ['attachments'] as const,
  request: (requestId: string) => [...attachmentKeys.all, 'request', requestId] as const,
}
