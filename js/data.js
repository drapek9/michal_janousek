/**
 * Data nemovitostí, referencí, služeb — připraveno pro napojení na CMS/API
 */

const PROPERTIES = [
  {
    id: "1",
    slug: "byt-praha-vinohrady",
    title: "Stylový byt 3+kk",
    location: "Vinohrady",
    city: "Praha",
    price: 12450000,
    status: "available",
    area: 78,
    rooms: "3+kk",
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
    ],
    description:
      "Krásný zrekonstruovaný byt v klidné části Vinohrad. Prostorná obývací část s francouzskými okny, moderní kuchyně a dvě ložnice.",
    features: ["Balkon", "Sklep", "Výtah", "Parkování"],
    yearBuilt: 1930,
    floor: "3. patro",
    energyClass: "C",
  },
  {
    id: "2",
    slug: "rodinny-dum-kladno",
    title: "Rodinný dům se zahradou",
    location: "Kladno – Kročehlavy",
    city: "Kladno",
    price: 8900000,
    status: "available",
    area: 165,
    rooms: "5+1",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    ],
    description:
      "Prostorný rodinný dům s velkou zahradou a garáží. Klidná lokalita s výbornou dostupností.",
    features: ["Zahrada 450 m²", "Garáž", "Terasa", "Krb"],
    yearBuilt: 2005,
    energyClass: "B",
  },
  {
    id: "3",
    slug: "byt-usti-nad-labem",
    title: "Byt 2+kk s výhledem",
    location: "Centrum",
    city: "Ústí nad Labem",
    price: 3250000,
    status: "available",
    area: 52,
    rooms: "2+kk",
    image:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80",
    ],
    description:
      "Světlý byt v centru Ústí s panoramatickým výhledem na řeku. Kompletní rekonstrukce.",
    features: ["Výtah", "Sklep", "Zasklená lodžie"],
    yearBuilt: 1985,
    floor: "8. patro",
    energyClass: "C",
  },
  {
    id: "4",
    slug: "prodano-byt-praha-smichov",
    title: "Byt 4+1 po rekonstrukci",
    location: "Smíchov",
    city: "Praha",
    price: 14200000,
    priceLabel: "Prodáno",
    status: "sold",
    area: 95,
    rooms: "4+1",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    ],
    description: "Úspěšně prodaný byt v atraktivní lokalitě Smíchova.",
    features: ["Balkon", "Sklep"],
    yearBuilt: 1920,
  },
  {
    id: "5",
    slug: "prodano-dum-beroun",
    title: "Rodinný dům Beroun",
    location: "Beroun – Závodí",
    city: "Beroun",
    price: 6750000,
    priceLabel: "Prodáno",
    status: "sold",
    area: 140,
    rooms: "4+kk",
    image:
      "https://images.unsplash.com/photo-1605276374101-dea5814f31b3?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1605276374101-dea5814f31b3?w=1200&q=80",
    ],
    description: "Rodinný dům prodaný za 14 dní od zahájení prodeje.",
    features: ["Zahrada", "Garáž"],
    yearBuilt: 2010,
  },
  {
    id: "6",
    slug: "prodano-byt-kladno",
    title: "Byt 3+1 Kladno",
    location: "Kladno – centrum",
    city: "Kladno",
    price: 4100000,
    priceLabel: "Prodáno",
    status: "sold",
    area: 72,
    rooms: "3+1",
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80",
    ],
    description:
      "Byt prodaný nad požadovanou cenu díky kvalitní prezentaci.",
    features: ["Balkon", "Sklep"],
    yearBuilt: 1975,
  },
];

const TESTIMONIALS = [
  {
    id: "1",
    name: "Petra a Tomáš Novákoví",
    location: "Praha – Vinohrady",
    text: "Michal nám pomohl prodat byt za cenu, o které jsme ani nesnili. Celý proces byl transparentní, vždy jsme věděli, co se děje.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80",
    propertyType: "Prodej bytu",
  },
  {
    id: "2",
    name: "Ing. Martin Svoboda",
    location: "Kladno",
    text: "Profesionální přístup od prvního kontaktu. Michal připravil nemovitost skvěle a dům se prodal do měsíce. Určitě doporučuji.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80",
    propertyType: "Prodej rodinného domu",
  },
  {
    id: "3",
    name: "Jana Horáková",
    location: "Ústí nad Labem",
    text: "Hledala jsem někoho, kdo mi pomůže s prodejem bytu po rodičích. Michal byl trpělivý, vše vysvětlil a odhad ceny byl přesný.",
    rating: 5,
    propertyType: "Prodej bytu",
  },
  {
    id: "4",
    name: "David a Lucie Procházkovi",
    location: "Beroun",
    text: "Spolupráce s Michalem byla skvělá zkušenost. Komunikace na jedničku, férové jednání a výsledek nad očekávání.",
    rating: 5,
    image:
      "https://images.unsplash.com/photo-1605276374101-dea5814f31b3?w=400&q=80",
    propertyType: "Prodej rodinného domu",
  },
  {
    id: "5",
    name: "Pavel Černý",
    location: "Praha",
    text: "Odhad zdarma mi otevřel oči — online kalkulačky ukazovaly úplně jinou cenu. Za týden jsme měli kupce.",
    rating: 5,
    propertyType: "Odhad a prodej",
  },
  {
    id: "6",
    name: "Markéta Vlčková",
    location: "Střední Čechy",
    text: "Jako majitelka pronajímaného bytu oceňuji, že Michal řeší vše od A do Z. Nemusím se o nic starat.",
    rating: 5,
    propertyType: "Pronájem",
  },
];

