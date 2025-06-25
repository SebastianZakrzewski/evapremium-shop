# Images Folder Structure

This folder contains all static images used in the application.

## Folder Structure:

- **products/** - Product images, product photos, item thumbnails
- **hero/** - Hero section images, banner images, main promotional graphics
- **logos/** - Company logos, brand assets, icons
- **backgrounds/** - Background images, patterns, textures

## Usage in Next.js:

```tsx
// In React components
<img src="/images/products/product-1.jpg" alt="Product 1" />

// With Next.js Image component (recommended)
import Image from 'next/image'
<Image src="/images/hero/banner.jpg" alt="Hero Banner" width={1200} height={600} />

// In CSS
.hero-section {
  background-image: url('/images/backgrounds/pattern.jpg');
}
```

## File Naming Convention:
- Use kebab-case: `product-image-1.jpg`
- Include dimensions in filename if needed: `hero-banner-1200x600.jpg`
- Use descriptive names: `company-logo-primary.svg` 