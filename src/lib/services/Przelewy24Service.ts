/**
 * Serwis Przelewy24
 * 
 * Obsługuje komunikację z API Przelewy24:
 * - Rejestracja transakcji
 * - Weryfikacja płatności
 * - Generowanie podpisów
 * 
 * Na podstawie testów połączenia i dokumentacji P24 API 3.2
 */

import crypto from 'crypto'
import { P24Config, P24TransactionData, P24PaymentResult, P24VerificationResult, P24Error } from '@/lib/types/przelewy24'
import { P24RegisterRequest, P24VerifyRequest, P24RegisterResponse, P24VerifyResponse, P24WebhookData } from '@/lib/types/przelewy24'
import { getP24Config } from '@/lib/config/przelewy24'

export class Przelewy24Service {
  private config: P24Config

  constructor() {
    this.config = getP24Config()
  }

  /**
   * Generuje podpis zgodny z P24 API 3.2
   * Format: SHA384(JSON.stringify({sessionId, merchantId, amount, currency, crc}))
   */
  private generateSign(data: {
    sessionId: string
    merchantId: number
    amount: number
    currency: string
  }): string {
    const signData = {
      sessionId: data.sessionId,
      merchantId: data.merchantId,
      amount: data.amount,
      currency: data.currency,
      crc: this.config.crcKey
    }

    const jsonString = JSON.stringify(signData)
    return crypto.createHash('sha384').update(jsonString).digest('hex')
  }

  /**
   * Generuje nagłówek Basic Auth dla P24 API
   * Format: posId:reportKey (nie merchantId:apiKey!)
   */
  private getBasicAuthHeader(): string {
    const credentials = Buffer.from(`${this.config.posId}:${this.config.reportKey}`).toString('base64')
    return `Basic ${credentials}`
  }

  /**
   * Rejestruje transakcję w P24
   */
  async registerTransaction(transactionData: P24TransactionData): Promise<P24PaymentResult> {
    try {
      console.log('🔄 P24Service: Rejestracja transakcji', transactionData)
      console.log('🔄 P24Service: Konfiguracja P24', {
        merchantId: this.config.merchantId,
        posId: this.config.posId,
        environment: this.config.environment,
        apiUrl: this.config.apiUrl
      })

      // Konwertuj kwotę na grosze (P24 wymaga)
      const amountInCents = Math.round(transactionData.amount * 100)
      console.log('🔄 P24Service: Kwota w groszach', amountInCents)

      // Generuj podpis
      const sign = this.generateSign({
        sessionId: transactionData.sessionId,
        merchantId: this.config.merchantId,
        amount: amountInCents,
        currency: transactionData.currency
      })
      console.log('🔄 P24Service: Wygenerowany podpis', sign)

      // Przygotuj dane żądania
      const requestData: P24RegisterRequest = {
        merchantId: this.config.merchantId,
        posId: this.config.posId,
        sessionId: transactionData.sessionId,
        amount: amountInCents,
        currency: transactionData.currency,
        description: transactionData.description,
        email: transactionData.email,
        country: transactionData.country,
        urlReturn: this.config.urlReturn,
        urlStatus: this.config.urlStatus,
        sign
      }

      console.log('🔄 P24Service: Dane żądania', requestData)

      // Wyślij żądanie do P24
      const response = await fetch(`${this.config.apiUrl}/transaction/register`, {
        method: 'POST',
        headers: {
          'Authorization': this.getBasicAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      const responseData = await response.json()
      console.log('🔄 P24Service: Odpowiedź P24', responseData)

      if (!response.ok) {
        throw new P24Error(
          `Błąd rejestracji P24: ${responseData.error || response.statusText}`,
          'REGISTER_ERROR',
          response.status
        )
      }

      if (responseData.responseCode !== 0) {
        throw new P24Error(
          `P24 zwróciło błąd: ${responseData.error}`,
          'P24_ERROR',
          responseData.responseCode
        )
      }

      // Zwróć URL płatności
      const paymentUrl = `${this.config.apiUrl.replace('/api/v1', '')}/trnRequest/${responseData.data.token}`

      return {
        success: true,
        token: responseData.data.token,
        paymentUrl
      }

    } catch (error) {
      console.error('❌ P24Service: Błąd rejestracji', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Nieznany błąd rejestracji'
      }
    }
  }

  /**
   * Weryfikuje transakcję po webhook
   */
  async verifyTransaction(sessionId: string, orderId: number, amount: number): Promise<P24VerificationResult> {
    try {
      console.log('🔄 P24Service: Weryfikacja transakcji', { sessionId, orderId, amount })

      // Konwertuj kwotę na grosze
      const amountInCents = Math.round(amount * 100)

      // Generuj podpis
      const sign = this.generateSign({
        sessionId,
        merchantId: this.config.merchantId,
        amount: amountInCents,
        currency: 'PLN'
      })

      // Przygotuj dane żądania
      const requestData: P24VerifyRequest = {
        merchantId: this.config.merchantId,
        posId: this.config.posId,
        sessionId,
        amount: amountInCents,
        currency: 'PLN',
        orderId,
        sign
      }

      console.log('🔄 P24Service: Dane weryfikacji', requestData)

      // Wyślij żądanie do P24
      const response = await fetch(`${this.config.apiUrl}/transaction/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': this.getBasicAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      const responseData = await response.json()
      console.log('🔄 P24Service: Odpowiedź weryfikacji', responseData)

      if (!response.ok) {
        throw new P24Error(
          `Błąd weryfikacji P24: ${responseData.error || response.statusText}`,
          'VERIFY_ERROR',
          response.status
        )
      }

      if (responseData.responseCode !== 0) {
        throw new P24Error(
          `P24 zwróciło błąd weryfikacji: ${responseData.error}`,
          'P24_VERIFY_ERROR',
          responseData.responseCode
        )
      }

      return {
        success: true,
        verified: true,
        orderId: responseData.data.orderId,
        methodId: responseData.data.methodId
      }

    } catch (error) {
      console.error('❌ P24Service: Błąd weryfikacji', error)
      
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Nieznany błąd weryfikacji'
      }
    }
  }

  /**
   * Weryfikuje podpis webhook (zabezpieczenie)
   */
  verifyWebhookSignature(webhookData: P24WebhookData): boolean {
    try {
      const expectedSign = this.generateSign({
        sessionId: webhookData.sessionId,
        merchantId: webhookData.merchantId,
        amount: webhookData.amount,
        currency: webhookData.currency
      })

      return expectedSign === webhookData.sign
    } catch (error) {
      console.error('❌ P24Service: Błąd weryfikacji podpisu webhook', error)
      return false
    }
  }

  /**
   * Pobiera URL płatności na podstawie tokenu
   */
  getPaymentUrl(token: string): string {
    return `${this.config.apiUrl.replace('/api/v1', '')}/trnRequest/${token}`
  }

  /**
   * Sprawdza czy konfiguracja jest poprawna
   */
  validateConfig(): boolean {
    try {
      getP24Config()
      return true
    } catch (error) {
      console.error('❌ P24Service: Nieprawidłowa konfiguracja', error)
      return false
    }
  }
}

// Eksportuj instancję singleton
export const p24Service = new Przelewy24Service()
