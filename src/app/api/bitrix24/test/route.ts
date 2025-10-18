/**
 * Bitrix24 Test Endpoint
 * 
 * Tests connection to Bitrix24 and validates configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { bitrix24Client } from '@/lib/integrations/bitrix24/client';
import { validateBitrix24Config } from '@/lib/integrations/bitrix24/config';
import { contactService } from '@/lib/integrations/bitrix24/services/ContactService';
import { dealService } from '@/lib/integrations/bitrix24/services/DealService';
import { leadService } from '@/lib/integrations/bitrix24/services/LeadService';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Bitrix24 connection...');

    // 1. Validate configuration
    const configValidation = validateBitrix24Config();
    if (!configValidation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Configuration validation failed',
        details: configValidation.errors,
        tests: {
          configuration: false,
          connection: false,
          permissions: false,
        }
      }, { status: 400 });
    }

    console.log('✅ Configuration validation passed');

    // 2. Test basic connection
    const connectionTest = await bitrix24Client.testConnection();
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: 'Connection test failed',
        details: connectionTest.error,
        tests: {
          configuration: true,
          connection: false,
          permissions: false,
        }
      }, { status: 500 });
    }

    console.log('✅ Connection test passed');

    // 3. Test permissions by getting current user
    let userInfo = null;
    try {
      userInfo = await bitrix24Client.getCurrentUser();
      console.log('✅ User info retrieved successfully');
    } catch (error) {
      console.warn('⚠️ Failed to get user info:', error);
    }

    // 4. Test CRM permissions
    const crmTests = await testCrmPermissions();

    const result = {
      success: true,
      message: 'Bitrix24 integration test completed successfully',
      tests: {
        configuration: true,
        connection: true,
        permissions: crmTests.success,
      },
      details: {
        user: userInfo,
        crmPermissions: crmTests.details,
        timestamp: new Date().toISOString(),
      }
    };

    console.log('✅ All Bitrix24 tests passed');

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Bitrix24 test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      tests: {
        configuration: false,
        connection: false,
        permissions: false,
      }
    }, { status: 500 });
  }
}

/**
 * Test CRM permissions
 */
async function testCrmPermissions(): Promise<{ success: boolean; details: any }> {
  const results: any = {
    contacts: { success: false, error: null },
    deals: { success: false, error: null },
    leads: { success: false, error: null },
  };

  try {
    // Test contacts
    try {
      await contactService.findByEmail('test@example.com');
      results.contacts.success = true;
      console.log('✅ Contacts permission test passed');
    } catch (error) {
      results.contacts.error = error instanceof Error ? error.message : 'Unknown error';
      console.warn('⚠️ Contacts permission test failed:', error);
    }

    // Test deals
    try {
      await dealService.getDealStages();
      results.deals.success = true;
      console.log('✅ Deals permission test passed');
    } catch (error) {
      results.deals.error = error instanceof Error ? error.message : 'Unknown error';
      console.warn('⚠️ Deals permission test failed:', error);
    }

    // Test leads
    try {
      await leadService.getLeadSources();
      results.leads.success = true;
      console.log('✅ Leads permission test passed');
    } catch (error) {
      results.leads.error = error instanceof Error ? error.message : 'Unknown error';
      console.warn('⚠️ Leads permission test failed:', error);
    }

    const allPassed = Object.values(results).every((test: any) => test.success);
    
    return {
      success: allPassed,
      details: results
    };

  } catch (error) {
    console.error('❌ CRM permissions test failed:', error);
    return {
      success: false,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        ...results
      }
    };
  }
}

/**
 * POST - Run specific tests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType } = body;

    console.log('🧪 Running specific Bitrix24 test:', testType);

    switch (testType) {
      case 'connection':
        return await testConnection();
      
      case 'contacts':
        return await testContacts();
      
      case 'deals':
        return await testDeals();
      
      case 'leads':
        return await testLeads();
      
      case 'full':
        return await testFullIntegration();
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid test type. Available: connection, contacts, deals, leads, full'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Specific test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Test connection only
 */
async function testConnection() {
  const connectionTest = await bitrix24Client.testConnection();
  
  return NextResponse.json({
    success: connectionTest.success,
    message: connectionTest.success ? 'Connection successful' : 'Connection failed',
    details: connectionTest
  });
}

/**
 * Test contacts functionality
 */
async function testContacts() {
  try {
    const sources = await leadService.getLeadSources();
    const testEmail = 'test@example.com';
    const contact = await contactService.findByEmail(testEmail);
    
    return NextResponse.json({
      success: true,
      message: 'Contacts test completed',
      details: {
        sourcesCount: sources.length,
        testEmailSearch: contact ? 'Found' : 'Not found',
        contact: contact
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Test deals functionality
 */
async function testDeals() {
  try {
    const stages = await dealService.getDealStages();
    
    return NextResponse.json({
      success: true,
      message: 'Deals test completed',
      details: {
        stagesCount: stages.length,
        stages: stages.slice(0, 5) // First 5 stages
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Test leads functionality
 */
async function testLeads() {
  try {
    const sources = await leadService.getLeadSources();
    const statuses = await leadService.getLeadStatuses();
    
    return NextResponse.json({
      success: true,
      message: 'Leads test completed',
      details: {
        sourcesCount: sources.length,
        statusesCount: statuses.length,
        sources: sources.slice(0, 5), // First 5 sources
        statuses: statuses.slice(0, 5) // First 5 statuses
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Test full integration
 */
async function testFullIntegration() {
  try {
    // Test all services
    const [userInfo, stages, sources, statuses] = await Promise.all([
      bitrix24Client.getCurrentUser(),
      dealService.getDealStages(),
      leadService.getLeadSources(),
      leadService.getLeadStatuses()
    ]);

    return NextResponse.json({
      success: true,
      message: 'Full integration test completed',
      details: {
        user: userInfo,
        dealStages: stages.length,
        leadSources: sources.length,
        leadStatuses: statuses.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
