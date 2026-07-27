import { NextRequest, NextResponse } from 'next/server';
import { CartService } from '@/lib/services/CartService';
import { AccessoryService } from '@/lib/services/AccessoryService';
import { Cart, AddToCartDTO } from '@/lib/types/cart-new';
import { revalidateMatItemPrice } from '@/features/vehicle-catalog/server/matCartValidation';

const accessoryService = new AccessoryService();
const cartService = new CartService((id) => accessoryService.getAccessoryById(id));

const revalidateMatCartItem = async (item: AddToCartDTO): Promise<AddToCartDTO> => {
  if (item.productType !== 'mat') return item
  if (item.unitPrice == null || item.unitPrice <= 0) {
    throw new Error('Brak ceny dla wybranych dywaników')
  }

  const validatedConfiguration = await revalidateMatItemPrice(
    item.configuration,
    item.unitPrice,
  )

  return {
    ...item,
    configuration: validatedConfiguration,
    unitPrice: validatedConfiguration.pricing.totalPrice,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, cart, ...data } = body;
    
    let result: Cart;
    
    switch (action) {
      case 'add':
        result = await cartService.addToCart(
          cart,
          await revalidateMatCartItem(data as AddToCartDTO),
        );
        break;
        
      case 'remove':
        result = await cartService.removeFromCart(cart, data.itemId);
        break;
        
      case 'update':
        result = await cartService.updateQuantity(cart, data.itemId, data.quantity);
        break;
        
      case 'clear':
        result = cartService.clearCart();
        break;
        
      default:
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid action. Must be: add, remove, update, or clear' 
          },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error processing cart action:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'summary') {
      // This would typically get cart from session/storage
      // For now, return empty cart
      const emptyCart: Cart = {
        items: [],
        subtotal: 0,
        shippingCost: 0,
        tax: 0,
        discount: 0,
        total: 0,
        itemCount: 0
      };
      
      const summary = cartService.getCartSummary(emptyCart);
      
      return NextResponse.json({
        success: true,
        data: summary
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Invalid action. Must be: summary' 
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error getting cart summary:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
