// 历史记录纯函数：新的在前，最多 MAX 条
export const MAX = 20
export const KEY = 'calc-history'

export const addEntry = (list, expr, result) => [{ expr, result }, ...list].slice(0, MAX)

// 去掉末尾多余运算符，与 calc.js 的 = 分支一致
export const stripOp = (expr) => ('+-×÷'.includes(expr.at(-1)) ? expr.slice(0, -1) : expr)

export function parseHistory(raw) {
  try {
    const list = JSON.parse(raw)
    if (!Array.isArray(list)) return []
    return list.filter((e) => typeof e?.expr === 'string' && typeof e?.result === 'string').slice(0, MAX)
  } catch {
    return []
  }
}

export function loadHistory(storage = globalThis.localStorage) {
  try {
    return parseHistory(storage.getItem(KEY))
  } catch {
    return []
  }
}

export function saveHistory(list, storage = globalThis.localStorage) {
  try {
    storage.setItem(KEY, JSON.stringify(list))
  } catch {
    // 存储不可用时忽略，内存里的列表照常工作
  }
}
