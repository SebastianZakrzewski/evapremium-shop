"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTracking } from "@/lib/tracking"
import { useOrder } from "@/features/orders/hooks/useOrder"
import { isPaynowCheckoutEnabled } from "@/lib/config/payment-provider"
import type { PaymentSuccessStatus } from "../lib/paymentSuccessPresentation"
import {
  PaymentSuccessMessage,
  PaymentSuccessPending,
  PaymentSuccessView,
} from "./PaymentSuccessView"

export function PaymentSuccess() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const sessionId = searchParams.get("sessionId")
  const p24SessionId = searchParams.get("p24_session_id")
  const paynowPaymentId = searchParams.get("paymentId")
  const paynowPaymentStatus = searchParams.get("paymentStatus")
  const [paymentStatus, setPaymentStatus] = useState<PaymentSuccessStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { trackPurchase, createPurchaseData: createPurchase } = useTracking()
  const { getOrder } = useOrder()

  const pollPaynowStatus = async (resolvedOrderId: string) => {
    try {
      const response = await fetch(`/api/payments/paynow/status?orderId=${resolvedOrderId}`)
      if (!response.ok) return null
      const data = await response.json()
      return data.payment as { status?: string; providerStatus?: string } | undefined
    } catch {
      return null
    }
  }

  const refreshOrderPaymentStatus = async (resolvedOrderId: string) => {
    const order = await getOrder(resolvedOrderId)
    if (!order) return

    setPaymentStatus((prev) => ({
      ...prev,
      status: (order.paymentStatus as PaymentSuccessStatus["status"]) || prev?.status || "pending",
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentMethod: order.paymentMethod,
      orderStatus: order.status,
      paymentStatus: order.paymentStatus,
    }))
  }

  const checkPaymentStatus = async (identifier: string) => {
    try {
      setLoading(true)
      setError(null)

      let order = null

      if (p24SessionId || identifier.includes("_")) {
        order = await getOrder(identifier)

        if (!order) {
          const sessionIdParts = identifier.split("_")
          if (sessionIdParts.length >= 2) {
            order = await getOrder(sessionIdParts[1])
          }
        }
      } else {
        order = await getOrder(identifier)
      }

      if (!order) {
        throw new Error("Zamówienie nie zostało znalezione. Sprawdź czy płatność została zakończona pomyślnie.")
      }

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pending_order_id")
      }

      setPaymentStatus({
        status: (order.paymentStatus as PaymentSuccessStatus["status"]) || "pending",
        orderId: order.id,
        orderNumber: order.orderNumber,
        p24OrderId: order.p24OrderId,
        total: Number(order.total || 0),
        subtotal: Number(order.subtotal || 0),
        shippingCost: Number(order.shippingCost || 0),
        tax: Number(order.tax || 0),
        discount: Number(order.discount || 0),
        customer: order.customer,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        paymentMethod: order.paymentMethod,
        orderStatus: order.status,
        paymentStatus: order.paymentStatus,
        trackingNumber: order.trackingNumber,
        notes: order.notes,
        createdAt: order.createdAt
          ? (typeof order.createdAt === "string" ? order.createdAt : order.createdAt.toISOString())
          : undefined,
        items: order.items || [],
      })

      if (
        isPaynowCheckoutEnabled() &&
        order.paymentStatus === "pending" &&
        (order.paymentMethod === "paynow" || paynowPaymentId || paynowPaymentStatus)
      ) {
        const paynowStatus = await pollPaynowStatus(order.id)
        if (paynowStatus?.status === "paid" || paynowStatus?.providerStatus === "CONFIRMED") {
          await refreshOrderPaymentStatus(order.id)
        }
      }

      if (order.paymentStatus === "paid" && order.items && order.items.length > 0) {
        try {
          const cacheKey = `purchase_${order.orderNumber}`
          const cached = localStorage.getItem(cacheKey)

          if (!cached) {
            const transactionId = order.p24OrderId || paynowPaymentId || order.id
            const purchaseData = createPurchase(
              order.items,
              order.orderNumber,
              Number(order.total || 0),
              transactionId,
              order.paymentMethod,
              order.customer?.email,
              order.customer?.phone
            )
            trackPurchase(purchaseData)
            localStorage.setItem(cacheKey, Date.now().toString())
          }
        } catch (trackingError) {
          console.error("[Tracking] Error tracking Purchase:", trackingError)
        }
      }
    } catch (err) {
      console.error("PaymentSuccess: Error checking payment status:", err)
      setError(err instanceof Error ? err.message : "Nieznany błąd")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let identifier = orderId || sessionId || p24SessionId

    if (!identifier && typeof window !== "undefined") {
      const savedOrderId = sessionStorage.getItem("pending_order_id")
      if (savedOrderId) identifier = savedOrderId
    }

    if (!identifier) {
      setError("Brak identyfikatora zamówienia. Skontaktuj się z nami jeśli problem się powtarza.")
      setLoading(false)
      return
    }

    checkPaymentStatus(identifier)
  }, [orderId, sessionId, p24SessionId, paynowPaymentId, paynowPaymentStatus])

  const handleRecheck = () => {
    const identifier = orderId
      || sessionId
      || p24SessionId
      || paynowPaymentId
      || (typeof window !== "undefined" ? sessionStorage.getItem("pending_order_id") : null)

    if (identifier) {
      checkPaymentStatus(identifier)
    }
  }

  if (loading && !paymentStatus) {
    return <PaymentSuccessPending />
  }

  if (error) {
    return (
      <PaymentSuccessMessage
        title="Nie udało się potwierdzić płatności"
        message={error}
      />
    )
  }

  if (!paymentStatus) {
    return (
      <PaymentSuccessMessage
        title="Brak danych"
        message="Nie udało się pobrać informacji o płatności."
      />
    )
  }

  return (
    <PaymentSuccessView
      paymentStatus={paymentStatus}
      isRefreshing={loading}
      onRecheck={handleRecheck}
    />
  )
}
