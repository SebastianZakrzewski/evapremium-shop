import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useNavbarLogoAnimation } from "../useNavbarLogoAnimation"

const hasOptionalConsentGrantedMock = vi.fn()

vi.mock("@/features/cookie-consent", () => ({
  COOKIE_CONSENT_ACCEPTED_EVENT: "evaCookieConsentAccepted",
  hasOptionalConsentGranted: () => hasOptionalConsentGrantedMock(),
}))

describe("useNavbarLogoAnimation", () => {
  beforeEach(() => {
    hasOptionalConsentGrantedMock.mockReset()
    hasOptionalConsentGrantedMock.mockReturnValue(false)
  })

  it("starts inactive when optional cookie consent is missing", () => {
    const { result } = renderHook(() => useNavbarLogoAnimation())

    expect(result.current).toBe(false)
  })

  it("activates when optional cookie consent is already granted", () => {
    hasOptionalConsentGrantedMock.mockReturnValue(true)

    const { result } = renderHook(() => useNavbarLogoAnimation())

    expect(result.current).toBe(true)
  })

  it("activates after custom accept event", () => {
    const { result } = renderHook(() => useNavbarLogoAnimation())

    expect(result.current).toBe(false)

    act(() => {
      window.dispatchEvent(new Event("evaCookieConsentAccepted"))
    })

    expect(result.current).toBe(true)
  })

  it("activates after CookiebotOnAccept", () => {
    const { result } = renderHook(() => useNavbarLogoAnimation())

    act(() => {
      window.dispatchEvent(new Event("CookiebotOnAccept"))
    })

    expect(result.current).toBe(true)
  })
})
