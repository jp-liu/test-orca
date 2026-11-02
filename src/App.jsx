import { useEffect, useState } from 'react'
import { press, initial } from './calc.js'

const BUTTONS = [
  ['C', 'C'], ['⌫', 'back'], ['÷', '÷'], ['×', '×'],
  ['7', '7'], ['8', '8'], ['9', '9'], ['−', '-'],
  ['4', '4'], ['5', '5'], ['6', '6'], ['+', '+'],
  ['1', '1'], ['2', '2'], ['3', '3'], ['=', '='],
  ['0', '0'], ['.', '.'],
]

const KEYMAP = { '*': '×', '/': '÷', Enter: '=', Backspace: 'back', Escape: 'C', c: 'C', C: 'C' }

export default function App() {
  const [state, setState] = useState(initial)

  useEffect(() => {
    const onKey = (e) => {
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
      <div className="display">{state.expr.replace(/-/g, '−') || '0'}</div>
      <div className="keys">
        {BUTTONS.map(([label, key]) => (
          <button key={key} className={`k-${key === '=' ? 'eq' : key === '0' ? 'zero' : 'n'}`} onClick={() => setState((s) => press(s, key))}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
