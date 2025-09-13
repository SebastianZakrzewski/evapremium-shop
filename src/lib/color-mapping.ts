// Mapowanie kolorów z bazy danych na kolory hex i polskie nazwy
export const colorMapping = {
  'niebieski': { name: "Niebieski", color: "#0084d1" },
  'czerwony': { name: "Czerwony", color: "#d12d1c" },
  'żółty': { name: "Żółty", color: "#ffe100" },
  'kość słoniowa': { name: "Kość słoniowa", color: "#d9d7c7" },
  'ciemnoniebieski': { name: "Ciemnoniebieski", color: "#1a355b" },
  'bordowy': { name: "Bordowy", color: "#6d2635" },
  'pomarańczowy': { name: "Pomarańczowy", color: "#ff7b1c" },
  'jasnobeżowy': { name: "Jasnobeżowy", color: "#d1b48c" },
  'ciemnoszary': { name: "Ciemnoszary", color: "#4a4a4a" },
  'fioletowy': { name: "Fioletowy", color: "#7c4bc8" },
  'limonkowy': { name: "Limonkowy", color: "#8be000" },
  'beżowy': { name: "Beżowy", color: "#b48a5a" },
  'różowy': { name: "Różowy", color: "#ff7eb9" },
  'czarny': { name: "Czarny", color: "#222" },
  'ciemnozielony': { name: "Ciemnozielony", color: "#1b5e3c" },
  'brązowy': { name: "Brązowy", color: "#4b2e1e" },
  'biały': { name: "Biały", color: "#ffffff" },
  'jasnoszary': { name: "Jasnoszary", color: "#bdbdbd" },
  'lightgrey': { name: "Jasnoszary", color: "#bdbdbd" },
  'zielony': { name: "Zielony", color: "#4caf50" },
  'ivory': { name: "Kość słoniowa", color: "#d9d7c7" },
  'darkblue': { name: "Ciemnoniebieski", color: "#1a355b" },
  'maroon': { name: "Bordowy", color: "#6d2635" },
  'orange': { name: "Pomarańczowy", color: "#ff7b1c" },
  'lightbeige': { name: "Jasnobeżowy", color: "#d1b48c" },
  'darkgrey': { name: "Ciemnoszary", color: "#4a4a4a" },
  'purple': { name: "Fioletowy", color: "#7c4bc8" },
  'lime': { name: "Limonkowy", color: "#8be000" },
  'pink': { name: "Różowy", color: "#ff7eb9" },
  'black': { name: "Czarny", color: "#222" },
  'white': { name: "Biały", color: "#ffffff" },
  'grey': { name: "Szary", color: "#6b7280" },
  'beige': { name: "Beżowy", color: "#b48a5a" },
  'green': { name: "Zielony", color: "#4caf50" },
  'brown': { name: "Brązowy", color: "#4b2e1e" },
  'blue': { name: "Niebieski", color: "#0084d1" },
  'red': { name: "Czerwony", color: "#d12d1c" },
  'yellow': { name: "Żółty", color: "#ffe100" },
  'darkgreen': { name: "Ciemnozielony", color: "#1b5e3c" },
};

// Kolory dostępne dla każdej struktury komórek (na podstawie analizy bazy danych)
export const availableColorsByCellStructure = {
  'diamonds': {
    materialColors: [
      'beige', 'black', 'blue', 'brown', 'darkblue', 'darkgreen', 'darkgrey', 
      'ivory', 'lightbeige', 'lime', 'maroon', 'orange', 'pink', 'purple', 
      'red', 'white', 'yellow'
    ],
    borderColors: [
      'beige', 'black', 'blue', 'brown', 'darkblue', 'darkgrey', 'green', 
      'lightgrey', 'maroon', 'orange', 'pink', 'purple', 'red', 'yellow'
    ]
  },
  'honey': {
    materialColors: [
      'black', 'blue', 'brown', 'darkblue', 'darkgreen', 'darkgrey', 
      'ivory', 'lightbeige', 'maroon', 'red'
    ],
    borderColors: [
      'beige', 'black', 'blue', 'brown', 'darkblue', 'darkgrey', 'green', 
      'lightgrey', 'maroon', 'orange', 'pink', 'purple', 'red', 'yellow'
    ]
  }
};

export function getColorInfo(colorKey: string) {
  return colorMapping[colorKey as keyof typeof colorMapping] || { name: colorKey, color: "#666666" };
}

export function getAvailableColors(cellStructure: string, type: 'material' | 'border') {
  const structure = availableColorsByCellStructure[cellStructure as keyof typeof availableColorsByCellStructure];
  if (!structure) return [];
  
  return type === 'material' ? structure.materialColors : structure.borderColors;
}
