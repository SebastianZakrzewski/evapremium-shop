import type { ReactNode } from "react"
import Link from "next/link"
import {
  ArrowRight,
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
  type DetailRow,
  type PaymentSuccessStatus,
} from "../lib/paymentSuccessPresentation"

type PaymentSuccessViewProps = {
  paymentStatus: PaymentSuccessStatus
  isRefreshing: boolean
  onRecheck: () => void
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
  children,
}: {
  title: string
  icon?: ReactNode
  children: ReactNode
}) => (
  <section className="border-t border-white/10 py-6">
    <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-white/40">
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
  const metaRows = buildOrderMetaRows(paymentStatus)
  const customerRows = buildCustomerRows(paymentStatus.customer)
  const priceLines = buildPaymentPriceLines(paymentStatus)
  const shippingLines = formatAddressLines(paymentStatus.shippingAddress)
  const billingLines = formatAddressLines(paymentStatus.billingAddress)
  const showBilling = addressesDiffer(paymentStatus.shippingAddress, paymentStatus.billingAddress)
  const items = paymentStatus.items || []

  return (
    <section className="bg-black text-white" aria-labelledby="payment-success-title">
      <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <header className="flex flex-col gap-8 border-b border-white/10 pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-white/40">
              {getPaymentStatusLabel(paymentStatus.status)}
            </p>
            <h1 id="payment-success-title" className="text-4xl font-medium tracking-tight md:text-5xl">
              {getPaymentHeadline(paymentStatus.status)}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-white/50">
              {getPaymentLead(paymentStatus.status)}
            </p>
          </div>
          <div className="md:text-right">
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">Zamówienie</p>
            <p className="mt-2 text-sm font-medium tracking-tight text-white">
              {paymentStatus.orderNumber || "—"}
            </p>
            {paymentStatus.total !== undefined && (
              <p className="mt-2 text-3xl font-medium tracking-tight text-white">
                {priceLines.find((line) => line.tone === "total")?.value}
              </p>
            )}
          </div>
        </header>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
          <div className="space-y-6">
            {paymentStatus.status === "paid" && (
              <Panel title="Co dalej" icon={<Package className="h-4 w-4" />}>
                <ol className="space-y-3">
                  {PAID_NEXT_STEPS.map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-sm text-white/40">
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
                  className="mt-4 h-10 rounded-full border-0 bg-[#2c2c2e] text-white shadow-none hover:bg-[#3a3a3c]"
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
                    <li key={item.id || `${getOrderItemTitle(item)}-${index}`} className="border-b border-white/10 py-4 last:border-b-0">
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
                            ? "text-lg font-medium tracking-tight text-white"
                            : line.tone === "discount"
                              ? "text-sm font-medium text-white/70"
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
          <Button asChild className="h-12 rounded-full bg-red-600 px-8 text-white shadow-none hover:bg-red-500">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" aria-hidden="true" />
              Wróć do strony głównej
            </Link>
          </Button>
          {paymentStatus.status === "paid" && (
            <Button asChild variant="outline" className="h-12 rounded-full border-0 bg-[#1c1c1e] px-8 text-white shadow-none hover:bg-[#2c2c2e]">
              <Link href="/configurator">
                Skonfiguruj kolejne
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          )}
          {paymentStatus.status === "failed" && (
            <Button asChild variant="outline" className="h-12 rounded-full border-0 bg-[#1c1c1e] px-8 text-white shadow-none hover:bg-[#2c2c2e]">
              <Link href="/checkout">
                Spróbuj ponownie
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/55 sm:flex-row sm:items-center sm:gap-6">
          <p>Potrzebujesz pomocy?</p>
          <a href="mailto:evapremium.kontakt@gmail.com" className="inline-flex items-center gap-2 text-red-500 hover:text-red-400">
            <Mail className="h-4 w-4" aria-hidden="true" />
            evapremium.kontakt@gmail.com
          </a>
          <a href="tel:+48793993430" className="inline-flex items-center gap-2 text-red-500 hover:text-red-400">
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
    <div className="mx-auto max-w-lg py-8 text-center">
      <XCircle className="mx-auto h-8 w-8 text-white/70" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-semibold">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-white/65">{message}</p>
      <Button asChild className="mt-6 h-12 rounded-full bg-red-600 px-8 text-white shadow-none hover:bg-red-500">
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
    <div className="mx-auto max-w-md py-8 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border border-white/15 border-t-white" />
      <p className="mt-5 text-sm text-white/70">Sprawdzanie statusu płatności...</p>
    </div>
  </section>
)
