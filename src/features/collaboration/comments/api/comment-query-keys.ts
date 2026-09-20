export const commentKeys = {
  all: ['comments'] as const,
  request: (requestId: string) => [...commentKeys.all, 'request', requestId] as const,
}
