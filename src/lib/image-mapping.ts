/**
 * Mapowanie ścieżek do obrazów dywaników na podstawie wybranych opcji w konfiguratorze
 */

export type MatType = '3d' | 'classic';
export type CellStructure = 'diamonds' | 'honey';

/**
 * Generuje ścieżkę do obrazu dywanika na podstawie wybranych opcji
 */
export function getMatImagePath(
  matType: MatType,
  cellStructure: CellStructure,
  materialColor: string,
  borderColor: string
): string {
  // Mapowanie kolorów na nazwy folderów
  const colorToFolderMap: Record<string, string> = {
    'beige': 'beige',
    'black': 'black',
    'blue': 'blue',
    'brown': 'brown',
    'darkblue': 'darkblue',
    'darkgreen': 'darkgreen',
    'darkgrey': 'darkgrey',
    'green': 'green',
    'ivory': 'ivory',
    'lightbeige': 'lightbeige',
    'lightgrey': 'lightgrey',
    'lime': 'lime',
    'maroon': 'maroon',
    'orange': 'orange',
    'pink': 'pink',
    'purple': 'purple',
    'red': 'red',
    'white': 'white',
    'yellow': 'yellow'
  };

  // Mapowanie kolorów obszycia na nazwy folderów dla honey classic
  const honeyClassicBorderFolderMap: Record<string, string> = {
    'beige': 'honey beige trim',
    'black': 'honey black',
    'blue': 'honey blue trim',
    'brown': 'honey brown trim',
    'darkblue': 'honey blue trim', // Użyj blue trim dla darkblue (brak dedykowanego folderu)
    'darkgrey': 'honey darkgrey trim',
    'green': 'honey green trim',
    'lightgrey': 'honey lightgrey trim',
    'maroon': 'honey maroon trim',
    'orange': 'honey orange trim',
    'pink': 'honey pink trim',
    'purple': 'honey purple trim',
    'red': 'honey red trim',
    'yellow': 'honey yellow trim'
  };

  const materialFolder = colorToFolderMap[materialColor] || materialColor;
  const borderFolder = colorToFolderMap[borderColor] || borderColor;

  // Generuj ścieżkę w zależności od typu i struktury
  if (matType === '3d') {
    if (cellStructure === 'diamonds') {
      return `/dywaniki/3d/diamonds/${borderFolder}/5os-3d-diamonds-${materialColor}-${borderColor}.webp`;
    } else if (cellStructure === 'honey') {
      return `/dywaniki/3d/honey/${borderFolder}/5os-3d-honey-${materialColor}-${borderColor}.webp`;
    }
  } else if (matType === 'classic') {
    if (cellStructure === 'diamonds') {
      return `/dywaniki/classic/diamonds/diamonds ${borderFolder}/5os-classic-diamonds-${materialColor}-${borderColor}.webp`;
    } else if (cellStructure === 'honey') {
      const honeyBorderFolder = honeyClassicBorderFolderMap[borderColor] || `honey ${borderColor} trim`;
      return `/dywaniki/classic/honeycomb/${honeyBorderFolder}/5os-classic-honey-${materialColor}-${borderColor}.webp`;
    }
  }

  // Fallback - zwróć domyślną ścieżkę
  return `/dywaniki/3d/diamonds/black/5os-3d-diamonds-black-black.webp`;
}

/**
 * Sprawdza czy obraz istnieje (dla walidacji)
 */
