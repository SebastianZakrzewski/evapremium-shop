"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Truck, 
  Package, 
  Store, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Handshake,
  Shield,
  Star,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Schema walidacji
const checkoutSchema = z.object({
  // Dane kontaktowe
  firstName: z.string().min(2, "Imię musi mieć minimum 2 znaki"),
  lastName: z.string().min(2, "Nazwisko musi mieć minimum 2 znaki"),
  email: z.string().email("Nieprawidłowy adres email"),
  phone: z.string().min(9, "Nieprawidłowy numer telefonu"),
  
  // Adres wysyłkowy
  street: z.string().min(5, "Ulica musi mieć minimum 5 znaków"),
  postalCode: z.string().min(5, "Nieprawidłowy kod pocztowy"),
  city: z.string().min(2, "Miasto musi mieć minimum 2 znaki"),
  country: z.string().min(2, "Kraj musi mieć minimum 2 znaki"),
  
  // Dane do faktury
  sameAsShipping: z.boolean(),
  companyName: z.string().optional(),
  nip: z.string().optional(),
  
  // Metoda dostawy i płatności
  shippingMethod: z.string().min(1, "Wybierz metodę dostawy"),
  paymentMethod: z.string().min(1, "Wybierz metodę płatności"),
  
  // Checkboxy
  termsAccepted: z.boolean().refine(val => val === true, "Musisz zaakceptować regulamin"),
  newsletter: z.boolean(),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

// Dane produktu (placeholder)
const productData = {
  name: "Dywaniki EVA do BMW 3 E90 2007 – komplet z bagażnikiem",
  image: "/images/products/bmw.png",
  price: 299.99,
  quantity: 1,
}

// Metody dostawy
const shippingMethods = [
  {
    id: "dpd",
    name: "Kurier DPD",
    price: 14.99,
    description: "Dostawa w ciągu 1-2 dni roboczych",
    icon: Truck,
  },
  {
    id: "inpost",
    name: "Paczkomat InPost",
    price: 12.99,
    description: "Dostawa w ciągu 2-3 dni roboczych",
    icon: Package,
  },
  {
    id: "pickup",
    name: "Odbiór osobisty",
    price: 0,
    description: "Odbiór w naszym salonie",
    icon: Store,
  },
]

// Metody płatności
const paymentMethods = [
  {
    id: "card",
    name: "Karta płatnicza",
    description: "Visa, Mastercard, American Express",
    icon: CreditCard,
  },
  {
    id: "blik",
    name: "BLIK",
    description: "Płatność przez aplikację bankową",
    icon: Smartphone,
  },
  {
    id: "p24",
    name: "Przelewy24",
    description: "Przelew online",
    icon: Banknote,
  },
  {
    id: "cod",
    name: "Płatność przy odbiorze",
    description: "Zapłać kurierowi przy odbiorze",
    icon: Handshake,
  },
]

export function CheckoutSection() {
  const [isOrderSummaryExpanded, setIsOrderSummaryExpanded] = useState(false)
  const [discountCode, setDiscountCode] = useState("")
  const [discountApplied, setDiscountApplied] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      sameAsShipping: true,
      termsAccepted: false,
      newsletter: false,
    },
  })

  const sameAsShipping = watch("sameAsShipping")
  const selectedShipping = watch("shippingMethod")
  const shippingCost = shippingMethods.find(m => m.id === selectedShipping)?.price || 0
  const subtotal = productData.price * productData.quantity
  const total = subtotal + shippingCost

  const onSubmit = (data: CheckoutFormData) => {
    console.log("Dane zamówienia:", data)
    // Tutaj logika wysyłania zamówienia
    alert("Zamówienie zostało złożone!")
  }

  const applyDiscountCode = () => {
    if (discountCode.toLowerCase() === "welcome10") {
      setDiscountApplied(true)
      alert("Kod rabatowy został zastosowany! (10% zniżki)")
    } else {
      alert("Nieprawidłowy kod rabatowy")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finalizacja zamówienia</h1>
          <p className="text-gray-600">Wypełnij poniższe dane, aby zakończyć zakup</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formularz klienta */}
          <div className="lg:col-span-2 space-y-8">
            {/* Dane kontaktowe */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Dane kontaktowe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Imię *</Label>
                    <Input
                      id="firstName"
                      {...register("firstName")}
                      placeholder="Jan"
                      className={errors.firstName ? "border-red-500" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nazwisko *</Label>
                    <Input
                      id="lastName"
                      {...register("lastName")}
                      placeholder="Kowalski"
                      className={errors.lastName ? "border-red-500" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="jan.kowalski@example.com"
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefon *</Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      placeholder="+48 123 456 789"
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Adres wysyłkowy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Adres wysyłkowy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="street">Ulica i numer *</Label>
                  <Input
                    id="street"
                    {...register("street")}
                    placeholder="ul. Przykładowa 123"
                    className={errors.street ? "border-red-500" : ""}
                  />
                  {errors.street && (
                    <p className="text-red-500 text-sm mt-1">{errors.street.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="postalCode">Kod pocztowy *</Label>
                    <Input
                      id="postalCode"
                      {...register("postalCode")}
                      placeholder="00-000"
                      className={errors.postalCode ? "border-red-500" : ""}
                    />
                    {errors.postalCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="city">Miasto *</Label>
                    <Input
                      id="city"
                      {...register("city")}
                      placeholder="Warszawa"
                      className={errors.city ? "border-red-500" : ""}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="country">Kraj *</Label>
                  <Input
                    id="country"
                    {...register("country")}
                    placeholder="Polska"
                    className={errors.country ? "border-red-500" : ""}
                  />
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dane do faktury */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Dane do faktury</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sameAsShipping"
                    checked={sameAsShipping}
                    onCheckedChange={(checked) => setValue("sameAsShipping", checked as boolean)}
                  />
                  <Label htmlFor="sameAsShipping">Dane do faktury są takie same jak adres wysyłkowy</Label>
                </div>
                
                {!sameAsShipping && (
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="companyName">Nazwa firmy</Label>
                      <Input
                        id="companyName"
                        {...register("companyName")}
                        placeholder="Nazwa firmy (opcjonalnie)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nip">NIP</Label>
                      <Input
                        id="nip"
                        {...register("nip")}
                        placeholder="NIP (opcjonalnie)"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metoda dostawy */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Metoda dostawy</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={watch("shippingMethod")}
                  onValueChange={(value) => setValue("shippingMethod", value)}
                  className="space-y-4"
                >
                  {shippingMethods.map((method) => {
                    const Icon = method.icon
                    return (
                      <div key={method.id} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value={method.id} id={method.id} />
                        <div className="flex items-center space-x-3 flex-1">
                          <Icon className="h-5 w-5 text-gray-500" />
                          <div className="flex-1">
                            <Label htmlFor={method.id} className="text-base font-medium cursor-pointer">
                              {method.name}
                            </Label>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">
                            {method.price === 0 ? "Darmowa" : `${method.price.toFixed(2)} zł`}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </RadioGroup>
                {errors.shippingMethod && (
                  <p className="text-red-500 text-sm mt-2">{errors.shippingMethod.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Metoda płatności */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Metoda płatności</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={watch("paymentMethod")}
                  onValueChange={(value) => setValue("paymentMethod", value)}
                  className="space-y-4"
                >
                  {paymentMethods.map((method) => {
                    const Icon = method.icon
                    return (
                      <div key={method.id} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value={method.id} id={`payment-${method.id}`} />
                        <div className="flex items-center space-x-3 flex-1">
                          <Icon className="h-5 w-5 text-gray-500" />
                          <div>
                            <Label htmlFor={`payment-${method.id}`} className="text-base font-medium cursor-pointer">
                              {method.name}
                            </Label>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </RadioGroup>
                {errors.paymentMethod && (
                  <p className="text-red-500 text-sm mt-2">{errors.paymentMethod.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Checkboxy */}
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="termsAccepted"
                    checked={watch("termsAccepted")}
                    onCheckedChange={(checked) => setValue("termsAccepted", checked as boolean)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="termsAccepted" className="text-sm">
                      Akceptuję{" "}
                      <a href="/regulamin" className="text-blue-600 hover:text-blue-800 underline">
                        regulamin
                      </a>{" "}
                      i{" "}
                      <a href="/polityka-prywatnosci" className="text-blue-600 hover:text-blue-800 underline">
                        politykę prywatności
                      </a>{" "}
                      *
                    </Label>
                    {errors.termsAccepted && (
                      <p className="text-red-500 text-sm">{errors.termsAccepted.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="newsletter"
                    checked={watch("newsletter")}
                    onCheckedChange={(checked) => setValue("newsletter", checked as boolean)}
                  />
                  <Label htmlFor="newsletter" className="text-sm">
                    Zapisz mnie do newslettera (otrzymasz informacje o nowościach i promocjach)
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Podsumowanie zamówienia */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              {/* Mobile expandable summary */}
              <div className="lg:hidden">
                <Card>
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => setIsOrderSummaryExpanded(!isOrderSummaryExpanded)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Podsumowanie zamówienia</CardTitle>
                      {isOrderSummaryExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </CardHeader>
                  {isOrderSummaryExpanded && (
                    <CardContent>
                      <OrderSummaryContent 
                        productData={productData}
                        shippingCost={shippingCost}
                        total={total}
                        discountCode={discountCode}
                        setDiscountCode={setDiscountCode}
                        applyDiscountCode={applyDiscountCode}
                        discountApplied={discountApplied}
                      />
                    </CardContent>
                  )}
                </Card>
              </div>

              {/* Desktop fixed summary */}
              <div className="hidden lg:block">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Podsumowanie zamówienia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OrderSummaryContent 
                      productData={productData}
                      shippingCost={shippingCost}
                      total={total}
                      discountCode={discountCode}
                      setDiscountCode={setDiscountCode}
                      applyDiscountCode={applyDiscountCode}
                      discountApplied={discountApplied}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* CTA Button */}
              <div className="mt-6">
                <Button 
                  type="submit" 
                  className="w-full py-4 text-lg font-semibold"
                  size="lg"
                >
                  Zamawiam i płacę
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Klikając, akceptujesz regulamin i politykę prywatności.
                </p>
              </div>

              {/* Trust elements */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Bezpieczne płatności SSL</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <RotateCcw className="h-4 w-4 text-green-600" />
                  <span>30 dni na zwrot</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>4.9/5 - Opinie klientów</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// Komponent podsumowania zamówienia
interface OrderSummaryContentProps {
  productData: typeof productData
  shippingCost: number
  total: number
  discountCode: string
  setDiscountCode: (code: string) => void
  applyDiscountCode: () => void
  discountApplied: boolean
}

function OrderSummaryContent({
  productData,
  shippingCost,
  total,
  discountCode,
  setDiscountCode,
  applyDiscountCode,
  discountApplied
}: OrderSummaryContentProps) {
  return (
    <div className="space-y-4">
      {/* Produkt */}
      <div className="flex space-x-3">
        <img
          src={productData.image}
          alt={productData.name}
          className="w-16 h-16 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h4 className="font-medium text-sm">{productData.name}</h4>
          <p className="text-gray-600 text-sm">Ilość: {productData.quantity}</p>
          <p className="font-semibold">{productData.price.toFixed(2)} zł</p>
        </div>
      </div>

      <Separator />

      {/* Kod rabatowy */}
      <div className="space-y-2">
        <Label htmlFor="discountCode" className="text-sm">Kod rabatowy</Label>
        <div className="flex space-x-2">
          <Input
            id="discountCode"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder="np. WELCOME10"
            className="flex-1"
          />
          <Button 
            type="button" 
            onClick={applyDiscountCode}
            variant="outline"
            size="sm"
          >
            Zastosuj
          </Button>
        </div>
        {discountApplied && (
          <p className="text-green-600 text-sm">Kod rabatowy zastosowany! (10% zniżki)</p>
        )}
      </div>

      <Separator />

      {/* Podsumowanie kosztów */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Wartość produktów:</span>
          <span>{productData.price.toFixed(2)} zł</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Dostawa:</span>
          <span>{shippingCost === 0 ? "Darmowa" : `${shippingCost.toFixed(2)} zł`}</span>
        </div>
        {discountApplied && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Zniżka (10%):</span>
            <span>-{(total * 0.1).toFixed(2)} zł</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between font-semibold text-lg">
          <span>Łącznie:</span>
          <span>{discountApplied ? (total * 0.9).toFixed(2) : total.toFixed(2)} zł</span>
        </div>
      </div>
    </div>
  )
} 