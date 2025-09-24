/**
 * Testy mapowania między modelem Mats a tabelą CarMat
 */

import {
  mapCarMatToMats,
  mapMatsToCarMat,
  mapCarMatArrayToMats,
  mapMatsArrayToCarMat,
  validateCarMatRecord,
  validateMatsModel,
  convertIdToNumber,
  convertNumberToUuid,
  type MatsModel,
  type CarMatRecord
} from '../carmat-mapping';

describe('CarMat Mapping Tests', () => {
  const sampleCarMat: CarMatRecord = {
    id: 'a1b2c3d4-0000-0000-0000-000000000000',
    matType: '3d',
    materialColor: 'czarny',
    cellStructure: 'rhombus',
    borderColor: 'czarny',
    imagePath: '/images/mats/3d-black-rhombus.jpg',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const sampleMats: MatsModel = {
    id: 2712847316, // Konwersja z a1b2c3d4
    type: '3d',
    color: 'czarny',
    cellType: 'rhombus',
    edgeColor: 'czarny',
    image: '/images/mats/3d-black-rhombus.jpg'
  };

  describe('mapCarMatToMats', () => {
    it('powinien poprawnie mapować rekord CarMat na model Mats', () => {
      const result = mapCarMatToMats(sampleCarMat);
      
      expect(result).toEqual({
        id: 2712847316,
        type: '3d',
        color: 'czarny',
        cellType: 'rhombus',
        edgeColor: 'czarny',
        image: '/images/mats/3d-black-rhombus.jpg'
      });
    });

    it('powinien obsługiwać różne typy danych', () => {
      const carMatWithDifferentData: CarMatRecord = {
        ...sampleCarMat,
        matType: 'classic',
        materialColor: 'biały',
        cellStructure: 'honeycomb',
        borderColor: 'czerwony',
        imagePath: '/images/mats/classic-white-honeycomb.jpg'
      };

      const result = mapCarMatToMats(carMatWithDifferentData);
      
      expect(result.type).toBe('classic');
      expect(result.color).toBe('biały');
      expect(result.cellType).toBe('honeycomb');
      expect(result.edgeColor).toBe('czerwony');
    });
  });

  describe('mapMatsToCarMat', () => {
    it('powinien poprawnie mapować model Mats na rekord CarMat', () => {
      const result = mapMatsToCarMat(sampleMats);
      
      expect(result).toEqual({
        matType: '3d',
        materialColor: 'czarny',
        cellStructure: 'rhombus',
        borderColor: 'czarny',
        imagePath: '/images/mats/3d-black-rhombus.jpg'
      });
    });

    it('nie powinien zawierać id, createdAt, updatedAt', () => {
      const result = mapMatsToCarMat(sampleMats);
      
      expect(result).not.toHaveProperty('id');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
    });
  });

  describe('mapCarMatArrayToMats', () => {
    it('powinien mapować tablicę rekordów CarMat na tablicę modeli Mats', () => {
      const carMats = [sampleCarMat, { ...sampleCarMat, id: 'b2c3d4e5-0000-0000-0000-000000000000' }];
      const result = mapCarMatArrayToMats(carMats);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(sampleMats);
      expect(result[1].id).toBe(convertIdToNumber('b2c3d4e5-0000-0000-0000-000000000000'));
    });
  });

  describe('mapMatsArrayToCarMat', () => {
    it('powinien mapować tablicę modeli Mats na tablicę rekordów CarMat', () => {
      const matsArray = [sampleMats, { ...sampleMats, id: 1234567890 }];
      const result = mapMatsArrayToCarMat(matsArray);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        matType: '3d',
        materialColor: 'czarny',
        cellStructure: 'rhombus',
        borderColor: 'czarny',
        imagePath: '/images/mats/3d-black-rhombus.jpg'
      });
    });
  });

  describe('validateCarMatRecord', () => {
    it('powinien zwracać true dla poprawnego rekordu CarMat', () => {
      expect(validateCarMatRecord(sampleCarMat)).toBe(true);
    });

    it('powinien zwracać false dla niepełnego rekordu', () => {
      const incompleteRecord = { ...sampleCarMat };
      delete incompleteRecord.matType;
      
      expect(validateCarMatRecord(incompleteRecord)).toBe(false);
    });
  });

  describe('validateMatsModel', () => {
    it('powinien zwracać true dla poprawnego modelu Mats', () => {
      expect(validateMatsModel(sampleMats)).toBe(true);
    });

    it('powinien zwracać false dla niepełnego modelu', () => {
      const incompleteModel = { ...sampleMats };
      delete incompleteModel.type;
      
      expect(validateMatsModel(incompleteModel)).toBe(false);
    });
  });

  describe('convertIdToNumber', () => {
    it('powinien konwertować UUID na liczbę', () => {
      expect(convertIdToNumber('a1b2c3d4-0000-0000-0000-000000000000')).toBe(2712847316);
      expect(convertIdToNumber('00000001-0000-0000-0000-000000000000')).toBe(1);
    });
  });

  describe('convertNumberToUuid', () => {
    it('powinien konwertować liczbę na UUID', () => {
      expect(convertNumberToUuid(2712847316)).toBe('a1b2c3d4-0000-0000-0000-000000000000');
      expect(convertNumberToUuid(1)).toBe('00000001-0000-0000-0000-000000000000');
    });
  });

  describe('Round-trip conversion', () => {
    it('powinien zachować dane przy konwersji w obie strony', () => {
      const originalMats = sampleMats;
      const carMat = mapMatsToCarMat(originalMats);
      const backToMats = mapCarMatToMats({ ...carMat, id: convertNumberToUuid(originalMats.id) });
      
      expect(backToMats).toEqual(originalMats);
    });
  });
});
