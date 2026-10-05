import '@testing-library/jest-dom/vitest'
import { afterEach, describe, expect, it } from 'vitest'
import { mountModelCardObject } from '../mountModelCardObject'

const host = (): HTMLDivElement => {
  const node = document.createElement('div')
  document.body.appendChild(node)
  return node
}

describe('mountModelCardObject', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('inserts the model section card for the object fields', () => {
    const target = host()

    const unmount = mountModelCardObject(
      {
        fields: {
          brand: 'Škoda',
          model: 'Octavia(A4) polift 1 gen',
          generation: '2000-2010',
          bodyType: 'liftback',
        },
      },
      target
    )

    const frame = target.querySelector('iframe')
    expect(frame).not.toBeNull()
    const page = new URL(frame?.getAttribute('src') ?? '')
    expect(page.pathname).toBe('/modele')
    expect(page.searchParams.get('brand')).toBe('skoda')
    expect(page.searchParams.get('model')).toBe('octavia-a4-polift-1-gen')
    expect(page.searchParams.get('generation')).toBe('2000-2010')
    expect(page.searchParams.get('bodyType')).toBe('liftback')
    expect(frame).toHaveAttribute('title', 'Karta modelu')

    unmount()
    expect(target.querySelector('iframe')).toBeNull()
  })

  it('mounts nothing when the object is null', () => {
    const target = host()
    const unmount = mountModelCardObject(null, target)

    expect(target.childElementCount).toBe(0)
    expect(() => unmount()).not.toThrow()
  })

  it('removes only the card it inserted', () => {
    const target = host()
    const marker = document.createElement('span')
    target.appendChild(marker)

    const unmount = mountModelCardObject(
      {
        fields: {
          brand: 'skoda',
          model: 'octavia',
          generation: '2000-2010',
          bodyType: 'liftback',
        },
      },
      target
    )

    unmount()
    expect(target.contains(marker)).toBe(true)
    expect(target.querySelector('iframe')).toBeNull()
  })
})