const SERVICES = [
  {
    id: "prodej",
    title: "Prodej nemovitostí",
    description:
      "Kompletní servis od odhadu ceny přes marketing až po předání klíčů. Pomohu vám prodat za maximum s minimem stresu.",
    benefit: "Průměrně rychlejší prodej než při vlastním řešení",
    cta: "Kontaktovat",
    href: "kontakt.html",
  },
  {
    id: "pronajem",
    title: "Pronájem nemovitostí",
    description:
      "Najdu spolehlivé nájemníky, připravím smlouvy a postarám se o celý proces pronájmu.",
    benefit: "Ověření nájemníků a právní jistota",
    cta: "Kontaktovat",
    href: "kontakt.html",
  },
  {
    id: "odhad",
    title: "Odhad ceny nemovitosti",
    description:
      "Nezávazný profesionální odhad zdarma. Zjistíte reálnou tržní cenu, ne odhad z online kalkulačky.",
    benefit: "Zdarma a bez závazků",
    cta: "Odhad zdarma",
    href: "odhad-zdarma.html",
  },
  {
    id: "marketing",
    title: "Marketing nemovitostí",
    description:
      "Profesionální fotografie, video, virtuální prohlídky a cílená reklama na správných kanálech.",
    benefit: "Více zájemců o vaši nemovitost",
    cta: "Kontaktovat",
    href: "kontakt.html",
  },
  {
    id: "staging",
    title: "Home staging",
    description:
      "Připravím nemovitost tak, aby na první pohled zaujala. Drobné úpravy často znamenají vyšší cenu.",
    benefit: "Vyšší dojem a rychlejší prodej",
    cta: "Kontaktovat",
    href: "kontakt.html",
  },
  {
    id: "pravni",
    title: "Právní servis",
    description:
      "Spolupracuji s ověřenými právníky. Smlouvy, due diligence i řešení právních nástrah.",
    benefit: "Bezpečný převod bez překvapení",
    cta: "Kontaktovat",
    href: "kontakt.html",
  },
  {
    id: "financovani",
    title: "Financování",
    description:
      "Pomohu najít optimální hypotéku nebo financování ve spolupráci s bankami i poradci.",
    benefit: "Úspora času i peněz",
    cta: "Kontaktovat",
    href: "kontakt.html",
  },
];

const FAQ = [
  {
    q: "Je odhad opravdu zdarma a nezávazný?",
    a: "Ano. Odhad ceny je zcela zdarma a nezavazný. Nemusíte se rozhodnout pro spolupráci — získáte jen užitečné informace o tržní ceně vaší nemovitosti.",
  },
  {
    q: "Jak dlouho trvá nacenění?",
    a: "Po domluvě termínu přijdu osobně k nemovitosti. Prohlídka trvá obvykle 30–60 minut. Písemný odhad vám zašlu do 48 hodin.",
  },
  {
    q: "Proč nestačí online kalkulačka?",
    a: "Online kalkulačky pracují s průměrnými daty a nevidí stav ani specifika vaší nemovitosti. Často ukazují cenu o 10–20 % od reality.",
  },
  {
    q: "V jakých lokalitách působíte?",
    a: "Působím ve Středočeském kraji, Praze a Ústeckém kraji. Pro nemovitosti mimo tyto oblasti mě kontaktujte.",
  },
  {
    q: "Co se stane po odeslání formuláře?",
    a: "Ozvu se vám a domluvíme termín osobní prohlídky. Žádný spam.",
  },
  {
    q: "Musím být při prohlídce přítomen?",
    a: "Ideálně ano — můžete mi ukázat detaily a položit otázky. Pokud to není možné, domluvíme alternativu.",
  },
];

const TIMELINE = [
  { year: "2018", title: "Vstup do realit", description: "Začátek kariéry, první úspěšné prodeje." },
  { year: "2020", title: "RE/MAX Age", description: "Připojení k RE/MAX Age a celosvětové síti." },
  { year: "2022", title: "Specializace na prodej", description: "Zaměření na rodinné domy a byty ve Středočeském kraji." },
  { year: "2024", title: "Rozšíření působnosti", description: "Praha a Ústecký kraj — kompletní pokrytí regionů." },
  { year: "2025", title: "100+ spokojených klientů", description: "Přes stovku úspěšných transakcí a dlouhodobých vztahů." },
];

/** Formát ceny v Kč */
function formatPrice(price) {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(price);
}

/** Najde nemovitost podle slug */
function getPropertyBySlug(slug) {
  return PROPERTIES.find((p) => p.slug === slug);
}
