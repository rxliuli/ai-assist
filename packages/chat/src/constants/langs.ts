// ref: https://www.techonthenet.com/js/language_tags.php
export type Lang =
  | 'ar-SA'
  | 'bn-BD'
  | 'bn-IN'
  | 'cs-CZ'
  | 'da-DK'
  | 'de-AT'
  | 'de-CH'
  | 'de-DE'
  | 'el-GR'
  | 'en-AU'
  | 'en-CA'
  | 'en-GB'
  | 'en-IE'
  | 'en-IN'
  | 'en-NZ'
  | 'en-US'
  | 'en-ZA'
  | 'es-AR'
  | 'es-CL'
  | 'es-CO'
  | 'es-ES'
  | 'es-MX'
  | 'es-US'
  | 'fi-FI'
  | 'fr-BE'
  | 'fr-CA'
  | 'fr-CH'
  | 'fr-FR'
  | 'he-IL'
  | 'hi-IN'
  | 'hu-HU'
  | 'id-ID'
  | 'it-CH'
  | 'it-IT'
  | 'ja-JP'
  | 'ko-KR'
  | 'nl-BE'
  | 'nl-NL'
  | 'no-NO'
  | 'pl-PL'
  | 'pt-BR'
  | 'pt-PT'
  | 'ro-RO'
  | 'ru-RU'
  | 'sk-SK'
  | 'sv-SE'
  | 'ta-IN'
  | 'ta-LK'
  | 'th-TH'
  | 'tr-TR'
  | 'zh-CN'
  | 'zh-HK'
  | 'zh-TW'

export const langList = [
  {
    k: 'ar-SA',
    v: 'العربية (المملكة العربية السعودية)',
  },
  {
    k: 'bn-BD',
    v: 'বাংলা (বাংলাদেশ)',
  },
  {
    k: 'bn-IN',
    v: 'বাংলা (ভারত)',
  },
  {
    k: 'cs-CZ',
    v: 'čeština (Česká republika)',
  },
  {
    k: 'da-DK',
    v: 'dansk (Danmark)',
  },
  {
    k: 'de-AT',
    v: 'Österreichisches Deutsch',
  },
  {
    k: 'de-CH',
    v: 'Schweizer Hochdeutsch',
  },
  {
    k: 'de-DE',
    v: 'Standarddeutsch (wie es in Deutschland gesprochen wird)',
  },
  {
    k: 'el-GR',
    v: 'Νέα Ελληνικά (Ελλάδα)',
  },
  {
    k: 'en-AU',
    v: 'Australian English',
  },
  {
    k: 'en-CA',
    v: 'Canadian English',
  },
  {
    k: 'en-GB',
    v: 'British English',
  },
  {
    k: 'en-IE',
    v: 'Irish English',
  },
  {
    k: 'en-IN',
    v: 'Indian English',
  },
  {
    k: 'en-NZ',
    v: 'New Zealand English',
  },
  {
    k: 'en-US',
    v: 'English',
  },
  {
    k: 'en-ZA',
    v: 'English (South Africa)',
  },
  {
    k: 'es-AR',
    v: 'Español de Argentina',
  },
  {
    k: 'es-CL',
    v: 'Español de Chile',
  },
  {
    k: 'es-CO',
    v: 'Español de Colombia',
  },
  {
    k: 'es-ES',
    v: 'Español de España',
  },
  {
    k: 'es-MX',
    v: 'Español de México',
  },
  {
    k: 'es-US',
    v: 'Español de Estados Unidos',
  },
  {
    k: 'fi-FI',
    v: 'Suomi (Suomi)',
  },
  {
    k: 'fr-BE',
    v: 'français de Belgique',
  },
  {
    k: 'fr-CA',
    v: 'français canadien',
  },
  {
    k: 'fr-CH',
    v: 'français suisse',
  },
  {
    k: 'fr-FR',
    v: 'français standard (surtout en France)',
  },
  {
    k: 'he-IL',
    v: 'עברית (ישראל)',
  },
  {
    k: 'hi-IN',
    v: 'हिन्दी (भारत)',
  },
  {
    k: 'hu-HU',
    v: 'Magyar (Magyarország)',
  },
  {
    k: 'id-ID',
    v: 'Bahasa Indonesia (Indonesia)',
  },
  {
    k: 'it-CH',
    v: 'Italiano svizzero',
  },
  {
    k: 'it-IT',
    v: 'Italiano standard (come si parla in Italia)',
  },
  {
    k: 'ja-JP',
    v: '日本語 (日本)',
  },
  {
    k: 'ko-KR',
    v: '한국어 (대한민국)',
  },
  {
    k: 'nl-BE',
    v: 'Nederlands van België',
  },
  {
    k: 'nl-NL',
    v: 'Standaard Nederlands (zoals gesproken in Nederland)',
  },
  {
    k: 'no-NO',
    v: 'Norsk (Norge)',
  },
  {
    k: 'pl-PL',
    v: 'Polski (Polska)',
  },
  {
    k: 'pt-BR',
    v: 'Português do Brasil',
  },
  {
    k: 'pt-PT',
    v: 'Português europeu (como escrito e falado em Portugal)',
  },
  {
    k: 'ro-RO',
    v: 'Română (România)',
  },
  {
    k: 'ru-RU',
    v: 'Русский (Россия)',
  },
  {
    k: 'sk-SK',
    v: 'Slovenčina (Slovenská republika)',
  },
  {
    k: 'sv-SE',
    v: 'Svenska (Sverige)',
  },
  {
    k: 'ta-IN',
    v: 'தமிழ் (இந்தியா)',
  },
  {
    k: 'ta-LK',
    v: 'தமிழ் (இலங்கை)',
  },
  {
    k: 'th-TH',
    v: 'ไทย (ประเทศไทย)',
  },
  {
    k: 'tr-TR',
    v: 'Türkçe (Türkiye)',
  },
  {
    k: 'zh-CN',
    v: '简体中文（中国大陆）',
  },
  {
    k: 'zh-HK',
    v: '繁體中文（香港特別行政區）',
  },
  {
    k: 'zh-TW',
    v: '繁體中文（台灣）',
  },
]
