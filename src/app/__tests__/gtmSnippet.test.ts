import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const layoutSource = readFileSync(
  path.join(process.cwd(), 'src/app/layout.tsx'),
  'utf8'
)
const tagsSource = readFileSync(
  path.join(process.cwd(), 'src/components/analytics/DeferredTags.tsx'),
  'utf8'
)

const gtmSnippet =
  "})(window,document,'script','dataLayer','GTM-TD2WDGKV');"

describe('GTM container', () => {
  it('keeps the third-party GTM snippet and loads GA consent before it', () => {
    const consentIndex = layoutSource.indexOf('<GoogleConsentDefaultScript />')
    const tagsIndex = layoutSource.indexOf('<DeferredTags />')

    expect(tagsSource.indexOf(gtmSnippet)).toBeGreaterThan(-1)
    expect(consentIndex).toBeGreaterThan(-1)
    expect(tagsIndex).toBeGreaterThan(consentIndex)
    expect(layoutSource).toContain('data-cookieconsent="ignore"')
    expect(tagsSource).toContain('id="gtm"')
    expect(layoutSource).not.toContain('consent.cookiebot.com/uc.js')
    expect(tagsSource).not.toContain('consent.cookiebot.com/uc.js')
    expect(layoutSource).toContain('CybotCookiebotDialogBodyUnderlay')
  })
})
