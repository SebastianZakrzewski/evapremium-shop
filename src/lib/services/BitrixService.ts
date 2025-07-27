import { BitrixOrder, BitrixResponse } from '../types/bitrix';

export class BitrixService {
  // TODO: Zaktualizuj te zmienne środowiskowe o rzeczywiste dane Bitrix24
  private static readonly BITRIX_WEBHOOK_URL = process.env.BITRIX_WEBHOOK_URL || 'https://your-domain.bitrix24.pl/rest/1/your-webhook-key';
  private static readonly BITRIX_DEAL_STAGE_ID = process.env.BITRIX_DEAL_STAGE_ID || 'NEW';
  private static readonly BITRIX_ASSIGNED_BY_ID = process.env.BITRIX_ASSIGNED_BY_ID || '1';

  /**
   * Wysyła zamówienie do Bitrix24
   * TODO: Zaktualizuj endpoint URL o rzeczywisty adres Bitrix24
   */
  static async sendOrder(orderData: BitrixOrder): Promise<BitrixResponse> {
    try {
      // TODO: Sprawdź czy BITRIX_WEBHOOK_URL jest skonfigurowany
      if (!this.BITRIX_WEBHOOK_URL || this.BITRIX_WEBHOOK_URL.includes('your-domain')) {
        throw new Error('BITRIX_WEBHOOK_URL nie jest skonfigurowany - zaktualizuj zmienną środowiskową');
      }

      // TODO: Dostosuj strukturę danych do wymagań Twojego Bitrix24
      const bitrixData = {
        fields: {
          TITLE: `Zamówienie dywaników - ${orderData.customer.firstName} ${orderData.customer.lastName}`,
          STAGE_ID: this.BITRIX_DEAL_STAGE_ID,
          CURRENCY_ID: 'PLN',
          OPPORTUNITY: orderData.totalAmount,
          COMMENTS: this.formatOrderComments(orderData),
          CONTACT_ID: orderData.contactId,
          ASSIGNED_BY_ID: this.BITRIX_ASSIGNED_BY_ID,
          SOURCE_ID: 'WEB',
          UTM_SOURCE: 'eva-website',
          // TODO: Dodaj niestandardowe pola jeśli są potrzebne w Twoim Bitrix24
          // UF_CRM_CAR_BRAND: orderData.carDetails.brand,
          // UF_CRM_CAR_MODEL: orderData.carDetails.model,
          // UF_CRM_CAR_YEAR: orderData.carDetails.year,
          // UF_CRM_CAR_BODY: orderData.carDetails.body,
          // UF_CRM_CAR_TRANS: orderData.carDetails.trans,
          // UF_CRM_MAT_TYPE: orderData.productDetails.type,
          // UF_CRM_MAT_COLOR: orderData.productDetails.color,
          // UF_CRM_MAT_TEXTURE: orderData.productDetails.texture,
          // UF_CRM_MAT_VARIANT: orderData.productDetails.variant,
          // UF_CRM_MAT_EDGE_COLOR: orderData.productDetails.edgeColor,
          // UF_CRM_MAT_IMAGE: orderData.productDetails.image,
        }
      };

      console.log('📤 Wysyłanie zamówienia do Bitrix24:', {
        url: `${this.BITRIX_WEBHOOK_URL}/crm.deal.add`,
        data: bitrixData
      });

      const response = await fetch(`${this.BITRIX_WEBHOOK_URL}/crm.deal.add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bitrixData)
      });

      if (!response.ok) {
        throw new Error(`Bitrix API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Bitrix API error: ${result.error_description}`);
      }

      console.log('✅ Zamówienie zostało pomyślnie wysłane do Bitrix24:', result);

      return {
        success: true,
        data: result.result,
        message: 'Zamówienie zostało utworzone w Bitrix24'
      };

    } catch (error) {
      console.error('❌ Błąd podczas wysyłania zamówienia do Bitrix24:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Nieznany błąd',
        message: 'Błąd podczas tworzenia zamówienia w Bitrix24'
      };
    }
  }

  /**
   * Testuje połączenie z Bitrix24
   * TODO: Użyj tego do sprawdzenia czy konfiguracja jest poprawna
   */
  static async testConnection(): Promise<BitrixResponse> {
    try {
      if (!this.BITRIX_WEBHOOK_URL || this.BITRIX_WEBHOOK_URL.includes('your-domain')) {
        throw new Error('BITRIX_WEBHOOK_URL nie jest skonfigurowany');
      }

      const response = await fetch(`${this.BITRIX_WEBHOOK_URL}/crm.deal.fields`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Bitrix API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`Bitrix API error: ${result.error_description}`);
      }

      return {
        success: true,
        data: result.result,
        message: 'Połączenie z Bitrix24 działa poprawnie'
      };

    } catch (error) {
      console.error('❌ Błąd połączenia z Bitrix24:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Nieznany błąd',
        message: 'Błąd połączenia z Bitrix24'
      };
    }
  }

  /**
   * Formatuje komentarze zamówienia
   * TODO: Dostosuj format do swoich potrzeb
   */
  private static formatOrderComments(orderData: BitrixOrder): string {
    return `
Zamówienie dywaników:

Samochód:
- Marka: ${orderData.carDetails.brand}
- Model: ${orderData.carDetails.model}
- Rok: ${orderData.carDetails.year}
- Nadwozie: ${orderData.carDetails.body}
- Skrzynia: ${orderData.carDetails.trans}

Produkt:
- Typ: ${orderData.productDetails.type}
- Kolor: ${orderData.productDetails.color}
- Tekstura: ${orderData.productDetails.texture}
- Wariant: ${orderData.productDetails.variant}
- Kolor obszycia: ${orderData.productDetails.edgeColor}

Klient:
- Imię: ${orderData.customer.firstName}
- Nazwisko: ${orderData.customer.lastName}
- Email: ${orderData.customer.email}
- Telefon: ${orderData.customer.phone}

Cena całkowita: ${orderData.totalAmount} PLN
    `.trim();
  }
} 