# Czat EvaBot

Osadza czat z [evapremium_agent_V.0.0.1](https://github.com/SebastianZakrzewski/evapremium_agent_V.0.0.1).
Skrypt zostaje na originie widgetu. Sklep ustawia `window.widgetPlugin`, potem ładuje skrypt.

Domyślny `widgetPlugin.showProduct.cardUrl` to szablon karty modelu. Tokeny są nazwami kolumn dopasowanego wiersza:

`https://www.evapremium.pl/modele?brand={brand_key}&model={model_family_key}&generation={generation}&bodyType={body_type_key}`

Widget podstawia każdy token, który jest w polach wiersza, oraz `{productId}`. Zostawiona klamra nie otwiera okna. Pełny adres otwiera jedną kartę, bez menu i stopki. Parametry `brand`, `model`, `generation` i `bodyType` czyta strona modeli.

`mountObject(object, host)` czyta `object.fields` (`brand`, `model`, `generation`, `bodyType`) i wstawia w `host` iframe tej samej karty. Zwrócona funkcja zdejmuje ją. Przy `object: null` nic nie wstawia. Widget jeszcze nie woła tej metody.

Na stronie widać ikonę w prawym dolnym rogu. Chmurka startuje dopiero po akceptacji okna prywatności: najpierw animacja pisania, potem „Cześć! Służę pomocą.”. Ramka czatu powstaje po kliknięciu ikony. Skrypt `embed.js` nie jest wstawiany dynamicznie: w Chrome ma wtedy puste `document.currentScript` i nie rysuje okna.

Origin: `https://widget-xi-eight.vercel.app`.  
Na tym originie działa `/embed.js` (`data-eva-widget="eva-shop"`). `/widget-plugin.js` z README zwraca 404.

Nadpisanie originu: `NEXT_PUBLIC_EVA_WIDGET_ORIGIN`.

## Usage

```tsx
import { EvaChatWidget } from '@/features/eva-chat-widget'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <body>
      {children}
      <EvaChatWidget />
    </body>
  )
}
```
