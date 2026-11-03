import { useEffect, useRef, useState } from 'react'
import { press, initial, ERROR } from './calc.js'
import { addEntry, stripOp, hasOp, loadHistory, saveHistory } from './history.js'

const BUTTONS = [
  ['C', 'C'], ['⌫', 'back'], ['÷', '÷'], ['×', '×'],
  ['7', '7'], ['8', '8'], ['9', '9'], ['−', '-'],
  ['4', '4'], ['5', '5'], ['6', '6'], ['+', '+'],
  ['1', '1'], ['2', '2'], ['3', '3'], ['=', '='],
  ['0', '0'], ['.', '.'],
]

const KEYMAP = { '*': '×', '/': '÷', Enter: '=', Backspace: 'back', Escape: 'C', Delete: 'C', c: 'C', C: 'C' }

const fmt = (t) => t.replace(/-/g, '−')

export default function App() {
  const [state, setState] = useState(initial)
  const [history, setHistory] = useState(loadHistory)
  const prevRef = useRef(state)

  // 在 effect 里比较前后状态追加记录，避免 updater 副作用（StrictMode 会执行两次）
  useEffect(() => {
    const prev = prevRef.current
    prevRef.current = state
    const expr = stripOp(prev.expr)
    if (!prev.done && state.done && state.expr !== ERROR && hasOp(expr)) {
      setHistory((h) => addEntry(h, expr, state.expr))
    }
  }, [state])

  useEffect(() => saveHistory(history), [history])

  const recall = (result) => {
    const next = { expr: result, done: true }
    prevRef.current = next // 填回结果不算一次计算
    setState(next)
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return // 保留浏览器/系统快捷键
      const key = KEYMAP[e.key] ?? e.key
      if (!/^[\d.+\-×÷=]$|^C$|^back$/.test(key)) return
      e.preventDefault() // 避免 Enter 再次触发聚焦按钮、/ 触发浏览器查找
      setState((s) => press(s, key))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="calc">
      <div className="display">{fmt(state.expr) || '0'}</div>
      <div className="keys">
        {BUTTONS.map(([label, key]) => (
          <button key={key} className={`k-${key === '=' ? 'eq' : key === '0' ? 'zero' : 'n'}`} onClick={() => setState((s) => press(s, key))}>
            {label}
          </button>
        ))}
      </div>
      {history.length > 0 && (
        <div className="history">
          <div className="history-head">
            <span>历史</span>
            <button onClick={() => setHistory([])}>清空历史</button>
          </div>
          <ul>
            {history.map((e, i) => (
              <li key={i} onClick={() => recall(e.result)}>
                {fmt(e.expr)} = {fmt(e.result)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
