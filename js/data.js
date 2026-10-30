/**
 * Statická data webu (služby, FAQ, timeline).
 * Nemovitosti a reference se načítají z API – viz js/properties-api.js
 */

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
    a: "Ano. Odhad ceny je zcela zdarma a nezavazný. Nemusíte se rozhodnout pro spolupráci - získáte jen užitečné informace o tržní ceně vaší nemovitosti.",
  },
  {
    q: "Jak dlouho trvá nacenění?",
    a: "Po odeslání formuláře odhad připravím na základě vašich údajů a znalosti trhu. Obvykle vám ho zašlu do několika pracovních dnů – přesný termín vždy upřesním po domluvě.",
  },
  {
    q: "Proč nestačí online kalkulačka?",
    a: "Online kalkulačky pracují s průměrnými daty a nevidí stav ani specifika vaší nemovitosti. Často ukazují cenu o 10–20 % od reality.",
  },
  {
    q: "Co se stane po odeslání formuláře?",
    a: "Ozvu se vám, případně si upřesníme údaje o nemovitosti. Poté odhad připravím a zašlu vám ho zdarma a nezávazně. Žádný spam.",
  },
];

const TIMELINE = [
  { year: "2018", title: "Vstup do realit", description: "Začátek kariéry, první úspěšné prodeje." },
  { year: "2020", title: "Makléřská praxe", description: "Rozvoj samostatné realitní činnosti a sítě klientů." },
  { year: "2022", title: "Specializace na prodej", description: "Zaměření na rodinné domy a byty ve Středočeském kraji." },
  { year: "2024", title: "Rozšíření působnosti", description: "Praha a Ústecký kraj - kompletní pokrytí regionů." },
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
