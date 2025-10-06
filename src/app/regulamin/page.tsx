import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Regulamin - EvaPremium',
  description: 'Regulamin sklepu internetowego EvaPremium - warunki korzystania z serwisu',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Regulamin</h1>
          
          <div className="bg-black border border-neutral-800 rounded-lg shadow-lg p-8 space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">REGULAMIN SKLEPU INTERNETOWEGO WWW.EVAPREMIUM.PL</h1>
              <div className="text-sm text-gray-400">
                <p>Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}</p>
              </div>
            </div>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§ 1 POSTANOWIENIA OGÓLNE</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>
                  <strong>1.</strong> Niniejszy Regulamin określa zasady korzystania ze sklepu internetowego 
                  www.evapremium.pl (dalej: "Sklep"), prowadzonego przez <strong>Klaudia Lewandowska</strong>, 
                  miejsce wykonywania działalności: <strong>ul. Tadeusza Kościuszki 34/1, 81-198 Pogórze</strong>, 
                  NIP: <strong>5871715880</strong>, REGON: <strong>380082236</strong>, 
                  adres poczty elektronicznej: <strong>evapremium.kontakt@gmail.com</strong>, 
                  numer telefonu: <strong>+48 570 123 635</strong> (dalej: "Sprzedawca").
                </p>
                <p>
                  <strong>2.</strong> Regulamin jest regulaminem w rozumieniu art. 8 ustawy z dnia 2 marca 2000 r. 
                  o ochronie niektórych praw konsumentów oraz o odpowiedzialności za szkodę wyrządzoną przez produkt niebezpieczny.
                </p>
                <p>
                  <strong>3.</strong> Sklep internetowy funkcjonuje pod adresem: www.evapremium.pl
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§ 2 DEFINICJE</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>
                  <strong>1.</strong> <strong>Sklep internetowy</strong> - sklep internetowy prowadzony przez Sprzedawcę pod adresem www.evapremium.pl
                </p>
                <p>
                  <strong>2.</strong> <strong>Klient</strong> - osoba fizyczna, prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej, 
                  która dokonuje zakupów w Sklepie internetowym
                </p>
                <p>
                  <strong>3.</strong> <strong>Konsument</strong> - osoba fizyczna dokonująca z przedsiębiorcą czynności prawnej 
                  niezwiązanej bezpośrednio z jej działalnością gospodarczą lub zawodową
                </p>
                <p>
                  <strong>4.</strong> <strong>Produkt</strong> - dywaniki samochodowe EVA Premium oferowane w Sklepie internetowym
                </p>
                <p>
                  <strong>5.</strong> <strong>Zamówienie</strong> - oświadczenie woli Klienta zmierzające bezpośrednio do zawarcia Umowy Sprzedaży
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§ 3 KONTAKT ZE SKLEPEM</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>
                  <strong>1.</strong> Klient może kontaktować się ze Sprzedawcą za pomocą:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>adresu poczty elektronicznej: <strong>evapremium.kontakt@gmail.com</strong></li>
                  <li>numeru telefonu: <strong>+48 570 123 635</strong></li>
                  <li>formularza kontaktowego dostępnego na stronie Sklepu</li>
                </ul>
                <p>
                  <strong>2.</strong> Sprzedawca odpowiada na zapytania Klienta w terminie do 48 godzin.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§ 4 ZAKRES USŁUG</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>
                  <strong>1.</strong> Sklep internetowy oferuje sprzedaż dywaników samochodowych EVA Premium.
                </p>
                <p>
                  <strong>2.</strong> Produkty oferowane w Sklepie są opisane na stronach internetowych Sklepu.
                </p>
                <p>
                  <strong>3.</strong> Sprzedawca zastrzega sobie prawo do wprowadzania zmian w ofercie Sklepu.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§ 5 SKŁADANIE ZAMÓWIEŃ</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>
                  <strong>1.</strong> Zamówienia można składać za pomocą formularza zamówienia dostępnego na stronie Sklepu.
                </p>
                <p>
                  <strong>2.</strong> Zamówienie zawiera dane niezbędne do realizacji sprzedaży.
                </p>
                <p>
                  <strong>3.</strong> Sprzedawca potwierdza przyjęcie zamówienia poprzez wysłanie wiadomości e-mail.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§ 6 CENY I PŁATNOŚCI</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>
                  <strong>1.</strong> Ceny produktów podane w Sklepie są cenami brutto i zawierają podatek VAT.
                </p>
                <p>
                  <strong>2.</strong> Sprzedawca zastrzega sobie prawo do zmiany cen produktów.
                </p>
                <p>
                  <strong>3.</strong> Płatności można dokonywać za pomocą dostępnych w Sklepie metod płatności.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§ 7 DOSTAWA</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>
                  <strong>1.</strong> Produkty są dostarczane na adres podany przez Klienta w zamówieniu.
                </p>
                <p>
                  <strong>2.</strong> Koszty dostawy są podane w Sklepie i doliczane do ceny produktów.
                </p>
                <p>
                  <strong>3.</strong> Sprzedawca informuje Klienta o przewidywanym terminie dostawy.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§ 8 REKLAMACJE I ZWROTY</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>
                  <strong>1.</strong> Klient ma prawo do reklamacji wadliwych produktów zgodnie z przepisami prawa.
                </p>
                <p>
                  <strong>2.</strong> Reklamacje należy zgłaszać na adres e-mail: <strong>evapremium.kontakt@gmail.com</strong>
                </p>
                <p>
                  <strong>3.</strong> Sprzedawca rozpatruje reklamacje w terminie 14 dni roboczych.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§ 9 OCHRONA DANYCH OSOBOWYCH</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>
                  <strong>1.</strong> Dane osobowe Klientów są przetwarzane zgodnie z Polityką Prywatności.
                </p>
                <p>
                  <strong>2.</strong> Administratorem danych osobowych jest Sprzedawca.
                </p>
                <p>
                  <strong>3.</strong> Szczegółowe informacje o przetwarzaniu danych znajdują się w Polityce Prywatności.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§ 10 POSTANOWIENIA KOŃCOWE</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>
                  <strong>1.</strong> Sprzedawca zastrzega sobie prawo do zmiany Regulaminu.
                </p>
                <p>
                  <strong>2.</strong> O zmianach w Regulaminie Klienci będą informowani za pośrednictwem Sklepu.
                </p>
                <p>
                  <strong>3.</strong> W sprawach nieuregulowanych Regulaminem stosuje się przepisy prawa polskiego.
                </p>
              </div>
            </section>

            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg mt-8">
              <h3 className="text-lg font-semibold text-white mb-3">Kontakt w sprawach regulaminu</h3>
              <div className="text-gray-300 space-y-2">
                <p><strong>Email:</strong> evapremium.kontakt@gmail.com</p>
                <p><strong>Telefon:</strong> +48 570 123 635</p>
                <p><strong>Adres:</strong> ul. Tadeusza Kościuszki 34/1, 81-198 Pogórze</p>
                <p><strong>NIP:</strong> 5871715880</p>
                <p><strong>REGON:</strong> 380082236</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
