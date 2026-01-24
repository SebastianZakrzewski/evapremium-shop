import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zasady dostawy i płatności - EvaPremium',
  description: 'Polityka wysyłki i płatności w sklepie EvaPremium - koszty, terminy dostawy, sposoby płatności',
};

export default function DeliveryAndPaymentTermsPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Zasady dostawy i płatności</h1>
          
          <div className="bg-black border border-neutral-800 rounded-lg shadow-lg p-8 space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">POLITYKA WYSYŁKI I PŁATNOŚCI</h1>
              <div className="text-sm text-gray-400">
                <p>Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}</p>
              </div>
            </div>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">KOSZT, TERMIN I SPOSOBY DOSTAWY PRODUKTU</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>
                  Koszty dostawy Produktu ponoszone przez Klienta są określane w trakcie składania Zamówienia i zależą od wybranej metody płatności oraz sposobu dostawy. 
                  Informacja o całkowitym koszcie (w tym koszcie dostawy) jest każdorazowo podawana przed ostatecznym potwierdzeniem Zamówienia.
                </p>
                
                <p>
                  Termin dostawy Produktu składa się z dwóch elementów:
                </p>
                
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg my-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Czasu kompletowania Produktu</h3>
                  <p className="text-gray-300 mb-3">
                    który wynosi do 14 dni roboczych od momentu:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>dostarczenia przez Klienta wszystkich niezbędnych informacji, w tym zdjęć podłogi samochodu, jeżeli są wymagane,</li>
                    <li>zaksięgowania płatności na rachunku Sprzedawcy (w przypadku przelewu),</li>
                    <li>pozytywnej autoryzacji transakcji (w przypadku płatności elektronicznej),</li>
                    <li>lub złożenia zamówienia i uiszczenia przedpłaty (w przypadku płatności za pobraniem).</li>
                  </ul>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg my-4">
                  <h3 className="text-lg font-semibold text-white mb-3">+ Czasu dostawy przez przewoźnika</h3>
                  <p className="text-gray-300">
                    który wynosi zazwyczaj do 7 dni roboczych od momentu nadania przesyłki (dostawy realizowane są tylko w dni robocze, 
                    z wyłączeniem sobót, niedziel i dni ustawowo wolnych od pracy).
                  </p>
                </div>

                <p>
                  Zamówione Produkty dostarczane są za pośrednictwem firm kurierskich (m.in. DPD, DHL, InPost), Poczty Polskiej lub do paczkomatów InPost.
                </p>

                <p>
                  Po otrzymaniu wszystkich niezbędnych danych dotyczących zamówienia (w tym zdjęć i adresu), Klient ma możliwość wyboru jednej z opcji realizacji:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                  <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg text-center">
                    <h4 className="text-lg font-semibold text-white mb-2">Standard</h4>
                    <p className="text-gray-300">do 14 dni roboczych</p>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg text-center">
                    <h4 className="text-lg font-semibold text-white mb-2">Ekspres</h4>
                    <p className="text-gray-300">do 7 dni roboczych</p>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg text-center">
                    <h4 className="text-lg font-semibold text-white mb-2">Premium</h4>
                    <p className="text-gray-300">do 3 dni roboczych</p>
                  </div>
                </div>

                <p>
                  Usługi Ekspres i Premium są dodatkowo płatne, zgodnie z aktualnym cennikiem.
                </p>

                <p>
                  W przypadku opóźnienia dostawy z przyczyn niezależnych od Sprzedawcy, Klient zostanie niezwłocznie poinformowany. 
                  Sprzedawca nie ponosi odpowiedzialności za działania przewoźnika, lecz podejmuje wszelkie możliwe starania, aby przesyłka dotarła na czas.
                </p>

                <div className="bg-yellow-900/20 border border-yellow-600/30 p-4 rounded-lg my-4">
                  <p className="text-yellow-200">
                    <strong>Ważne:</strong> Klient ma obowiązek sprawdzenia przesyłki przy odbiorze. W przypadku stwierdzenia uszkodzenia opakowania lub Produktu należy spisać protokół szkody w obecności kuriera oraz niezwłocznie skontaktować się ze Sprzedawcą pod adresem e-mail 
                    <a href="mailto:evapremium.kontakt@gmail.com" className="text-blue-400 hover:underline ml-1">
                      evapremium.kontakt@gmail.com
                    </a>
                    {' '}lub telefonicznie pod numerem 
                    <a href="tel:+48793993430" className="text-blue-400 hover:underline ml-1">
                      +48 793 993 430
                    </a>.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">SPOSOBY PŁATNOŚCI</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>
                  Sprzedawca udostępnia następujące formy płatności:
                </p>

                <div className="space-y-6">
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-white mb-4">1.1. Przelew tradycyjny na rachunek bankowy Sprzedawcy:</h3>
                    <div className="bg-black border border-neutral-700 p-4 rounded-lg">
                      <div className="text-gray-300 space-y-2">
                        <p><strong>Klaudia Lewandowska</strong></p>
                        <p>ul. Tadeusza Kościuszki 34/1</p>
                        <p>81-198 Pogórze</p>
                        <p>NIP: 5871715880</p>
                        <p><strong>Numer rachunku (Alior Bank S.A.):</strong></p>
                        <p className="text-lg font-mono bg-neutral-800 p-2 rounded text-green-400">78 2490 0005 0000 4530 1376 8507</p>
                      </div>
                    </div>
                    <p className="text-gray-300 mt-4">
                      W tytule przelewu należy wpisać numer zamówienia, adres e-mail oraz markę i model samochodu.
                    </p>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-white mb-4">1.2. Płatność online</h3>
                    <p className="text-gray-300 mb-4">
                      za pośrednictwem systemów płatności elektronicznych (Stripe, BLIK, karta płatnicza).
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="bg-white rounded-lg p-3 w-20 h-16 flex items-center justify-center">
                        <span className="text-xs font-semibold text-black">Stripe</span>
                      </div>
                      <div className="bg-white rounded-lg p-3 w-20 h-16 flex items-center justify-center">
                        <span className="text-xs font-semibold text-black">BLIK</span>
                      </div>
                      <div className="bg-white rounded-lg p-3 w-20 h-16 flex items-center justify-center">
                        <span className="text-xs font-semibold text-black">Bank</span>
                      </div>
                      <div className="bg-white rounded-lg p-3 w-20 h-16 flex items-center justify-center">
                        <span className="text-xs font-semibold text-black">Karty</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-white mb-4">1.3. Płatność za pobraniem (przy odbiorze)</h3>
                    <p className="text-gray-300">
                      możliwa po uprzednim dokonaniu przedpłaty oraz weryfikacji danych adresowych.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-600/30 p-4 rounded-lg my-6">
                  <h4 className="text-lg font-semibold text-blue-200 mb-2">Informacje o płatnościach:</h4>
                  <ul className="text-blue-200 space-y-2">
                    <li>• W przypadku płatności elektronicznych (pkt 1.2), Klient dokonuje zapłaty przed rozpoczęciem realizacji zamówienia.</li>
                    <li>• W przypadku płatności za pobraniem (pkt 1.3), przesyłka zostanie wysłana po wpłacie przedpłaty przez Klienta i weryfikacji adresu dostawy. Pozostała kwota płatna jest u kuriera.</li>
                    <li>• Klient zobowiązany jest do dokonania zapłaty Ceny z tytułu Umowy Sprzedaży w terminie 5 dni roboczych od dnia jej zawarcia, chyba że Umowa Sprzedaży stanowi inaczej.</li>
                    <li>• Produkt zostanie przekazany do wysyłki dopiero po zaksięgowaniu środków (przelew, płatność online) lub po wpłacie przedpłaty (w przypadku płatności przy odbiorze).</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">DODATKOWE INFORMACJE</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>
                  W przypadku braku możliwości realizacji zamówienia z przyczyn niezależnych od Sprzedawcy (np. brak materiałów, błędne dane), 
                  Klient zostanie niezwłocznie poinformowany, a ewentualna wpłata zostanie zwrócona w ciągu 7 dni roboczych.
                </p>
                
                <p>
                  Reklamacje dotyczące dostawy (np. opóźnienia, uszkodzenia) można zgłaszać mailowo na adres: 
                  <a href="mailto:evapremium.kontakt@gmail.com" className="text-blue-400 hover:underline ml-1">
                    evapremium.kontakt@gmail.com
                  </a>
                  {' '}w ciągu 3 dni roboczych od odbioru.
                </p>
              </div>
            </section>

            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg mt-8">
              <h3 className="text-lg font-semibold text-white mb-3">Kontakt w sprawach dostawy i płatności</h3>
              <div className="text-gray-300 space-y-2">
                <p><strong>Email:</strong> 
                  <a href="mailto:evapremium.kontakt@gmail.com" className="text-blue-400 hover:underline ml-1">
                    evapremium.kontakt@gmail.com
                  </a>
                </p>
                <p><strong>Telefon:</strong> 
                  <a href="tel:+48793993430" className="text-blue-400 hover:underline ml-1">
                    +48 793 993 430
                  </a>
                </p>
                <p><strong>Adres:</strong> ul. Tadeusza Kościuszki 34/1, 81-198 Pogórze</p>
                <p><strong>NIP:</strong> 5871715880</p>
                <p><strong>Rachunek bankowy:</strong> 78 2490 0005 0000 4530 1376 8507 (Alior Bank S.A.)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
