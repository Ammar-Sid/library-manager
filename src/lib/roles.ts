export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  USER: 'USER',
} as const;

export type RoleName = (typeof Role)[keyof typeof Role];

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  BANNED: 'BANNED',
} as const;

export type UserStatusName = (typeof UserStatus)[keyof typeof UserStatus];

export function isUserStatus(value: string): value is UserStatusName {
  return Object.values(UserStatus).some((status) => status === value);
}
