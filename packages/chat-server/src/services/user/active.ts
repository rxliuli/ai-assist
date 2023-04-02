import { UserModel } from '../../constants/db'
import { activeCodeMap } from './signup'

export interface ActiveReq {
  code: string
}

/**
 * 激活用户
 * @param req
 */
export async function active(req: ActiveReq): Promise<void> {
  const info = activeCodeMap.get(req.code)
  if (!info) {
    throw new Error('Invalid active code')
  }
  if (info.timestamp < Date.now()) {
    activeCodeMap.delete(req.code)
    throw new Error('Active code expired')
  }
  const u = await UserModel.findOne({ where: { id: info.userId } })
  if (!u) {
    throw new Error('No such user')
  }
  if (u.get().emailVerified) {
    throw new Error('User already activated')
  }
  await u.set('emailVerified', true).save()
  activeCodeMap.delete(req.code)
}
