export function safeLocalStorageGet(key: string): any {
  const v = localStorage.getItem(key)
  if (!v) {
    return
  }
  try {
    return JSON.parse(v)
  } catch (e) {
    return
  }
}
