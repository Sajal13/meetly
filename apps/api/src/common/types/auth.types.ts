export interface UserAuthContext {
  id: string;
  phoneOrEmail: string;
}

export interface AdminAuthContext {
  id: string;
  email: string;
  roleIds: string[];
  roles: string[];
  permissions: string[];
}

export interface AccessTokenPayload {
  sub: string;
  type: 'user' | 'admin';
}

export type SubjectType = AccessTokenPayload['type'];

export interface RefreshTokenPayload {
  sub: string;
  type: SubjectType;
  jti: string;
}

export interface AdminMfaPayload {
  sub: string;
  purpose: 'admin-mfa';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
}

export interface SessionMeta {
  userAgent?: string;
  ip?: string;
}

export interface RefreshContext extends RefreshTokenPayload {
  refreshToken: string;
}
