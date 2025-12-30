'use client';

import { useState, useEffect } from 'react';
import { Car, Shield } from 'lucide-react';
import { LeadFormData } from '@/lib/types/lead';

interface CarMatPreviewProps {
  formData: LeadFormData;
}

export default function CarMatPreview({ formData }: CarMatPreviewProps) {
  const [previewData, setPreviewData] = useState({
    carModel: '',
    year: '',
    matType: '',
    completeness: '',
    borderColor: '',
    materialColor: ''
  });

  useEffect(() => {
    // Update preview based on form data
    const carModel = formData.company || 'Twój samochód';
    const year = formData.jobTitle || '';
    const matType = formData.industry || '';
    const completeness = formData.completeness || '';
    const borderColor = formData.borderColor || '';
    const materialColor = formData.materialColor || '';

    setPreviewData({
      carModel,
      year,
      matType,
      completeness,
      borderColor,
      materialColor
    });
  }, [formData]);

  const getMatTypeName = (type: string) => {
    switch (type) {
      case '3d-evapremium-z-rantami':
        return '3D EVAPREMIUM Z RANTAMI';
      case '3d-evapremium-bez-rantow':
        return '3D EVAPREMIUM BEZ RANTÓW';
      default:
        return '3D EVAPREMIUM';
    }
  };

  const getCompletenessName = (completeness: string) => {
    switch (completeness) {
      case 'dywanik-kierowcy':
        return 'Dywanik Kierowcy (1 szt.)';
      case 'przod':
        return 'Przód (2 szt.)';
      case 'przod-tyl':
        return 'Przód + Tył (5 szt.)';
      case 'przod-tyl-bagaznik':
        return 'Przód + Tył + Bagażnik (6 szt.)';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-md mx-auto w-full">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-red-600 to-red-500 rounded-3xl blur-sm opacity-25 animate-gradient-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-red-500 to-red-400 rounded-3xl blur-md opacity-15 animate-gradient-glow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-700 to-red-600 rounded-3xl blur-lg opacity-10 animate-gradient-shimmer" style={{ animationDelay: '2s' }}></div>
        <div className="relative card-glass glass-optimized rounded-3xl p-6 shadow-2xl w-full">
          {/* Preview Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
              <Car className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Twój Dywanik</h3>
            <p className="text-gray-400 text-sm">
              Spersonalizowany podgląd dla Twojego auta
            </p>
          </div>

          {/* Car Info */}
          <div className="bg-gray-800/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Car className="w-5 h-5 text-red-400" />
              <h4 className="text-white font-semibold">
                {previewData.carModel} {previewData.year && `(${previewData.year})`}
              </h4>
            </div>
            {previewData.matType && (
              <p className="text-gray-300 text-sm">
                {getMatTypeName(previewData.matType)}
              </p>
            )}
            {previewData.completeness && (
              <p className="text-gray-300 text-sm">
                {getCompletenessName(previewData.completeness)}
              </p>
            )}
          </div>

          {/* Product Preview */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 mb-6 text-center">
            <div className="w-32 h-32 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-xl mx-auto mb-4 flex items-center justify-center border border-red-500/30">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <p className="text-white text-sm font-semibold">EVAPREMIUM</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Najwyższa jakość • 3D Design • Ochrona podłogi
            </p>
          </div>

          {/* Selected Options Summary */}
          <div className="space-y-3 mb-6">
            {previewData.matType && (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-300 text-sm">Typ: {getMatTypeName(previewData.matType)}</span>
              </div>
            )}
            {previewData.completeness && (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-300 text-sm">Komplet: {getCompletenessName(previewData.completeness)}</span>
              </div>
            )}
            {previewData.borderColor && (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300 text-sm">Kolor obszycia: {previewData.borderColor}</span>
              </div>
            )}
            {previewData.materialColor && (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-300 text-sm">Kolor materiału: {previewData.materialColor}</span>
              </div>
            )}
          </div>

          {/* Call to Action */}
          {!previewData.carModel && (
            <div className="text-center mt-6">
              <p className="text-gray-400 text-sm">
                Wypełnij formularz, aby zobaczyć spersonalizowany podgląd
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
