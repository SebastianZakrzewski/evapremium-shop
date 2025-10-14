# Frontend Development Memories

## Project Overview
**EvaPremium Website** - Professional car floor mats (dywaniki samochodowe) e-commerce platform with advanced configurator functionality.

## Technology Stack (Current)

### Core Framework
- **Next.js 15.3.4** with App Router (latest stable)
- **React 18** with TypeScript strict mode
- **TypeScript 5** with strict configuration

### Styling & UI
- **TailwindCSS 4.1.10** (latest v4) with custom theme configuration
- **shadcn/ui** component library with Radix UI primitives
- **Framer Motion 10.16.16** for animations
- **Lucide React 0.294.0** for icons
- **class-variance-authority** for component variants
- **tailwind-merge** for class merging
- **tailwindcss-animate** for animations

### State Management & Data Fetching
- **TanStack React Query 5.8.4** for server state management
- **React Hook Form 7.48.2** with Zod validation
- **@hookform/resolvers 3.3.2** for form validation
- **Zod 3.22.4** for schema validation

### Database & Backend Integration
- **Supabase 2.38.4** as primary database
- **Prisma 5.7.1** as ORM
- **PostgreSQL** via Supabase
- **SQLite3 5.1.7** for local development

### Development Tools
- **ESLint 9.37.0** with Next.js configuration
- **Prettier** for code formatting
- **Vitest 1.0.4** for testing
- **React Testing Library 14.1.2** for component testing
- **@testing-library/jest-dom 6.1.5** for DOM testing utilities

### Additional Libraries
- **cookies-next 5.1.0** for cookie management
- **react-hot-toast 2.4.1** for notifications
- **cmdk 0.2.0** for command palette
- **dotenv 17.2.3** for environment variables

## Project Structure

### Architecture Pattern
- **Feature-based architecture** with `src/{features,entities,shared}` structure
- **App Router** with `app/` directory for routes
- **Public API** pattern - features must be re-exported via `index.ts`
- **Separation of concerns** - no business logic in components

### Key Directories
```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
├── lib/                    # Core utilities and services
│   ├── services/          # Business logic services
│   ├── repositories/      # Data access layer
│   ├── types/             # TypeScript type definitions
│   ├── validators/        # Zod schemas
│   └── utils/             # Utility functions
├── hooks/                  # Custom React hooks
├── features/              # Feature-specific modules
└── entities/              # Domain entities
```

## Key Features Implemented

### E-commerce Functionality
- **Product Configurator** - Advanced car mat configuration system
- **Shopping Cart** - Full cart management with persistence
- **Order Management** - Complete order processing workflow
- **Pricing Engine** - Dynamic pricing calculations
- **Session Management** - Hybrid client/server session handling

### Car Data Integration
- **Car Models Database** - Comprehensive car make/model/year data
- **Body Types Mapping** - Sedan, SUV, Hatchback, etc.
- **Generation Support** - Car model generations and variants
- **Color Mapping** - Product color variations and matching

### UI/UX Features
- **Responsive Design** - Mobile-first approach
- **Dark/Light Theme** - CSS custom properties based theming
- **Custom Animations** - Performance-optimized animations
- **Accessibility** - WCAG compliant components
- **SEO Optimization** - Meta tags, structured data, sitemap

## Development Guidelines

### Code Quality
- **Strict TypeScript** - No `any` types allowed
- **ESLint Rules** - Zero warnings policy (`--max-warnings=0`)
- **Component Naming** - PascalCase for components, camelCase for utilities
- **File Organization** - Clear separation of concerns

### Testing Strategy
- **Test-First Development** - Write tests before implementation
- **Component Testing** - React Testing Library for UI components
- **Service Testing** - Unit tests for business logic
- **Integration Testing** - End-to-end workflow testing

### Performance Optimization
- **Image Optimization** - Next.js Image component with WebP/AVIF
- **Code Splitting** - Dynamic imports for large components
- **Bundle Analysis** - Regular bundle size monitoring
- **Caching Strategy** - React Query for data caching

## Current Development Focus
- **Configurator Enhancement** - Advanced product configuration
- **Cart Synchronization** - Real-time cart updates
- **Order Processing** - Streamlined checkout flow
- **Performance Optimization** - Core Web Vitals improvement
- **Mobile Experience** - Enhanced mobile usability

## Environment Configuration
- **Development** - Local development with hot reload
- **Production** - Vercel deployment with edge functions
- **Database** - Supabase cloud with local SQLite fallback
- **CDN** - Vercel Edge Network for static assets

## Security Measures
- **Environment Variables** - All secrets via `process.env`
- **Input Validation** - Zod schemas for all external data
- **XSS Protection** - Proper escaping and sanitization
- **CSRF Protection** - Built-in Next.js security features
