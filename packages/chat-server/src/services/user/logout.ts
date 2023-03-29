import { revokeToken } from './auth'

export async function logout(token: string): Promise<void> {
  await revokeToken(token)
}
