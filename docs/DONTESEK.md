# Döntésnapló

Itt rögzítjük lépésenként, mit és miért döntöttünk az app fejlesztése során.
A legfrissebb lépés van legfelül.

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
