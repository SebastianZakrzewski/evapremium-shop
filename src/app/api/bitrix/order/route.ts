import { NextRequest, NextResponse } from 'next/server';
import { BitrixService } from '@/lib/services/BitrixService';
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
      totalAmount: body.totalAmount || 0,
      contactId: body.contactId,
    };

    console.log('📦 Przetwarzanie zamówienia:', orderData);

    // TODO: Dodaj logikę tworzenia kontaktu jeśli jest potrzebna
    // const contactResult = await BitrixService.createOrUpdateContact({...});

    // Wysyłanie zamówienia do Bitrix24
    const result = await BitrixService.sendOrder(orderData);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Błąd podczas wysyłania zamówienia do Bitrix24',
          details: result.error 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Zamówienie zostało pomyślnie wysłane do Bitrix24',
      data: {
        orderId: result.data,
        bitrixResponse: result
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
    const testResult = await BitrixService.testConnection();
    
    if (!testResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Błąd połączenia z Bitrix24',
          details: testResult.error 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Połączenie z Bitrix24 działa poprawnie',
      data: testResult.data
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