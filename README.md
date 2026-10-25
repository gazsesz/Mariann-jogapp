# Mariann jógapp

Jógaóra-tervező alkalmazás (React Native + Expo, TypeScript – Android és iOS).

## Tartalom

- `src/app/` – az app képernyői (expo-router): ászanatár, ászana-adatlap, óravázlataim, óravázlat-szerkesztő.
- `src/lib/` – adat, szűrők, ellenjavallat-figyelmeztetések, figurarajzolás, mentés (SQLite), PDF.
- `data/aszanak.json` – az ászanatár app-barát adatai (205 ászana, 12 kategória, irányzat-címkék, csakrák, hatásterületek, lépések, ellenjavallatok, figura-szögek).
- `docs/aszanatar.html` – az ászanatár önálló, böngészőben megnyitható változata SVG figurákkal.
- `docs/DONTESEK.md` – döntésnapló: lépésenként mit és miért döntöttünk.
- `tests/` – a szűrő-, figyelmeztetés-, figura- és PDF-logika tesztjei.

## Kipróbálás a telefonon (Windows)

1. Telepítsd a **Node.js LTS** változatát: <https://nodejs.org> (a telepítőben mindent hagyj alapértelmezésen).
2. Telepítsd a telefonra az **Expo Go** appot (Google Play vagy App Store).
3. Nyiss egy parancssort (PowerShell) a projekt mappájában, és futtasd:

   ```
   git pull
   npm install
   npx expo start
   ```

4. Megjelenik egy QR-kód. Androidon az Expo Go appal, iPhone-on a Kamera appal olvasd be.
   A telefon és a gép legyen ugyanazon a Wi-Fi hálózaton. Ha nem csatlakozik, próbáld: `npx expo start --tunnel`.

Böngészőben is megnézhető: `npx expo start --web`.

## Fejlesztés

```
npm run typecheck   # TypeScript ellenőrzés
npm test            # logikai tesztek
```