export function validateMatImagePath(
  matType: MatType,
  cellStructure: CellStructure,
  materialColor: string,
  borderColor: string
): boolean {
  const imagePath = getMatImagePath(matType, cellStructure, materialColor, borderColor);
  
  // Lista znanych kombinacji, które istnieją w systemie plików
  const validCombinations = new Set([
    // 3D Diamonds
    '3d-diamonds-beige-beige', '3d-diamonds-black-beige', '3d-diamonds-blue-beige',
    '3d-diamonds-brown-beige', '3d-diamonds-darkblue-beige', '3d-diamonds-darkgreen-beige',
    '3d-diamonds-darkgrey-beige', '3d-diamonds-ivory-beige', '3d-diamonds-lightbeige-beige',
    '3d-diamonds-lime-beige', '3d-diamonds-maroon-beige', '3d-diamonds-orange-beige',
    '3d-diamonds-pink-beige', '3d-diamonds-purple-beige', '3d-diamonds-red-beige',
    '3d-diamonds-white-beige', '3d-diamonds-yellow-beige',
    
    // 3D Honey
    '3d-honey-black-beige', '3d-honey-blue-beige', '3d-honey-brown-beige',
    '3d-honey-darkblue-beige', '3d-honey-darkgreen-beige', '3d-honey-darkgrey-beige',
    '3d-honey-ivory-beige', '3d-honey-lightbeige-beige', '3d-honey-maroon-beige',
    '3d-honey-red-beige',
    
    // Classic Diamonds
    'classic-diamonds-beige-beige', 'classic-diamonds-black-beige', 'classic-diamonds-blue-beige',
    'classic-diamonds-brown-beige', 'classic-diamonds-darkblue-beige', 'classic-diamonds-darkgreen-beige',
    'classic-diamonds-darkgrey-beige', 'classic-diamonds-ivory-beige', 'classic-diamonds-lightbeige-beige',
    'classic-diamonds-lime-beige', 'classic-diamonds-maroon-beige', 'classic-diamonds-orange-beige',
    'classic-diamonds-pink-beige', 'classic-diamonds-purple-beige', 'classic-diamonds-red-beige',
    'classic-diamonds-white-beige', 'classic-diamonds-yellow-beige',
    
    // Classic Honey
    'classic-honey-black-beige', 'classic-honey-blue-beige', 'classic-honey-brown-beige',
    'classic-honey-darkblue-beige', 'classic-honey-darkgreen-beige', 'classic-honey-darkgrey-beige',
    'classic-honey-ivory-beige', 'classic-honey-lightbeige-beige', 'classic-honey-maroon-beige',
    'classic-honey-red-beige'
  ]);

  const combinationKey = `${matType}-${cellStructure}-${materialColor}-${borderColor}`;
  return validCombinations.has(combinationKey);
}

/**
 * Pobiera wszystkie dostępne kombinacje kolorów dla danej struktury i typu
 */
export function getAvailableColorCombinations(
  matType: MatType,
  cellStructure: CellStructure
): Array<{ materialColor: string; borderColor: string; imagePath: string }> {
  const combinations: Array<{ materialColor: string; borderColor: string; imagePath: string }> = [];

  // Definicje dostępnych kolorów dla każdej struktury
  const colorDefinitions = {
    diamonds: {
      materialColors: ['beige', 'black', 'blue', 'brown', 'darkblue', 'darkgreen', 'darkgrey', 'ivory', 'lightbeige', 'lime', 'maroon', 'orange', 'pink', 'purple', 'red', 'white', 'yellow'],
      borderColors: ['beige', 'black', 'blue', 'brown', 'darkblue', 'darkgrey', 'green', 'lightgrey', 'maroon', 'orange', 'pink', 'purple', 'red', 'yellow']
    },
    honey: {
      materialColors: ['black', 'blue', 'brown', 'darkblue', 'darkgreen', 'darkgrey', 'ivory', 'lightbeige', 'maroon', 'red'],
      borderColors: ['beige', 'black', 'blue', 'brown', 'darkblue', 'darkgrey', 'green', 'lightgrey', 'maroon', 'orange', 'pink', 'purple', 'red', 'yellow']
    }
  };

  const colors = colorDefinitions[cellStructure];
  
  colors.materialColors.forEach(materialColor => {
    colors.borderColors.forEach(borderColor => {
      const imagePath = getMatImagePath(matType, cellStructure, materialColor, borderColor);
      combinations.push({ materialColor, borderColor, imagePath });
    });
  });

  return combinations;
}
