import {
  buildEvaWidgetFrameSrc,
  defaultEvaWidgetPlugin,
  EVA_CHAT_SLOT_SELECTOR,
  EVA_WIDGET_FRAME_CLASS_NAME,
  EVA_WIDGET_HOST_CLASS_NAME,
  EVA_WIDGET_ID,
} from './evaWidgetPlugin'

const hostSelector = `[data-eva-widget-host="${EVA_WIDGET_ID}"]`

export const mountEvaChatWidget = (doc: Document, origin?: string): (() => void) => {
  const view = doc.defaultView
  if (!view) {
    return () => undefined
  }

  const plugin = defaultEvaWidgetPlugin()
  view.widgetPlugin = {
    ...plugin,
    ...view.widgetPlugin,
    showProduct: view.widgetPlugin?.showProduct ?? plugin.showProduct,
    mountObject: view.widgetPlugin?.mountObject ?? plugin.mountObject,
  }

  const slot = doc.querySelector(EVA_CHAT_SLOT_SELECTOR)
  if (!(slot instanceof HTMLElement) || slot.querySelector(hostSelector)) {
    return () => undefined
  }

  const host = doc.createElement('div')
  host.setAttribute('data-eva-widget-host', EVA_WIDGET_ID)
  host.dataset.evaPlaced = 'true'
  host.className = EVA_WIDGET_HOST_CLASS_NAME

  const frame = doc.createElement('iframe')
  frame.src = buildEvaWidgetFrameSrc(origin, view.widgetPlugin)
  frame.title = 'EVA Premium czat'
  frame.className = EVA_WIDGET_FRAME_CLASS_NAME
  host.appendChild(frame)
  slot.appendChild(host)

  return () => undefined
}
