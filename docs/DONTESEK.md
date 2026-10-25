# Döntésnapló

Itt rögzítjük lépésenként, mit és miért döntöttünk az app fejlesztése során.
A legfrissebb lépés van legfelül.

---

## 3. lépés – Böngészős változat (2026-10-25)

**Gabor kérése:** buildeljük le, hogy böngészőből is meg lehessen nézni.

| Döntés | Miért |
| --- | --- |
| Böngészőben **localStorage** a tárolás (`src/lib/store.web.tsx`), telefonon marad az SQLite (`src/lib/store.tsx`) | Az expo-sqlite webes változata különleges szerverfejléceket és WebAssemblyt kér, ami megosztott linken nem működik. A képernyők kódja közös, csak a tároló cserélődik. |
| Egyetlen önálló HTML fájl készül (`npm run build:web`, majd `node scripts/web-single-file.mjs dist dist/mariann-jogapp.html`) | Bárhol megnyitható és megosztható, nincs szükség szerverre. |
| Közzétéve Claude Artifactként: https://claude.ai/artifact/Fthcs1MM3NpeeyhHcW3RRu | Privát link, Gabor oszthatja meg (Share menü). |
| Böngészőben saját megerősítő ablak (törlésnél) | Beágyazott oldalon a böngésző saját párbeszédablakai nem jelennek meg. |
| A PDF gomb csak a telefonos appban látszik | Beágyazott oldalon a nyomtatás le van tiltva. |
| Ismeretlen címről a kezdőlapra irányít (`src/app/+not-found.tsx`) | A link bármilyen útvonalon nyílhat meg. |

A böngészőben mentett órák csak abban a böngészőben látszanak, nem szinkronizálódnak a telefonnal.

---

## 2. lépés – Öt elem és heti tematika (2026-10-25)

**Gabor kérése:** az ászanákhoz kerüljön be az öt alapelem, és lehessen egy témát
több napra (pl. egy hétre) lebontani, ami az óravázlatoknál is látszik.

### Öt elem

| Döntés | Miért |
| --- | --- |
| Az „5 alapelem” a jógai **pañca mahābhūta**: Föld, Víz, Tűz, Levegő, Éter | A jóga hagyományában ez az öt elem, és az első öt csakrához kötődik. (A kínai öt elem – fa, tűz, föld, fém, víz – más rendszer; ha arra lenne igény, külön vehetjük fel.) |
| Az elem **a csakrákból származik** (Föld–Mūlādhāra, Víz–Svādhiṣṭhāna, Tűz–Maṇipūra, Levegő–Anāhata, Éter–Viśuddha) | Így következetes a meglévő csakra-hozzárendeléssel. Ha az elsődleges csakra a 6. vagy 7., akkor az első 1–5. másodlagos csakra eleme az elsődleges, ennek híján Éter (4 fordított/fejre irányuló póz). |
| Az adat a `data/aszanak.json`-ba került (5. verzió): `elements` lista és pózonként `elements: {primary, secondary}` | Egy forrás az appnak és később az ászanatárnak. A `docs/aszanatar.html` még nem mutatja az elemeket. |
| Megjelenik: szűrő („Öt elem”), lista, adatlap (elem minősége), óravázlat „Öt elem egyensúlya” sávdiagram, PDF | Az óra elem-egyensúlya ugyanúgy látszik, mint a csakráké. |

Eloszlás: Tűz 58, Víz 49, Levegő 43, Föld 38, Éter 17 ászana (elsődleges elem).

### Tematika

| Döntés | Miért |
| --- | --- |
| Új egység: **tematika** = cím, téma, jegyzet és napok listája; minden nap: cím, fókusz, hozzárendelt óravázlat | Egy témát napokra bontva lehet megtervezni, a napok óravázlatai külön is használhatók. |
| Alapból 7 nap, de napok hozzáadhatók, törölhetők, mozgathatók | Lehet 5 napos vagy 10 napos sorozat is. |
| Sablonok: **Üres hét**, **Csakra-utazás (7 nap)**, **Öt elem (5 nap + integráló + pihentető nap)** | Gyors indulás; a napok címe és fókusza kitöltve, átírható. |
| Egy naphoz új óravázlat készíthető (cím: „Tematika – N. nap: …”, téma = a nap fókusza, címke = a tematika neve), vagy meglévő rendelhető hozzá | Rugalmas: kész órák is beilleszthetők. |
| Az **Óravázlataim** fülön „Órák / Tematikák” váltó; az órák kártyáján látszik, melyik tematika hányadik napja | Gabor kérése szerint az óravázlatoknál is látszik a tematika. |
| Tematika törlésekor az óravázlatok megmaradnak; óravázlat törlésekor a nap üres lesz | Ne vesszen el véletlenül kidolgozott óra. |
| Heti elem-egyensúly és PDF heti áttekintés (naponként fókusz és pózok szakaszonként) | Áttekinthető a hét íve, kinyomtatható. |
| Tárolás: új `series` tábla (SQLite séma 2. verzió), JSON-ban | Ugyanaz a minta, mint az óravázlatoknál. |

