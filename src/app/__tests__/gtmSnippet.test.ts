import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const layoutSource = readFileSync(
  path.join(process.cwd(), 'src/app/layout.tsx'),
  'utf8'
)

const gtmSnippet =
  "})(window,document,'script','dataLayer','GTM-TD2WDGKV');"

describe('GTM container', () => {
  it('keeps the third-party GTM snippet and loads GA consent before it', () => {
    const gtmIndex = layoutSource.indexOf(gtmSnippet)
    const consentIndex = layoutSource.indexOf('<GoogleConsentDefaultScript />')
    const gaIndex = layoutSource.indexOf('<GoogleAnalyticsScript />')

    expect(gtmIndex).toBeGreaterThan(-1)
    expect(consentIndex).toBeGreaterThan(-1)
    expect(gaIndex).toBeGreaterThan(gtmIndex)
    expect(consentIndex).toBeLessThan(gtmIndex)
    expect(layoutSource).toContain('data-cookieconsent="ignore"')
    expect(layoutSource).toContain("id=\"gtm\"")
  })
})
