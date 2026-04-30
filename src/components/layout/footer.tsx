"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black relative pt-20 pb-10 overflow-hidden">
      {/* Gradient Top Border */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Logo i opis - 4 kolumny */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <Image
                src="/Logo svg .svg"
                alt="EvaPremium Logo"
                width={500}
                height={200}
                className="object-contain h-24 md:h-28 w-auto"
                priority
              />
            </Link>
            <p className="text-gray-400 leading-relaxed max-w-sm">
              Najwyższej jakości dywaniki samochodowe szyte na miarę. 
              Doświadcz różnicy w jakości, precyzji wykonania i nowoczesnym designie.
            </p>
            
            {/* Social Icons */}
            <div className="flex space-x-5 pt-2">
              <a href="#" className="text-gray-400 hover:text-white transition-colors transform hover:scale-110 duration-200">
                <span className="sr-only">Facebook</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors transform hover:scale-110 duration-200">
                <span className="sr-only">Instagram</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors transform hover:scale-110 duration-200">
                <span className="sr-only">TikTok</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.878-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Linki - 2 kolumny */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-6 border-l-2 border-red-600 pl-3">Nawigacja</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Strona główna
                </Link>
              </li>
              <li>
                <Link href="/dywaniki" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Dywaniki
                </Link>
              </li>
              <li>
                <Link href="/akcesoria" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Akcesoria
                </Link>
              </li>
              <li>
                <Link href="/o-nas" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  O Nas
                </Link>
              </li>
            </ul>
          </div>

          {/* Informacje - 2 kolumny */}
          <div className="col-span-1 lg:col-span-3">
            <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-6 border-l-2 border-red-600 pl-3">Informacje</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/kontakt" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/polityka-prywatnosci" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Polityka prywatności
                </Link>
              </li>
              <li>
                <Link href="/zasady-dostawy-platnosci" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Zasady dostawy
                </Link>
              </li>
              <li>
                <Link href="/regulamin" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Regulamin
                </Link>
              </li>
              <li>
                <Link href="/zwroty-wymiany" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <span className="w-1 h-1 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Zwroty i wymiany
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontakt - 4 kolumny */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-6 border-l-2 border-red-600 pl-3">Kontakt</h3>
            <ul className="space-y-4">
              <li className="group">
                <span className="block text-xs uppercase text-gray-400 mb-1 tracking-wide">Email</span>
                <a href="mailto:evapremium.kontakt@gmail.com" className="text-white hover:text-red-500 transition-colors font-medium">
                  evapremium.kontakt@gmail.com
                </a>
              </li>
              <li className="group">
                <span className="block text-xs uppercase text-gray-400 mb-1 tracking-wide">Telefon</span>
                <a href="tel:+48793993430" className="text-white hover:text-red-500 transition-colors font-medium text-lg">
                  +48 793 993 430
                </a>
              </li>
              <li>
                <span className="block text-xs uppercase text-gray-400 mb-1 tracking-wide">Adres</span>
                <span className="text-gray-400 block leading-snug">
                  Klaudia Lewandowska<br />
                  ul. Tadeusza Kościuszki 34/1<br />
                  81-198 Pogórze
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Opcje płatności */}
        <div className="border-t border-white/10 py-8">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest text-center mb-6">Bezpieczne płatności</h3>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 opacity-80">
            {[
              { src: "/formy_platnosci/visa.png", alt: "Visa" },
              { src: "/formy_platnosci/mastercard.png", alt: "Mastercard" },
              { src: "/formy_platnosci/american.svg", alt: "American Express" },
              { src: "/formy_platnosci/google.png", alt: "Google Pay" },
              { src: "/formy_platnosci/apple.jpg", alt: "Apple Pay" },
              { src: "/formy_platnosci/blik.png", alt: "BLIK" },
              { src: "/formy_platnosci/bank.png", alt: "Przelew" }
            ].map((item, index) => (
              <div key={index} className="bg-white p-2 rounded hover:scale-110 transition-transform duration-300 shadow-lg grayscale hover:grayscale-0 w-14 h-10 flex items-center justify-center">
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={40}
                  height={25}
                  className="object-contain w-full h-full"
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} EvaPremium. Wszystkie prawa zastrzeżone.</p>
          <div className="flex gap-6">
            <Link href="/polityka-prywatnosci" className="hover:text-gray-400 transition-colors">Polityka Prywatności</Link>
            <Link href="/regulamin" className="hover:text-gray-400 transition-colors">Regulamin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
