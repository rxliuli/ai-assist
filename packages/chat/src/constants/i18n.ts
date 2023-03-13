import i18next from 'i18next'
import { TranslateType } from '../i18n'
import en from '../i18n/en.json'
import zh from '../i18n/zh.json'
import ja from '../i18n/ja.json'

function getDefaultLanguage() {
  const l = navigator.language
  if (l.startsWith('zh')) {
    return 'zh'
  }
  if (l.startsWith('ja')) {
    return 'ja'
  }
  return 'en'
}

await i18next.init({
  lng: getDefaultLanguage(),
  fallbackLng: 'en',
  debug: true,
  resources: {
    en: {
      translation: en,
    },
    zh: {
      translation: zh,
    },
    ja: {
      translation: ja,
    },
  },
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
