import { buildModelCardPath } from '@/features/brands/model/modelCardUrl'

export type EvaWidgetObjectFields = {
  brand?: string
  model?: string
  generation?: string
  bodyType?: string
}

export type EvaWidgetObject = {
  fields?: EvaWidgetObjectFields
} | null

const readField = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

export const mountModelCardObject = (object: EvaWidgetObject, host: HTMLElement): (() => void) => {
  if (!object?.fields || !(host instanceof HTMLElement)) {
    return () => undefined
  }

  const brand = readField(object.fields.brand)
  const model = readField(object.fields.model)
  const generation = readField(object.fields.generation)
  const bodyType = readField(object.fields.bodyType)

  if (!brand || !model || !generation || !bodyType) {
    return () => undefined
  }

  const frame = host.ownerDocument.createElement('iframe')
  const page = new URL(buildModelCardPath({ brand, model, generation, bodyType }), window.location.origin)
  frame.src = page.toString()
  frame.title = 'Karta modelu'
  frame.style.width = '100%'
  frame.style.height = '100%'
  frame.style.border = '0'
  frame.style.background = 'transparent'
  host.appendChild(frame)

  return () => {
    frame.remove()
  }
}
