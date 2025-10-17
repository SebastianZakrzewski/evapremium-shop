"use client"

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Clock, AlertCircle, ArrowRight, Home, ShoppingBag, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';

interface PaymentStatus {
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  orderId?: string;
  orderNumber?: string;
  transactionId?: number;
  p24OrderId?: number;
  p24MethodId?: number;
  total?: number;
  customer?: any;
  items?: any[];
}

export function PaymentSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const sessionId = searchParams.get('sessionId');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sprawdź czy mamy orderId lub sessionId
    if (!orderId && !sessionId) {
      // Zamiast błędu, pokaż domyślną stronę sukcesu
      setPaymentStatus({
        status: 'paid',
        orderId: 'demo',
        orderNumber: 'DEMO-' + Date.now(),
        total: 0,
        customer: { email: 'demo@evapremium.pl' },
        items: []
      });
      setLoading(false);
      return;
    }

    checkPaymentStatus();
  }, [orderId, sessionId]);

  const checkPaymentStatus = async () => {
    try {
      setLoading(true);
      
      // Pobierz szczegóły zamówienia
      const response = await fetch(`/api/orders/${orderId || sessionId}`);
      
      if (!response.ok) {
        throw new Error('Nie udało się pobrać szczegółów zamówienia');
      }

      const data = await response.json();
      
      if (data.success) {
        const order = data.data;
        setPaymentStatus({
          status: order.paymentStatus,
          orderId: order.id,
          orderNumber: order.orderNumber,
          p24OrderId: order.p24OrderId,
          p24MethodId: order.p24MethodId,
          total: Number(order.total),
          customer: order.customer,
          items: order.items
        });
      } else {
        throw new Error(data.error || 'Błąd podczas pobierania zamówienia');
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-16 w-16 text-green-400 animate-bounce-in" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-16 w-16 text-red-400 animate-bounce-in" />;
      case 'pending':
        return <Clock className="h-16 w-16 text-yellow-400 animate-bounce-in" />;
      default:
        return <AlertCircle className="h-16 w-16 text-gray-400 animate-bounce-in" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Płatność została pomyślnie przetworzona';
      case 'failed':
        return 'Płatność nie została przetworzona';
      case 'cancelled':
        return 'Płatność została anulowana';
      case 'pending':
        return 'Płatność jest w trakcie przetwarzania';
      default:
        return 'Nieznany status płatności';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-900/30 text-green-400 border-green-500/30 px-4 py-2 text-sm font-medium">Opłacone</Badge>;
      case 'failed':
        return <Badge className="bg-red-900/30 text-red-400 border-red-500/30 px-4 py-2 text-sm font-medium">Nieudane</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-900/30 text-gray-400 border-gray-500/30 px-4 py-2 text-sm font-medium">Anulowane</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-900/30 text-yellow-400 border-yellow-500/30 px-4 py-2 text-sm font-medium">W trakcie</Badge>;
      default:
        return <Badge className="bg-gray-900/30 text-gray-400 border-gray-500/30 px-4 py-2 text-sm font-medium">Nieznany</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-red-800/10"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-2 h-2 bg-red-500 rounded-full animate-float-hover"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-red-300 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-red-600 rounded-full animate-float-hover" style={{animationDelay: '0.5s'}}></div>
        </div>

        <Card className="w-full max-w-md bg-neutral-900/80 border-neutral-800 backdrop-blur-sm relative z-10">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-6"></div>
            <p className="text-white/80 text-lg">Sprawdzanie statusu płatności...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-red-800/10"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-2 h-2 bg-red-500 rounded-full animate-float-hover"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-red-300 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-red-600 rounded-full animate-float-hover" style={{animationDelay: '0.5s'}}></div>
        </div>

        <Card className="w-full max-w-md bg-neutral-900/80 border-neutral-800 backdrop-blur-sm relative z-10">
          <CardContent className="p-8 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6 animate-bounce-in" />
            <h2 className="text-2xl font-bold text-white mb-4">Błąd</h2>
            <p className="text-white/70 mb-6 text-lg">{error}</p>
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105">
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Wróć do strony głównej
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!paymentStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-red-800/10"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-2 h-2 bg-red-500 rounded-full animate-float-hover"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-red-300 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-red-600 rounded-full animate-float-hover" style={{animationDelay: '0.5s'}}></div>
        </div>

        <Card className="w-full max-w-md bg-neutral-900/80 border-neutral-800 backdrop-blur-sm relative z-10">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6 animate-bounce-in" />
            <h2 className="text-2xl font-bold text-white mb-4">Brak danych</h2>
            <p className="text-white/70 mb-6 text-lg">Nie udało się pobrać informacji o płatności</p>
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105">
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Wróć do strony głównej
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-red-800/10"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-2 h-2 bg-red-500 rounded-full animate-float-hover"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-red-300 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-red-600 rounded-full animate-float-hover" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-60 left-1/2 w-1 h-1 bg-red-500 rounded-full animate-float-hover" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-60 right-1/4 w-2 h-2 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-4xl">
          {/* Success Image and Main Content */}
          <div className="text-center mb-8 animate-fade-in">
            {paymentStatus.status === 'paid' && (
              <div className="relative mb-8">
                <div className="relative mx-auto w-80 h-56 sm:w-96 sm:h-64 md:w-[28rem] md:h-72 lg:w-[32rem] lg:h-80 xl:w-[36rem] xl:h-80">
                  <img
                    src="/succes.webp"
                    alt="Płatność zakończona sukcesem - ikona sukcesu"
                    className="w-full h-full object-cover rounded-3xl shadow-2xl animate-bounce-in border-4 border-red-500/20"
                    onError={(e) => {
                      console.error('Error loading success image:', e);
                      // Fallback to success icon
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center animate-bounce-in shadow-2xl border-4 border-red-500/20"><svg class="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></div>';
                      }
                    }}
                  />
                  <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-18 h-18 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-red-500 rounded-full flex items-center justify-center animate-pulse-glow shadow-lg">
                    <CheckCircle className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white" />
                  </div>
                </div>
              </div>
            )}
            
            {paymentStatus.status !== 'paid' && (
              <div className="flex justify-center mb-8">
                <div className="relative">
                  {getStatusIcon(paymentStatus.status)}
                  {paymentStatus.status === 'pending' && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full animate-ping"></div>
                  )}
                </div>
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in-delay">
              {paymentStatus.status === 'paid' ? 'Dziękujemy!' : `Dziękujemy! ${getStatusText(paymentStatus.status)}`}
            </h1>
            
            {paymentStatus.status === 'paid' && (
              <p className="text-xl sm:text-2xl text-white/80 mb-4 animate-fade-in-delay-2">
                {getStatusText(paymentStatus.status)}
              </p>
            )}
            
            <div className="flex justify-center mb-8 animate-fade-in-delay-2">
              {getStatusBadge(paymentStatus.status)}
            </div>
          </div>

          {/* Status-specific content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
            {/* Main status card */}
            <Card className="bg-neutral-900/80 border-neutral-800 backdrop-blur-sm animate-slide-in-left">
              <CardContent className="p-6">
                {paymentStatus.status === 'paid' && (
                  <div className="space-y-4">
                    <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
                      <h3 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Dziękujemy! Płatność potwierdzona!
                      </h3>
                      <p className="text-green-300 text-sm">
                        {paymentStatus.orderId === 'demo' 
                          ? 'Dziękujemy za zainteresowanie naszymi produktami! To jest przykładowa strona sukcesu.'
                          : 'Dziękujemy za zakup! Twoje zamówienie zostało pomyślnie opłacone. Otrzymasz potwierdzenie na adres email.'
                        }
                      </p>
                    </div>
                    
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                      <h4 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Co dalej?
                      </h4>
                      <ul className="text-red-300 text-sm space-y-2">
                        {paymentStatus.orderId === 'demo' ? (
                          <>
                            <li>• Przejdź do konfiguratora i skonfiguruj swoje dywaniki</li>
                            <li>• Wybierz markę, model i rok produkcji swojego auta</li>
                            <li>• Dostosuj kolory i materiały do swoich preferencji</li>
                            <li>• Dodaj produkty do koszyka i złoż zamówienie</li>
                          </>
                        ) : (
                          <>
                            <li>• Otrzymasz email z potwierdzeniem zamówienia</li>
                            <li>• Twoje dywaniki zostaną przygotowane w ciągu 1-2 dni</li>
                            <li>• Otrzymasz informację o wysyłce</li>
                            <li>• Czas dostawy: 2-3 dni robocze</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {paymentStatus.status === 'failed' && (
                  <div className="space-y-4">
                    <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4">
                      <h3 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                        <XCircle className="h-5 w-5" />
                        Dziękujemy! Płatność nieudana
                      </h3>
                      <p className="text-red-300 text-sm">
                        Dziękujemy za próbę! Wystąpił problem z przetworzeniem płatności. Spróbuj ponownie lub skontaktuj się z nami.
                      </p>
                    </div>
                  </div>
                )}

                {paymentStatus.status === 'pending' && (
                  <div className="space-y-4">
                    <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Dziękujemy! Płatność w trakcie
                      </h3>
                      <p className="text-yellow-300 text-sm mb-4">
                        Dziękujemy za zakup! Twoja płatność jest w trakcie przetwarzania. Sprawdzimy status za chwilę.
                      </p>
                      <Button 
                        onClick={checkPaymentStatus} 
                        variant="outline" 
                        className="w-full bg-yellow-600/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-600/30"
                        disabled={loading}
                      >
                        {loading ? 'Sprawdzanie...' : 'Sprawdź ponownie'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order details card */}
            <Card className="bg-neutral-900/80 border-neutral-800 backdrop-blur-sm animate-slide-in-right">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Szczegóły zamówienia
                </h4>
                
                <div className="space-y-3 text-sm">
                  {paymentStatus.orderNumber && (
                    <div className="flex justify-between items-center py-2 border-b border-neutral-700">
                      <span className="text-white/70">Numer zamówienia:</span>
                      <span className="text-white font-mono">{paymentStatus.orderNumber}</span>
                    </div>
                  )}
                  
                  {paymentStatus.orderId && (
                    <div className="flex justify-between items-center py-2 border-b border-neutral-700">
                      <span className="text-white/70">ID zamówienia:</span>
                      <span className="text-white font-mono text-xs">{paymentStatus.orderId}</span>
                    </div>
                  )}
                  
                  {paymentStatus.p24OrderId && (
                    <div className="flex justify-between items-center py-2 border-b border-neutral-700">
                      <span className="text-white/70">ID transakcji P24:</span>
                      <span className="text-white font-mono">{paymentStatus.p24OrderId}</span>
                    </div>
                  )}
                  
                  {paymentStatus.total && (
                    <div className="flex justify-between items-center py-2 border-b border-neutral-700">
                      <span className="text-white/70">Kwota:</span>
                      <span className="text-red-400 font-bold text-lg">{paymentStatus.total.toFixed(2)} zł</span>
                    </div>
                  )}
                  
                  {paymentStatus.customer && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-white/70">Email:</span>
                      <span className="text-white">{paymentStatus.customer.email}</span>
                    </div>
                  )}
                </div>

                {/* Products list */}
                {paymentStatus.items && paymentStatus.items.length > 0 && (
                  <div className="mt-6">
                    <h5 className="font-semibold text-white mb-3">Produkty</h5>
                    <div className="space-y-2">
                      {paymentStatus.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-neutral-700 last:border-b-0">
                          <span className="text-white/70 text-sm">{item.productName}</span>
                          <span className="text-white font-medium">{item.subtotal.toFixed(2)} zł</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2 max-w-2xl mx-auto">
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-2">
              <Link href="/">
                <Home className="h-5 w-5" />
                Wróć do strony głównej
              </Link>
            </Button>
            
            {paymentStatus.status === 'failed' && (
              <Button asChild variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-600/20 px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-2">
                <Link href="/checkout">
                  <ShoppingBag className="h-5 w-5" />
                  Spróbuj ponownie
                </Link>
              </Button>
            )}
            
            {paymentStatus.status === 'paid' && (
              <Button asChild variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-600/20 px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-2">
                <Link href="/configurator">
                  <ArrowRight className="h-5 w-5" />
                  {paymentStatus.orderId === 'demo' ? 'Przejdź do konfiguratora' : 'Skonfiguruj kolejne'}
                </Link>
              </Button>
            )}
          </div>

          {/* Contact info */}
          <div className="text-center mt-8 animate-fade-in-delay-2">
            <p className="text-white/60 text-sm mb-4">Potrzebujesz pomocy?</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <a 
                href="mailto:kontakt@evapremium.pl" 
                className="flex items-center justify-center gap-2 text-red-400 hover:text-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black rounded-lg p-2"
                aria-label="Wyślij email do kontaktu"
              >
                <Mail className="h-4 w-4" />
                <span className="text-sm">kontakt@evapremium.pl</span>
              </a>
              <a 
                href="tel:+48123456789" 
                className="flex items-center justify-center gap-2 text-red-400 hover:text-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black rounded-lg p-2"
                aria-label="Zadzwoń do nas"
              >
                <Phone className="h-4 w-4" />
                <span className="text-sm">+48 123 456 789</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
