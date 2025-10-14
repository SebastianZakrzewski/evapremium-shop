# Instrukcje tworzenia tabel w Supabase

## Problem z połączeniem
Połączenie z Supabase nie działa z powodu błędu "Tenant or user not found". Może to oznaczać, że:
- Projekt Supabase został usunięty
- URL połączenia jest niepoprawny
- Klucze API wygasły

## Rozwiązanie

### Opcja 1: Utwórz nowy projekt Supabase
1. Idź do [supabase.com](https://supabase.com)
2. Zaloguj się i utwórz nowy projekt
3. Skopiuj nowe dane połączenia do pliku `.env`

### Opcja 2: Użyj SQL Editor w istniejącym projekcie
1. Idź do swojego projektu Supabase
2. Przejdź do **SQL Editor**
3. Skopiuj i wklej poniższy SQL:

```sql
-- Create accessory_categories table
CREATE TABLE IF NOT EXISTS accessory_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50), -- emoji or icon name
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    parent_id INTEGER REFERENCES accessory_categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create accessories table
CREATE TABLE IF NOT EXISTS accessories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    image_src VARCHAR(500),
    features TEXT[], -- array of feature strings
    in_stock BOOLEAN DEFAULT true,
    stock_quantity INTEGER, -- null = unlimited
    is_active BOOLEAN DEFAULT true,
    rating DECIMAL(3, 2), -- 1-5 stars
    review_count INTEGER DEFAULT 0,
    weight DECIMAL(8, 2), -- in grams
    dimensions JSONB, -- {length, width, height} in cm
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    category_id INTEGER NOT NULL REFERENCES accessory_categories(id) ON DELETE CASCADE
);

-- Create mats table
CREATE TABLE IF NOT EXISTS mats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_brand_slug VARCHAR(100) NOT NULL, -- e.g., "bmw", "audi"
    car_model_slug VARCHAR(100) NOT NULL, -- e.g., "3-series", "a4"
    generation VARCHAR(50), -- e.g., "F30", "B9"
    body_type VARCHAR(50), -- e.g., "sedan", "wagon"
    year_from INTEGER,
    year_to INTEGER,
    base_price DECIMAL(10, 2) NOT NULL,
    available_set_types TEXT[] NOT NULL, -- ["front", "basic", "premium", "complete"]
    available_cell_types TEXT[] NOT NULL, -- ["diamonds", "honey"]
    available_colors TEXT[] NOT NULL, -- material colors
    available_edge_colors TEXT[] NOT NULL, -- edge colors
    has_heel_pad BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(car_brand_slug, car_model_slug, generation, body_type)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
    payment_method VARCHAR(100), -- card, transfer, blik, etc.
    tracking_number VARCHAR(100),
    
    -- Customer data as JSON
    customer JSONB NOT NULL, -- {name, email, phone, company?}
    shipping_address JSONB NOT NULL, -- {street, city, postalCode, country}
    billing_address JSONB, -- if different from shipping
    
    -- Pricing
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    
    -- Timestamps
    notes TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    
    -- Product identification
    product_type VARCHAR(50) NOT NULL, -- "accessory" or "mat"
    product_id UUID NOT NULL, -- ID from accessories or mats table
    
    -- Product snapshot (preserves data even if product is deleted)
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    product_image VARCHAR(500),
    
    -- Configuration for mats
    configuration JSONB, -- {carDetails, setType, cellType, colors, heelPad}
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accessories_category_id ON accessories(category_id);
CREATE INDEX IF NOT EXISTS idx_accessories_slug ON accessories(slug);
CREATE INDEX IF NOT EXISTS idx_accessories_sku ON accessories(sku);
CREATE INDEX IF NOT EXISTS idx_accessories_is_active ON accessories(is_active);

CREATE INDEX IF NOT EXISTS idx_mats_car_details ON mats(car_brand_slug, car_model_slug);
CREATE INDEX IF NOT EXISTS idx_mats_generation ON mats(generation);
CREATE INDEX IF NOT EXISTS idx_mats_body_type ON mats(body_type);
CREATE INDEX IF NOT EXISTS idx_mats_is_active ON mats(is_active);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders((customer->>'email'));
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_type ON order_items(product_type);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_accessory_categories_updated_at BEFORE UPDATE ON accessory_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accessories_updated_at BEFORE UPDATE ON accessories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mats_updated_at BEFORE UPDATE ON mats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

4. Kliknij **Run** aby wykonać SQL

### Opcja 3: Użyj Prisma po naprawieniu połączenia
Po naprawieniu połączenia z Supabase, możesz użyć:

```bash
npx prisma migrate dev --name add_products_and_orders_tables
```

## Weryfikacja
Po utworzeniu tabel, sprawdź czy zostały utworzone poprawnie:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('accessory_categories', 'accessories', 'mats', 'orders', 'order_items')
ORDER BY table_name;
```

## Następne kroki
Po utworzeniu tabel:
1. Zaktualizuj plik `.env` z nowymi danymi połączenia
2. Uruchom `npx prisma generate` aby wygenerować klienta
3. Uruchom `npx prisma db push` aby zsynchronizować schemat
4. Utwórz dane testowe używając skryptów seed
