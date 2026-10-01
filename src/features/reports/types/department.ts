import type { z } from 'zod'
import type { departmentListResponseSchema, departmentSchema } from '../schemas/department.schema'

export interface Department {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export function mapDepartment(dto: z.infer<typeof departmentSchema>): Department {
  return dto
}

export function mapDepartmentListResponse(dto: z.infer<typeof departmentListResponseSchema>): Department[] {
  return dto.data.map(mapDepartment)
}