---

## 1. lépés – Az app alapja (2026-10-25)

**Cél:** működő első változat telefonra: ászanatár szűrőkkel, óravázlat
összeállítása és mentése, PDF óravázlat.

### Technológia

| Döntés | Miért |
| --- | --- |
| **React Native + Expo (SDK 58), TypeScript** | Egy kódbázis Androidra és iOS-re. Expo Go-val a telefonon azonnal kipróbálható, Mac és Android Studio nélkül. |
| **expo-router**, a képernyők a `src/app/` mappában | Fájlalapú navigáció, az Expo ajánlott megoldása. |
| **expo-sqlite**, helyi adatbázis az eszközön | Offline működés, nincs fiók és szerver. Egy óravázlat egy sor, a tartalma JSON-ként tárolódik, így a formátum később bővíthető táblamódosítás nélkül. |
| **react-native-svg** a figurákhoz | Az ászanatár pálcikafiguráit ugyanazokból a szögadatokból rajzoljuk (`src/lib/figure.ts`), nincs szükség képfájlokra. |
| **expo-print + expo-sharing** a PDF-hez | A telefon saját PDF-készítőjét használja, a kész fájl megosztható (e-mail, Drive, nyomtatás). |
| Az ászanaadat a repó `data/aszanak.json` fájljából jön | Egyetlen forrás az ászanatárnak és az appnak. Az app a 4-es verziót (hatásterületekkel, PR #2) használja. |
| A kezelőfelület magyar | Mariann és a magyar oktatók a célcsoport. |

### Funkciók az 1. körben (a piackutatás alapján)

- **Ászanatár:** keresés magyar, szanszkrit vagy angol névre (ékezet nélkül is),
  kategóriánként csoportosított lista figurákkal.
- **Kombinálható szűrők:** kategória, szint, irányzat, csakra (opcionálisan csak
  elsődleges), hatásterület. Egy szemponton belül VAGY, szempontok között ÉS.
- **Ászana-adatlap:** végrehajtás, hatások, csakrák, ellenjavallatok,
  hozzáadás bármelyik óravázlat bármelyik szakaszához.
- **Óravázlat:** cím, téma/szándék, célzott szint, időtartam, címkék, jegyzet.
  Alapértelmezett szakaszok: Ráhangolódás, Bemelegítés, Fő rész, Levezetés,
  Relaxáció. A szakaszok átnevezhetők, mozgathatók, törölhetők, újak vehetők fel.
- **Pózonként:** tartási idő (szabad szöveg, pl. „5 légzés”, „3 perc”; Yin pózoknál
  alapból 3 perc), oldal (–, mindkét, jobb, bal), jegyzet, sorrend mozgatása.
- **Ellenjavallat-figyelmeztetés:** az órához megjelölhetők a csoportban jelzett
  panaszok (pl. magas vérnyomás, térd, várandósság). Az app az ászanák
  ellenjavallat-szövegében keres rájuk, és jelzi az érintett pózokat. Azt is jelzi,
  ha egy póz nehezebb az óra célzott szintjénél.
- **Csakra-egyensúly:** az óra pózainak elsődleges csakrái sávdiagramon.
- **Óravázlataim:** lista keresővel, másolat készítése, törlés.
- **PDF óravázlat** figurákkal, jegyzetekkel, figyelmeztetésekkel.
- Minden változás **automatikusan mentődik**.

### Szándékosan későbbre hagyva

- Óraelemző panel bővítése (hatás-lefedettség, intenzitásgörbe), következő-póz
  javaslat, újrahasználható blokkok (pl. napüdvözlet), tanítási mód (2. kör a
  piackutatás szerint).
- Húzással rendezés (most fel/le nyilak vannak).
- Felhőszinkron, fiók: nem tervezzük, amíg nincs rá igény.
- Sötét téma.

### Nyitott kérdések Mariann felé

- Jók-e az alapértelmezett szakasznevek?
- Milyen panaszok forduljanak elő még a csoportokban (a lista bővíthető)?
- Mi kerüljön még a PDF-re (pl. zene, légzőgyakorlat külön mezőben)?
