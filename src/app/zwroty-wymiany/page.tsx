import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zwroty i wymiany - EvaPremium',
  description: 'Polityka zwrotów i wymiany produktów w sklepie EvaPremium - warunki zwrotów, reklamacji i gwarancji',
};

export default function ReturnsAndExchangesPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Zwroty i wymiany</h1>
          
          <div className="bg-black border border-neutral-800 rounded-lg shadow-lg p-8 space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">POLITYKA ZWROTÓW I REKLAMACJI</h1>
              <div className="text-sm text-gray-400">
                <p>Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}</p>
              </div>
            </div>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Zwroty i wymiany</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>
                  Produkty oferowane w Sklepie są nowe, wytwarzane na indywidualne zamówienie, według specyfikacji wybranej przez Klienta, 
                  zgodne z zawartą umową i zostały legalnie wprowadzone na rynek Rzeczypospolitej Polskiej.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">PRAWO ODSTĄPIENIA OD UMOWY</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>
                  Zgodnie z art. 38 pkt 3 ustawy z dnia 30 maja 2014 r. o prawach konsumenta, prawo do odstąpienia od umowy zawartej na odległość 
                  nie przysługuje Konsumentowi, jeżeli przedmiotem świadczenia jest rzecz nieprefabrykowana, wyprodukowana według specyfikacji 
                  Konsumenta lub służąca zaspokojeniu jego zindywidualizowanych potrzeb.
                </p>
                <p>
                  Produkty oferowane w Sklepie – jako wykonywane na zamówienie, zgodnie z indywidualną specyfikacją Klienta – nie podlegają 
                  zwrotowi bez podania przyczyny.
                </p>
                <p>
                  Jednakże Klient będący Konsumentem lub podmiotem, o którym mowa w § 10 Regulaminu, ma prawo zgłosić reklamację z tytułu 
                  niezgodności towaru z umową (np. w przypadku błędnego wykonania, niepasującego rozmiaru, uszkodzenia produktu). W takiej sytuacji:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>W pierwszej kolejności Klient zgłasza reklamację, która zostaje rozpatrzona przez Sprzedawcę,</li>
                  <li>Sprzedawca może dokonać poprawek, naprawy lub wymiany produktu,</li>
                  <li>Dopiero w przypadku, gdy naprawa lub wymiana nie jest możliwa lub nieskuteczna, Klient ma prawo odstąpić od umowy i uzyskać zwrot ceny – zgodnie z przepisami ustawy.</li>
                </ul>
                <p>
                  <strong>Zgłoszenia należy kierować na adres e-mail:</strong> 
                  <a href="mailto:evapremium.kontakt@gmail.com" className="text-blue-400 hover:underline ml-1">
                    evapremium.kontakt@gmail.com
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Standardowe produkty</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>
                  W przypadku produktów standardowych, takich jak ściereczki, ochraniacze, wieszaki samochodowe i inne niepersonalizowane produkty:
                </p>
                <p>
                  Mają Państwo prawo odstąpić od niniejszej umowy w terminie 14 dni bez podania jakiejkolwiek przyczyny. Termin do odstąpienia od umowy 
                  wygasa po upływie 14 dni od dnia, w którym weszli Państwo w posiadanie rzeczy lub w którym osoba trzecia inna niż przewoźnik i 
                  wskazana przez Państwa weszła w posiadanie rzeczy.
                </p>
                <p>
                  Aby skorzystać z prawa odstąpienia od umowy, muszą Państwo poinformować nas:
                </p>
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg my-4">
                  <div className="text-gray-300 space-y-2">
                    <p><strong>Klaudia Lewandowska</strong></p>
                    <p>ul. Tadeusza Kościuszki 34/1</p>
                    <p>81-198 Pogórze</p>
                    <p>NIP: 5871715880</p>
                    <p>tel. +48 793 993 430</p>
                    <p>e-mail: 
                      <a href="mailto:evapremium.kontakt@gmail.com" className="text-blue-400 hover:underline ml-1">
                        evapremium.kontakt@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
                <p>
                  o swojej decyzji o odstąpieniu od niniejszej umowy w drodze jednoznacznego oświadczenia (na przykład pismo wysłane pocztą, 
                  faksem lub pocztą elektroniczną). Mogą Państwo skorzystać z wzoru formularza odstąpienia od umowy, jednak nie jest to obowiązkowe.
                </p>
                <p>
                  Aby zachować termin do odstąpienia od umowy, wystarczy, aby wysłali Państwo informację dotyczącą wykonania przysługującego 
                  Państwu prawa odstąpienia od umowy przed upływem terminu do odstąpienia od umowy.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Skutki odstąpienia od umowy</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>
                  W przypadku odstąpienia od niniejszej umowy zwracamy Państwu wszystkie otrzymane od Państwa płatności, w tym koszty dostarczenia 
                  rzeczy (z wyjątkiem dodatkowych kosztów wynikających z wybranego przez Państwa sposobu dostarczenia innego niż najtańszy zwykły 
                  sposób dostarczenia oferowany przez nas), niezwłocznie, a w każdym przypadku nie później niż 14 dni od dnia, w którym zostaliśmy 
                  poinformowani o Państwa decyzji o wykonaniu prawa odstąpienia od niniejszej umowy. Zwrotu płatności dokonamy przy użyciu takich 
                  samych sposobów płatności, jakie zostały przez Państwa użyte w pierwotnej transakcji, chyba że wyraźnie zgodziliście się Państwo na 
                  inne rozwiązanie; w każdym przypadku nie poniosą Państwo żadnych opłat w związku z tym zwrotem. Możemy wstrzymać się ze zwrotem 
                  płatności do czasu otrzymania rzeczy lub do czasu dostarczenia nam dowodu jej odesłania, w zależności od tego, które zdarzenie nastąpi wcześniej.
                </p>
                <p>
                  Proszę odesłać lub przekazać nam rzecz na powyższy adres niezwłocznie, a w każdym razie nie później niż 14 dni od dnia, w którym 
                  poinformowali nas Państwo o odstąpieniu od niniejszej umowy. Termin jest zachowany, jeżeli odeślą Państwo rzecz przed upływem terminu 14 dni.
                </p>
                <p>
                  Będą Państwo musieli ponieść bezpośrednie koszty zwrotu rzeczy.
                </p>
                <p>
                  Prawo do odstąpienia od umowy przez konsumenta jest wyłączone w przypadku:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                  <li>umowy, w której przedmiotem świadczenia jest rzecz nieprefabrykowana, wyprodukowana według specyfikacji konsumenta lub służąca zaspokojeniu jego zindywidualizowanych potrzeb.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. REKLAMACJA Z TYTUŁU GWARANCJI</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <div className="space-y-4">
                  <p><strong>1.1.</strong> Wszystkie Produkty oferowane w Sklepie objęte są gwarancją Sprzedawcy obowiązującą na terytorium Rzeczypospolitej Polskiej.</p>
                  <p><strong>1.2.</strong> Okres gwarancji dla Produktów wynosi 12 miesięcy i jest liczony od dnia dostarczenia Produktu do Klienta.</p>
                  <p><strong>1.3.</strong> Dokumentem uprawniającym do ochrony gwarancyjnej jest karta gwarancyjna lub dowód zakupu.</p>
                  <p><strong>1.4.</strong> Dane gwaranta, szczegółowe informacje na temat towarów objętych gwarancją, okres jej trwania oraz warunki gwarancji, jak również uprawnienia przysługujące Klientowi z tytułu gwarancji zawiera karta gwarancyjna dołączona do Produktu lub udostępniona na stronie Sklepu.</p>
                  <p><strong>1.5.</strong> Gwarancja nie wyłącza uprawnień Konsumenta ani podmiotu, o którym mowa w § 10 Regulaminu, wynikających z przepisów ustawy o prawach konsumenta z dnia 30 maja 2014 r.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. REKLAMACJA Z TYTUŁU NIEZGODNOŚCI PRODUKTU Z UMOWĄ</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <div className="space-y-4">
                  <p><strong>2.1.</strong> Podstawa i zakres odpowiedzialności Sprzedawcy wobec Klienta będącego Konsumentem lub podmiotem, o którym mowa w § 10 Regulaminu, z tytułu braku zgodności Produktu z umową określone są w ustawie z dnia 30 maja 2014 r. o prawach konsumenta.</p>
                  <p><strong>2.2.</strong> Podstawa i zakres odpowiedzialności Sprzedawcy wobec Klienta będącego Przedsiębiorcą z tytułu rękojmi określone są w Kodeksie cywilnym.</p>
                  <p><strong>2.3.</strong> Sprzedawca ponosi odpowiedzialność za brak zgodności Produktu z umową istniejący w chwili jego dostarczenia oraz ujawniony w ciągu 2 lat od tej chwili, chyba że termin przydatności Produktu określony przez Sprzedawcę lub producenta jest dłuższy.</p>
                  
                  <p><strong>2.4.</strong> Zgłoszenia reklamacyjne można kierować:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>mailowo na adres: 
                      <a href="mailto:evapremium.kontakt@gmail.com" className="text-blue-400 hover:underline ml-1">
                        evapremium.kontakt@gmail.com
                      </a>
                    </li>
                    <li>pisemnie na adres:
                      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg my-2 ml-4">
                        <div className="text-gray-300 space-y-1">
                          <p>Klaudia Lewandowska</p>
                          <p>ul. Tadeusza Kościuszki 34/1</p>
                          <p>81-198 Pogórze</p>
                          <p>NIP: 5871715880</p>
                        </div>
                      </div>
                    </li>
                  </ul>
                  
                  <p><strong>2.5.</strong> W zgłoszeniu reklamacyjnym należy podać możliwie najwięcej informacji i okoliczności dotyczących przedmiotu reklamacji, w szczególności:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>rodzaj i data wystąpienia nieprawidłowości,</li>
                    <li>dokumentacja zdjęciowa (jeśli możliwa),</li>
                    <li>dane kontaktowe.</li>
                  </ul>
                  
                  <p><strong>2.6.</strong> W celu oceny nieprawidłowości i niezgodności Produktu z umową, Konsument lub podmiot, o którym mowa w § 10 Regulaminu, ma obowiązek udostępnić Produkt Sprzedawcy – Sprzedawca odbierze go na swój koszt.</p>
                  
                  <p><strong>2.7.</strong> Sprzedawca ustosunkuje się do zgłoszenia reklamacyjnego niezwłocznie, nie później niż w terminie 14 dni od dnia jego otrzymania. W przypadku potrzeby uzyskania dodatkowych informacji, opinii technicznej lub ekspertyzy – termin ten może zostać wydłużony, o czym Klient zostanie poinformowany.</p>
                  
                  <p><strong>2.8.</strong> W przypadku reklamacji Klienta będącego Konsumentem lub podmiotem, o którym mowa w § 10 Regulaminu, brak odpowiedzi w terminie 14 dni jest równoznaczny z jej uwzględnieniem – o ile Sprzedawca nie poinformował uprzednio o konieczności wydłużenia terminu.</p>
                  
                  <p><strong>2.9.</strong> Klient będący Konsumentem może żądać w pierwszej kolejności naprawy lub wymiany Produktu. Obniżenia ceny lub odstąpienia od umowy Klient może żądać wyłącznie w przypadkach wskazanych w ustawie o prawach konsumenta.</p>
                  
                  <p><strong>2.10.</strong> W przypadku uznanej reklamacji Sprzedawca:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                    <li>pokrywa koszty naprawy lub wymiany oraz ponownego dostarczenia Produktu do Klienta,</li>
                    <li>obniża cenę Produktu zgodnie z proporcją wartości i zwraca różnicę w terminie do 14 dni od otrzymania oświadczenia,</li>
                    <li>w przypadku odstąpienia od umowy – zwraca pełną cenę Produktu w terminie 14 dni od otrzymania zwróconego towaru lub dowodu jego odesłania; koszt zwrotu ponosi Sprzedawca.</li>
                  </ul>
                  
                  <p><strong>2.11.</strong> Odpowiedź na reklamację zostanie przekazana Klientowi w formie pisemnej lub na trwałym nośniku (e-mail lub SMS).</p>
                </div>
              </div>
            </section>

            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg mt-8">
              <h3 className="text-lg font-semibold text-white mb-3">Kontakt w sprawach zwrotów i reklamacji</h3>
              <div className="text-gray-300 space-y-2">
                <p><strong>Email:</strong> 
                  <a href="mailto:evapremium.kontakt@gmail.com" className="text-blue-400 hover:underline ml-1">
                    evapremium.kontakt@gmail.com
                  </a>
                </p>
                <p><strong>Telefon:</strong> +48 793 993 430</p>
                <p><strong>Adres:</strong> ul. Tadeusza Kościuszki 34/1, 81-198 Pogórze</p>
                <p><strong>NIP:</strong> 5871715880</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
