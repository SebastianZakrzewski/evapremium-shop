import { NextRequest, NextResponse } from 'next/server'
import { submitContactMessage } from '@/lib/contact/submitContactMessage'

export const dynamic = 'force-dynamic'

const readClientIp = (request: NextRequest): string => {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }

  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

export const POST = async (request: NextRequest) => {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Sprawdź pola formularza i spróbuj ponownie.' },
      { status: 400 }
    )
  }

  const result = await submitContactMessage({
    body,
    ip: readClientIp(request),
  })

  return NextResponse.json(result.body, { status: result.status })
}
