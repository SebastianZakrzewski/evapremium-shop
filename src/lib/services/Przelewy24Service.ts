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
import { P24Config, P24TransactionData, P24PaymentResult, P24VerificationResult, P24WebhookData } from '@/lib/types/przelewy24'
import { getP24Config } from '@/lib/config/przelewy24'

// ===========================================
// TYPES & INTERFACES
// ===========================================

interface SignData {
  sessionId: string
  merchantId: number
  amount: number
  currency: string
  crcKey: string
}

interface P24RegisterRequest {
  merchantId: number
  posId: number
  sessionId: string
  amount: number
  currency: string
  description: string
  email: string
  country: string
  urlReturn: string
  urlStatus: string
  sign: string
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Generuje podpis dla webhooków P24 zgodnie z oficjalną dokumentacją
 * Format: SHA384(JSON.stringify({merchantId, posId, sessionId, amount, originAmount, currency, orderId, crc}))
 */
function generateWebhookSign(_webhookData: P24WebhookData, _crcKey: string): string {
  throw new Error('Not implemented')
}

/**
 * Generuje podpis webhooka z różnymi wariantami kolejności pól (diagnostyka)
 */
function generateWebhookSignVariants(_webhookData: P24WebhookData, _reportKey: string): Record<string, string> {
  throw new Error('Not implemented')
}

export class Przelewy24Service {
  private config: P24Config | null

  constructor() {
    this.config = getP24Config()
  }

  /**
   * Sprawdza czy P24 jest dostępne i skonfigurowane
   */
  public isP24Available(): boolean {
    return this.config !== null
  }

  /**
   * Pobiera konfigurację P24 lub rzuca błąd
   */
  private getConfig(): P24Config {
    if (!this.config) {
      throw new Error('Przelewy24 nie jest skonfigurowane lub wyłączone')
    }
    return this.config
  }

  /**
   * Generuje podpis zgodny z P24 API 3.2
   * Format: SHA384(JSON.stringify({sessionId, merchantId, amount, currency, crc}))
   */
  private async generateSign(data: SignData): Promise<string> {
    this.validateSignData(data)
    
    const signData = this.buildSignData(data)
    const jsonString = JSON.stringify(signData)
    
    return this.generateSHA384Hash(jsonString)
  }

  /**
   * Waliduje dane wejściowe dla generowania podpisu
   */
  private validateSignData(data: SignData): void {
    this.validateRequired(data.sessionId, 'sessionId cannot be null or undefined')
    this.validateRequired(data.crcKey, 'crcKey cannot be null or undefined')
    this.validateCrcKey(data.crcKey)
    this.validateMerchantId(data.merchantId)
    this.validateAmount(data.amount)
    this.validateCurrency(data.currency)
  }

  /**
   * Waliduje klucz CRC
   */
  private validateCrcKey(crcKey: string): void {
    if (crcKey === '') {
      throw new Error('crcKey cannot be empty')
    }
  }

  /**
   * Waliduje merchantId
   */
  private validateMerchantId(merchantId: number): void {
    if (typeof merchantId !== 'number' || merchantId < 0) {
      throw new Error('merchantId must be a non-negative number')
    }
  }

  /**
   * Buduje obiekt danych do podpisu zgodnie z dokumentacją P24
   */
  private buildSignData(data: SignData) {
    return {
      sessionId: data.sessionId,
      merchantId: data.merchantId,
      amount: data.amount,
      currency: data.currency,
      crc: data.crcKey
    }
  }

  /**
   * Generuje hash SHA384 z podanego stringa
   */
  private generateSHA384Hash(input: string): string {
    return crypto.createHash('sha384').update(input).digest('hex')
  }

  /**
   * Generuje nagłówek Basic Auth dla P24 API
   * Format: posId:reportKey (nie merchantId:apiKey!)
   */
  private getBasicAuthHeader(): string {
    const config = this.getConfig()
    const credentials = `${config.posId}:${config.reportKey}`
    return `Basic ${Buffer.from(credentials).toString('base64')}`
  }

