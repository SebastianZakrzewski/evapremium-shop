"use client"

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
      setError('Brak identyfikatora zamówienia');
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
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-8 w-8 text-red-500" />;
      case 'pending':
        return <Clock className="h-8 w-8 text-yellow-500" />;
      default:
        return <AlertCircle className="h-8 w-8 text-gray-500" />;
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
        return <Badge className="bg-green-100 text-green-800">Opłacone</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Nieudane</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Anulowane</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">W trakcie</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Nieznany</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Sprawdzanie statusu płatności...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Błąd</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button asChild>
              <Link href="/">Wróć do strony głównej</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!paymentStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Brak danych</h2>
            <p className="text-gray-600 mb-4">Nie udało się pobrać informacji o płatności</p>
            <Button asChild>
              <Link href="/">Wróć do strony głównej</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon(paymentStatus.status)}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {getStatusText(paymentStatus.status)}
          </CardTitle>
          <div className="flex justify-center mt-2">
            {getStatusBadge(paymentStatus.status)}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {paymentStatus.status === 'paid' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Płatność potwierdzona!</h3>
              <p className="text-green-700 text-sm">
                Twoje zamówienie zostało pomyślnie opłacone. Otrzymasz potwierdzenie na adres email.
              </p>
            </div>
          )}

          {paymentStatus.status === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Płatność nieudana</h3>
              <p className="text-red-700 text-sm">
                Wystąpił problem z przetworzeniem płatności. Spróbuj ponownie lub skontaktuj się z nami.
              </p>
            </div>
          )}

          {paymentStatus.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Płatność w trakcie</h3>
              <p className="text-yellow-700 text-sm">
                Twoja płatność jest w trakcie przetwarzania. Sprawdzimy status za chwilę.
              </p>
              <Button 
                onClick={checkPaymentStatus} 
                variant="outline" 
                className="mt-2"
                disabled={loading}
              >
                Sprawdź ponownie
              </Button>
            </div>
          )}

          {paymentStatus.orderId && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Szczegóły zamówienia</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Numer zamówienia:</strong> {paymentStatus.orderNumber}</p>
                <p><strong>ID zamówienia:</strong> {paymentStatus.orderId}</p>
                {paymentStatus.p24OrderId && (
                  <p><strong>ID transakcji P24:</strong> {paymentStatus.p24OrderId}</p>
                )}
                {paymentStatus.total && (
                  <p><strong>Kwota:</strong> {paymentStatus.total.toFixed(2)} zł</p>
                )}
                {paymentStatus.customer && (
                  <p><strong>Email:</strong> {paymentStatus.customer.email}</p>
                )}
              </div>
            </div>
          )}

          {paymentStatus.items && paymentStatus.items.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Produkty</h4>
              <div className="space-y-2">
                {paymentStatus.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{item.productName}</span>
                    <span className="font-medium">{item.subtotal.toFixed(2)} zł</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/">Wróć do strony głównej</Link>
            </Button>
            {paymentStatus.status === 'failed' && (
              <Button asChild variant="outline" className="flex-1">
                <Link href="/checkout">Spróbuj ponownie</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
