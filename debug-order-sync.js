// Simple debug script to test order sync
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugOrderSync() {
  try {
    console.log('🔍 Debugging order sync...');
    
    // Get orders from database
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['pending', 'confirmed'])
      .limit(1);
    
    if (error) {
      console.error('❌ Error fetching orders:', error);
      return;
    }
    
    if (!orders || orders.length === 0) {
      console.log('❌ No orders found');
      return;
    }
    
    const order = orders[0];
    console.log('📋 Order details:', {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      customer: order.customer,
      shippingAddress: order.shipping_address,
      createdAt: order.created_at
    });
    
    // Check customer data
    const customer = order.customer;
    console.log('👤 Customer analysis:', {
      hasCustomer: !!customer,
      customerType: typeof customer,
      customerKeys: customer ? Object.keys(customer) : 'no customer',
      hasName: !!(customer && customer.name),
      hasEmail: !!(customer && customer.email),
      hasPhone: !!(customer && customer.phone),
      name: customer?.name,
      email: customer?.email,
      phone: customer?.phone,
      firstName: customer?.firstName,
      lastName: customer?.lastName
    });
    
    // Check shipping address
    const shippingAddress = order.shipping_address;
    console.log('🏠 Shipping address analysis:', {
      hasShippingAddress: !!shippingAddress,
      shippingAddressType: typeof shippingAddress,
      shippingAddressKeys: shippingAddress ? Object.keys(shippingAddress) : 'no shipping address',
      street: shippingAddress?.street,
      city: shippingAddress?.city,
      postalCode: shippingAddress?.postalCode,
      country: shippingAddress?.country
    });
    
    // Simulate contact mapping
    console.log('🔄 Simulating contact mapping...');
    
    const fullName = customer?.name || `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim();
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const contactData = {
      NAME: firstName || 'Klient',
      LAST_NAME: lastName,
      EMAIL: customer?.email ? [{
        VALUE: customer.email,
        VALUE_TYPE: 'WORK'
      }] : undefined,
      PHONE: customer?.phone ? [{
        VALUE: customer.phone,
        VALUE_TYPE: 'WORK'
      }] : undefined,
      ADDRESS: shippingAddress?.street || shippingAddress?.address,
      ADDRESS_CITY: shippingAddress?.city,
      ADDRESS_POSTAL_CODE: shippingAddress?.postalCode,
      ADDRESS_COUNTRY: shippingAddress?.country || 'Polska',
      COMPANY_TITLE: customer?.company || undefined,
      SOURCE_ID: 'WEB',
      SOURCE_DESCRIPTION: 'EVA Website',
    };
    
    // Remove undefined values
    const cleanContactData = Object.fromEntries(
      Object.entries(contactData).filter(([_, value]) => value !== undefined)
    );
    
    console.log('📞 Mapped contact data:', {
      name: cleanContactData.NAME,
      lastName: cleanContactData.LAST_NAME,
      hasEmail: !!cleanContactData.EMAIL?.length,
      hasPhone: !!cleanContactData.PHONE?.length,
      emailValue: cleanContactData.EMAIL?.[0]?.VALUE,
      phoneValue: cleanContactData.PHONE?.[0]?.VALUE,
      fullContactData: cleanContactData
    });
    
    // Check if contact has minimum required data
    const hasMinimumData = cleanContactData.NAME && 
      (cleanContactData.EMAIL?.length || cleanContactData.PHONE?.length);
    
    console.log('✅ Contact validation:', {
      hasMinimumData,
      hasName: !!cleanContactData.NAME,
      hasEmail: !!cleanContactData.EMAIL?.length,
      hasPhone: !!cleanContactData.PHONE?.length,
      isValid: hasMinimumData
    });
    
    if (!hasMinimumData) {
      console.error('❌ Contact missing required data - this will cause sync to fail');
    } else {
      console.log('✅ Contact has minimum required data');
    }
    
  } catch (error) {
    console.error('❌ Error in debug:', error);
  }
}

debugOrderSync();
