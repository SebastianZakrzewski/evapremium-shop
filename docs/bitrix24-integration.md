# Bitrix24 Integration Documentation

## Overview

This document describes the Bitrix24 CRM integration module for the EVA Website. The integration enables automatic synchronization of orders, contacts, and leads between the EVA Website and Bitrix24 CRM system.

## Features

- **Automatic Order Sync**: Orders are automatically synchronized to Bitrix24 as deals
- **Contact Management**: Customer contacts are created/updated in Bitrix24
- **Lead Generation**: Contact form submissions create leads in Bitrix24
- **Bidirectional Sync**: Webhook support for updates from Bitrix24
- **Manual Sync**: API endpoints for manual synchronization
- **Error Handling**: Robust error handling with retry logic
- **Rate Limiting**: Built-in rate limiting to respect Bitrix24 API limits

## Architecture

### File Structure

```
src/
├── lib/
│   ├── integrations/
│   │   └── bitrix24/
│   │       ├── client.ts              # Main Bitrix24 API client
│   │       ├── config.ts              # Configuration management
│   │       ├── services/
│   │       │   ├── ContactService.ts  # Contact operations
│   │       │   ├── DealService.ts     # Deal operations
│   │       │   └── LeadService.ts     # Lead operations
│   │       └── mappers/
│   │           ├── orderToContact.ts  # Order → Contact mapping
│   │           ├── orderToDeal.ts     # Order → Deal mapping
│   │           └── formToLead.ts      # Form → Lead mapping
│   └── services/
│       └── OrderService.ts            # Extended with Bitrix24 sync
└── app/
    └── api/
        └── bitrix24/
            ├── test/route.ts          # Connection testing
            ├── sync/route.ts          # Manual synchronization
            └── webhook/route.ts       # Webhook handling
```

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```bash
# Bitrix24 Configuration
BITRIX24_WEBHOOK_URL=https://your-domain.bitrix24.com/rest/1/xxxxx/
BITRIX24_WEBHOOK_ENABLED=true
BITRIX24_AUTO_SYNC_ORDERS=true
BITRIX24_AUTO_SYNC_LEADS=true
```

### Bitrix24 Setup

1. **Create Webhook**:
   - Go to Bitrix24 → Settings → Development → Webhooks
   - Create new webhook with the following permissions:
     - `crm` - Full access to CRM
     - `user` - Read user information
   - Copy the webhook URL to `BITRIX24_WEBHOOK_URL`

2. **Configure Custom Fields** (Optional):
   - Add custom fields to deals for better order tracking:
     - `UF_CRM_ORDER_NUMBER` - Order number
     - `UF_CRM_PAYMENT_METHOD` - Payment method
     - `UF_CRM_PAYMENT_STATUS` - Payment status
     - `UF_CRM_CAR_BRAND` - Car brand
     - `UF_CRM_CAR_MODEL` - Car model
     - `UF_CRM_PRODUCT_TYPE` - Product type
     - `UF_CRM_SHIPPING_METHOD` - Shipping method

## API Endpoints

### Test Connection

**GET** `/api/bitrix24/test`

Tests the Bitrix24 connection and validates configuration.

**Response:**
```json
{
  "success": true,
  "message": "Bitrix24 integration test completed successfully",
  "tests": {
    "configuration": true,
    "connection": true,
    "permissions": true
  },
  "details": {
    "user": { "ID": "1", "NAME": "Admin" },
    "crmPermissions": {
      "contacts": { "success": true },
      "deals": { "success": true },
      "leads": { "success": true }
    }
  }
}
```

**POST** `/api/bitrix24/test`

Run specific tests:

```json
{
  "testType": "connection" // or "contacts", "deals", "leads", "full"
}
```

### Manual Synchronization

**POST** `/api/bitrix24/sync`

Synchronize data with Bitrix24.

**Sync Single Order:**
```json
{
  "type": "order",
  "orderId": "order-uuid",
  "force": false
}
```

**Sync Multiple Orders:**
```json
{
  "type": "orders",
  "dateFrom": "2024-01-01",
  "dateTo": "2024-01-31",
  "force": false
}
```

**Sync Lead:**
```json
{
  "type": "lead",
  "formData": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+48123456789",
    "message": "Interested in car mats"
  }
}
```

**Full Sync:**
```json
{
  "type": "all",
  "dateFrom": "2024-01-01",
  "dateTo": "2024-01-31"
}
```

**GET** `/api/bitrix24/sync?orderNumber=ORD-2024-000001`

Check sync status for specific order.

### Webhook Endpoint

**POST** `/api/bitrix24/webhook`

Receives webhooks from Bitrix24 for bidirectional synchronization.

**GET** `/api/bitrix24/webhook`

Health check for webhook endpoint.

## Data Mapping

### Order → Contact

| EVA Website | Bitrix24 Contact |
|-------------|------------------|
| `customer.name` | `NAME` |
| `customer.email` | `EMAIL[0].VALUE` |
| `customer.phone` | `PHONE[0].VALUE` |
| `shippingAddress.street` | `ADDRESS` |
| `shippingAddress.city` | `ADDRESS_CITY` |
| `shippingAddress.postalCode` | `ADDRESS_POSTAL_CODE` |
| `shippingAddress.country` | `ADDRESS_COUNTRY` |
| `customer.company` | `COMPANY_TITLE` |

