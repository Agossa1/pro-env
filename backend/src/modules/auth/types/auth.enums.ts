/*
|--------------------------------------------------------------------------
| AUTH ENUMS
|--------------------------------------------------------------------------
| Miroir strict des types PostgreSQL définis dans 01.schema.sql.
|--------------------------------------------------------------------------
*/

export enum RoleTier {
  PLATFORM = 'platform',
  TERRITORIAL = 'territorial',
  FIELD = 'field',
}

export enum UserRoleCode {
  SUPER_ADMIN = 'super_admin',
  ADMIN_MINISTERE = 'admin_ministere',
  ADMIN_MAIRIE = 'admin_mairie',
  TECHNICIEN = 'technicien',
  PREFECTURE = 'prefecture',
  CITOYEN = 'citoyen',
}

export enum OtpType {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PHONE_VERIFICATION = 'PHONE_VERIFICATION',
  PASSWORD_RESET     = 'PASSWORD_RESET',
  TWO_FACTOR         = 'TWO_FACTOR',
}

export enum AuditAction {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}
