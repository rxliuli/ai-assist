declare module '@analytics/google-analytics' {
  import { AnalyticsPlugin } from 'analytics'

  interface GaOptions {
    // 必需 - 数组。Google Analytics 测量 ID
    measurementIds: string[]
    // 可选 - 布尔值。启用 Google Analytics 调试模式
    debug?: boolean
    // 可选 - 字符串。dataLayer 对象的可选名称。默认为 ga4DataLayer。
    dataLayerName?: string
    // 可选 - 字符串。dataLayer 对象的可选名称。默认为 gtag。
    gtagName?: string
    // 可选 - 对象。用于配置 ga cookie 的其他 cookie 属性
    gtagConfig?: {
      // 可选 - 布尔值。启用匿名发送到 Google Analytics 的 IP 地址。
      anonymize_ip?: boolean
      // 可选 - 字符串。用于配置 ga cookie 的其他 cookie 属性
      cookie_domain?: string
      // 可选 - 数字。用于配置 ga cookie 的其他 cookie 属性
      cookie_expires?: number
      // 可选 - 字符串。用于配置 ga cookie 的其他 cookie 属性
      cookie_prefix?: string
      // 可选 - 布尔值。用于配置 ga cookie 的其他 cookie 属性
      cookie_update?: boolean
      // 可选 - 字符串。用于配置 ga cookie 的其他 cookie 属性
      cookie_flags?: string
    }
    // 可选 - 字符串。谷歌分析脚本的自定义 URL，如果代理调用
    customScriptSrc?: string
  }

  function googleAnalytics(options: GaOptions): AnalyticsPlugin
  export default googleAnalytics
}
