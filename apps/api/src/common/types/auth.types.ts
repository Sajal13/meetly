export interface UserAuthContext {
  id: string;
  phoneOrEmail: string;
}

export interface AdminAuthContext {
  id: string;
  email: string;
  roleIds: string[];
  permissions: string[];
}

export interface AccessTokenPayload {
  sub: string;
  type: 'user' | 'admin';
}
