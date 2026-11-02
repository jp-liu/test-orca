import { describe, it, expect } from 'vitest'
import { press, initial, ERROR } from './calc.js'

const run = (keys, state = initial) => [...keys].reduce(press, state).expr

describe('calc', () => {
  it('先乘除后加减', () => {
    expect(run('2+3×4=')).toBe('14')
    expect(run('10-6÷2=')).toBe('7')
  })
  it('小数', () => {
    expect(run('0.1+0.2=')).toBe('0.3')
    expect(run('.5×2=')).toBe('1')
    expect(run('1..2')).toBe('1.2')
  })
  it('除零显示错误', () => {
    expect(run('1÷0=')).toBe(ERROR)
    expect(run('1÷0=5')).toBe('5')
  })
  it('连续计算', () => {
    expect(run('2+3=×4=')).toBe('20')
    expect(run('2-5=+1=')).toBe('-2')
    expect(run('2+3=7')).toBe('7')
  })
})
