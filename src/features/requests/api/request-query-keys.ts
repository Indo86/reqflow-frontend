import type { RequestStatus, RequestType } from '../types/request'

export interface RequestListFilters {
  page: number
  pageSize: number
  type?: RequestType
  status?: RequestStatus
  q?: string
  // Menentukan cakupan daftar request.
  view?: 'all' | 'mine' | 'assigned'
}

// Menyusun kunci cache untuk kueri ini.
export const requestKeys = {
  all: ['requests'] as const,
  lists: () => [...requestKeys.all, 'list'] as const,
  list: (filters: RequestListFilters) => [...requestKeys.lists(), filters] as const,
  details: () => [...requestKeys.all, 'detail'] as const,
  detail: (id: string) => [...requestKeys.details(), id] as const,
  // Detail hanya menggunakan ID request sebagai kunci cache.
  audit: (id: string) => [...requestKeys.details(), id, 'audit'] as const,
}
