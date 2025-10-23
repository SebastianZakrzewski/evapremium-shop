// Sprawdź konfigurację zamówienia i strukturę danych
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrderConfiguration() {
  try {
    console.log('🔍 Sprawdzanie konfiguracji zamówienia ORD-2025-000003...\n');
    
    // Pobierz zamówienie z items
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('order_number', 'ORD-2025-000003')
      .single();
    
    if (error) {
      console.error('❌ Error fetching order:', error);
      return;
    }
    
    if (!orders) {
      console.log('❌ Order not found');
      return;
    }
    
    console.log('📋 ORDER DETAILS:');
    console.log('   Order Number:', orders.order_number);
    console.log('   Status:', orders.status);
    console.log('   Payment Status:', orders.payment_status);
    console.log('   Total:', orders.total);
    console.log('   Items count:', orders.order_items?.length || 0);
    
    console.log('\n📦 ORDER ITEMS:');
    if (orders.order_items && orders.order_items.length > 0) {
      orders.order_items.forEach((item, index) => {
        console.log(`\n   Item ${index + 1}:`);
        console.log('   - Product Name:', item.product_name);
        console.log('   - Product Type:', item.product_type);
        console.log('   - Quantity:', item.quantity);
        console.log('   - Unit Price:', item.unit_price);
        console.log('   - Has Configuration:', !!item.configuration);
        
        if (item.configuration) {
          console.log('   - Configuration:', JSON.stringify(item.configuration, null, 6));
          
          // Sprawdź strukturę konfiguracji
          const config = item.configuration;
          console.log('\n   📊 CONFIGURATION ANALYSIS:');
          console.log('   - Configuration keys:', Object.keys(config));
          console.log('   - Has carDetails:', !!config.carDetails);
          
          if (config.carDetails) {
            console.log('   - carDetails:', JSON.stringify(config.carDetails, null, 6));
            console.log('   - carDetails keys:', Object.keys(config.carDetails));
            console.log('   - Brand:', config.carDetails.brand);
            console.log('   - Model:', config.carDetails.model);
            console.log('   - Year:', config.carDetails.year);
            console.log('   - Body:', config.carDetails.body);
          } else {
            console.log('   ⚠️  No carDetails found in configuration');
          }
          
          console.log('   - Has materialColor:', !!config.materialColor);
          console.log('   - materialColor:', config.materialColor);
          console.log('   - Has borderColor:', !!config.borderColor);
          console.log('   - borderColor:', config.borderColor);
          console.log('   - Has cellShape:', !!config.cellShape);
          console.log('   - cellShape:', config.cellShape);
          console.log('   - Has setType:', !!config.setType);
          console.log('   - setType:', config.setType);
        } else {
          console.log('   ⚠️  No configuration found for this item');
        }
      });
    } else {
      console.log('   ⚠️  No order items found');
    }
    
    console.log('\n✅ Analysis complete');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkOrderConfiguration().catch(console.error);

