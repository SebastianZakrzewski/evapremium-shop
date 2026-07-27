import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/database/supabase'
import {
  queryMatProductImages,
  type MatProductImageRow,
} from '@/features/mat-product-images/lib/queryMatProductImages'

export const maxDuration = 30

const stringParam = z.preprocess((val) => (val === null ? undefined : val), z.string().optional())
const numberParam = z.preprocess((val) => {
  if (val === null || val === undefined || val === '') {
    return undefined
  }
  const parsed = parseInt(String(val), 10)
  return Number.isNaN(parsed) ? undefined : parsed
}, z.number().optional())

const QueryParamsSchema = z.object({
  brand: stringParam,
  model: stringParam,
  year: numberParam,
  generation: stringParam,
  bodyType: stringParam,
}).passthrough()

export type MatProductImage = MatProductImageRow

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = {
      brand: searchParams.get('brand'),
      model: searchParams.get('model'),
      year: searchParams.get('year'),
      generation: searchParams.get('generation'),
      bodyType: searchParams.get('bodyType'),
    }

    console.log('🔍 API /api/mat-product-images: Fetching images with params:', queryParams)

    const validatedParams = QueryParamsSchema.parse(queryParams)

    const images = await queryMatProductImages(supabaseAdmin, {
      brand: validatedParams.brand,
      model: validatedParams.model,
      year: validatedParams.year,
      generation: validatedParams.generation,
      bodyType: validatedParams.bodyType,
    })

    console.log(`✅ API /api/mat-product-images: Found ${images.length} images`)

    return NextResponse.json({
      images,
      count: images.length,
    })
  } catch (error) {
    console.error('❌ API /api/mat-product-images: Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Nieprawidłowe parametry zapytania', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    )
  }
}
