import { describe, it, expect } from 'vitest'
import { addEntry, stripOp, hasOp, parseHistory, loadHistory, saveHistory, MAX, KEY } from './history.js'

const mem = () => {
  const m = new Map()
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) }
}

describe('history', () => {
  it('追加且新的在前', () => {
    const l = addEntry(addEntry([], '1+1', '2'), '2×3', '6')
    expect(l).toEqual([{ expr: '2×3', result: '6' }, { expr: '1+1', result: '2' }])
  })
  it('最多 20 条', () => {
    let l = []
    for (let i = 0; i < 25; i++) l = addEntry(l, `${i}`, `${i}`)
    expect(l).toHaveLength(MAX)
    expect(l[0].expr).toBe('24')
    expect(l.at(-1).expr).toBe('5')
  })
  it('去掉末尾运算符', () => {
    expect(stripOp('2+3×')).toBe('2+3')
    expect(stripOp('2+3')).toBe('2+3')
  })
  it('只有含运算的式子才记录', () => {
    for (const e of ['5', '5×', '0.5', '-3', '-3+']) expect(hasOp(stripOp(e))).toBe(false)
    for (const e of ['2+3', '2+3×', '2-5', '-3+1', '-3×2']) expect(hasOp(stripOp(e))).toBe(true)
    expect(stripOp('2+3×')).toBe('2+3')
  })
  it('损坏数据退回空列表', () => {
    expect(parseHistory('{bad')).toEqual([])
    expect(parseHistory(null)).toEqual([])
    expect(parseHistory('{"a":1}')).toEqual([])
    expect(parseHistory('[1,{"expr":"1","result":"1"}]')).toEqual([{ expr: '1', result: '1' }])
    expect(loadHistory({ getItem: () => { throw new Error('x') } })).toEqual([])
    expect(loadHistory(undefined)).toEqual([])
  })
  it('读写往返', () => {
    const s = mem()
    saveHistory([{ expr: '1+1', result: '2' }], s)
    expect(JSON.parse(s.getItem(KEY))).toHaveLength(1)
    expect(loadHistory(s)).toEqual([{ expr: '1+1', result: '2' }])
    expect(() => saveHistory([], { setItem: () => { throw new Error('full') } })).not.toThrow()
  })
})
