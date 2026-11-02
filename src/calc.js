// 纯函数计算逻辑：表达式以字符串保存，运算符用 + - × ÷
export const ERROR = '错误'
export const initial = { expr: '', done: false }

const isOp = (c) => '+-×÷'.includes(c)

// 先乘除后加减；除零返回 null。不使用 eval。
export function evaluate(expr) {
  const parts = expr.split(/([+\-×÷])/)
  if (parts[0] === '' && parts[1] === '-') parts.splice(0, 3, '-' + parts[2]) // 前导负号
  const nums = [Number(parts[0])]
  const addOps = []
  for (let i = 1; i < parts.length; i += 2) {
    const op = parts[i]
    const n = Number(parts[i + 1])
    if (op === '×') nums.push(nums.pop() * n)
    else if (op === '÷') {
      if (n === 0) return null
      nums.push(nums.pop() / n)
    } else {
      addOps.push(op)
      nums.push(n)
    }
  }
  const r = addOps.reduce((acc, op, i) => (op === '+' ? acc + nums[i + 1] : acc - nums[i + 1]), nums[0])
  if (!Number.isFinite(r)) return null
  // ponytail: 12 位有效数字消除浮点误差（0.1+0.2）；极大/极小数会变成科学计数法，需要时再换 decimal 库
  return parseFloat(r.toPrecision(12))
}

// 处理一次按键，返回新状态。key: '0'-'9' '.' '+' '-' '×' '÷' '=' 'C' 'back'
export function press(state, key) {
  const { expr, done } = state
  const fresh = done || expr === ERROR

  if (key === 'C') return initial
  if (key === 'back') return fresh ? initial : { expr: expr.slice(0, -1), done: false }

  if (/^\d$/.test(key)) return { expr: fresh ? key : expr + key, done: false }

  if (key === '.') {
    if (fresh) return { expr: '0.', done: false }
    const current = expr.split(/[+\-×÷]/).pop()
    if (current.includes('.')) return state
    return { expr: expr + (current === '' ? '0.' : '.'), done: false }
  }

  if (isOp(key)) {
    if (expr === ERROR || expr === '') return state
    const base = isOp(expr.at(-1)) ? expr.slice(0, -1) : expr
    return { expr: base + key, done: false }
  }

  if (key === '=') {
    if (expr === '' || fresh) return state
    const r = evaluate(isOp(expr.at(-1)) ? expr.slice(0, -1) : expr)
    return { expr: r === null ? ERROR : String(r), done: true }
  }

  return state
}
