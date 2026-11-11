-- Dodatki do dywanika dostępne w konfiguratorze, poza katalogiem akcesoriów.
insert into public.accessory_categories (name, slug, description, is_active, sort_order)
values (
  'Wykończenie dywanika',
  'wykonczenie-dywanika',
  'Opcjonalne wykończenia dokładane do dywanika w konfiguratorze.',
  true,
  99
)
on conflict (slug) do nothing;

insert into public.accessories (
  name,
  slug,
  description,
  price,
  sku,
  features,
  in_stock,
  stock_quantity,
  is_active,
  review_count,
  category_id,
  product_type
)
select
  item.name,
  item.slug,
  item.description,
  item.price,
  item.sku,
  item.features,
  true,
  null,
  true,
  0,
  category.id,
  'wykonczenie'
from (
  values
    (
      'Wzmocnione szwy premium',
      'wzmocnione-szwy-premium',
      'Dodatkowe wzmocnienie szwów w obszyciu dywanika. Przeszycie chroni krawędź tam, gdzie materiał pracuje najmocniej.',
      29.00,
      'WYK-SZWY-PREMIUM',
      array['Wzmocnione obszycie', 'Do dywanika']::text[]
    ),
    (
      'Powłoka anti-dirt',
      'powloka-anti-dirt',
      'Powłoka anti-dirt nakładana na dywanik. Ogranicza wnikanie brudu i ułatwia czyszczenie powierzchni.',
      39.00,
      'WYK-ANTI-DIRT',
      array['Powłoka ochronna', 'Do dywanika']::text[]
    )
) as item(name, slug, description, price, sku, features)
join public.accessory_categories as category
  on category.slug = 'wykonczenie-dywanika'
on conflict (slug) do nothing;
