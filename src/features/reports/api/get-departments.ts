import { apiClient } from '@/lib/api'
import { departmentListResponseSchema } from '../schemas/department.schema'
import { mapDepartmentListResponse, type Department } from '../types/department'

// GET /departments — organization scope is derived entirely from the
// session server-side (department.service.ts listDepartments); there is no
// organizationId param to send. Open to any authenticated role (no
// requireRole on the list route), same as the report endpoints this feeds.
export async function getDepartments(): Promise<Department[]> {
  const response = await apiClient('/departments')
  return mapDepartmentListResponse(departmentListResponseSchema.parse(response))
}
