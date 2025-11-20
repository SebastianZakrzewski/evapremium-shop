/**
 * Skrypt do generowania obrazu przedstawiającego model Audi na tle dywaników 3D.
 * Pobiera zdjęcie modelu Audi z internetu, łączy z obrazem dywaników i dodaje opis.
 * 
 * Wymagane pakiety:
 * npm install sharp
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Informacje o modelu Audi A4 B9
const MODEL_INFO = {
  brand: "Audi",
  model: "A4",
  generation: "B9",
  years: "2015-2023",
  bodyType: "Sedan",
  description: "Audi A4 B9 to elegancka limuzyna klasy średniej, produkowana w latach 2015-2023. Model ten charakteryzuje się nowoczesnym designem, zaawansowaną technologią oraz doskonałymi osiągami. Idealnie pasujące dywaniki 3D zapewniają maksymalną ochronę wnętrza pojazdu."
};

/**
 * Usuwa tło ze zdjęcia samochodu
 * Jeśli obraz już ma przezroczyste tło (PNG z alpha), zwraca go bez zmian
 * W przeciwnym razie próbuje usunąć białe/jednolite tło
 */
async function removeBackground(imageBuffer) {
  const sharp = require('sharp');
  
  try {
    const image = await sharp(imageBuffer);
    const metadata = await image.metadata();
    
    // Jeśli obraz już ma kanał alpha (przezroczyste tło), zwróć go bez zmian
    if (metadata.hasAlpha) {
      console.log('✅ Obraz już ma przezroczyste tło');
      return imageBuffer;
    }
    
    // Próba usunięcia białego/jasnego tła
    console.log('🎨 Próba usunięcia białego tła...');
    
    // Konwersja do RGBA i usunięcie białego tła
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Próg dla białego tła (można dostosować)
    const threshold = 240; // Piksele jaśniejsze niż ten próg będą przezroczyste
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Jeśli piksel jest bardzo jasny (biały/jasny), ustaw alpha na 0
      if (r > threshold && g > threshold && b > threshold) {
        data[i + 3] = 0; // Przezroczyste
      }
    }
    
    // Konwersja z powrotem do obrazu
    const result = await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
      .png()
      .toBuffer();
    
    console.log('✅ Tło usunięte');
    return result;
  } catch (error) {
    console.warn('⚠️ Nie udało się usunąć tła, używam oryginalnego obrazu:', error.message);
    // Jeśli nie udało się usunąć tła, zwróć oryginalny obraz
    return imageBuffer;
  }
}

/**
 * Pobiera obraz z URL
 */
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Tworzy obraz dywaników 3D na podstawie opisu używając SVG
 * Dywaniki są w tle, bez ramki, z tekstem "3D"
 */
