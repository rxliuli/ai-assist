import i18next from 'i18next'
import { TranslateType } from '../i18n'
import enUS from '../i18n/en-US.json'
import zhCN from '../i18n/zh-CN.json'
import jaJP from '../i18n/ja-JP.json'
import { Lang } from './langs'

export function getLanguage() {
  return localStorage.getItem('chatLanguage') ?? navigator.language
}

export function setLanguage(lang: Lang) {
  localStorage.setItem('chatLanguage', lang)
  location.reload()
}

export const langs: { lang: Lang; label: string }[] = [
  { lang: 'en-US', label: 'English' },
  { lang: 'zh-CN', label: '简体中文' },
  { lang: 'ja-JP', label: '日本語' },
]

await i18next.init({
  lng: getLanguage(),
  fallbackLng: 'en-US',
  debug: true,
  resources: {
    'en-US': { translation: enUS },
    'zh-CN': { translation: zhCN },
    'ja-JP': { translation: jaJP },
  } as Record<Lang, { translation: any }>,
  keySeparator: false,
})

/**
 * Get the translated text according to the key
 * @param args
 */
export function t<K extends keyof TranslateType>(...args: TranslateType[K]['params']): TranslateType[K]['value'] {
  // @ts-ignore
  return i18next.t(args[0], args[1])
}
