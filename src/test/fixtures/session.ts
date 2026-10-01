const organization = { id: 'org-1', name: 'Acme Indonesia', slug: 'acme-indonesia' }

export const employeeProfile = {
  id: 'user-employee',
  name: 'Eddie Employee',
  email: 'eddie@example.com',
  role: 'EMPLOYEE',
  mustChangePassword: false,
  organization,
  department: { id: 'dept-eng', name: 'Engineering' },
}

export const managerProfile = {
  id: 'user-manager',
  name: 'Mona Manager',
  email: 'mona@example.com',
  role: 'MANAGER',
  mustChangePassword: false,
  organization,
  department: { id: 'dept-eng', name: 'Engineering' },
}

export const adminProfile = {
  id: 'user-admin',
  name: 'Ava Admin',
  email: 'ava@example.com',
  role: 'ADMIN',
  mustChangePassword: false,
  organization,
  department: null,
}
