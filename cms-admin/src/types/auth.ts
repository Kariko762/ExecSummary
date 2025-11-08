// Authentication & User Management Types

export interface UserPermissions {
  parentApp: {
    canView: boolean;
    canEdit: boolean;
  };
  cmsAdmin: {
    canView: boolean;
    canEdit: boolean;
    canManageUsers: boolean;
    canManageSettings: boolean;
  };
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: UserPermissions;
  createdAt: string;
  lastLogin: string | null;
  isActive: boolean;
}

export interface Role {
  name: string;
  description: string;
  defaultPermissions: UserPermissions;
}

export interface UsersData {
  users: User[];
  roles: Record<'admin' | 'editor' | 'viewer', Role>;
  version: string;
  lastUpdated: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthSession {
  userId: string;
  username: string;
  role: string;
  permissions: UserPermissions;
  loginTime: string;
  expiresAt: string;
}
