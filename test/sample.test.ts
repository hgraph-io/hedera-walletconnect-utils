import { sample } from '../src'

describe(sample.name, () => {
  it('should say hello world', () => {
    expect(sample()).toBe('hello world')
  })
})