### Order → Deal

| EVA Website | Bitrix24 Deal |
|-------------|---------------|
| `orderNumber` | `TITLE` |
| `total` | `OPPORTUNITY` |
| `status` | `STAGE_ID` (mapped) |
| `paymentMethod` | `UF_CRM_PAYMENT_METHOD` |
| `paymentStatus` | `UF_CRM_PAYMENT_STATUS` |
| `orderNumber` | `UF_CRM_ORDER_NUMBER` |
| `createdAt` | `UF_CRM_ORDER_DATE` |

### Form → Lead

| Form Data | Bitrix24 Lead |
|-----------|---------------|
| `name` | `NAME` |
| `email` | `EMAIL[0].VALUE` |
| `phone` | `PHONE[0].VALUE` |
| `company` | `COMPANY_TITLE` |
| `message` | `COMMENTS` |
| `subject` | `TITLE` |

## Status Mapping

### Order Status → Deal Stage

| Order Status | Deal Stage |
|--------------|------------|
| `pending` | `NEW` |
| `confirmed` | `PREPARATION` |
| `processing` | `PREPARATION` |
| `shipped` | `PREPARATION` |
| `delivered` | `WON` |
| `cancelled` | `LOSE` |

### Payment Status → Deal Stage

| Payment Status | Deal Stage |
|----------------|------------|
| `paid` | `PREPARATION` |
| `failed` | `LOSE` |
| `refunded` | `LOSE` |
| `pending` | `NEW` |

## Error Handling

### Retry Logic

- **Max Attempts**: 3
- **Base Delay**: 1 second
- **Exponential Backoff**: Yes
- **Max Delay**: 30 seconds

### Rate Limiting

- **Max Requests**: 2 per second
- **Time Window**: 1 second
- **Automatic Queuing**: Yes

### Error Types

1. **Configuration Errors**: Missing or invalid environment variables
2. **Connection Errors**: Network issues, timeouts
3. **API Errors**: Bitrix24 API errors, invalid responses
4. **Validation Errors**: Invalid data format, missing required fields
5. **Permission Errors**: Insufficient webhook permissions

## Monitoring and Logging

### Log Levels

- **INFO**: Successful operations, sync completions
- **WARN**: Non-critical issues, skipped operations
- **ERROR**: Failed operations, API errors
- **DEBUG**: Detailed operation information

### Key Metrics

- Sync success rate
- Error frequency by type
- API response times
- Queue processing times

## Troubleshooting

### Common Issues

1. **"Bitrix24 integration is disabled"**
   - Check `BITRIX24_WEBHOOK_ENABLED=true` in environment variables

2. **"Configuration validation failed"**
   - Verify `BITRIX24_WEBHOOK_URL` is set and valid
   - Ensure webhook URL contains `bitrix24.com`

3. **"Connection test failed"**
   - Check webhook URL is correct
   - Verify webhook permissions include `crm` and `user`
   - Test webhook URL manually in browser

4. **"Permission denied"**
   - Check webhook has required permissions
   - Verify webhook is not expired
   - Regenerate webhook if necessary

5. **"Rate limit exceeded"**
   - Integration has built-in rate limiting
   - Reduce sync frequency if needed
   - Check for multiple sync processes running

### Debug Mode

Enable detailed logging by setting:
```bash
NODE_ENV=development
```

### Testing

1. **Test Connection**:
   ```bash
   curl -X GET https://your-domain.com/api/bitrix24/test
   ```

2. **Test Sync**:
   ```bash
   curl -X POST https://your-domain.com/api/bitrix24/sync \
     -H "Content-Type: application/json" \
     -d '{"type": "connection"}'
   ```

3. **Test Webhook**:
   ```bash
   curl -X GET https://your-domain.com/api/bitrix24/webhook
   ```

## Security Considerations

1. **Webhook Security**: Webhook URLs should be kept secret
2. **Data Validation**: All incoming data is validated with Zod schemas
3. **Error Information**: Sensitive information is not exposed in error messages
4. **Rate Limiting**: Built-in protection against API abuse
5. **Retry Logic**: Prevents infinite retry loops

## Performance Optimization

1. **Batch Operations**: Multiple products added in single batch request
2. **Async Processing**: Sync operations don't block order creation
3. **Error Isolation**: Sync failures don't affect order processing
4. **Caching**: Contact lookup to avoid duplicate creation
5. **Rate Limiting**: Respects Bitrix24 API limits

## Future Enhancements

1. **Real-time Sync**: WebSocket-based real-time synchronization
2. **Advanced Mapping**: Custom field mapping configuration
3. **Sync Dashboard**: Web interface for monitoring and management
4. **Bulk Operations**: Mass import/export functionality
5. **Analytics**: Detailed sync statistics and reporting

## Support

For technical support or questions about the Bitrix24 integration:

1. Check this documentation first
2. Review application logs for error details
3. Test connection using `/api/bitrix24/test`
4. Contact development team with specific error messages

## Changelog

### Version 1.0.0
- Initial implementation
- Order synchronization
- Contact management
- Lead generation
- Webhook support
- Manual sync API
- Error handling and retry logic
- Rate limiting
- Comprehensive documentation
