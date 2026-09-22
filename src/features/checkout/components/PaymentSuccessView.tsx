import type { ReactNode } from "react"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Home,
  Mail,
  MapPin,
  Package,
  Phone,
  Receipt,
  RotateCcw,
  UserRound,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { OrderItemConfigurationSummary } from "./OrderItemConfigurationSummary"
import {
  PAID_NEXT_STEPS,
  addressesDiffer,
  buildCustomerRows,
  buildOrderMetaRows,
  buildPaymentPriceLines,
  formatAddressLines,
  getOrderItemLineTotal,
  getOrderItemTitle,
  getPaymentHeadline,
  getPaymentLead,
  getPaymentStatusLabel,
  getPaymentTone,
  type DetailRow,
  type PaymentSuccessStatus,
  type PaymentTone,
} from "../lib/paymentSuccessPresentation"

type PaymentSuccessViewProps = {
  paymentStatus: PaymentSuccessStatus
  isRefreshing: boolean
  onRecheck: () => void
}

const toneClasses: Record<PaymentTone, { icon: string; badge: string; ring: string }> = {
  success: {
    icon: "text-emerald-300",
    badge: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30",
    ring: "bg-emerald-400/10 border-emerald-400/30",
  },
  pending: {
    icon: "text-amber-300",
    badge: "bg-amber-400/10 text-amber-200 border-amber-400/30",
    ring: "bg-amber-400/10 border-amber-400/30",
  },
  danger: {
    icon: "text-red-300",
    badge: "bg-red-500/10 text-red-300 border-red-500/30",
    ring: "bg-red-500/10 border-red-500/30",
  },
  neutral: {
    icon: "text-white/70",
    badge: "bg-white/5 text-white/70 border-white/10",
    ring: "bg-white/5 border-white/10",
  },
}

const StatusIcon = ({ status }: { status: string }) => {
  const className = "h-7 w-7"
  if (status === "paid") return <CheckCircle2 className={className} aria-hidden="true" />
  if (status === "pending") return <Clock3 className={className} aria-hidden="true" />
  return <XCircle className={className} aria-hidden="true" />
}

const DetailList = ({ rows }: { rows: DetailRow[] }) => (
  <dl className="divide-y divide-white/10">
    {rows.map((row) => (
      <div key={row.label} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
        <dt className="text-sm text-white/50">{row.label}</dt>
        <dd className="text-sm font-medium text-white sm:text-right break-words">{row.value}</dd>
      </div>
    ))}
  </dl>
)

const Panel = ({
  title,
  icon,
  children,
}: {
  title: string
  icon: ReactNode
  children: ReactNode
}) => (
  <section className="rounded-2xl border border-white/10 bg-[#111] p-5 md:p-6">
    <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-white/45">
      <span className="text-red-500" aria-hidden="true">{icon}</span>
      {title}
    </h2>
    {children}
  </section>
)

const AddressBlock = ({ lines }: { lines: string[] }) => (
  <address className="not-italic text-sm leading-6 text-white/80">
    {lines.map((line) => (
      <span key={line} className="block">{line}</span>
    ))}
  </address>
)

