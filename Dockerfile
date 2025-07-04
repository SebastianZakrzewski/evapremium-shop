FROM node:18-alpine

WORKDIR /app

# Kopiuj pliki konfiguracyjne
COPY package*.json ./
COPY next.config.ts ./
COPY tailwind.config.js ./
COPY tsconfig.json ./
COPY postcss.config.mjs ./

# Zainstaluj zależności
RUN npm ci

# Kopiuj kod źródłowy
COPY . .

# Eksponuj port
EXPOSE 3000

# Komenda uruchamiająca w trybie development
CMD ["npm", "run", "dev"] 