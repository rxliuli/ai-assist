import { UserModel } from '../../constants/db'
import { ServerError } from '../../util/ServerError'
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
    throw new ServerError('Invalid active code', 'INVALID_ACTIVE_CODE')
  }
  if (info.timestamp < Date.now()) {
    activeCodeMap.delete(req.code)
    throw new ServerError('Active code expired', 'ACTIVE_CODE_EXPIRED')
  }
  const u = await UserModel.findOne({ where: { id: info.userId } })
  if (!u) {
    throw new ServerError('No such user', 'NO_SUCH_USER')
  }
  if (u.get().emailVerified) {
    throw new ServerError('User already activated', 'USER_ALREADY_ACTIVATED')
  }
  await u.set('emailVerified', true).save()
  activeCodeMap.delete(req.code)
}
