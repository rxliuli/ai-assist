import { useLocalStore, useObserver } from 'mobx-react-lite'

/**
 * 声明一个状态，一般用于原始值，例如数字或者字符串
 */
export function useLocalRef<T>(value: T): { value: T } {
  return useLocalStore(() => ({ value }))
}

/**
 * 声明一个状态，一般用于非原始值，例如对象或者数组
 */
export function useLocalReactive<T extends Record<string, any>>(value: T): T {
  return useLocalStore(() => value)
}

/**
 * 声明根据状态变更运行副作用
 */
export function useLocalWatchEffect(f: () => void, dep?: () => any) {
  useObserver(() => {
    dep?.()
    return f()
  })
}

/**
 * 声明一个计算属性
 */
export function useLocalComputed<T>(f: () => T): { value: T } {
  const r = useLocalStore(() => ({
    get value() {
      return f()
    },
  }))
  return r
}
