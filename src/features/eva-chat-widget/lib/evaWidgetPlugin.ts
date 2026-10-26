import { EVA_MODEL_CARD_URL } from '@/features/brands/model/modelCardUrl'
import { mountModelCardObject, type EvaWidgetObject } from './mountModelCardObject'

export const EVA_WIDGET_ID = 'eva-shop'

export const DEFAULT_EVA_WIDGET_ORIGIN = 'https://widget-xi-eight.vercel.app'

/**
 * Host contract names this file widget-plugin.js. The published origin and
 * shop snippet in the agent repo serve embed.js, which mounts the chat iframe.
 */
export const EVA_WIDGET_SCRIPT_FILE = 'embed.js'

export const EVA_CHAT_SLOT_SELECTOR = '[data-eva-chat-slot]'

export const EVA_CHAT_GREETING_TITLE = 'Cześć!'

export const EVA_CHAT_GREETING_BODY = 'Służę pomocą.'

export const EVA_WIDGET_HOST_CLASS_NAME = 'h-full w-full'

export const EVA_WIDGET_FRAME_CLASS_NAME =
  'h-full w-full border-0 bg-transparent max-md:rounded-none md:rounded-[28px]'

export type EvaWidgetShowProduct = {
  productId: string
  cardUrl: string
}

export type EvaWidgetMountObject = (object: EvaWidgetObject, host: HTMLElement) => () => void

export type EvaWidgetPluginConfig = {
  showProduct?: EvaWidgetShowProduct
  mountObject?: EvaWidgetMountObject
}

export const EVA_WIDGET_PRODUCT_ID = 'eva-model-card'

export { EVA_MODEL_CARD_URL }

export const defaultEvaWidgetPlugin = (): EvaWidgetPluginConfig => ({
  showProduct: {
    productId: EVA_WIDGET_PRODUCT_ID,
    cardUrl: EVA_MODEL_CARD_URL,
  },
  mountObject: mountModelCardObject,
})

declare global {
  interface Window {
    widgetPlugin?: EvaWidgetPluginConfig
  }
}

export const resolveEvaWidgetOrigin = (origin?: string): string => {
  const value = (origin ?? process.env.NEXT_PUBLIC_EVA_WIDGET_ORIGIN ?? DEFAULT_EVA_WIDGET_ORIGIN)
    .trim()
    .replace(/\/$/, '')

  return value || DEFAULT_EVA_WIDGET_ORIGIN
}

export const buildEvaWidgetScriptSrc = (origin?: string): string => {
  return `${resolveEvaWidgetOrigin(origin)}/${EVA_WIDGET_SCRIPT_FILE}`
}

export const buildEvaWidgetFrameSrc = (
  origin?: string,
  config?: EvaWidgetPluginConfig
): string => {
  const page = new URL(`${resolveEvaWidgetOrigin(origin)}/`)
  page.searchParams.set('widget', EVA_WIDGET_ID)

  const showProduct = config?.showProduct
  if (showProduct?.productId && showProduct.cardUrl) {
    page.searchParams.set('productId', showProduct.productId)
    page.searchParams.set('cardUrl', showProduct.cardUrl)
  }

  return page.toString()
}

export const EVA_CHAT_ICON_SRC = '/evabot.jpg'
