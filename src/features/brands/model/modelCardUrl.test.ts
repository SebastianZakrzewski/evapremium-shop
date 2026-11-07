import { describe, expect, it } from 'vitest'
import {
  EVA_MODEL_CARD_URL,
  buildModelCardPath,
  isPinnedModelCard,
  shouldPinShopChrome,
  matchesModelCardQuery,
  readModelCardQuery,
} from './modelCardUrl'

describe('buildModelCardPath', () => {
  it('identifies a model card by brand, model, generation and body type', () => {
    expect(
      buildModelCardPath({
        brand: 'Škoda',
        model: 'Octavia (A4)',
        generation: 'Polift 1 gen',
        bodyType: 'Liftback',
      })
    ).toBe('/modele?brand=skoda&model=octavia-a4&generation=polift-1-gen&bodyType=liftback')
  })
})

describe('readModelCardQuery', () => {
  it('ignores unfilled widget tokens', () => {
    const params = new URLSearchParams(
      'brand=skoda&model=%7Bmodel%7D&generation=%7Bgeneration%7D&bodyType=liftback'
    )

    expect(readModelCardQuery(params)).toEqual({
      brand: 'skoda',
      model: '',
      generation: '',
      bodyType: 'liftback',
    })
  })
})

describe('isPinnedModelCard', () => {
  it('requires every product key', () => {
    expect(
      isPinnedModelCard({
        brand: 'skoda',
        model: 'octavia-a4',
        generation: 'polift-1-gen',
        bodyType: 'liftback',
      })
    ).toBe(true)
    expect(
      isPinnedModelCard({
        brand: 'skoda',
        model: 'octavia-a4',
        generation: '',
        bodyType: 'liftback',
      })
    ).toBe(false)
  })
})

describe('shouldPinShopChrome', () => {
  const card = {
    brand: 'audi',
    model: 'a4',
    generation: 'b9',
    bodyType: 'sedan',
  }

  it('pins only the models catalog', () => {
    expect(shouldPinShopChrome('/modele', card)).toBe(true)
    expect(shouldPinShopChrome('/konfigurator', card)).toBe(false)
  })
})

describe('matchesModelCardQuery', () => {
  const card = {
    name: 'Octavia (A4)',
    modelFamilyKey: 'octavia-a4',
    generation: 'Polift 1 gen',
    generationDisplay: '2000-2010 rok',
    bodyType: 'liftback',
    bodyTypeDisplay: 'Liftback',
  }

  it('keeps the card when the url slugs match', () => {
    expect(
      matchesModelCardQuery(card, {
        brand: 'skoda',
        model: 'octavia-a4',
        generation: 'polift-1-gen',
        bodyType: 'liftback',
      })
    ).toBe(true)
  })

  it('drops a different body type', () => {
    expect(
      matchesModelCardQuery(card, {
        brand: 'skoda',
        model: 'octavia-a4',
        generation: 'polift-1-gen',
        bodyType: 'sedan',
      })
    ).toBe(false)
  })

  it('matches a short body type key against a longer stored value', () => {
    expect(
      matchesModelCardQuery(
        { ...card, bodyType: 'suv_5_door', bodyTypeDisplay: 'SUV' },
        {
          brand: 'skoda',
          model: 'octavia-a4',
          generation: 'polift-1-gen',
          bodyType: 'suv',
        }
      )
    ).toBe(true)
  })
})

describe('EVA_MODEL_CARD_URL', () => {
  it('keeps substitutable tokens for the widget', () => {
    expect(EVA_MODEL_CARD_URL).toBe(
      'https://www.evapremium.pl/modele?brand={brand_key}&model={model_family_key}&generation={generation}&bodyType={body_type_key}'
    )
  })
})
