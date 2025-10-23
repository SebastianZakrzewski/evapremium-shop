// Debug order items and configuration
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugOrderItems() {
  try {
    console.log('🔍 Debugging order items and configuration...');
    
    // Get order with items
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products(*)
        )
      `)
      .eq('order_number', 'ORD-2025-000003')
      .limit(1);
    
    if (error) {
      console.error('❌ Error fetching order:', error);
      return;
    }
    
    if (!orders || orders.length === 0) {
      console.log('❌ Order not found');
      return;
    }
    
    const order = orders[0];
    console.log('📋 Order with items:', {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      total: order.total,
      itemsCount: order.order_items?.length || 0
    });
    
    // Analyze each item
    if (order.order_items && order.order_items.length > 0) {
      order.order_items.forEach((item, index) => {
        console.log(`\n🔍 Item ${index + 1}:`, {
          id: item.id,
          productType: item.product_type,
          productName: item.product_name,
          productSku: item.product_sku,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          subtotal: item.subtotal,
          hasConfiguration: !!item.configuration,
          configuration: item.configuration,
          product: item.product
        });
        
        // Analyze configuration if exists
        if (item.configuration) {
          console.log(`🔍 Item ${index + 1} configuration:`, {
            configurationType: typeof item.configuration,
            configurationKeys: Object.keys(item.configuration),
            fullConfiguration: item.configuration
          });
        }
      });
    } else {
      console.log('❌ No items found in order');
    }
    
  } catch (error) {
    console.error('❌ Error debugging order items:', error);
  }
}

debugOrderItems();
