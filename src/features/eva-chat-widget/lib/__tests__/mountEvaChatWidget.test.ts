import '@testing-library/jest-dom/vitest'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildEvaWidgetFrameSrc,
  DEFAULT_EVA_WIDGET_ORIGIN,
  defaultEvaWidgetPlugin,
  EVA_MODEL_CARD_URL,
  EVA_WIDGET_PRODUCT_ID,
} from '../evaWidgetPlugin'
import { mountEvaChatWidget } from '../mountEvaChatWidget'

const appendSlot = (): HTMLDivElement => {
  const slot = document.createElement('div')
  slot.setAttribute('data-eva-chat-slot', '')
  document.body.appendChild(slot)
  return slot
}

describe('buildEvaWidgetFrameSrc', () => {
  it('points at the shop widget frame', () => {
    const src = buildEvaWidgetFrameSrc(
      'https://widget-xi-eight.vercel.app/',
      defaultEvaWidgetPlugin()
    )
    const page = new URL(src)

    expect(page.origin).toBe('https://widget-xi-eight.vercel.app')
    expect(page.searchParams.get('widget')).toBe('eva-shop')
    expect(page.searchParams.get('productId')).toBe(EVA_WIDGET_PRODUCT_ID)
    expect(page.searchParams.get('cardUrl')).toBe(EVA_MODEL_CARD_URL)
  })
})

describe('mountEvaChatWidget', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    delete window.widgetPlugin
  })

  it('mounts one chat frame into the slot', () => {
    const slot = appendSlot()
    mountEvaChatWidget(document, DEFAULT_EVA_WIDGET_ORIGIN)
    mountEvaChatWidget(document, DEFAULT_EVA_WIDGET_ORIGIN)

    expect(window.widgetPlugin).toEqual(defaultEvaWidgetPlugin())
    const frames = slot.querySelectorAll('iframe')
    expect(frames).toHaveLength(1)
    expect(frames[0]).toHaveAttribute(
      'src',
      buildEvaWidgetFrameSrc(DEFAULT_EVA_WIDGET_ORIGIN, defaultEvaWidgetPlugin())
    )
    expect(frames[0]).toHaveAttribute('title', 'EVA Premium czat')
  })

  it('keeps a showProduct config that was set before mount', () => {
    appendSlot()
    window.widgetPlugin = {
      showProduct: {
        productId: 'audi-a4',
        cardUrl: 'https://evapremium.pl/karty/audi-a4',
      },
    }

    mountEvaChatWidget(document, DEFAULT_EVA_WIDGET_ORIGIN)

    expect(window.widgetPlugin.showProduct?.productId).toBe('audi-a4')
    expect(window.widgetPlugin.mountObject).toBe(defaultEvaWidgetPlugin().mountObject)
  })

  it('does not move the frame when the page DOM changes', () => {
    const slot = appendSlot()
    mountEvaChatWidget(document, DEFAULT_EVA_WIDGET_ORIGIN)
    const appends = vi.spyOn(slot, 'appendChild')

    for (let index = 0; index < 30; index += 1) {
      const node = document.createElement('span')
      document.body.appendChild(node)
      node.appendChild(document.createElement('i'))
    }

    expect(appends).not.toHaveBeenCalled()
    expect(slot.querySelectorAll('iframe')).toHaveLength(1)
  })
})
