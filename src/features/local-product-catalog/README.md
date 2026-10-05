# Local product catalog

Maps vehicle card photos stored in `public/images/products/{brand}` onto catalog models.

## Usage

```ts
import { resolveLocalProductImage } from "@/features/local-product-catalog"

const imageUrl = await resolveLocalProductImage({
  brand: "BMW",
  model: "X5 (G05) 4 gen",
  generation: "2018-2025",
  bodyType: "suv",
  yearFrom: 2018,
  yearTo: 2025,
})
// "/images/products/bmw/BMW_X5_G05_4_gen_2018-2025_rok_SUV.png"
```

Filenames are parsed for series, chassis code, generation, years and body type. The first confident match wins over empty database previews.
