"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  MessageCircle,
  Building2,
  Users
} from 'lucide-react';

export default function ContactSection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-red-800/10"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-2 h-2 bg-red-500 rounded-full animate-float-hover"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-60 left-1/4 w-1.5 h-1.5 bg-red-600 rounded-full animate-float-hover" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-red-500 rounded-full animate-float-hover" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-20 left-1/2 w-2 h-2 bg-red-400 rounded-full animate-float-hover" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            KONTAKT
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Masz pytania? Chcesz złożyć zamówienie? Jesteśmy tutaj, aby Ci pomóc!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="bg-gray-900 backdrop-blur border-gray-700 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-3">
                  <MessageCircle className="h-8 w-8 text-red-500" />
                  Skontaktuj się z nami
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contact Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-black/20 rounded-lg">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                      <Phone className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Telefon</h3>
                      <p className="text-gray-300">+48 123 456 789</p>
                      <p className="text-gray-400 text-sm">Pon-Pt: 8:00-18:00</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-black/20 rounded-lg">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                      <Mail className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Email</h3>
                      <p className="text-gray-300">kontakt@evapremium.pl</p>
                      <p className="text-gray-400 text-sm">Odpowiadamy w ciągu 24h</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-black/20 rounded-lg">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Adres</h3>
                      <p className="text-gray-300">ul. Przykładowa 123</p>
                      <p className="text-gray-300">00-000 Warszawa</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-black/20 rounded-lg">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Godziny pracy</h3>
                      <p className="text-gray-300">Poniedziałek - Piątek: 8:00 - 18:00</p>
                      <p className="text-gray-300">Sobota: 9:00 - 15:00</p>
                      <p className="text-gray-400 text-sm">Niedziela: Zamknięte</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card className="bg-gray-900 backdrop-blur border-gray-700 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-3">
                  <Building2 className="h-8 w-8 text-red-500" />
                  O naszej firmie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-center">
                  <div className="flex items-center justify-center gap-4 p-4 bg-black/20 rounded-lg">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Zespół ekspertów</h3>
                      <p className="text-gray-300">Ponad 50 specjalistów</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 leading-relaxed">
                    EvaPremium to polska firma z wieloletnim doświadczeniem w produkcji 
                    dywaników samochodowych EVA. Nasz zespół składa się z ekspertów, 
                    którzy pomogą Ci wybrać idealne rozwiązanie dla Twojego samochodu.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="bg-gray-900 backdrop-blur border-gray-700 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-3">
                  <Send className="h-8 w-8 text-red-500" />
                  Wyślij wiadomość
                </CardTitle>
                <p className="text-gray-300">
                  Wypełnij formularz, a skontaktujemy się z Tobą w ciągu 24 godzin
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white font-medium">
                        Imię *
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Twoje imię"
                        className="bg-black/40 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white font-medium">
                        Nazwisko *
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Twoje nazwisko"
                        className="bg-black/40 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white font-medium">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="twoj@email.pl"
                      className="bg-black/40 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white font-medium">
                      Telefon
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+48 123 456 789"
                      className="bg-black/40 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-white font-medium">
                      Temat *
                    </Label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="Temat wiadomości"
                      className="bg-black/40 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white font-medium">
                      Wiadomość *
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Opisz swoje pytanie lub zapytanie..."
                      rows={6}
                      className="bg-black/40 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20 resize-none"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-red-500/25"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Wyślij wiadomość
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <Card className="bg-gray-900 backdrop-blur border-gray-700 shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-3">
                <MapPin className="h-8 w-8 text-red-500" />
                Znajdź nas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black/20 rounded-lg p-8 text-center">
                <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 text-lg">Mapa zostanie wkrótce dodana</p>
                    <p className="text-gray-400 text-sm">ul. Przykładowa 123, 00-000 Warszawa</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-hover {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float-hover {
          animation: float-hover 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
