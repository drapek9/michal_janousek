# Michal Janoušek - Realitní makléř

Statický vícestránkový web v čistém **HTML, CSS a JavaScriptu** (bez Reactu a TypeScriptu).

## Spuštění (jen prohlížení webu)

Otevřete `index.html` v prohlížeči, nebo statický server:

```bash
npx serve .
```

Web poběží typicky na `http://localhost:3000`. **Admin a API tímto způsobem nefungují** (POST vrátí HTTP 405).

## Lokální admin (úpravy nemovitostí)

Admin potřebuje **PHP + MySQL**. Na Windows nejjednodušší **Laragon** ([laragon.org](https://laragon.org/download/)):

1. Nainstalujte Laragon, spusťte **MySQL**.
2. V phpMyAdmin vytvořte databázi `michal_janousek` a importujte `api/setup.sql`.
3. Zkopírujte `api/config.local.dev.php.example` → `api/config.local.php` (lokální root/heslo).
4. Ve složce projektu spusťte PowerShell: `.\dev-server.ps1`
5. Otevřete **http://localhost:8080/admin/**
6. Vytvořte účet:  
   `http://localhost:8080/api/setup-admin.php?key=local-dev-zmente-me&email=admin@test.cz&password=heslo123`

**Proč HTTP 405?** Live Server / `npx serve` umí jen HTML/CSS/JS. Admin volá `/api/index.php` (PHP) – statický server POST neumí a vrátí 405.

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

- Bílá, tmavě modrá (`#0A2540`), decentní červená (`#DC1C2E`)
- Fonty: Inter (Google Fonts)
- Responzivní layout, plovoucí CTA „Odhad zdarma“
