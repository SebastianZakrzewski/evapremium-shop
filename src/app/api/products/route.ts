import { NextRequest, NextResponse } from 'next/server';

// Przykładowe dane produktów
const products = [
  {
    id: '1',
    name: 'Dywaniki 3D z rantami - Audi A3',
    description: 'Wysokiej jakości dywaniki 3D z rantami dla Audi A3',
    price: 299.99,
    category: '3d-with-rims',
    images: ['/images/products/audi.jpg'],
    inStock: true
  },
  {
    id: '2',
    name: 'Dywaniki 3D z rantami - BMW X3',
    description: 'Precyzyjnie dopasowane dywaniki 3D dla BMW X3',
    price: 349.99,
    category: '3d-with-rims',
    images: ['/images/products/bmw.png'],
    inStock: true
  }
];

// GET /api/products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let filteredProducts = products;

    // Filtrowanie po kategorii
    if (category) {
      filteredProducts = filteredProducts.filter(product => product.category === category);
    }

    // Wyszukiwanie
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredProducts,
      count: filteredProducts.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}

// POST /api/products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Walidacja danych
    if (!body.name || !body.price) {
      return NextResponse.json(
        { success: false, error: 'Brak wymaganych pól' },
        { status: 400 }
      );
    }

    // Symulacja dodawania nowego produktu
    const newProduct = {
      id: Date.now().toString(),
      name: body.name,
      description: body.description || '',
      price: body.price,
      category: body.category || 'standard',
      images: body.images || [],
      inStock: body.inStock !== false
    };

    // W rzeczywistej aplikacji tutaj byłaby operacja na bazie danych
    products.push(newProduct);

    return NextResponse.json({
      success: true,
      data: newProduct
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Błąd serwera' },
      { status: 500 }
    );
  }
} 