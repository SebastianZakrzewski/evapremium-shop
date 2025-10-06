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
              <h2 className="text-2xl font-semibold text-white mb-4">§1 POSTANOWIENIA OGÓLNE</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>
                  Sklep internetowy działający pod adresem www.evapremium.pl prowadzony jest przez Klaudię Lewandowską, 
                  prowadzącą działalność gospodarczą w formie jednoosobowej działalności gospodarczej, z siedzibą przy 
                  ul. Tadeusza Kościuszki 34/1, 81-198 Pogórze, Gdynia, NIP: 5871715880, REGON: 380082236, 
                  adres e-mail: kontakt.evapremium@gmail.com, numer telefonu: +48 570 123 635.
                </p>
                <p>
                  Niniejszy Regulamin określa warunki zawierania i rozwiązywania Umów Sprzedaży Produktów, 
                  tryb postępowania reklamacyjnego, a także rodzaje i zakres usług świadczonych drogą elektroniczną 
                  przez Sklep www.evapremium.pl.
                </p>
                <p>
                  Każdy Usługobiorca z chwilą podjęcia czynności zmierzających do korzystania z Usług Elektronicznych 
                  Sklepu www.evapremium.pl zobowiązany jest do przestrzegania postanowień niniejszego Regulaminu.
                </p>
                <p>
                  Kolory prezentowane na stronie internetowej mają charakter poglądowy i mogą różnić się od rzeczywistych 
                  ze względu na indywidualne ustawienia monitorów oraz warunki oświetlenia. Różnice te nie stanowią 
                  podstawy do reklamacji, jeśli produkt odpowiada uzgodnionym parametrom (wymiary, jakość, wzór).
                </p>
                <p>
                  W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>ustawy o świadczeniu usług drogą elektroniczną z dnia 18 lipca 2002 r.,</li>
                  <li>ustawy o prawach konsumenta z dnia 30 maja 2014 r.,</li>
                  <li>ustawy o pozasądowym rozwiązywaniu sporów konsumenckich z dnia 23 września 2016 r.,</li>
                  <li>Kodeksu cywilnego z dnia 23 kwietnia 1964 r.,</li>
                  <li>oraz inne właściwe przepisy prawa polskiego.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§2 DEFINICJE</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p><strong>REGULAMIN</strong> – niniejszy dokument.</p>
                <p><strong>SKLEP</strong> – sklep internetowy dostępny pod adresem www.evapremium.pl.</p>
                <p><strong>USŁUGA ELEKTRONICZNA</strong> – usługa świadczona drogą elektroniczną przez Usługodawcę na rzecz Usługobiorcy za pośrednictwem Sklepu.</p>
                <p><strong>FORMULARZ KONTAKTOWY</strong> – formularz umożliwiający wysłanie wiadomości do Usługodawcy.</p>
                <p><strong>FORMULARZ WYCENY</strong> – formularz umożliwiający otrzymanie indywidualnej wyceny.</p>
                <p><strong>FORMULARZ ZAMÓWIENIA</strong> – formularz umożliwiający złożenie Zamówienia.</p>
                <p><strong>SYSTEM OPINII</strong> – usługa umożliwiająca publikowanie opinii o produktach.</p>
                <p><strong>NEWSLETTER</strong> – usługa umożliwiająca subskrypcję bezpłatnych informacji o produktach.</p>
                <p><strong>SPRZEDAWCA / USŁUGODAWCA</strong> – Klaudia Lewandowska, prowadząca jednoosobową działalność gospodarczą, ul. Tadeusza Kościuszki 34/1, 81-198 Pogórze, Gdynia, NIP: 5871715880, REGON: 380082236, e-mail: kontakt.evapremium@gmail.com, tel. +48 570 123 635.</p>
                <p><strong>USŁUGOBIORCA</strong> – osoba fizyczna, prawna lub jednostka organizacyjna korzystająca z Usług Elektronicznych.</p>
                <p><strong>KLIENT</strong> – Usługobiorca, który zamierza zawrzeć lub zawarł Umowę Sprzedaży.</p>
                <p><strong>KONSUMENT</strong> – osoba fizyczna dokonująca czynności niezwiązanej z działalnością gospodarczą lub zawodową.</p>
                <p><strong>PRZEDSIĘBIORCA</strong> – osoba prowadząca działalność gospodarczą.</p>
                <p><strong>PRODUKT</strong> – rzecz ruchoma lub usługa będąca przedmiotem Umowy Sprzedaży.</p>
                <p><strong>UMOWA SPRZEDAŻY</strong> – umowa zawarta pomiędzy Klientem a Sprzedawcą za pośrednictwem Sklepu.</p>
                <p><strong>ZAMÓWIENIE</strong> – oświadczenie woli Klienta stanowiące ofertę zakupu Produktu.</p>
                <p><strong>CENA</strong> – kwota wyrażona w PLN, obejmująca podatek VAT.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§3 INFORMACJE O PRODUKTACH I ZAMAWIANIU</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>Sklep www.evapremium.pl prowadzi sprzedaż Produktów za pośrednictwem Internetu.</p>
                <p>Produkty oferowane w Sklepie są nowe, wykonywane na indywidualne zamówienie zgodnie ze specyfikacją Klienta i legalnie wprowadzone na rynek polski.</p>
                <p>Informacje zawarte w Sklepie nie stanowią oferty w rozumieniu Kodeksu cywilnego. Złożenie Zamówienia stanowi ofertę Klienta.</p>
                <p>Ceny podawane są w złotych polskich (PLN) i zawierają VAT. Koszty dostawy nie są wliczone w cenę.</p>
                <p>Cena obowiązuje w momencie złożenia Zamówienia i nie zmienia się po jego złożeniu.</p>
                <p>Sklep informuje jasno o cenach jednostkowych, promocjach i obniżkach zgodnie z obowiązującymi przepisami (w tym o najniższej cenie z ostatnich 30 dni).</p>
                <p>Zamówienia można składać:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>przez stronę internetową (formularz zamówienia) – 24/7,</li>
                  <li>e-mailem na adres kontakt.evapremium@gmail.com,</li>
                  <li>przez formularz wyceny,</li>
                  <li>telefonicznie lub SMS na numer +48 570 123 635,</li>
                  <li>przez portale społecznościowe (Facebook, Messenger, Instagram, TikTok, WhatsApp).</li>
                </ul>
                <p>Warunkiem złożenia zamówienia jest akceptacja Regulaminu.</p>
                <p>Produkty promocyjne mają ograniczoną ilość i realizowane są według kolejności zamówień.</p>
                <p>Klient zobowiązany jest do prawidłowego użytkowania produktów EVA zgodnie z zaleceniami:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>unikanie kontaktu z ostrymi przedmiotami,</li>
                  <li>zachowanie bezpiecznej odległości przy użyciu myjek ciśnieniowych (min. 20 cm),</li>
                  <li>unikanie wysokich temperatur powyżej 80°C,</li>
                  <li>nieużywanie twardych szczotek ani ostrych narzędzi,</li>
                  <li>nieprzycinanie ani niemodyfikowanie dywaników – zmiany mogą unieważnić gwarancję.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§4 ZAWARCIE UMOWY SPRZEDAŻY</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>Do zawarcia Umowy Sprzedaży niezbędne jest wcześniejsze złożenie przez Klienta Zamówienia zgodnie z §3.</p>
                <p>Po złożeniu Zamówienia Sprzedawca niezwłocznie potwierdza jego otrzymanie.</p>
                <p>Potwierdzenie otrzymania Zamówienia następuje telefonicznie, e-mailowo, SMS-em lub przez komunikatory społecznościowe. Z chwilą potwierdzenia Klient zostaje związany złożonym Zamówieniem.</p>
                <p>W przypadku zamówień składanych e-mailowo lub przez formularz wyceny, umowa zostaje zawarta z chwilą akceptacji oferty przesłanej przez Sprzedawcę.</p>
                <p>Potwierdzenie otrzymania Zamówienia zawiera:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>potwierdzenie wszystkich istotnych elementów Zamówienia,</li>
                  <li>formularz odstąpienia od umowy,</li>
                  <li>treść Regulaminu.</li>
                </ul>
                <p>Z chwilą otrzymania potwierdzenia (e-mail) zostaje zawarta Umowa Sprzedaży.</p>
                <p>Dowód zakupu:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>każda Umowa Sprzedaży potwierdzana jest paragonem lub fakturą,</li>
                  <li>dokument może być dołączony do przesyłki lub wysłany elektronicznie.</li>
                </ul>
                <p>Sprzedawca przystępuje do realizacji zamówienia po otrzymaniu wszystkich niezbędnych danych dotyczących auta i produktu oraz po wpłacie zaliczki lub pełnej kwoty.</p>
                <p>Jeśli Klient nie dostarczy wymaganych danych lub płatności w ciągu 5 dni roboczych, Sprzedawca może odstąpić od umowy.</p>
                <p>Produkcja zamówienia rozpoczyna się dopiero po zaksięgowaniu płatności.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§5 SPOSOBY PŁATNOŚCI</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>Sprzedawca udostępnia następujące sposoby płatności:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>przelew tradycyjny,</li>
                  <li>płatność online (Stripe, BLIK, Przelewy24, PayPal),</li>
                  <li>płatność przy odbiorze (za pobraniem).</li>
                </ul>
                <p>W przypadku przelewu tradycyjnego, wpłat należy dokonywać na rachunek bankowy:<br />
                47 1140 2004 0000 3702 7951 8739 (mBank S.A.)<br />
                Właściciel rachunku: Klaudia Lewandowska, ul. Tadeusza Kościuszki 34/1, 81-198 Pogórze, Polska.<br />
                W tytule przelewu należy wpisać numer zamówienia, e-mail oraz markę i model samochodu.</p>
                <p>Przy płatnościach elektronicznych realizacja zamówienia rozpoczyna się po potwierdzeniu autoryzacji płatności.</p>
                <p>W przypadku płatności przy odbiorze wysyłka następuje po weryfikacji danych i przedpłacie.</p>
                <p>Płatność musi być dokonana w ciągu 5 dni roboczych od zawarcia umowy, chyba że ustalono inaczej.</p>
                <p>Przy płatności przelewem lub online wysyłka następuje po zaksięgowaniu wpłaty.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§6 KOSZT, TERMIN I SPOSOBY DOSTAWY PRODUKTU</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>Koszty dostawy pokrywa Klient. Wysokość kosztów zależy od wybranego sposobu dostawy i płatności i jest wskazywana w trakcie składania zamówienia.</p>
                <p>Na termin dostawy składa się czas produkcji oraz czas transportu:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>czas kompletowania produktu wynosi do 14 dni roboczych od dostarczenia przez Klienta wszystkich niezbędnych danych oraz zaksięgowania płatności,</li>
                  <li>czas dostawy zależy od wybranego wariantu:
                    <ul className="list-disc list-inside text-gray-300 space-y-1 ml-8 mt-2">
                      <li>Ekspres – do 7 dni roboczych,</li>
                      <li>Premium – do 3 dni roboczych,</li>
                      <li>Standard – do 14 dni roboczych.</li>
                    </ul>
                  </li>
                </ul>
                <p>Dostawy realizowane są w dni robocze.</p>
                <p>Produkty wysyłane są za pośrednictwem Poczty Polskiej, InPost (paczkomaty) lub firm kurierskich.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§7 REKLAMACJE PRODUKTU</h2>
              <div className="text-gray-300 leading-relaxed space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">1. Reklamacja z tytułu gwarancji</h3>
                  <div className="space-y-4">
                    <p>Wszystkie produkty oferowane w Sklepie objęte są gwarancją Sprzedawcy obowiązującą na terenie Polski.</p>
                    <p>Okres gwarancji wynosi 12 miesięcy i liczony jest od dnia dostarczenia Produktu do Klienta.</p>
                    <p>Dokumentem uprawniającym do skorzystania z gwarancji jest dowód zakupu.</p>
                    <p>Szczegółowe warunki gwarancji są określone w karcie gwarancyjnej dołączonej do produktu lub dostępnej na stronie Sklepu.</p>
                    <p>Gwarancja nie wyłącza uprawnień Konsumenta wynikających z przepisów o niezgodności towaru z umową.</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">2. Reklamacja z tytułu braku zgodności produktu z umową</h3>
                  <div className="space-y-4">
                    <p>Odpowiedzialność Sprzedawcy wobec Konsumenta lub przedsiębiorcy na prawach konsumenta wynika z ustawy o prawach konsumenta z dnia 30 maja 2014 r.</p>
                    <p>Odpowiedzialność wobec przedsiębiorców regulują przepisy Kodeksu cywilnego.</p>
                    <p>Sprzedawca odpowiada za brak zgodności produktu z umową istniejący w chwili dostarczenia i ujawniony w ciągu 2 lat od tego momentu.</p>
                    <p>Zawiadomienia o braku zgodności można dokonać:</p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                      <li>mailowo: reklamacje@evapremium.pl,</li>
                      <li>pisemnie: ul. Tadeusza Kościuszki 34/1, 81-198 Pogórze, Gdynia.</li>
                    </ul>
                    <p>Reklamacja powinna zawierać jak najwięcej szczegółów (opis niezgodności, datę, dane kontaktowe).</p>
                    <p>W celu oceny produktu Klient ma obowiązek udostępnić go Sprzedawcy. Sprzedawca pokrywa koszty odbioru.</p>
                    <p>Sprzedawca ustosunkuje się do reklamacji w terminie 14 dni. W przypadku konieczności przeprowadzenia ekspertyzy termin może zostać przedłużony po poinformowaniu Klienta.</p>
                    <p>Brak odpowiedzi Sprzedawcy w terminie 14 dni oznacza uznanie reklamacji.</p>
                    <p>W pierwszej kolejności Klient może żądać wymiany lub naprawy produktu. Obniżenia ceny lub odstąpienia od umowy może żądać w przypadkach przewidzianych ustawą.</p>
                    <p>W przypadku uzasadnionej reklamacji Sprzedawca:</p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                      <li>pokrywa koszty naprawy lub wymiany,</li>
                      <li>zwraca część ceny proporcjonalnie do niezgodności,</li>
                      <li>w przypadku odstąpienia od umowy – zwraca pełną cenę w ciągu 14 dni od otrzymania produktu.</li>
                    </ul>
                    <p>Odpowiedź na reklamację przekazywana jest w formie pisemnej, mailowej lub SMS-owej.</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">3. Reklamacje wynikające z błędnych danych podanych przez klienta</h3>
                  <div className="space-y-4">
                    <p>Klient ponosi odpowiedzialność za poprawność danych (m.in. rok produkcji, wersja nadwozia, typ silnika).</p>
                    <p>Produkty wykonane na podstawie błędnych danych nie podlegają zwrotowi ani wymianie, ponieważ są wykonywane na indywidualne zamówienie.</p>
                    <p>W przypadku podejrzenia błędów pracownik Sprzedawcy kontaktuje się z Klientem w celu weryfikacji danych. Brak odpowiedzi w ciągu 3 dni roboczych skutkuje realizacją zamówienia według podanych informacji.</p>
                    <p>Reklamacje dotyczące produktów wykonanych zgodnie z błędnymi danymi Klienta nie są uznawane jako wada produktu.</p>
                    <p>Sprzedawca może zaproponować rekompensatę:</p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                      <li>Opcja A: wykonanie nowego kompletu z rabatem (20%–50% w zależności od wartości zamówienia),</li>
                      <li>Opcja B: wykonanie nowego kompletu w ramach kolejnego zamówienia, z odbiorem błędnego zestawu.</li>
                    </ul>
                    <p>Każdy przypadek reklamacji z tej kategorii dokumentowany jest w systemie sprzedażowym.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§8 PRAWO ODSTĄPIENIA OD UMOWY</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>Konsument lub przedsiębiorca na prawach konsumenta może odstąpić od umowy zawartej na odległość w terminie 14 dni bez podania przyczyny, z zastrzeżeniem wyjątków wymienionych poniżej.</p>
                <p>W razie odstąpienia umowa uważana jest za niezawartą.</p>
                <p>Termin liczy się:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>dla umów sprzedaży rzeczy – od dnia objęcia rzeczy w posiadanie,</li>
                  <li>dla umów obejmujących wiele produktów – od dnia objęcia ostatniego,</li>
                  <li>dla umów o świadczenie usług – od dnia zawarcia umowy.</li>
                </ul>
                <p>Zgodnie z art. 38 ustawy o prawach konsumenta prawo odstąpienia nie przysługuje m.in. w przypadku:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>towarów wykonanych na indywidualne zamówienie (np. dywaniki EVA),</li>
                  <li>towarów zapieczętowanych ze względów higienicznych po otwarciu opakowania,</li>
                  <li>usług wykonanych w całości za wyraźną zgodą konsumenta.</li>
                </ul>
                <p>Odstąpienie od umowy przysługuje obu stronom w przypadku niewykonania zobowiązań przez drugą stronę.</p>
                <p>W przypadku produktów standardowych (np. akcesoriów niepersonalizowanych) Klient może odstąpić od umowy zgodnie z ustawą.</p>
                <p>Procedura reklamacyjna określona jest w §7.</p>
                <p>Jeśli Klient odeśle produkt bez wcześniejszego uzgodnienia, przesyłka nie zostanie automatycznie przyjęta. Może zostać odesłana z powrotem po opłaceniu kosztów wysyłki (27 zł brutto) lub odebrana osobiście. Brak decyzji w ciągu 30 dni uprawnia Sprzedawcę do utylizacji produktu.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§9 POSTANOWIENIA DOTYCZĄCE PRZEDSIĘBIORCÓW (B2B)</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>Sprzedawca ma prawo odstąpić od umowy zawartej z przedsiębiorcą (niebędącym konsumentem) w terminie 30 dni roboczych bez podania przyczyny.</p>
                <p>Sprzedawca może ograniczyć dostępne metody płatności oraz wymagać przedpłaty.</p>
                <p>Korzyści i ryzyka związane z produktem przechodzą na Klienta w momencie wydania produktu przewoźnikowi.</p>
                <p>Przedsiębiorca powinien zbadać przesyłkę przy odbiorze i w razie szkód niezwłocznie dochodzić roszczeń u przewoźnika.</p>
                <p>Sprzedawca może wypowiedzieć umowę o świadczenie usług elektronicznych ze skutkiem natychmiastowym, bez podania przyczyny.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§10 PRZEDSIĘBIORCY NA PRAWACH KONSUMENTÓW</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>Przedsiębiorca prowadzący jednoosobową działalność gospodarczą korzysta z ochrony konsumenckiej, jeśli umowa nie ma dla niego charakteru zawodowego.</p>
                <p>W takim przypadku przysługują mu prawa dotyczące:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>niedozwolonych postanowień umownych,</li>
                  <li>odpowiedzialności za brak zgodności towaru z umową,</li>
                  <li>prawa odstąpienia od umowy,</li>
                  <li>dostarczania treści lub usług cyfrowych.</li>
                </ul>
                <p>Ochrona nie przysługuje w zakresie usług rzecznika konsumentów i Prezesa UOKiK.</p>
                <p>Charakter zawodowy transakcji weryfikowany jest na podstawie wpisu do CEIDG.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§11 RODZAJ I ZAKRES USŁUG ELEKTRONICZNYCH</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>Usługodawca za pośrednictwem Sklepu umożliwia korzystanie z następujących usług elektronicznych:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>zawieranie umów sprzedaży produktów,</li>
                  <li>korzystanie z formularza wyceny,</li>
                  <li>korzystanie z systemu opinii,</li>
                  <li>subskrypcję newslettera,</li>
                  <li>wysyłanie wiadomości przez formularz kontaktowy.</li>
                </ul>
                <p>Świadczenie usług elektronicznych odbywa się zgodnie z niniejszym Regulaminem.</p>
                <p>Usługodawca ma prawo zamieszczać w Sklepie treści reklamowe, które stanowią integralną część witryny.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§12 WARUNKI ŚWIADCZENIA I ZAWIERANIA UMÓW O ŚWIADCZENIE USŁUG ELEKTRONICZNYCH</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>Świadczenie usług elektronicznych przez Usługodawcę jest bezpłatne.</p>
                <p>Umowy o świadczenie usług elektronicznych zawierane są:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>na czas oznaczony – np. w przypadku formularzy zamówienia, kontaktowego i wyceny (umowa kończy się po wysłaniu lub rezygnacji ze złożenia wiadomości/zamówienia),</li>
                  <li>na czas nieoznaczony – w przypadku subskrypcji newslettera.</li>
                </ul>
                <p>Wymagania techniczne niezbędne do korzystania z usług elektronicznych:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>komputer lub urządzenie mobilne z dostępem do Internetu,</li>
                  <li>aktywne konto e-mail,</li>
                  <li>aktualna przeglądarka internetowa z włączoną obsługą plików cookies i JavaScript.</li>
                </ul>
                <p>Usługobiorca zobowiązany jest do:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>korzystania ze Sklepu zgodnie z prawem i dobrymi obyczajami,</li>
                  <li>podawania prawdziwych danych,</li>
                  <li>niedostarczania treści bezprawnych.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§13 REKLAMACJE DOTYCZĄCE USŁUG ELEKTRONICZNYCH</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>Reklamacje związane z usługami elektronicznymi można zgłaszać mailowo na adres: reklamacje@evapremium.pl.</p>
                <p>W treści reklamacji należy podać możliwie dokładny opis problemu, datę wystąpienia oraz dane kontaktowe.</p>
                <p>Sprzedawca rozpatruje reklamację niezwłocznie, nie później niż w ciągu 14 dni od otrzymania zgłoszenia.</p>
                <p>Odpowiedź przekazywana jest drogą mailową lub w inny wskazany przez Usługobiorcę sposób.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§14 ROZWIĄZYWANIE UMÓW O ŚWIADCZENIE USŁUG ELEKTRONICZNYCH</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>Umowy o świadczenie usług elektronicznych o charakterze ciągłym (np. newsletter) mogą zostać wypowiedziane:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>przez Usługobiorcę w dowolnym momencie, ze skutkiem natychmiastowym, poprzez wysłanie wiadomości na adres: reklamacje@evapremium.pl,</li>
                  <li>przez Usługodawcę w przypadku naruszenia Regulaminu, po wcześniejszym wezwaniu do zaprzestania naruszeń.</li>
                </ul>
                <p>Wypowiedzenie skutkuje rozwiązaniem umowy ze skutkiem na przyszłość.</p>
                <p>Umowa może być również rozwiązana w dowolnym momencie za porozumieniem stron.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§15 WŁASNOŚĆ INTELEKTUALNA</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>Wszystkie treści umieszczone na stronie www.evapremium.pl są chronione prawem autorskim i stanowią własność Klaudii Lewandowskiej, prowadzącej działalność gospodarczą przy ul. Tadeusza Kościuszki 34/1, 81-198 Pogórze, Gdynia, NIP: 5871715880, REGON: 380082236, z zastrzeżeniem treści zamieszczanych przez użytkowników lub objętych licencją.</p>
                <p>Jakiekolwiek kopiowanie, modyfikowanie, wykorzystywanie lub rozpowszechnianie zawartości strony bez zgody Usługodawcy jest zabronione i podlega odpowiedzialności cywilnej oraz karnej.</p>
                <p>Wszystkie znaki towarowe, nazwy handlowe i logotypy użyte w Sklepie należą do ich właścicieli i zostały użyte wyłącznie w celach informacyjnych.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">§16 POSTANOWIENIA KOŃCOWE</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>Umowy zawierane za pośrednictwem Sklepu podlegają prawu polskiemu.</p>
                <p>W przypadku niezgodności postanowień Regulaminu z przepisami prawa stosuje się odpowiednie przepisy prawa polskiego.</p>
                <p>Spory wynikające z umów zawieranych pomiędzy Sprzedawcą a Klientami rozstrzygane są w pierwszej kolejności polubownie, z uwzględnieniem ustawy o pozasądowym rozwiązywaniu sporów konsumenckich.</p>
                <p>Sądowe rozstrzyganie sporów:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>w przypadku Konsumentów – według właściwości ogólnej określonej przez kodeks postępowania cywilnego,</li>
                  <li>w przypadku przedsiębiorców – przez sąd właściwy dla siedziby Sprzedawcy.</li>
                </ul>
                <p>Konsument ma prawo do skorzystania z pozasądowych sposobów rozwiązywania sporów, m.in. poprzez:</p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>mediację,</li>
                  <li>sądy polubowne,</li>
                  <li>platformę ODR: <a href="https://ec.europa.eu/consumers/odr" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>.</li>
                </ul>
                <p>Regulamin obowiązuje od dnia jego publikacji na stronie Sklepu.</p>
              </div>
            </section>

            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg mt-8">
              <h3 className="text-lg font-semibold text-white mb-3">Kontakt w sprawach regulaminu</h3>
              <div className="text-gray-300 space-y-2">
                <p><strong>Email:</strong> kontakt.evapremium@gmail.com</p>
                <p><strong>Telefon:</strong> +48 570 123 635</p>
                <p><strong>Adres:</strong> ul. Tadeusza Kościuszki 34/1, 81-198 Pogórze, Gdynia</p>
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
