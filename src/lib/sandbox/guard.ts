import { NextResponse } from 'next/server'
import { SandboxIsolationError } from './isolationPolicy'
import { assertSandboxDataPlane, isSandboxScope } from './runtime'

export const isolationErrorResponse = (error: unknown): NextResponse | null => {
  if (!(error instanceof SandboxIsolationError)) return null

  return NextResponse.json(
    {
      success: false,
      error: error.message,
      violations: error.violations,
    },
    { status: 503 }
  )
}

export const blockIfSandboxMisconfigured = (): NextResponse | null => {
  try {
    assertSandboxDataPlane()
    return null
  } catch (error) {
    const response = isolationErrorResponse(error)
    if (response) return response
    throw error
  }
}

/** CRM, P24, and abandoned-cart export stay off for the whole sandbox scope. */
export const blockSandboxSideEffects = (): NextResponse | null => {
  const blocked = blockIfSandboxMisconfigured()
  if (blocked) return blocked

  if (isSandboxScope()) {
    return NextResponse.json(
      {
        success: false,
        error: 'CRM and non-sandbox payment providers are disabled in sandbox isolation',
      },
      { status: 503 }
    )
  }

  return null
}
