# Icons Folder

This folder contains icon files (PNG, ICO, etc.) that are not SVG components.

## Usage:

```tsx
// In React components
<img src="/icons/favicon.ico" alt="Favicon" />

// In HTML head
<link rel="icon" href="/icons/favicon.ico" />
```

## Note:
- For SVG icons, consider creating React components in `src/components/icons/`
- This folder is for non-SVG icon files only
- Favicon files should be placed here 