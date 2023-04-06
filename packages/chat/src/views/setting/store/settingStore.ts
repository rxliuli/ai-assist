import { observable } from 'mobx'
import { t } from '../../../constants/i18n'

export const settingStore = observable({
  title: t('setting.title'),
})
