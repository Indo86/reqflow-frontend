import { apiClient } from '@/lib/api'
import { departmentListResponseSchema } from '../schemas/department.schema'
import { mapDepartmentListResponse, type Department } from '../types/department'

// Mengambil data dari /departments.
export async function getDepartments(): Promise<Department[]> {
  const response = await apiClient('/departments')
  return mapDepartmentListResponse(departmentListResponseSchema.parse(response))
}
