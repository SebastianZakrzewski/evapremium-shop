"use client";

import React, { useState } from 'react';
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
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const contactInfo = [
  {
    icon: Phone,
    title: "Infolinia",
    value: "+48 793 993 430",
    subtext: "Pon-Pt: 8:00-18:00",
    action: "tel:+48793993430",
    color: "text-green-500",
    bg: "bg-green-500/10"
  },
  {
    icon: Mail,
    title: "Email",
    value: "evapremium.kontakt@gmail.com",
    subtext: "Odpowiadamy w 24h",
    action: "mailto:evapremium.kontakt@gmail.com",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    icon: MapPin,
    title: "Siedziba",
    value: "Gdynia, Pogórze",
    subtext: "ul. Tadeusza Kościuszki 34/1",
    action: "https://maps.google.com",
    color: "text-red-500",
    bg: "bg-red-500/10"
  }
];

export default function ContactSection() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    // Simulate API call
    setTimeout(() => setFormState('success'), 1500);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden py-20 md:py-32">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-red-900/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-900/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left Side - Contact Info & Map */}
          <div className="lg:col-span-5 space-y-8">
            {/* Info Cards */}
            <div className="grid gap-4">
              {contactInfo.map((info, idx) => {
                const Icon = info.icon;
                return (
                  <a 
                    key={idx} 
                    href={info.action}
                    className="flex items-center gap-5 p-5 rounded-xl bg-[#111] border border-white/5 hover:border-white/20 hover:bg-[#161616] transition-all duration-300 group"
                  >
                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", info.bg)}>
                      <Icon className={cn("w-6 h-6", info.color)} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-medium mb-1">{info.title}</p>
                      <h4 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors">{info.value}</h4>
                      <p className="text-xs text-gray-400">{info.subtext}</p>
                    </div>
                    <ArrowRight className="ml-auto w-5 h-5 text-gray-400 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </a>
                );
              })}
            </div>

            {/* Map Preview */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
              <iframe
                src="https://www.google.com/maps?q=ul.+Tadeusza+Kościuszki+34%2F1,+81-198+Pogórze,+Gdynia&output=embed&hl=pl&z=16"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(85%) grayscale(20%)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokalizacja EvaPremium"
                className="opacity-80 group-hover:opacity-100 transition-opacity duration-500"
              />
              <div className="absolute inset-0 pointer-events-none border-2 border-white/5 rounded-2xl" />
            </div>
            
            <div className="p-6 bg-[#111] rounded-xl border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-5 h-5 text-gray-400" />
                <h4 className="font-bold text-white">Dane Firmowe</h4>
              </div>
              <div className="space-y-2 text-sm text-gray-400">
                <p>EvaPremium Klaudia Lewandowska</p>
                <p>NIP: 5871715880</p>
                <p>ul. Tadeusza Kościuszki 34/1</p>
                <p>81-198 Pogórze</p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-8">
                <MessageCircle className="w-6 h-6 text-red-500" />
                <h3 className="text-2xl font-bold text-white">Napisz do nas</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-400">Imię</Label>
                    <Input
                      id="firstName"
                      placeholder="Wpisz imię"
                      className="bg-black/50 border-white/10 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/20 h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-400">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="twoj@email.com"
                      className="bg-black/50 border-white/10 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/20 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-gray-400">Temat</Label>
                  <Input
                    id="subject"
                    placeholder="Czego dotyczy wiadomość?"
                    className="bg-black/50 border-white/10 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/20 h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-400">Wiadomość</Label>
                  <Textarea
                    id="message"
                    placeholder="Treść wiadomości..."
                    rows={6}
                    className="bg-black/50 border-white/10 text-white placeholder:text-gray-400 focus:border-red-500 focus:ring-red-500/20 resize-none"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={formState !== 'idle'}
                  className={cn(
                    "w-full h-14 text-base font-bold transition-all duration-300",
                    formState === 'success' 
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-red-600 text-white hover:bg-red-700"
                  )}
                >
                  {formState === 'idle' && (
                    <>
                      Wyślij Wiadomość
                      <Send className="ml-2 w-4 h-4" />
                    </>
                  )}
                  {formState === 'submitting' && "Wysyłanie..."}
                  {formState === 'success' && (
                    <>
                      Wysłano Pomyślnie
                      <CheckCircle className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
