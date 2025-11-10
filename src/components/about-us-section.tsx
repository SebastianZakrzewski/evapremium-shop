"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Users, 
  Target, 
  Heart, 
  Shield, 
  Truck, 
  Star,
  CheckCircle,
  TrendingUp,
  Globe
} from 'lucide-react';

export default function AboutUsSection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-red-800/10"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-2 h-2 bg-red-500 rounded-full animate-float-hover"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-red-300 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-red-600 rounded-full animate-float-hover" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
            O Nas
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            EvaPremium to polski producent najwyższej jakości dywaników samochodowych EVA. 
            Od 2010 roku dostarczamy innowacyjne rozwiązania dla miłośników motoryzacji.
          </p>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto mt-8"></div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <Card className="bg-gray-900 backdrop-blur border-gray-700 shadow-2xl hover:shadow-red-500/10 transition-all duration-300 text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">5+</h3>
              <p className="text-gray-300">Lat doświadczenia</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 backdrop-blur border-gray-700 shadow-2xl hover:shadow-red-500/10 transition-all duration-300 text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">2K+</h3>
              <p className="text-gray-300">Zadowolonych klientów</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 backdrop-blur border-gray-700 shadow-2xl hover:shadow-red-500/10 transition-all duration-300 text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">1000+</h3>
              <p className="text-gray-300">Modeli samochodów</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 backdrop-blur border-gray-700 shadow-2xl hover:shadow-red-500/10 transition-all duration-300 text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">4.9/5</h3>
              <p className="text-gray-300">Ocena klientów</p>
            </CardContent>
          </Card>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            <Card className="bg-gray-900 backdrop-blur border-gray-700 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Nasza Misja</h2>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                Dostarczamy najwyższej jakości dywaniki samochodowe EVA, które łączą funkcjonalność, 
                trwałość i estetykę. Naszym celem jest zapewnienie każdemu kierowcy komfortu i stylu 
                podczas codziennych podróży.
              </p>
            </CardContent>
          </Card>

            <Card className="bg-gray-900 backdrop-blur border-gray-700 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mr-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Nasza Wizja</h2>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                Być wiodącym producentem dywaników samochodowych w Europie, wyznaczając nowe standardy 
                jakości i innowacyjności. Chcemy, aby EvaPremium było synonimem doskonałości w branży automotive.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Nasze Wartości</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gray-900 backdrop-blur border-gray-700 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Jakość</h3>
                <p className="text-gray-300">
                  Używamy tylko najwyższej jakości materiałów EVA i najnowszych technologii produkcji.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 backdrop-blur border-gray-700 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Pasja</h3>
                <p className="text-gray-300">
                  Motoryzacja to nasza pasja. Każdy produkt tworzymy z miłością do detali.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 backdrop-blur border-gray-700 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Innowacja</h3>
                <p className="text-gray-300">
                  Ciągle rozwijamy nasze produkty, wprowadzając nowe wzory i rozwiązania.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 backdrop-blur border-gray-700 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Klient</h3>
                <p className="text-gray-300">
                  Zadowolenie naszych klientów jest dla nas najważniejsze. Słuchamy i reagujemy na potrzeby.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 backdrop-blur border-gray-700 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Szybkość</h3>
                <p className="text-gray-300">
                  Szybka realizacja zamówień i dostawa w całej Polsce w ciągu 24-48 godzin.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 backdrop-blur border-gray-700 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Gwarancja</h3>
                <p className="text-gray-300">
                  Pełna gwarancja jakości i satysfakcji. Jeśli nie jesteś zadowolony, zwracamy pieniądze.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Dlaczego EvaPremium?</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Materiał EVA Premium</h3>
                  <p className="text-gray-300">
                    Używamy najwyższej jakości materiału EVA, który jest wodoodporny, łatwy w czyszczeniu i trwały.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Dokładne Dopasowanie</h3>
                  <p className="text-gray-300">
                    Każdy dywanik jest precyzyjnie dopasowany do konkretnego modelu i wersji samochodu.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Różnorodność Wzorów</h3>
                  <p className="text-gray-300">
                    Oferujemy dziesiątki wzorów i kolorów, abyś mógł dopasować dywaniki do swojego stylu.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Polska Produkcja</h3>
                  <p className="text-gray-300">
                    Wszystkie dywaniki produkowane są w Polsce, wspierając lokalną gospodarkę.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Szybka Dostawa</h3>
                  <p className="text-gray-300">
                    Realizujemy zamówienia w ciągu 24-48 godzin i dostarczamy w całej Polsce.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Gwarancja Jakości</h3>
                  <p className="text-gray-300">
                    100% gwarancji satysfakcji. Jeśli nie jesteś zadowolony, zwracamy pieniądze.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-red-600/20 to-red-700/20 backdrop-blur border-red-500/30 shadow-2xl">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Gotowy na zmianę?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Dołącz do tysięcy zadowolonych klientów i zamów swoje idealne dywaniki EVA już dziś!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#dywaniki" 
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-red-500/25"
              >
                Zobacz Produkty
              </a>
              <a 
                href="tel:+48570123635" 
                className="border border-gray-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Zadzwoń: +48 570 123 635
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
