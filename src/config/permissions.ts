export type Permission =
  | 'users:manage'
  | 'rates:manage'
  | 'reports:view'
  | 'parking:entry:create'
  | 'parking:exit:create'
  | 'customers:manage'
  | 'vehicles:manage'

export type UserRole = 'admin' | 'operator'

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  admin: [
    'users:manage',
    'rates:manage',
    'reports:view',
    'parking:entry:create',
    'parking:exit:create',
    'customers:manage',
    'vehicles:manage',
  ],
  operator: [
    'parking:entry:create',
    'parking:exit:create',
    'customers:manage',
    'vehicles:manage',
  ],
}