async function createMatsImage(width = 1200, height = 600) {
  const sharp = require('sharp');
  
  // SVG z dywanikami 3D - w stylu tła
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Tekst "3D" na górze -->
      <text x="${width / 2}" y="120" font-family="Arial, sans-serif" 
            font-size="100" font-weight="bold" fill="black" text-anchor="middle">3D</text>
      
      <!-- Lewy dywanik (większy, nieregularny kształt) -->
      <polygon points="150,${height/2 - 30} 200,${height/2 - 120} 300,${height/2 - 130} 
                       350,${height/2 - 100} 400,${height/2 - 80} 450,${height/2 - 60} 
                       430,${height/2 + 80} 400,${height/2 + 100} 350,${height/2 + 120} 
                       300,${height/2 + 110} 250,${height/2 + 90} 200,${height/2 + 70} 
                       170,${height/2 + 30} 150,${height/2}" 
               fill="#3c3c3c" stroke="#ff0000" stroke-width="4"/>
      
      <!-- Prawy dywanik (mniejszy, prostszy kształt) -->
      <polygon points="600,${height/2 - 20} 650,${height/2 - 30} 700,${height/2 - 25} 
                       750,${height/2 - 10} 770,${height/2 + 10} 760,${height/2 + 110} 
                       730,${height/2 + 130} 680,${height/2 + 140} 630,${height/2 + 130} 
                       600,${height/2 + 110}" 
               fill="#3c3c3c" stroke="#ff0000" stroke-width="4"/>
    </svg>
  `;
  
  // Konwersja SVG do PNG z przezroczystym tłem
  const buffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();
  
  return buffer;
}

/**
 * Łączy obrazy w stylu: dywaniki w tle, samochód na pierwszym planie, tekst na dole
 */
async function combineImages(carImageBuffer, matsImageBuffer, outputPath) {
  try {
    const sharp = require('sharp');
    
    // Załadowanie obrazów
    const carImage = await sharp(carImageBuffer);
    const carMetadata = await carImage.metadata();
    
    const matsImage = await sharp(matsImageBuffer);
    const matsMetadata = await matsImage.metadata();
    
    // Wymiary finalnego obrazu
    const finalWidth = 1200;
    const matsHeight = 600; // Wysokość sekcji z dywanikami (tło)
    const carHeight = 800; // Wysokość sekcji z samochodem
    const textHeight = 120; // Wysokość sekcji z tekstem
    const finalHeight = matsHeight + carHeight + textHeight;
    
    // Usunięcie tła ze zdjęcia samochodu (jeśli nie jest już przezroczyste)
    console.log('🎨 Usuwanie tła ze zdjęcia samochodu...');
    const carWithoutBg = await removeBackground(carImageBuffer);
    
    // Skalowanie zdjęcia samochodu - większe, na pierwszym planie
    // Używamy 'contain' zamiast 'cover', aby zachować proporcje
    const carResized = await sharp(carWithoutBg)
      .resize(finalWidth, carHeight, { 
        fit: 'contain', 
        position: 'center',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Przezroczyste tło
      })
      .toBuffer();
    
    // Skalowanie obrazu dywaników do szerokości finalnego obrazu
    const matsResized = await sharp(matsImageBuffer)
      .resize(finalWidth, matsHeight, { fit: 'cover' })
      .toBuffer();
    
    // Funkcja do escapowania XML
    const escapeXml = (str) => {
      return str.replace(/&/g, '&amp;')
                 .replace(/</g, '&lt;')
                 .replace(/>/g, '&gt;')
                 .replace(/"/g, '&quot;')
                 .replace(/'/g, '&apos;');
    };
    
    // Tekst modelu - białe tło z zaokrąglonymi rogami
    // Format: "Audi" (czerwony) + "100 (C4) VI" (czarny) - jak w przykładzie
    const modelName = MODEL_INFO.model;
    const generationText = MODEL_INFO.generation ? ` (${MODEL_INFO.generation})` : '';
    const fullModelText = `${modelName}${generationText}`;
    
    const svgText = `
      <svg width="${finalWidth}" height="${textHeight}" xmlns="http://www.w3.org/2000/svg">
        <!-- Białe tło z zaokrąglonymi rogami -->
        <rect x="${finalWidth / 2 - 350}" y="10" width="700" height="90" 
              rx="8" ry="8" fill="white" opacity="0.95"/>
        
        <!-- Tytuł - Audi w czerwonym kolorze -->
        <text x="${finalWidth / 2}" y="50" font-family="Arial, sans-serif" 
              font-size="38" font-weight="bold" fill="#dc2626" text-anchor="middle">${escapeXml(MODEL_INFO.brand)}</text>
        
        <!-- Model i generacja - czarny kolor -->
        <text x="${finalWidth / 2}" y="80" font-family="Arial, sans-serif" 
              font-size="30" fill="black" text-anchor="middle">${escapeXml(fullModelText)}</text>
      </svg>
    `;
    
    // Tworzenie gradientu tła (biały u góry, lekko fioletowy/niebieski u dołu)
    const gradientSvg = `
      <svg width="${finalWidth}" height="${finalHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e8eaf6;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${finalWidth}" height="${finalHeight}" fill="url(#bgGradient)"/>
      </svg>
    `;
    
    const gradientBuffer = await sharp(Buffer.from(gradientSvg))
      .png()
      .toBuffer();
    
    // Łączenie obrazów w odpowiedniej kolejności:
    // 1. Gradient tła
    // 2. Dywaniki (tło, górna część) - z lekką przezroczystością
    // 3. Samochód (pierwszy plan, środkowa część)
    // 4. Tekst (dolna część, częściowo na samochodzie)
    
    // Oblicz pozycję samochodu - wyśrodkowany i częściowo na dywanikach
    const carActualHeight = carHeight; // Może być mniejsza jeśli użyto 'contain'
    const carTop = matsHeight - 150; // Częściowo nakłada się na dywaniki
    
    await sharp(gradientBuffer)
      .composite([
        { input: matsResized, top: 0, left: 0, blend: 'over' },
        { input: carResized, top: carTop, left: 0, blend: 'over' }, // Samochód z przezroczystym tłem
        { input: Buffer.from(svgText), top: matsHeight + carHeight - 120, left: 0, blend: 'over' }
      ])
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Obraz zapisany: ${outputPath}`);
    console.log(`📐 Rozmiar: ${finalWidth}x${finalHeight}px`);
  } catch (error) {
    console.error('❌ Błąd przy łączeniu obrazów:', error.message);
    if (error.message.includes('Cannot find module')) {
      console.log('\n💡 Zainstaluj wymagane pakiety:');
      console.log('   npm install sharp');
    }
    throw error;
  }
}

