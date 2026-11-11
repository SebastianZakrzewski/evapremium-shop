-- Organizer do bagażnika Klasyczny M (33×33 cm) w sekcji akcesoriów.
insert into public.accessories (
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
  dimensions,
  category_id,
  images,
  product_type
)
values (
  'Organizer do bagażnika Klasyczny M',
  'organizer-do-bagaznika-klasyczny-m',
  'Otwarty, składany organizer do bagażnika z pianki EVA o podstawie 33×33 cm. Sztywne ścianki trzymają kształt pod zakupami, a dwa boczne uchwyty ułatwiają wyniesienie kosza z auta. Pianka nie nasiąka wodą i nie trzyma zapachów, więc nadaje się też do mokrych rzeczy i płynów. Po złożeniu zajmuje niewiele miejsca.',
  90.00,
  'ORG-KLAS-M',
  '/images/accessories/organizer-klasyczny-m/01.webp',
  array[
    'Wymiary 33×33 cm',
    'Wodoszczelna pianka EVA',
    'Otwarta, składana konstrukcja',
    'Dwa boczne uchwyty',
    'Grubość materiału 10 mm'
  ],
  true,
  null,
  true,
  4.80,
  0,
  '{"length": 33, "width": 33}'::jsonb,
  2,
  array[
    '/images/accessories/organizer-klasyczny-m/01.webp',
    '/images/accessories/organizer-klasyczny-m/02.webp',
    '/images/accessories/organizer-klasyczny-m/03.webp'
  ],
  'organizer'
)
on conflict (slug) do nothing;
