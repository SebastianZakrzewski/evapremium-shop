import crypto from 'crypto'
import {
  PaynowConfig,
  PaynowCreatePaymentRequest,
  PaynowCreatePaymentResponse,
  PaynowError,
  PaynowPaymentResult,
  paynowCreatePaymentResponseSchema,
} from '@/lib/types/paynow'
import { getPaynowConfig } from '@/lib/config/paynow'

interface SignatureHeaders {
  'Api-Key': string
  'Idempotency-Key': string
}

const sortObjectKeys = (value: Record<string, string>): Record<string, string> => {
  return Object.keys(value)
    .sort()
    .reduce<Record<string, string>>((acc, key) => {
      acc[key] = value[key]
      return acc
    }, {})
}

const buildSignaturePayload = (
  headers: SignatureHeaders,
  body: string,
  parameters: Record<string, string> = {}
): string => {
  const payload = {
    headers: sortObjectKeys(headers as unknown as Record<string, string>),
    parameters: sortObjectKeys(parameters),
    body,
  }

  return JSON.stringify(payload)
}

const calculateHmacBase64 = (data: string, signatureKey: string): string => {
  return crypto.createHmac('sha256', signatureKey).update(data).digest('base64')
}

export class PaynowService {
  private config: PaynowConfig | null

  constructor() {
    this.config = getPaynowConfig()
  }

  public isPaynowAvailable(): boolean {
    return this.config !== null
  }

  private getConfig(): PaynowConfig {
    if (!this.config) {
      throw new PaynowError('Paynow nie jest skonfigurowane lub wyłączone', 'PAYNOW_DISABLED', 503)
    }
    return this.config
  }

  public calculateRequestSignature(
    apiKey: string,
    idempotencyKey: string,
    body: string,
    parameters: Record<string, string> = {}
  ): string {
    const config = this.getConfig()
    const payload = buildSignaturePayload(
      {
        'Api-Key': apiKey,
        'Idempotency-Key': idempotencyKey,
      },
      body,
      parameters
    )
    return calculateHmacBase64(payload, config.signatureKey)
  }

  public verifyNotificationSignature(rawBody: string, signatureHeader: string | null): boolean {
    if (!signatureHeader) {
      return false
    }

    const config = this.getConfig()
    const calculated = calculateHmacBase64(rawBody, config.signatureKey)
    const expected = Buffer.from(signatureHeader)
    const actual = Buffer.from(calculated)

    if (expected.length !== actual.length) {
      return false
    }

    return crypto.timingSafeEqual(expected, actual)
  }

  public async createPayment(
    paymentData: PaynowCreatePaymentRequest,
    idempotencyKey: string
  ): Promise<PaynowPaymentResult> {
    const config = this.getConfig()
    const body = JSON.stringify(paymentData)
    const signature = this.calculateRequestSignature(config.apiKey, idempotencyKey, body)

    try {
      const response = await fetch(`${config.apiUrl}/v3/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Api-Key': config.apiKey,
          Signature: signature,
          'Idempotency-Key': idempotencyKey,
        },
        body,
      })

      const responseText = await response.text()
      let parsed: unknown = null

      if (responseText) {
        try {
          parsed = JSON.parse(responseText)
        } catch {
          parsed = null
        }
      }

      if (!response.ok) {
        const errorMessage =
          typeof parsed === 'object' &&
          parsed !== null &&
          'message' in parsed &&
          typeof (parsed as { message?: string }).message === 'string'
            ? (parsed as { message: string }).message
            : `Paynow API error: ${response.status}`

        return {
          success: false,
          error: errorMessage,
        }
      }

      const validated = paynowCreatePaymentResponseSchema.parse(parsed) as PaynowCreatePaymentResponse

      return {
        success: true,
        redirectUrl: validated.redirectUrl,
        paymentId: validated.paymentId,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Nieznany błąd Paynow',
      }
    }
  }

  public async getPaymentStatus(paymentId: string, idempotencyKey: string): Promise<PaynowProviderStatusResponse | null> {
    const config = this.getConfig()
    const signature = this.calculateRequestSignature(config.apiKey, idempotencyKey, '', {
      id: paymentId,
    })

    try {
      const response = await fetch(`${config.apiUrl}/v3/payments/${paymentId}/status`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Api-Key': config.apiKey,
          Signature: signature,
          'Idempotency-Key': idempotencyKey,
        },
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data as PaynowProviderStatusResponse
    } catch {
      return null
    }
  }
}

export interface PaynowProviderStatusResponse {
  paymentId: string
  status: string
  externalId?: string
  modifiedAt?: string
}

export {
  buildSignaturePayload,
  calculateHmacBase64,
}
