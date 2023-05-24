import { describe, expect, it } from 'vitest'
import { generateUrl } from '../generate'

describe('generateUrl', () => {
  it('should generate a URL with width only', () => {
    const url = generateUrl({ width: 200 })
    expect(url).toBe('https://picsum.photos/200/200')
  })

  it('should generate a URL with width and height', () => {
    const url = generateUrl({ width: 200, height: 300 })
    expect(url).toBe('https://picsum.photos/200/300')
  })

  it('should generate a URL with id', () => {
    const url = generateUrl({ width: 200, height: 300, id: 237 })
    expect(url).toBe('https://picsum.photos/id/237/200/300')
  })

  it('should generate a URL with seed', () => {
    const url = generateUrl({ width: 200, height: 300, seed: 'picsum' })
    expect(url).toBe('https://picsum.photos/seed/picsum/200/300')
  })

  it('should generate a URL with grayscale', () => {
    const url = generateUrl({ width: 200, height: 300, grayscale: true })
    expect(url).toBe('https://picsum.photos/200/300?grayscale')
  })

  it('should generate a URL with blur', () => {
    const url = generateUrl({ width: 200, height: 300, blur: 2 })
    expect(url).toBe('https://picsum.photos/200/300?blur=2')
  })

  it('should generate a URL with boolean blur', () => {
    const url = generateUrl({ width: 200, height: 300, blur: true })
    expect(url).toBe('https://picsum.photos/200/300?blur')
  })

  it('should generate a URL with boolean blur', () => {
    const url = generateUrl({ width: 200, height: 300, blur: false })
    expect(url).toBe('https://picsum.photos/200/300')
  })

  it('should generate a URL with extension', () => {
    const url = generateUrl({ width: 200, height: 300, ext: 'jpg' })
    expect(url).toBe('https://picsum.photos/200/300.jpg')
  })

  it('should throw an error if both id and seed are provided', () => {
    expect(() => {
      generateUrl({ width: 200, height: 300, id: 237, seed: 'picsum' })
    }).toThrow('The "id" and "seed" parameters cannot be used together.')
  })
})
