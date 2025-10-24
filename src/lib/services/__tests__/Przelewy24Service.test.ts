import { describe, it, expect, vi, beforeEach } from 'vitest'
import crypto from 'crypto'

// Mock the config to avoid dependency issues
vi.mock('@/lib/config/przelewy24', () => ({
  getP24Config: vi.fn(() => ({
    merchantId: 12345,
    posId: 67890,
    crcKey: 'test-crc-key',
    apiKey: 'test-api-key',
    reportKey: 'test-report-key',
    environment: 'sandbox',
    urlReturn: 'https://example.com/return',
    urlStatus: 'https://example.com/status',
    apiUrl: 'https://sandbox.przelewy24.pl/api/v1'
  }))
}))

// Import the service after mocking
import { Przelewy24Service } from '../Przelewy24Service'

describe('Przelewy24Service - generateSign', () => {
  let service: Przelewy24Service

  beforeEach(() => {
    service = new Przelewy24Service()
  })

  it('should generate correct SHA-384 signature', async () => {
    // Test data
    const testData = {
      sessionId: 'test-session-123',
      merchantId: 12345,
      amount: 10000, // 100.00 PLN in grosze
      currency: 'PLN',
      crcKey: 'test-crc-key'
    }

    // Expected JSON string that should be hashed
    const expectedJson = JSON.stringify({
      sessionId: testData.sessionId,
      merchantId: testData.merchantId,
      amount: testData.amount,
      currency: testData.currency,
      crc: testData.crcKey
    })

    // Calculate expected hash using Node.js crypto
    const expectedHash = crypto.createHash('sha384').update(expectedJson).digest('hex')

    // Access private method for testing
    const generateSign = (service as any).generateSign.bind(service)
    const actualHash = await generateSign(testData)

    expect(actualHash).toBe(expectedHash)
    expect(actualHash).toMatch(/^[0-9a-f]{96}$/) // SHA-384 produces 96 hex characters
  })

  it('should handle different data types correctly', async () => {
    const testData = {
      sessionId: 'session-with-special-chars-!@#$%',
      merchantId: 99999,
      amount: 1, // 0.01 PLN
      currency: 'EUR',
      crcKey: 'crc-key-with-special-chars!@#'
    }

    const generateSign = (service as any).generateSign.bind(service)
    const hash = await generateSign(testData)

    expect(hash).toMatch(/^[0-9a-f]{96}$/)
    expect(hash).toBeTruthy()
  })

  it('should produce different hashes for different inputs', async () => {
    const data1 = {
      sessionId: 'session1',
      merchantId: 12345,
      amount: 10000,
      currency: 'PLN',
      crcKey: 'key1'
    }

    const data2 = {
      sessionId: 'session2',
      merchantId: 12345,
      amount: 10000,
      currency: 'PLN',
      crcKey: 'key1'
    }

    const generateSign = (service as any).generateSign.bind(service)
    const hash1 = await generateSign(data1)
    const hash2 = await generateSign(data2)

    expect(hash1).not.toBe(hash2)
  })

  it('should be consistent with P24 documentation format', async () => {
    // Test with data that matches P24 documentation example
    const testData = {
      sessionId: 'test-session-id',
      merchantId: 12345,
      amount: 10000,
      currency: 'PLN',
      crcKey: 'test-crc-key'
    }

    const generateSign = (service as any).generateSign.bind(service)
    const hash = await generateSign(testData)

    // Verify the hash is valid SHA-384
    expect(hash).toMatch(/^[0-9a-f]{96}$/)
    
    // Verify it's deterministic
    const hash2 = await generateSign(testData)
    expect(hash).toBe(hash2)
  })

  describe('Edge Cases', () => {
    it('should handle empty sessionId', async () => {
      const testData = {
        sessionId: '',
        merchantId: 12345,
        amount: 1000,
        currency: 'PLN',
        crcKey: 'test-key'
      }

      const generateSign = (service as any).generateSign.bind(service)
      const hash = await generateSign(testData)

      expect(hash).toMatch(/^[0-9a-f]{96}$/)
      expect(hash).toBeTruthy()
    })

    it('should handle zero amount', async () => {
      const testData = {
        sessionId: 'test-session',
        merchantId: 12345,
        amount: 0,
        currency: 'PLN',
        crcKey: 'test-key'
      }

      const generateSign = (service as any).generateSign.bind(service)
      const hash = await generateSign(testData)

      expect(hash).toMatch(/^[0-9a-f]{96}$/)
      expect(hash).toBeTruthy()
    })

    it('should handle maximum safe integer amount', async () => {
      const testData = {
        sessionId: 'test-session',
        merchantId: 12345,
        amount: Number.MAX_SAFE_INTEGER,
        currency: 'PLN',
        crcKey: 'test-key'
      }

      const generateSign = (service as any).generateSign.bind(service)
      const hash = await generateSign(testData)

      expect(hash).toMatch(/^[0-9a-f]{96}$/)
      expect(hash).toBeTruthy()
    })

    it('should handle different currencies', async () => {
      const currencies = ['PLN', 'EUR', 'USD', 'GBP']
      const generateSign = (service as any).generateSign.bind(service)

      for (const currency of currencies) {
        const testData = {
          sessionId: 'test-session',
          merchantId: 12345,
          amount: 1000,
          currency,
          crcKey: 'test-key'
        }

        const hash = await generateSign(testData)
        expect(hash).toMatch(/^[0-9a-f]{96}$/)
        expect(hash).toBeTruthy()
      }
    })

    it('should handle special characters in sessionId', async () => {
      const testData = {
        sessionId: 'session-with-emoji-🚀-and-special-chars-!@#$%^&*()',
        merchantId: 12345,
        amount: 1000,
        currency: 'PLN',
        crcKey: 'test-key'
      }

      const generateSign = (service as any).generateSign.bind(service)
      const hash = await generateSign(testData)

      expect(hash).toMatch(/^[0-9a-f]{96}$/)
      expect(hash).toBeTruthy()
    })

    it('should handle whitespace in crcKey', async () => {
      const testData = {
        sessionId: 'test-session',
        merchantId: 12345,
        amount: 1000,
        currency: 'PLN',
        crcKey: '  test-key-with-whitespace  '
      }

      const generateSign = (service as any).generateSign.bind(service)
      const hash = await generateSign(testData)

      expect(hash).toMatch(/^[0-9a-f]{96}$/)
      expect(hash).toBeTruthy()
    })

    it('should handle very long sessionId', async () => {
      const longSessionId = 'a'.repeat(1000)
      const testData = {
        sessionId: longSessionId,
        merchantId: 12345,
        amount: 1000,
        currency: 'PLN',
        crcKey: 'test-key'
      }

      const generateSign = (service as any).generateSign.bind(service)
      const hash = await generateSign(testData)

      expect(hash).toMatch(/^[0-9a-f]{96}$/)
      expect(hash).toBeTruthy()
    })
  })

  describe('Error Handling', () => {
    it('should throw error for null sessionId', async () => {
      const testData = {
        sessionId: null as any,
        merchantId: 12345,
        amount: 1000,
        currency: 'PLN',
        crcKey: 'test-key'
      }

      const generateSign = (service as any).generateSign.bind(service)
      await expect(generateSign(testData)).rejects.toThrow()
    })

    it('should throw error for undefined crcKey', async () => {
      const testData = {
        sessionId: 'test-session',
        merchantId: 12345,
        amount: 1000,
        currency: 'PLN',
        crcKey: undefined as any
      }

      const generateSign = (service as any).generateSign.bind(service)
      await expect(generateSign(testData)).rejects.toThrow()
    })

    it('should throw error for negative amount', async () => {
      const testData = {
        sessionId: 'test-session',
        merchantId: 12345,
        amount: -100,
        currency: 'PLN',
        crcKey: 'test-key'
      }

      const generateSign = (service as any).generateSign.bind(service)
      await expect(generateSign(testData)).rejects.toThrow()
    })

    it('should throw error for negative merchantId', async () => {
      const testData = {
        sessionId: 'test-session',
        merchantId: -12345,
        amount: 1000,
        currency: 'PLN',
        crcKey: 'test-key'
      }

      const generateSign = (service as any).generateSign.bind(service)
      await expect(generateSign(testData)).rejects.toThrow()
    })

    it('should throw error for invalid merchantId type (string)', async () => {
      const testData = {
        sessionId: 'test-session',
        merchantId: 'invalid' as any,
        amount: 1000,
        currency: 'PLN',
        crcKey: 'test-key'
      }

      const generateSign = (service as any).generateSign.bind(service)
      await expect(generateSign(testData)).rejects.toThrow()
    })

    it('should throw error for invalid amount type (string)', async () => {
      const testData = {
        sessionId: 'test-session',
        merchantId: 12345,
        amount: 'invalid' as any,
        currency: 'PLN',
        crcKey: 'test-key'
      }

      const generateSign = (service as any).generateSign.bind(service)
      await expect(generateSign(testData)).rejects.toThrow()
    })

    it('should throw error for invalid currency type (number)', async () => {
      const testData = {
        sessionId: 'test-session',
        merchantId: 12345,
        amount: 1000,
        currency: 123 as any,
        crcKey: 'test-key'
      }

      const generateSign = (service as any).generateSign.bind(service)
      await expect(generateSign(testData)).rejects.toThrow()
    })

    it('should throw error for empty crcKey', async () => {
      const testData = {
        sessionId: 'test-session',
        merchantId: 12345,
        amount: 1000,
        currency: 'PLN',
        crcKey: ''
      }

      const generateSign = (service as any).generateSign.bind(service)
      await expect(generateSign(testData)).rejects.toThrow()
    })

    it('should throw error for all null values', async () => {
      const testData = {
        sessionId: null as any,
        merchantId: null as any,
        amount: null as any,
        currency: null as any,
        crcKey: null as any
      }

      const generateSign = (service as any).generateSign.bind(service)
      await expect(generateSign(testData)).rejects.toThrow()
    })
  })

  describe('Crypto Integration', () => {
    it('should call crypto.createHash with sha384', async () => {
      const createHashSpy = vi.spyOn(crypto, 'createHash')
      const testData = {
        sessionId: 'test-session',
        merchantId: 12345,
        amount: 1000,
        currency: 'PLN',
        crcKey: 'test-key'
      }

      const generateSign = (service as any).generateSign.bind(service)
      await generateSign(testData)

      expect(createHashSpy).toHaveBeenCalledWith('sha384')
    })

    it('should call hash.update with correct JSON string', async () => {
      const testData = {
        sessionId: 'test-session',
        merchantId: 12345,
        amount: 1000,
        currency: 'PLN',
        crcKey: 'test-key'
      }

      const expectedJson = JSON.stringify({
        sessionId: 'test-session',
        merchantId: 12345,
        amount: 1000,
        currency: 'PLN',
        crc: 'test-key'
      })

      // Mock the hash object
      const mockHash = {
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue('mocked-hash')
      }
      vi.spyOn(crypto, 'createHash').mockReturnValue(mockHash as any)

      const generateSign = (service as any).generateSign.bind(service)
      await generateSign(testData)

      expect(mockHash.update).toHaveBeenCalledWith(expectedJson)
    })

    it('should call hash.digest with hex encoding', async () => {
      const testData = {
        sessionId: 'test-session',
        merchantId: 12345,
        amount: 1000,
        currency: 'PLN',
        crcKey: 'test-key'
      }

      const mockHash = {
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue('mocked-hash')
      }
      vi.spyOn(crypto, 'createHash').mockReturnValue(mockHash as any)

      const generateSign = (service as any).generateSign.bind(service)
      await generateSign(testData)

      expect(mockHash.digest).toHaveBeenCalledWith('hex')
    })
  })

  describe('Przelewy24Service - registerTransaction', () => {
    let service: Przelewy24Service

    beforeEach(() => {
      service = new Przelewy24Service()
      
      // Mock generateSign
      vi.spyOn(service as any, 'generateSign').mockResolvedValue('mocked-signature')
      
      // Mock getBasicAuthHeader
      vi.spyOn(service as any, 'getBasicAuthHeader').mockReturnValue('Basic dGVzdDp0ZXN0')
      
      // Clear fetch mocks
      vi.clearAllMocks()
    })

    describe('Happy Path', () => {
      it('should register transaction successfully', async () => {
        const transactionData = {
          sessionId: 'test-session-123',
          amount: 10000, // 100.00 PLN
          currency: 'PLN',
          description: 'Test payment',
          email: 'test@example.com',
          country: 'PL'
        }

        const mockResponse = {
          data: {
            token: 'test-payment-token-123'
          },
          responseCode: 0
        }

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })

        const result = await service.registerTransaction(transactionData)

        expect(result.success).toBe(true)
        expect(result.token).toBe('test-payment-token-123')
        expect(result.paymentUrl).toBeDefined()
        expect(result.error).toBeUndefined()
      })

      it('should handle different currencies correctly', async () => {
        const transactionData = {
          sessionId: 'session-eur-456',
          amount: 5000, // 50.00 EUR
          currency: 'EUR',
          description: 'EUR payment',
          email: 'test@example.com',
          country: 'DE'
        }

        const mockResponse = {
          data: {
            token: 'test-payment-token-eur'
          },
          responseCode: 0
        }

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })

        const result = await service.registerTransaction(transactionData)

        expect(result.success).toBe(true)
        expect(result.token).toBe('test-payment-token-eur')
      })
    })

    describe('Edge Cases', () => {
      it('should handle zero amount', async () => {
        const transactionData = {
          sessionId: 'test-session',
          amount: 0,
          currency: 'PLN',
          description: 'Zero amount test',
          email: 'test@example.com',
          country: 'PL'
        }

        const mockResponse = {
          data: {
            token: 'test-payment-token-zero'
          },
          responseCode: 0
        }

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })

        const result = await service.registerTransaction(transactionData)
        expect(result.success).toBe(true)
      })

      it('should handle empty description', async () => {
        const transactionData = {
          sessionId: 'test-session',
          amount: 1000,
          currency: 'PLN',
          description: '',
          email: 'test@example.com',
          country: 'PL'
        }

        const mockResponse = {
          data: {
            token: 'test-payment-token'
          },
          responseCode: 0
        }

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })

        const result = await service.registerTransaction(transactionData)
        expect(result.success).toBe(true)
      })

      it('should handle special characters in sessionId', async () => {
        const transactionData = {
          sessionId: 'session-with-emoji-🚀-and-special-chars-!@#$%',
          amount: 1000,
          currency: 'PLN',
          description: 'Test payment',
          email: 'test@example.com',
          country: 'PL'
        }

        const mockResponse = {
          data: {
            token: 'test-payment-token-special'
          },
          responseCode: 0
        }

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })

        const result = await service.registerTransaction(transactionData)
        expect(result.success).toBe(true)
      })
    })

    describe('Error Handling', () => {
      it('should handle null transactionData', async () => {
        const result = await service.registerTransaction(null as any)
        
        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
        expect(result.token).toBeUndefined()
        expect(result.paymentUrl).toBeUndefined()
      })

      it('should handle undefined transactionData', async () => {
        const result = await service.registerTransaction(undefined as any)
        
        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
      })

      it('should handle negative amount', async () => {
        const transactionData = {
          sessionId: 'test-session',
          amount: -100,
          currency: 'PLN',
          description: 'Test payment',
          email: 'test@example.com',
          country: 'PL'
        }

        const result = await service.registerTransaction(transactionData)
        
        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
      })

      it('should handle invalid email format', async () => {
        const transactionData = {
          sessionId: 'test-session',
          amount: 1000,
          currency: 'PLN',
          description: 'Test payment',
          email: 'invalid-email',
          country: 'PL'
        }

        const result = await service.registerTransaction(transactionData)
        
        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
      })

      it('should handle API error response', async () => {
        const transactionData = {
          sessionId: 'test-session',
          amount: 1000,
          currency: 'PLN',
          description: 'Test payment',
          email: 'test@example.com',
          country: 'PL'
        }

        global.fetch = vi.fn().mockResolvedValue({
          ok: false,
          status: 400,
          json: () => Promise.resolve({
            error: 'Invalid request',
            responseCode: 1
          })
        })

        const result = await service.registerTransaction(transactionData)
        
        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
      })

      it('should handle network error', async () => {
        const transactionData = {
          sessionId: 'test-session',
          amount: 1000,
          currency: 'PLN',
          description: 'Test payment',
          email: 'test@example.com',
          country: 'PL'
        }

        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

        const result = await service.registerTransaction(transactionData)
        
        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
      })
    })

    describe('API Integration', () => {
      it('should call correct API endpoint', async () => {
        const transactionData = {
          sessionId: 'test-session',
          amount: 1000,
          currency: 'PLN',
          description: 'Test payment',
          email: 'test@example.com',
          country: 'PL'
        }

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ data: { token: 'test-token' }, responseCode: 0 })
        })

        await service.registerTransaction(transactionData)

        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/transaction/register'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': 'Basic dGVzdDp0ZXN0',
              'Content-Type': 'application/json'
            })
          })
        )
      })

      it('should include correct request body', async () => {
        const transactionData = {
          sessionId: 'test-session',
          amount: 1000,
          currency: 'PLN',
          description: 'Test payment',
          email: 'test@example.com',
          country: 'PL'
        }

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ data: { token: 'test-token' }, responseCode: 0 })
        })

        await service.registerTransaction(transactionData)

        const fetchCall = (global.fetch as any).mock.calls[0]
        const requestBody = JSON.parse(fetchCall[1].body)

        expect(requestBody).toMatchObject({
          merchantId: expect.any(Number),
          posId: expect.any(Number),
          sessionId: 'test-session',
          amount: 1000,
          currency: 'PLN',
          description: 'Test payment',
          email: 'test@example.com',
          country: 'PL',
          sign: 'mocked-signature'
        })
      })
    })

    describe('Validation Tests', () => {
      it('should validate sessionId is required', async () => {
        const transactionData = {
          sessionId: '',
          amount: 1000,
          currency: 'PLN',
          description: 'Test payment',
          email: 'test@example.com',
          country: 'PL'
        }

        const result = await service.registerTransaction(transactionData)
        
        expect(result.success).toBe(false)
        expect(result.error).toContain('sessionId')
      })

      it('should validate amount is non-negative', async () => {
        const transactionData = {
          sessionId: 'test-session',
          amount: -50,
          currency: 'PLN',
          description: 'Test payment',
          email: 'test@example.com',
          country: 'PL'
        }

        const result = await service.registerTransaction(transactionData)
        
        expect(result.success).toBe(false)
        expect(result.error).toContain('amount')
      })

      it('should validate currency is required', async () => {
        const transactionData = {
          sessionId: 'test-session',
          amount: 1000,
          currency: '',
          description: 'Test payment',
          email: 'test@example.com',
          country: 'PL'
        }

        const result = await service.registerTransaction(transactionData)
        
        expect(result.success).toBe(false)
        expect(result.error).toContain('currency')
      })

      it('should validate description is required', async () => {
        const transactionData = {
          sessionId: 'test-session',
          amount: 1000,
          currency: 'PLN',
          description: null as any,
          email: 'test@example.com',
          country: 'PL'
        }

        const result = await service.registerTransaction(transactionData)
        
        expect(result.success).toBe(false)
        expect(result.error).toContain('description')
      })

      it('should validate email format', async () => {
        const transactionData = {
          sessionId: 'test-session',
          amount: 1000,
          currency: 'PLN',
          description: 'Test payment',
          email: 'not-an-email',
          country: 'PL'
        }

        const result = await service.registerTransaction(transactionData)
        
        expect(result.success).toBe(false)
        expect(result.error).toContain('email')
      })

      it('should validate country is required', async () => {
        const transactionData = {
          sessionId: 'test-session',
          amount: 1000,
          currency: 'PLN',
          description: 'Test payment',
          email: 'test@example.com',
          country: ''
        }

        const result = await service.registerTransaction(transactionData)
        
        expect(result.success).toBe(false)
        expect(result.error).toContain('country')
      })
    })

    describe('Additional Edge Cases', () => {
      it('should handle maximum safe integer amount', async () => {
        const transactionData = {
          sessionId: 'test-session',
          amount: Number.MAX_SAFE_INTEGER,
          currency: 'PLN',
          description: 'Max amount test',
          email: 'test@example.com',
          country: 'PL'
        }

        const mockResponse = {
          data: {
            token: 'test-payment-token-max'
          },
          responseCode: 0
        }

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })

        const result = await service.registerTransaction(transactionData)
        expect(result.success).toBe(true)
      })

      it('should handle very long description', async () => {
        const longDescription = 'A'.repeat(1000)
        const transactionData = {
          sessionId: 'test-session',
          amount: 1000,
          currency: 'PLN',
          description: longDescription,
          email: 'test@example.com',
          country: 'PL'
        }

        const mockResponse = {
          data: {
            token: 'test-payment-token-long'
          },
          responseCode: 0
        }

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        })

        const result = await service.registerTransaction(transactionData)
        expect(result.success).toBe(true)
      })

      it('should handle different country codes', async () => {
        const countries = ['PL', 'DE', 'US', 'GB', 'FR']
        
        for (const country of countries) {
          const transactionData = {
            sessionId: `test-session-${country}`,
            amount: 1000,
            currency: 'PLN',
            description: 'Test payment',
            email: 'test@example.com',
            country
          }

          const mockResponse = {
            data: {
              token: `test-payment-token-${country}`
            },
            responseCode: 0
          }

          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockResponse)
          })

          const result = await service.registerTransaction(transactionData)
          expect(result.success).toBe(true)
        }
      })

      it('should handle different email formats', async () => {
        const emails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'test+tag@example.org',
          'user123@test-domain.com'
        ]
        
        for (const email of emails) {
          const transactionData = {
            sessionId: `test-session-${email.split('@')[0]}`,
            amount: 1000,
            currency: 'PLN',
            description: 'Test payment',
            email,
            country: 'PL'
          }

          const mockResponse = {
            data: {
              token: `test-payment-token-${email.split('@')[0]}`
            },
            responseCode: 0
          }

          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockResponse)
          })

          const result = await service.registerTransaction(transactionData)
          expect(result.success).toBe(true)
        }
      })
    })
  })
})