  /**
   * Rejestruje transakcję w P24
   */
  async registerTransaction(transactionData: P24TransactionData): Promise<P24PaymentResult> {
    try {
      this.validateTransactionData(transactionData)
      
      const sign = await this.generateTransactionSign(transactionData)
      const requestData = this.buildRegisterRequest(transactionData, sign)
      
      const response = await this.sendRegisterRequest(requestData)
      const responseData = await response.json()
      console.log(requestData)

      if (!this.isSuccessfulResponse(response, responseData)) {
        return this.createErrorResult(responseData, response)
      }
      

      return this.createSuccessResult(responseData.data.token)
      
    } catch (error) {
      return this.createErrorResultFromException(error)
    }
  }

  /**
   * Generuje podpis dla transakcji
   */
  private async generateTransactionSign(transactionData: P24TransactionData): Promise<string> {
    const config = this.getConfig()
    return this.generateSign({
      sessionId: transactionData.sessionId,
      merchantId: config.merchantId,
      amount: transactionData.amount,
      currency: transactionData.currency,
      crcKey: config.crcKey
    })
  }

  /**
   * Buduje żądanie rejestracji transakcji
   */
  private buildRegisterRequest(transactionData: P24TransactionData, sign: string): P24RegisterRequest {
    const config = this.getConfig()
    return {
      merchantId: config.merchantId,
      posId: config.posId,
      sessionId: transactionData.sessionId,
      amount: transactionData.amount,
      currency: transactionData.currency,
      description: transactionData.description,
      email: transactionData.email,
      country: transactionData.country,
      urlReturn: config.urlReturn,
      urlStatus: config.urlStatus,
      sign
    }
  }

