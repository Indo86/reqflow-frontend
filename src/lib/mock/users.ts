import type { MockUser } from '@/types/domain'

export const deniZaky: MockUser = {
  id: 'u-deni',
  name: 'Deni Zaky',
  initials: 'DZ',
  role: 'Employee',
  department: 'Engineering',
}

export const sarahWijaya: MockUser = {
  id: 'u-sarah',
  name: 'Sarah Wijaya',
  initials: 'SW',
  role: 'Manager',
  department: 'Engineering',
}

export const andiPratama: MockUser = {
  id: 'u-andi',
  name: 'Andi Pratama',
  initials: 'AP',
  role: 'Director',
  department: 'Operations',
}

export const rinaPutri: MockUser = {
  id: 'u-rina',
  name: 'Rina Putri',
  initials: 'RP',
  role: 'Finance',
  department: 'Finance',
}

export const adminUser: MockUser = {
  id: 'u-admin',
  name: 'Admin User',
  initials: 'AU',
  role: 'Admin',
  department: 'Operations',
}

export const mockUsers = [deniZaky, sarahWijaya, andiPratama, rinaPutri, adminUser]
