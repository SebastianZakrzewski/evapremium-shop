import { NextRequest, NextResponse } from 'next/server';
import { BitrixOrder } from '@/lib/types/bitrix';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Dodaj walidację danych wejściowych
    if (!body.customer || !body.carDetails || !body.productDetails) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Brak wymaganych danych: customer, carDetails, productDetails' 
        },
        { status: 400 }
      );
    }

    // TODO: Dostosuj strukturę danych do swoich potrzeb
    const orderData: BitrixOrder = {
      customer: {
        firstName: body.customer.firstName || '',
        lastName: body.customer.lastName || '',
        email: body.customer.email || '',
        phone: body.customer.phone || '',
        address: body.customer.address,
      },
      carDetails: {
        brand: body.carDetails.brand || '',
        model: body.carDetails.model || '',
        year: body.carDetails.year || '',
        body: body.carDetails.body || '',
        trans: body.carDetails.trans || '',
      },
      productDetails: {
        type: body.productDetails.type || '',
        color: body.productDetails.color || '',
        texture: body.productDetails.texture || '',
        variant: body.productDetails.variant || '',
        edgeColor: body.productDetails.edgeColor || '',
        image: body.productDetails.image || '',
      },
      shipping: {
        method: body.shipping?.method || '',
        methodName: body.shipping?.methodName || '',
        cost: body.shipping?.cost || 0,
        estimatedDelivery: body.shipping?.estimatedDelivery || '',
      },
      payment: {
        method: body.payment?.method || '',
        methodName: body.payment?.methodName || '',
      },
      company: {
        name: body.company?.name || '',
        nip: body.company?.nip || '',
        isInvoice: body.company?.isInvoice || false,
      },
      pricing: {
        subtotal: body.pricing?.subtotal || 0,
        shippingCost: body.pricing?.shippingCost || 0,
        discountAmount: body.pricing?.discountAmount || 0,
        totalAmount: body.totalAmount || 0,
      },
      additional: {
        termsAccepted: body.additional?.termsAccepted || false,
        newsletter: body.additional?.newsletter || false,
        discountCode: body.additional?.discountCode || '',
        discountApplied: body.additional?.discountApplied || false,
        notes: body.additional?.notes || '',
      },
      metadata: {
        orderId: body.metadata?.orderId || '',
        orderDate: body.metadata?.orderDate || new Date(),
        source: body.metadata?.source || '',
        utmSource: body.metadata?.utmSource || '',
        utmMedium: body.metadata?.utmMedium || '',
        utmCampaign: body.metadata?.utmCampaign || '',
      },
      contactId: body.contactId,
    };

    console.log('📦 Przetwarzanie zamówienia:', orderData);

    // TODO: Dodaj logikę tworzenia kontaktu jeśli jest potrzebna
    // const contactResult = await BitrixService.createOrUpdateContact({...});

    // TODO: Implementuj integrację z Bitrix24
    console.log('📦 Zamówienie do wysłania:', orderData);

    return NextResponse.json({
      success: true,
      message: 'Zamówienie zostało zapisane (integracja z Bitrix24 wyłączona)',
      data: {
        orderId: `temp-${Date.now()}`,
        orderData: orderData
      }
    });

  } catch (error) {
    console.error('❌ Błąd podczas przetwarzania zamówienia:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Błąd serwera podczas przetwarzania zamówienia',
        details: error instanceof Error ? error.message : 'Nieznany błąd'
      },
      { status: 500 }
    );
  }
}

// GET - test połączenia z Bitrix24
export async function GET() {
  try {
    // TODO: Implementuj test połączenia z Bitrix24
    return NextResponse.json({
      success: true,
      message: 'Test połączenia wyłączony (integracja z Bitrix24 nieaktywna)',
      data: { status: 'disabled' }
    });

  } catch (error) {
    console.error('❌ Błąd podczas testowania połączenia z Bitrix24:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Błąd podczas testowania połączenia z Bitrix24',
        details: error instanceof Error ? error.message : 'Nieznany błąd'
      },
      { status: 500 }
    );
  }
} 