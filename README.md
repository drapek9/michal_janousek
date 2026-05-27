# Michal Janoušek - Realitní makléř RE/MAX Age

Statický vícestránkový web v čistém **HTML, CSS a JavaScriptu** (bez Reactu a TypeScriptu).

## Spuštění

Otevřete `index.html` v prohlížeči, nebo použijte lokální server:

```bash
npx serve .
```

Web poběží typicky na `http://localhost:3000`.

## Struktura projektu

```
├── index.html              Domů
├── o-mne.html              O mně
├── sluzby.html             Služby
├── nemovitosti.html        Seznam nemovitostí + filtr
├── nemovitost.html         Detail (?slug=...)
├── reference.html          Reference klientů
├── kontakt.html            Kontakt + mapa
├── odhad-zdarma.html       Landing page - odhad zdarma (priorita)
├── css/
│   ├── variables.css       Design tokeny
│   ├── base.css            Reset, typografie, utility
│   ├── components.css      Tlačítka, karty, formuláře
│   └── layout.css          Header, footer, hero
├── js/
│   ├── config.js           Kontakty, navigace
│   ├── data.js             Nemovitosti, reference, FAQ (CMS-ready)
│   ├── layout.js           Header, footer, menu
│   ├── forms.js            Formuláře + success state
│   ├── properties.js       Karty a detail nemovitostí
│   ├── testimonials.js     Reference
│   ├── services.js         Služby
│   ├── faq.js              FAQ accordion
│   └── animations.js       Scroll animace
├── robots.txt
└── sitemap.xml
```

## Úpravy obsahu

- **Kontakty a SEO:** `js/config.js`
- **Nemovitosti, reference, FAQ:** `js/data.js`
- **Fotografie makléře:** `images/fotka_michal_janousek.png` (HTML + `SITE.brokerPhoto` v `config.js`)

## Formuláře

Odeslání je zatím simulované (success obrazovka). Pro produkci připojte endpoint v `js/forms.js` (fetch na váš API / Formspree / e-mail službu).

## Design

- Bílá, tmavě modrá (`#0A2540`), decentní RE/MAX červená (`#DC1C2E`)
- Fonty: Inter + Playfair Display (Google Fonts)
- Responzivní layout, plovoucí CTA „Odhad zdarma“
