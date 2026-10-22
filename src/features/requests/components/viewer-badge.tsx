import { Badge } from '@/components/shared/badge'
import { describeViewer } from '../lib/describe-viewer'
import type { RequestViewer } from '../types/request'

export function ViewerBadge({ viewer }: { viewer: RequestViewer | undefined }) {
  const presentation = describeViewer(viewer)
  return presentation ? <Badge variant={presentation.variant}>{presentation.label}</Badge> : null
}
