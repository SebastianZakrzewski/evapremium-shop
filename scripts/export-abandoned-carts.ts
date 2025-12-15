// Load environment variables from .env file
import { config } from 'dotenv';
import { resolve } from 'path';

// Try to load .env.local first, then .env
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Set Bitrix24 integration as enabled before importing modules
if (!process.env.BITRIX24_WEBHOOK_ENABLED) {
  process.env.BITRIX24_WEBHOOK_ENABLED = 'true';
}

// Check if Bitrix24 webhook URL is configured
if (!process.env.BITRIX24_WEBHOOK_URL || 
    process.env.BITRIX24_WEBHOOK_URL.includes('your-domain') || 
    process.env.BITRIX24_WEBHOOK_URL.includes('xxxxx')) {
  console.error('❌ Bitrix24 webhook URL is not configured!');
  console.error('Please set BITRIX24_WEBHOOK_URL in your .env or .env.local file');
  console.error('Example: BITRIX24_WEBHOOK_URL=https://your-domain.bitrix24.com/rest/1/xxxxx/');
  process.exit(1);
}

import { createClient } from '@supabase/supabase-js';
import { env } from '../src/config/env';
import { dealService } from '../src/lib/integrations/bitrix24/services/DealService';

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

const CART_IDS = [
  '6dbed870-ee94-40ec-9399-83cf89d9c1a7',
  'e4c4d5ae-ba19-4e6b-a178-357c05f66575'
];

async function exportAbandonedCarts() {
  console.log('🚀 Starting manual export of abandoned carts...');
  console.log('📋 Cart IDs to process:', CART_IDS);

  const results: Array<{ id: string; bitrixDealId?: string; error?: string }> = [];

  for (const cartId of CART_IDS) {
    try {
      console.log(`\n🔄 Processing cart: ${cartId}`);

      // 1. Fetch cart from database
      const { data: cart, error: fetchError } = await supabase
        .from('abandoned_carts')
        .select('*')
        .eq('id', cartId)
        .single();

      if (fetchError) {
        console.error(`❌ Error fetching cart ${cartId}:`, fetchError.message);
        results.push({ id: cartId, error: fetchError.message });
        continue;
      }

      if (!cart) {
        console.error(`❌ Cart ${cartId} not found`);
        results.push({ id: cartId, error: 'Cart not found' });
        continue;
      }

      console.log(`✅ Cart found:`, {
        id: cart.id,
        status: cart.status,
        bitrix_deal_id: cart.bitrix_deal_id,
        stage: (cart.metadata as any)?.stage,
        total_amount: cart.total_amount
      });

      // 2. Check if already exported
      if (cart.bitrix_deal_id) {
        console.log(`⚠️ Cart ${cartId} already has deal_id: ${cart.bitrix_deal_id}`);
        results.push({ id: cartId, bitrixDealId: cart.bitrix_deal_id });
        continue;
      }

      // 3. Atomic lock: set status to 'processing'
      const { data: lockedCart, error: lockError } = await supabase
        .from('abandoned_carts')
        .update({ status: 'processing' })
        .eq('id', cartId)
        .select()
        .single();

      if (lockError) {
        console.error(`❌ Error locking cart ${cartId}:`, lockError.message);
        results.push({ id: cartId, error: lockError.message });
        continue;
      }

      if (!lockedCart) {
        console.error(`❌ Failed to lock cart ${cartId}`);
        results.push({ id: cartId, error: 'Failed to lock cart' });
        continue;
      }

      console.log(`🔒 Cart locked for processing`);

      // 4. Create deal in Bitrix24
      console.log(`📤 Creating deal in Bitrix24...`);
      const created = await dealService.createDealForAbandonedCart(lockedCart as any);

      if (!created.success || !created.id) {
        console.error(`❌ Failed to create deal for cart ${cartId}:`, created.error);
        // Rollback status
        await supabase
          .from('abandoned_carts')
          .update({ status: cart.status || 'pending' })
          .eq('id', cartId);
        results.push({ id: cartId, error: created.error || 'Failed to create deal' });
        continue;
      }

      console.log(`✅ Deal created in Bitrix24: ${created.id}`);

      // 5. Update cart with deal_id and status 'exported'
      const { error: updateError } = await supabase
        .from('abandoned_carts')
        .update({ 
          bitrix_deal_id: created.id, 
          status: 'exported',
          bitrix_category_id: null,
          bitrix_stage_id: null
        })
        .eq('id', cartId)
        .eq('status', 'processing');

      if (updateError) {
        console.error(`❌ Error updating cart ${cartId}:`, updateError.message);
        // Rollback status
        await supabase
          .from('abandoned_carts')
          .update({ status: cart.status || 'pending' })
          .eq('id', cartId);
        results.push({ id: cartId, error: updateError.message });
      } else {
        console.log(`✅ Cart ${cartId} successfully exported to Bitrix24`);
        results.push({ id: cartId, bitrixDealId: created.id });
      }
    } catch (e: any) {
      console.error(`❌ Exception processing cart ${cartId}:`, e?.message);
      // Try to rollback status
      try {
        const { data: cart } = await supabase
          .from('abandoned_carts')
          .select('status')
          .eq('id', cartId)
          .single();
        
        if (cart) {
          await supabase
            .from('abandoned_carts')
            .update({ status: cart.status || 'pending' })
            .eq('id', cartId);
        }
      } catch (rollbackError) {
        console.error(`❌ Failed to rollback status for cart ${cartId}`);
      }
      results.push({ id: cartId, error: e?.message || 'Unknown error' });
    }
  }

  // Summary
  console.log('\n📊 Summary:');
  console.log('='.repeat(50));
  const successCount = results.filter(r => r.bitrixDealId).length;
  const errorCount = results.filter(r => r.error).length;
  
  results.forEach(result => {
    if (result.bitrixDealId) {
      console.log(`✅ ${result.id}: Exported to Bitrix24 (Deal ID: ${result.bitrixDealId})`);
    } else {
      console.log(`❌ ${result.id}: ${result.error || 'Unknown error'}`);
    }
  });
  
  console.log('='.repeat(50));
  console.log(`Total: ${results.length}, Success: ${successCount}, Errors: ${errorCount}`);

  process.exit(errorCount > 0 ? 1 : 0);
}

// Run the script
exportAbandonedCarts().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

