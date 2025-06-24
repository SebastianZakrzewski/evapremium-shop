# Eva Website v0.1 Alpha

Nowoczesna aplikacja Next.js z Tailwind CSS i shadcn/ui.

## 🚀 Technologie

- **Next.js 14** - Framework React z App Router
- **TypeScript** - Typowanie statyczne
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Komponenty UI zbudowane na Radix UI
- **ESLint** - Linting kodu

## 📦 Instalacja

1. Sklonuj repozytorium:
```bash
git clone <repository-url>
cd eva-website-v0.1-alpha
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Uruchom serwer deweloperski:
```bash
npm run dev
```

4. Otwórz [http://localhost:3000](http://localhost:3000) w przeglądarce.

## 🛠️ Dostępne skrypty

- `npm run dev` - Uruchamia serwer deweloperski
- `npm run build` - Buduje aplikację do produkcji
- `npm run start` - Uruchamia aplikację w trybie produkcji
- `npm run lint` - Sprawdza kod za pomocą ESLint

## 📁 Struktura projektu

```
src/
├── app/                 # App Router (Next.js 14)
│   ├── globals.css     # Globalne style CSS
│   ├── layout.tsx      # Główny layout
│   └── page.tsx        # Strona główna
├── components/         # Komponenty React
│   └── ui/            # Komponenty shadcn/ui
│       ├── button.tsx
│       └── card.tsx
└── lib/               # Narzędzia i utilities
    └── utils.ts       # Funkcje pomocnicze
```

## 🎨 shadcn/ui

Projekt używa shadcn/ui do komponentów UI. Aby dodać nowe komponenty:

```bash
npx shadcn@latest add <component-name>
```

Dostępne komponenty:
- `button` - Przyciski z różnymi wariantami
- `card` - Karty z nagłówkiem, treścią i stopką

## 🌙 Tryb ciemny

Aplikacja wspiera tryb ciemny dzięki Tailwind CSS i shadcn/ui. Kolory automatycznie dostosowują się do preferencji systemu.

## 📱 Responsywność

Aplikacja jest w pełni responsywna i działa na wszystkich urządzeniach dzięki Tailwind CSS.

## 🔧 Konfiguracja

- `tailwind.config.js` - Konfiguracja Tailwind CSS
- `components.json` - Konfiguracja shadcn/ui
- `postcss.config.mjs` - Konfiguracja PostCSS

## 📄 Licencja

MIT

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
