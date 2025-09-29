import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmepxyervpeujwvgdqtm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZXB4eWVydnBldWp3dmdkcXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUwOTQyNSwiZXhwIjoyMDczMDg1NDI1fQ.sr3YFtozFZCJpTKTfjX7180oI_fjT0rxG0sx2i0YKlI';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    // Pobierz unikalne typy nadwozia z tabeli car_models_extended
    const { data: bodyTypes, error } = await supabase
      .from('car_models_extended')
      .select('body_type')
      .not('body_type', 'is', null)
      .order('body_type');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Błąd podczas pobierania typów nadwozia' },
        { status: 500 }
      );
    }

    if (!bodyTypes || bodyTypes.length === 0) {
      return NextResponse.json([]);
    }

    // Usuń duplikaty i przygotuj dane
    const uniqueBodyTypes = Array.from(
      new Set(bodyTypes.map(item => item.body_type))
    ).map((bodyType, index) => ({
      id: index + 1,
      name: bodyType,
      category: getBodyTypeCategory(bodyType),
      description: getBodyTypeDescription(bodyType)
    }));

    return NextResponse.json(uniqueBodyTypes);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd serwera' },
      { status: 500 }
    );
  }
}

// Funkcja pomocnicza do kategoryzacji typów nadwozia
function getBodyTypeCategory(bodyType: string): string {
  const lowerType = bodyType.toLowerCase();
  
  if (lowerType.includes('hatchback')) return 'hatchback';
  if (lowerType.includes('sedan')) return 'sedan';
  if (lowerType.includes('suv')) return 'suv';
  if (lowerType.includes('coupe')) return 'coupe';
  if (lowerType.includes('roadster') || lowerType.includes('cabrio')) return 'convertible';
  if (lowerType.includes('kombi') || lowerType.includes('wagon')) return 'wagon';
  if (lowerType.includes('van') || lowerType.includes('dostawczak')) return 'van';
  if (lowerType.includes('minivan')) return 'minivan';
  if (lowerType.includes('fastback') || lowerType.includes('liftback')) return 'fastback';
  
  return 'other';
}

// Funkcja pomocnicza do generowania opisu typu nadwozia
function getBodyTypeDescription(bodyType: string): string {
  const descriptions: Record<string, string> = {
    'hatchback 2drzwi': 'Hatchback 2-drzwiowy',
    'hatchback 3drzwi': 'Hatchback 3-drzwiowy',
    'hatchback 5drzwi': 'Hatchback 5-drzwiowy',
    'hatchback 3/5drzwi': 'Hatchback 3 lub 5-drzwiowy',
    'hatchback': 'Hatchback',
    'sedan': 'Sedan',
    'coupe': 'Coupe',
    'roadster': 'Roadster',
    'cabrio': 'Kabriolet',
    'SUV': 'SUV',
    'SUV 5os.': 'SUV 5-osobowy',
    'SUV 7os.': 'SUV 7-osobowy',
    'kombi': 'Kombi',
    'kombi/ sedan': 'Kombi lub sedan',
    'minivan': 'Minivan',
    'VAN': 'Van',
    'dostawczak': 'Dostawczak',
    'van 4drzwi': 'Van 4-drzwiowy',
    'fastback': 'Fastback',
    'liftback': 'Liftback',
    'shooting brake': 'Shooting brake'
  };
  
  return descriptions[bodyType] || bodyType;
}
