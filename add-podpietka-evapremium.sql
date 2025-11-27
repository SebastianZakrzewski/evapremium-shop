-- Dodaj nowy rekord akcesorium: podpietka EVAPREMIUM plastry miodu
-- Kategoria: Podpiętki (id: 2)

INSERT INTO accessories (
    name,
    slug,
    description,
    price,
    sku,
    image_src,
    features,
    in_stock,
    stock_quantity,
    is_active,
    rating,
    review_count,
    category_id,
    created_at,
    updated_at
) VALUES (
    'Podpietka EVAPREMIUM plastry miodu',
    'podpietka-evapremium-plastry-miodu',
    'Elegancka podpietka EVAPREMIUM z wzorem plastrów miodu wykonana z materiału EVA',
    34.99,
    'POD-EVAPREM',
    NULL,
    ARRAY['Materiał EVA', 'Wzór plastrów miodu', 'Premium', 'Trwałe'],
    true,
    NULL,
    true,
    4.8,
    0,
    2,
    NOW(),
    NOW()
);