  /**
   * Wysyła żądanie rejestracji do P24 API
   */
  private async sendRegisterRequest(requestData: P24RegisterRequest): Promise<Response> {
    const config = this.getConfig()
    return fetch(`${config.apiUrl}/transaction/register`, {
      method: 'POST',
      headers: {
        'Authorization': this.getBasicAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
  }

  /**
   * Sprawdza czy odpowiedź jest sukcesem
   */
  private isSuccessfulResponse(response: Response, responseData: any): boolean {
    return response.ok && responseData.responseCode === 0
  }

  /**
   * Tworzy wynik błędu z odpowiedzi API
   */
  private createErrorResult(responseData: any, response: Response): P24PaymentResult {
    return {
      success: false,
      error: responseData.error || `HTTP ${response.status}: ${response.statusText}`
    }
  }

  /**
   * Tworzy wynik sukcesu
   */
  private createSuccessResult(token: string): P24PaymentResult {
    return {
      success: true,
      token,
      paymentUrl: this.getPaymentUrl(token)
    }
  }

  /**
   * Tworzy wynik błędu z wyjątku
   */
  private createErrorResultFromException(error: unknown): P24PaymentResult {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }

  /**
   * Waliduje dane transakcji
   */
  private validateTransactionData(data: P24TransactionData): void {
    this.validateRequired(data, 'Transaction data is required')
    this.validateSessionId(data.sessionId)
    this.validateAmount(data.amount)
    this.validateCurrency(data.currency)
    this.validateDescription(data.description)
    this.validateEmail(data.email)
    this.validateCountry(data.country)
  }

  /**
   * Waliduje czy obiekt nie jest null/undefined
   */
  private validateRequired<T>(value: T, message: string): asserts value is NonNullable<T> {
    if (value == null) {
      throw new Error(message)
    }
  }

  /**
   * Waliduje sessionId
   */
  private validateSessionId(sessionId: string): void {
    if (!sessionId || typeof sessionId !== 'string') {
      throw new Error('sessionId must be a non-empty string')
    }
  }

  /**
   * Waliduje kwotę
   */
  private validateAmount(amount: number): void {
    if (typeof amount !== 'number' || amount < 0) {
      throw new Error('amount must be a non-negative number')
    }
  }

  /**
   * Waliduje walutę
   */
  private validateCurrency(currency: string): void {
    if (!currency || typeof currency !== 'string') {
      throw new Error('currency must be a non-empty string')
    }
  }

  /**
   * Waliduje opis
   */
  private validateDescription(description: string): void {
    if (typeof description !== 'string') {
      throw new Error('description must be a string')
    }
  }

  /**
   * Waliduje email
   */
  private validateEmail(email: string): void {
    if (!email || typeof email !== 'string' || !this.isValidEmail(email)) {
      throw new Error('email must be a valid email address')
    }
  }

  /**
   * Waliduje kraj
   */
  private validateCountry(country: string): void {
    if (!country || typeof country !== 'string') {
      throw new Error('country must be a non-empty string')
    }
  }

  /**
   * Sprawdza czy email ma prawidłowy format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Weryfikuje transakcję po webhook przez API P24
   * Endpoint: PUT /transaction/verify
   */
  async verifyTransaction(sessionId: string, orderId: string, amount: number, currency: string = 'PLN'): Promise<P24VerificationResult> {
    try {
      const config = this.getConfig()
      
      // Generuj podpis dla weryfikacji (używa MD5, nie SHA384)
      const verifySignString = [
        config.merchantId,
        config.posId,
        sessionId,
        amount,
        currency,
        orderId,
        config.crcKey
      ].join('|')
      
      const verifySign = crypto.createHash('md5').update(verifySignString).digest('hex')
      
      const verifyData = {
        merchantId: config.merchantId,
        posId: config.posId,
        sessionId: sessionId,
        amount: amount,
        currency: currency,
        orderId: orderId,
        sign: verifySign
      }
      
      console.log('🔍 P24Service: Weryfikacja transakcji', {
        sessionId,
        orderId,
        amount,
        currency
      })
      
      const response = await fetch(`${config.apiUrl}/transaction/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': this.getBasicAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(verifyData)
      })
      
      const responseData = await response.json()
      
      if (response.ok && responseData.responseCode === 0) {
        console.log('✅ P24Service: Transakcja zweryfikowana pomyślnie')
        return {
          success: true,
          verified: true,
          orderId: responseData.data?.orderId || orderId,
          methodId: responseData.data?.methodId
        }
      } else {
        console.error('❌ P24Service: Błąd weryfikacji transakcji', {
          status: response.status,
          responseCode: responseData.responseCode,
          error: responseData.error
        })
        return {
          success: false,
          verified: false,
          error: responseData.error || `HTTP ${response.status}: ${response.statusText}`
        }
      }
    } catch (error) {
      console.error('❌ P24Service: Błąd podczas weryfikacji transakcji', error)
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Weryfikuje podpis webhook zgodnie z dokumentacją P24
   * Format podpisu: SHA384(JSON.stringify({merchantId, posId, sessionId, amount, originAmount, currency, orderId, methodId, statement, crc: crcKey}))
   * P24 wysyła podpis jako SHA384 (96 znaków)
   */
  verifyWebhookSignature(webhookData: P24WebhookData): boolean {
    try {
      const config = this.getConfig()
      
      // Format zgodny z dokumentacją P24: JSON ze wszystkimi polami + crcKey
      const signData = {
        merchantId: webhookData.merchantId,
        posId: webhookData.posId,
        sessionId: webhookData.sessionId,
        amount: webhookData.amount,
        originAmount: webhookData.originAmount,
        currency: webhookData.currency,
        orderId: webhookData.orderId,
        methodId: webhookData.methodId,
        statement: webhookData.statement,
        crc: config.crcKey
      }
      
      // Oblicz SHA384 hash z JSON string
      const calculatedSign = this.generateSHA384Hash(JSON.stringify(signData))
      
      // Porównaj z podpisem z webhook
      const isValid = calculatedSign === webhookData.sign
      
      if (!isValid) {
        console.error('❌ P24Service: Nieprawidłowy podpis webhook', {
          calculated: calculatedSign.substring(0, 20) + '...',
          received: webhookData.sign?.substring(0, 20) + '...',
          calculatedLength: calculatedSign.length,
          receivedLength: webhookData.sign?.length
        })
      } else {
        console.log('✅ P24Service: Podpis webhook zweryfikowany')
      }
      
      return isValid
    } catch (error) {
      console.error('❌ P24Service: Błąd podczas weryfikacji podpisu webhook', error)
      return false
    }
  }

  /**
   * Pobiera URL płatności na podstawie tokenu
   * Format zgodny z dokumentacją P24: /trnRequest/{token}
   */
  getPaymentUrl(token: string): string {
    const config = this.getConfig()
    const baseUrl = config.environment === 'sandbox' 
      ? 'https://sandbox.przelewy24.pl'
      : 'https://secure.przelewy24.pl'
    
    return `${baseUrl}/trnRequest/${token}`
  }

  /**
   * Sprawdza czy konfiguracja jest poprawna
   */
  validateConfig(): boolean {
    throw new Error('Not implemented')
  }
}

// Tymczasowo brak singletona podczas refaktoru
