export type UserRole = 'catequista' | 'coordinador'

export interface User {
  id: string
  parish_id: string
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: 'bearer'
  expires_in: number
  user: User
}