export const PaymentSuccessView = ({
  paymentStatus,
  isRefreshing,
  onRecheck,
}: PaymentSuccessViewProps) => {
  const tone = getPaymentTone(paymentStatus.status)
  const styles = toneClasses[tone]
  const metaRows = buildOrderMetaRows(paymentStatus)
  const customerRows = buildCustomerRows(paymentStatus.customer)
  const priceLines = buildPaymentPriceLines(paymentStatus)
  const shippingLines = formatAddressLines(paymentStatus.shippingAddress)
  const billingLines = formatAddressLines(paymentStatus.billingAddress)
  const showBilling = addressesDiffer(paymentStatus.shippingAddress, paymentStatus.billingAddress)
  const items = paymentStatus.items || []

  return (
    <section className="relative overflow-hidden bg-black text-white" aria-labelledby="payment-success-title">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(204,16,32,0.22),transparent_68%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-14">
        <header className="rounded-3xl border border-white/10 bg-[#111]/90 p-6 shadow-2xl shadow-black/40 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${styles.ring} ${styles.icon}`}>
                <StatusIcon status={paymentStatus.status} />
              </div>
              <div>
                <p className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles.badge}`}>
                  {getPaymentStatusLabel(paymentStatus.status)}
                </p>
                <h1 id="payment-success-title" className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                  {getPaymentHeadline(paymentStatus.status)}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/65 md:text-base">
                  {getPaymentLead(paymentStatus.status)}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/40 px-5 py-4 md:min-w-56 md:text-right">
              <p className="text-xs uppercase tracking-[0.16em] text-white/40">Zamówienie</p>
              <p className="mt-1 font-mono text-lg font-semibold text-white">
                {paymentStatus.orderNumber || "—"}
              </p>
              {paymentStatus.total !== undefined && (
                <p className="mt-2 text-2xl font-semibold text-red-500">
                  {priceLines.find((line) => line.tone === "total")?.value}
                </p>
              )}
            </div>
          </div>
        </header>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
          <div className="space-y-6">
            {paymentStatus.status === "paid" && (
              <Panel title="Co dalej" icon={<Package className="h-4 w-4" />}>
                <ol className="space-y-3">
                  {PAID_NEXT_STEPS.map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <span className="pt-0.5 text-sm leading-6 text-white/80">{step}</span>
                    </li>
                  ))}
                </ol>
              </Panel>
            )}

            {paymentStatus.status === "pending" && (
              <Panel title="Status płatności" icon={<Clock3 className="h-4 w-4" />}>
                <p className="text-sm leading-6 text-white/70">
                  Jeśli właśnie wróciłeś z bramki płatności, potwierdzenie może pojawić się z krótkim opóźnieniem.
                </p>
                <Button
                  type="button"
                  onClick={onRecheck}
                  disabled={isRefreshing}
                  variant="outline"
                  className="mt-4 border-white/15 bg-white/5 text-white hover:bg-white/10"
                >
                  <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                  {isRefreshing ? "Sprawdzanie..." : "Sprawdź ponownie"}
                </Button>
              </Panel>
            )}

            <Panel title="Produkty" icon={<Package className="h-4 w-4" />}>
              {items.length === 0 ? (
                <p className="text-sm text-white/50">Brak pozycji w zamówieniu.</p>
              ) : (
                <ul className="space-y-3">
                  {items.map((item, index) => (
                    <li key={item.id || `${getOrderItemTitle(item)}-${index}`} className="rounded-xl border border-white/10 bg-black/35 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-white">{getOrderItemTitle(item)}</p>
                          <p className="mt-1 text-sm text-white/45">
                            {item.quantity !== undefined ? `${item.quantity} szt.` : "Ilość niepodana"}
                            {item.unitPrice !== undefined ? ` · ${getOrderItemLineTotal({ unitPrice: item.unitPrice, quantity: 1 })} / szt.` : ""}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-white">{getOrderItemLineTotal(item)}</p>
                      </div>
                      <OrderItemConfigurationSummary configuration={item.configuration} />
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            {paymentStatus.notes && (
              <Panel title="Uwagi" icon={<Receipt className="h-4 w-4" />}>
                <p className="text-sm leading-6 text-white/75">{paymentStatus.notes}</p>
              </Panel>
            )}
          </div>

          <aside className="space-y-6">
            <Panel title="Szczegóły zamówienia" icon={<Receipt className="h-4 w-4" />}>
              <DetailList rows={metaRows} />
            </Panel>

            {customerRows.length > 0 && (
              <Panel title="Klient" icon={<UserRound className="h-4 w-4" />}>
                <DetailList rows={customerRows} />
              </Panel>
            )}

            {shippingLines.length > 0 && (
              <Panel title="Dostawa" icon={<MapPin className="h-4 w-4" />}>
                <AddressBlock lines={shippingLines} />
                {showBilling && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <p className="mb-2 text-xs uppercase tracking-[0.16em] text-white/40">Faktura</p>
                    <AddressBlock lines={billingLines} />
                  </div>
                )}
              </Panel>
            )}

            {priceLines.length > 0 && (
              <Panel title="Rozliczenie" icon={<Receipt className="h-4 w-4" />}>
                <dl>
                  {priceLines.map((line) => (
                    <div
                      key={line.label}
                      className={`flex items-center justify-between gap-4 py-2.5 ${line.tone === "total" ? "mt-1 border-t border-white/10 pt-3" : ""}`}
                    >
                      <dt className={line.tone === "total" ? "text-sm font-semibold text-white" : "text-sm text-white/55"}>
                        {line.label}
                      </dt>
                      <dd
                        className={
                          line.tone === "total"
                            ? "text-lg font-semibold text-red-500"
                            : line.tone === "discount"
                              ? "text-sm font-medium text-emerald-300"
                              : "text-sm font-medium text-white"
                        }
                      >
                        {line.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Panel>
            )}
          </aside>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" aria-hidden="true" />
              Wróć do strony głównej
            </Link>
          </Button>
          {paymentStatus.status === "paid" && (
            <Button asChild variant="outline" className="border-white/15 bg-transparent text-white hover:bg-white/5">
              <Link href="/configurator">
                Skonfiguruj kolejne
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          )}
          {paymentStatus.status === "failed" && (
            <Button asChild variant="outline" className="border-white/15 bg-transparent text-white hover:bg-white/5">
              <Link href="/checkout">
                Spróbuj ponownie
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/55 sm:flex-row sm:items-center sm:gap-6">
          <p>Potrzebujesz pomocy?</p>
          <a href="mailto:evapremium.kontakt@gmail.com" className="inline-flex items-center gap-2 text-red-400 hover:text-red-300">
            <Mail className="h-4 w-4" aria-hidden="true" />
            evapremium.kontakt@gmail.com
          </a>
          <a href="tel:+48793993430" className="inline-flex items-center gap-2 text-red-400 hover:text-red-300">
            <Phone className="h-4 w-4" aria-hidden="true" />
            +48 793 993 430
          </a>
        </div>
      </div>
    </section>
  )
}

type PaymentSuccessMessageProps = {
  title: string
  message: string
}

export const PaymentSuccessMessage = ({ title, message }: PaymentSuccessMessageProps) => (
  <section className="bg-black px-4 py-16 text-white">
    <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-[#111] p-8 text-center">
      <XCircle className="mx-auto h-12 w-12 text-red-500" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-semibold">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-white/65">{message}</p>
      <Button asChild className="mt-6 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600">
        <Link href="/">
          <Home className="mr-2 h-4 w-4" aria-hidden="true" />
          Wróć do strony głównej
        </Link>
      </Button>
    </div>
  </section>
)

export const PaymentSuccessPending = () => (
  <section className="bg-black px-4 py-20 text-white" aria-live="polite">
    <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-[#111] p-8 text-center">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-red-500" />
      <p className="mt-5 text-sm text-white/70">Sprawdzanie statusu płatności...</p>
    </div>
  </section>
)
