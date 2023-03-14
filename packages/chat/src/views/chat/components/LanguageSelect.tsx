import { observer } from 'mobx-react-lite'
import { getLanguage, langs, setLanguage } from '../../../constants/i18n'
import css from './LanguageSelect.module.css'

export const LanguageSelect = () => {
  const lang = getLanguage()
  return (
    <select className={css.LanguageSelect} value={lang} onChange={(ev) => setLanguage(ev.currentTarget.value as any)}>
      {langs.map((it) => (
        <option key={it.lang} value={it.lang}>
          {it.label}
        </option>
      ))}
    </select>
  )
}