/**
 * Główna funkcja
 */
async function main() {
  console.log('🚗 Generator obrazu modelu Audi z dywanikami 3D');
  console.log('='.repeat(60));
  
  // Sprawdzenie argumentów
  // Użycie: node script.js [mats-image-path] [car-image-path-or-url]
  // Przykłady:
  //   node script.js                                    # używa domyślnych wartości
  //   node script.js null ./car.png                    # używa lokalnego PNG z przezroczystym tłem
  //   node script.js ./mats.png ./car.png             # używa obu lokalnych plików
  //   node script.js null https://example.com/car.jpg  # używa URL do zdjęcia
  
  const matsImagePath = process.argv[2] && process.argv[2] !== 'null' ? process.argv[2] : null;
  const carImageUrl = process.argv[3] && process.argv[3] !== 'null' 
    ? process.argv[3] 
    : 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800';
  
  let matsImageBuffer;
  
  // Pobranie lub utworzenie obrazu dywaników
  if (matsImagePath && fs.existsSync(matsImagePath)) {
    console.log(`📂 Ładowanie obrazu dywaników z: ${matsImagePath}`);
    matsImageBuffer = fs.readFileSync(matsImagePath);
  } else {
    if (matsImagePath) {
      console.log(`⚠️ Plik ${matsImagePath} nie istnieje. Tworzenie obrazu dywaników...`);
    } else {
      console.log('🎨 Tworzenie obrazu dywaników 3D...');
    }
    matsImageBuffer = await createMatsImage();
  }
  
  // Pobranie zdjęcia samochodu
  console.log(`📥 Pobieranie zdjęcia samochodu z: ${carImageUrl}`);
  let carImageBuffer;
  try {
    // Sprawdź czy to lokalny plik
    if (fs.existsSync(carImageUrl)) {
      console.log('📂 Ładowanie lokalnego pliku...');
      carImageBuffer = fs.readFileSync(carImageUrl);
    } else {
      carImageBuffer = await downloadImage(carImageUrl);
    }
    console.log('✅ Zdjęcie samochodu pobrane');
  } catch (error) {
    console.error(`⚠️ Błąd przy pobieraniu zdjęcia: ${error.message}`);
    console.log('💡 Użyj innego URL lub podaj ścieżkę do lokalnego pliku');
    console.log('💡 Najlepiej użyj zdjęcia PNG z przezroczystym tłem');
    process.exit(1);
  }
  
  // Utworzenie finalnego obrazu
  const outputDir = path.join(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, 'audi-a4-b9-with-mats.png');
  
  await combineImages(carImageBuffer, matsImageBuffer, outputPath);
  
  console.log('\n✨ Gotowe!');
  console.log(`📁 Obraz zapisany w: ${path.resolve(outputPath)}`);
}

// Uruchomienie skryptu
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Błąd:', error.message);
    process.exit(1);
  });
}

module.exports = { combineImages, createMatsImage, downloadImage };

